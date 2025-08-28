import { NextRequest } from "next/server";
import OpenAI from "openai";
import { z } from "zod";
import { getRateLimiter, localRateLimit } from "@/lib/rateLimit";
import {
  buildContext,
  lexicalFallback,
  loadIndex,
  topKSimilar,
  getEarliestPost,
  getLatestProject,
  getLatestPost,
  filterByType,
  getPreviousOfSameType,
  getResumeInfo,
} from "@/lib/rag";
import { SYSTEM_PROMPT, PROMPT_CONFIG } from "@/lib/prompts";

export const runtime = 'nodejs';

const BodySchema = z.object({
  message: z.string().min(1).max(PROMPT_CONFIG.chat.maxUserMessageLength),
  focusUrls: z.array(z.string()).optional(),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1).max(PROMPT_CONFIG.chat.maxAssistantMessageLength),
      })
    )
    .optional(),
});

function getClientKey(req: NextRequest): string {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
  const ua = req.headers.get("user-agent") || "unknown";
  return `${ip}:${ua}`;
}

function sameOriginOnly(req: NextRequest): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return true; // SSR or same-origin fetches often omit
  const host = req.headers.get("host");
  try {
    const url = new URL(origin);
    return url.host === host;
  } catch {
    return false;
  }
}



export async function POST(req: NextRequest) {
  const t0 = Date.now();
  try {
    if (!sameOriginOnly(req)) {
      return new Response("Forbidden", { status: 403 });
    }

    const limiter = getRateLimiter();
    const clientKey = getClientKey(req);
    if (limiter) {
      const { success, reset } = await limiter.limit(clientKey);
      if (!success) {
        return new Response(JSON.stringify({ error: "rate_limited", reset }), {
          status: 429,
          headers: { "content-type": "application/json" },
        });
      }
    } else {
      const { success, reset } = localRateLimit(clientKey);
      if (!success) {
        return new Response(JSON.stringify({ error: "rate_limited", reset }), {
          status: 429,
          headers: { "content-type": "application/json" },
        });
      }
    }

    const body = await req.json().catch(() => null);
    const parsed = BodySchema.safeParse(body);
    if (!parsed.success) {
      return new Response("Bad Request", { status: 400 });
    }
    const userMessage = parsed.data.message.trim();
    const focusUrls = (parsed.data.focusUrls || []).filter((u) => typeof u === 'string');
    const history = (parsed.data.history || []).slice(-PROMPT_CONFIG.chat.maxHistoryLength); // limit context size

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return new Response("Server Misconfigured", { status: 500 });

    const openai = new OpenAI({ apiKey });

    // Compute query embedding
    const t1 = Date.now();
    let queryEmbedding: number[] = [];
    try {
      // If follow-up pronoun, enrich embedding input with last user message
      const lastUser = [...history].reverse().find((h) => h.role === "user");
      const pronounFollowUp = /\b(it|that|this|the post|the blog)\b/i.test(userMessage);
      const embedInput = pronounFollowUp && lastUser ? `${lastUser.content}\nFollow-up: ${userMessage}` : userMessage;
      const embed = await openai.embeddings.create({ model: "text-embedding-3-small", input: embedInput });
      queryEmbedding = embed.data[0].embedding as unknown as number[];
    } catch {
      // Embedding failure should return a controlled error
      return new Response("Embedding error", { status: 502 });
    }
    const t2 = Date.now();

    // Retrieve
    const index = loadIndex();
    const focusDocs = index.filter((d) => focusUrls.includes(d.url));
    const isPronounFollowUp = /\b(it|that|this|the post|the blog)\b/i.test(userMessage);
    let retrieved = [] as typeof index;
    if (isPronounFollowUp && focusDocs.length > 0) {
      retrieved = focusDocs.slice(0, 5);
    } else {
      // For technology queries, retrieve more results to ensure we don't miss any projects
      const isTechQuery = /\b(pytorch|tensorflow|react|next\.js|python|machine learning|ml|ai|nlp|data analysis)\b/i.test(userMessage.toLowerCase());
      const k = isTechQuery ? PROMPT_CONFIG.search.techQueryResults : PROMPT_CONFIG.search.defaultResults;
      
      retrieved = topKSimilar(index, queryEmbedding, k);
      if (retrieved.length === 0) {
        retrieved = lexicalFallback(index, userMessage, k);
      }
    }
    // Intent detection: latest project, latest post, or restrict by type
    const asksLatestProject = /latest\s+(project|thing\s+you\s+built|work(ed)?\s+on)/i.test(userMessage);
    const asksLatestPost = /latest\s+(blog|post|article|write\w*)/i.test(userMessage);
    const asksProjectsOnly = /\b(project|projects)\b/i.test(userMessage) && !/\b(post|blog|article|write)/i.test(userMessage);
    const asksPostsOnly = /\b(post|blog|article|write)/i.test(userMessage) && !/\b(project|projects)\b/i.test(userMessage);
    const asksPrevious = /(previous|before\s+that|prior|earlier\s+than\s+that)/i.test(userMessage);
    const asksResume = /\b(resume|work\s+experience|job|employment|career|background|skills|education)\b/i.test(userMessage);

    const earliest = /first\s+blog|first\s+post|earliest\s+blog|earliest\s+post/i.test(userMessage) ? getEarliestPost(index) : null;
    const mergedDocs = [...focusDocs, ...retrieved];
    const dedup = new Map<string, typeof index[number]>();
    for (const d of mergedDocs) dedup.set(d.id, d);
    let contextDocs = Array.from(dedup.values()).slice(0, 5);
    // Deterministic overrides for specific intents
    if (asksPrevious) {
      // Choose previous item relative to the most prominent item in context
      const anchor = contextDocs[0];
      if (anchor) {
        const prev = getPreviousOfSameType(index, anchor);
        if (prev) {
          contextDocs = [prev, ...contextDocs.filter((d) => d.slug !== prev.slug)].slice(0, 5);
        }
      }
    } else if (asksResume) {
      // Prioritize resume information for work experience queries
      const resumeInfo = getResumeInfo(index);
      if (resumeInfo) {
        contextDocs = [resumeInfo, ...contextDocs.filter((d) => d.id !== resumeInfo.id)].slice(0, 5);
      }
    } else if (asksLatestProject) {
      const latestProj = getLatestProject(index);
      if (latestProj) {
        contextDocs = [latestProj, ...contextDocs.filter((d) => d.slug !== latestProj.slug)].slice(0, 5);
      }
    } else if (asksLatestPost) {
      const latestP = getLatestPost(index);
      if (latestP) {
        contextDocs = [latestP, ...contextDocs.filter((d) => d.slug !== latestP.slug)].slice(0, 5);
      }
    } else if (asksProjectsOnly) {
      const onlyProjects = filterByType(contextDocs, "project");
      if (onlyProjects.length > 0) contextDocs = onlyProjects;
    } else if (asksPostsOnly) {
      const onlyPosts = filterByType(contextDocs, "post");
      if (onlyPosts.length > 0) contextDocs = onlyPosts;
    }
    if (earliest) {
      contextDocs = [earliest, ...contextDocs.filter((d) => d.id !== earliest.id)].slice(0, 5);
    }
    // For technology queries, use larger context to fit more projects
    const isTechQuery = /\b(pytorch|tensorflow|react|next\.js|python|machine learning|ml|ai|nlp|data analysis)\b/i.test(userMessage.toLowerCase());
    const contextSize = isTechQuery ? PROMPT_CONFIG.search.techQueryContextSize : PROMPT_CONFIG.search.defaultContextSize;
    const { context, sources } = buildContext(contextDocs, contextSize, userMessage);
    // Lightweight diagnostics
    try {
      const diag = {
        indexSize: index.length,
        retrievedCount: retrieved.length,
        contextCount: contextDocs.length,
        intent: {
          asksLatestProject,
          asksLatestPost,
          asksProjectsOnly,
          asksPostsOnly,
          asksPrevious: Boolean(asksPrevious),
          asksResume,
          earliest: Boolean(earliest),
        },
        typesInContext: contextDocs.reduce((acc: Record<string, number>, d) => {
          acc[d.type] = (acc[d.type] || 0) + 1;
          return acc;
        }, {}),
        topSlugs: contextDocs.map((d) => `${d.type}:${d.slug}`),
      };
      console.info("[chat] retrieval_diag", diag);
    } catch {
      // best-effort diagnostics only
    }

    // Put context and question into a single user message
    const combinedUser = `Context:\n${context}\n\nRules:\n- When the question asks for the first blog/post, identify the earliest by date in the Context.\n- When asked for the latest project or post, use the most recent by date.\n- When asked for the previous item ("before that"), select the chronologically previous item of the same type.\n- When asked about work experience, employment, skills, or education, prioritize resume information.\n- Prefer projects when the user asks about what I built or worked on.\n- Include inline links using markdown [Title](URL).\n- Use the conversation history to resolve pronouns and follow-ups, but never override or invent facts beyond Context.\n\nQuestion: ${userMessage}`;

    // Use model from prompts configuration
    const preferred = PROMPT_CONFIG.model;
    console.info("[chat] model selection", { preferred, source: "prompts.ts" });
    try {
      const response = await openai.chat.completions.create({
        model: preferred,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...history.map((h) => ({ role: h.role as "user" | "assistant", content: h.content })),
          { role: "user", content: combinedUser },
        ],
        temperature: PROMPT_CONFIG.temperature,
        max_tokens: PROMPT_CONFIG.maxTokens,
        stream: true,
      });
      const encoder = new TextEncoder();
      type StreamChunk = { choices?: Array<{ delta?: { content?: string | null } }> };
      const stream = new ReadableStream<Uint8Array>({
        start(controller) {
          (async () => {
            try {
              for await (const chunk of (response as AsyncIterable<StreamChunk>)) {
                const choice = chunk.choices?.[0];
                const delta = choice?.delta?.content ?? "";
                if (delta) controller.enqueue(encoder.encode(delta));
              }
            } catch {
              controller.error(new Error("stream_error"));
            } finally {
              const footer = `\n\n[[SOURCES]]${JSON.stringify(sources)}[[/SOURCES]]`;
              controller.enqueue(encoder.encode(footer));
              controller.close();
            }
          })();
        },
      });
      const t3 = Date.now();
      const headers = new Headers({
        "content-type": "text/markdown; charset=utf-8",
        "x-latency-ms": String(t3 - t0),
        "x-embed-ms": String(t2 - t1),
        "x-retrieve-ms": String(t3 - t2),
        "x-model-used": preferred,
        "x-index-size": String(index.length),
        "x-retrieved": String(retrieved.length),
        "cache-control": "no-store",
      });
      return new Response(stream, { status: 200, headers });
    } catch (err) {
      const status = (err as { status?: number }).status;
      const message = (err as { message?: string }).message || String(err);
      console.error("[chat] chat.completions failed", { status, message, preferred });
      return new Response("Model unavailable", { status: 502 });
    }
    // (Unreachable: returns happen in both success paths above)
  } catch {
    return new Response("Internal Error", { status: 500 });
  }
}