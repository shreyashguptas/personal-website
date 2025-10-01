import { NextRequest } from "next/server";
import OpenAI from "openai";
import { z } from "zod";
import { getRateLimiter, localRateLimit } from "@/lib/rateLimit";
import { logSecurityEvent, sanitizeClientKey } from "@/lib/security";
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
import { cleanupCache } from "@/lib/rag";
import { captureAiGeneration } from "@/lib/analytics-server";

export const runtime = 'nodejs';

// Cleanup cache on process termination
process.on('SIGINT', () => {
  console.info('[chat] Received SIGINT, cleaning up cache...');
  cleanupCache();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.info('[chat] Received SIGTERM, cleaning up cache...');
  cleanupCache();
  process.exit(0);
});

const BodySchema = z.object({
  message: z.string()
    .min(1, "Message cannot be empty")
    .max(PROMPT_CONFIG.chat.maxUserMessageLength, `Message too long (max ${PROMPT_CONFIG.chat.maxUserMessageLength} characters)`)
    .refine((msg) => msg.trim().length > 0, "Message cannot be only whitespace")
    .refine((msg) => msg.length <= 10000, "Message too long") // Additional safety limit
    .refine((msg) => !/<script/i.test(msg), "Script tags not allowed")
    .refine((msg) => !/<iframe/i.test(msg), "Iframe tags not allowed")
    .refine((msg) => !/javascript:/i.test(msg), "JavaScript URLs not allowed"),
  focusUrls: z.array(
    z.string()
      .refine((url) => {
        // Allow absolute URLs (http/https) or relative URLs starting with /
        if (url.startsWith('http://') || url.startsWith('https://')) {
          try {
            new URL(url);
            return true;
          } catch {
            return false;
          }
        } else if (url.startsWith('/')) {
          return true;
        }
        return false;
      }, "URL must be absolute (http/https) or relative to site (starting with /)")
      .refine((url) => !url.includes('..'), "Directory traversal not allowed")
  ).max(10, "Too many focus URLs").optional(),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string()
          .min(1, "Content cannot be empty")
          .max(PROMPT_CONFIG.chat.maxAssistantMessageLength, `Content too long (max ${PROMPT_CONFIG.chat.maxAssistantMessageLength} characters)`)
          .refine((content) => content.trim().length > 0, "Content cannot be only whitespace")
          .refine((content) => !/<script/i.test(content), "Script tags not allowed")
          .refine((content) => !/<iframe/i.test(content), "Iframe tags not allowed"),
      })
    )
    .max(PROMPT_CONFIG.chat.maxHistoryLength, `History too long (max ${PROMPT_CONFIG.chat.maxHistoryLength} messages)`)
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
  
  // Additional security checks
  const contentType = req.headers.get("content-type");
  if (!contentType || !contentType.includes("application/json")) {
    const clientKey = getClientKey(req);
    logSecurityEvent({
      type: 'invalid_content_type',
      clientKey: sanitizeClientKey(clientKey),
      details: `Invalid content-type: ${contentType}`,
      userAgent: req.headers.get('user-agent') || undefined,
      ip: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || undefined,
    });
    return new Response("Unsupported Media Type", { status: 415 });
  }

  // Request size limit (1MB)
  const contentLength = req.headers.get("content-length");
  if (contentLength && parseInt(contentLength) > 1024 * 1024) {
    const clientKey = getClientKey(req);
    logSecurityEvent({
      type: 'request_too_large',
      clientKey: sanitizeClientKey(clientKey),
      details: `Request too large: ${contentLength} bytes`,
      userAgent: req.headers.get('user-agent') || undefined,
      ip: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || undefined,
    });
    return new Response("Request Entity Too Large", { status: 413 });
  }

  try {
    if (!sameOriginOnly(req)) {
      const clientKey = getClientKey(req);
      logSecurityEvent({
        type: 'cross_origin',
        clientKey: sanitizeClientKey(clientKey),
        details: `Cross-origin request blocked from ${req.headers.get("origin")}`,
        userAgent: req.headers.get('user-agent') || undefined,
        ip: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || undefined,
      });
      return new Response("Forbidden", { status: 403 });
    }

    const limiter = getRateLimiter();
    const clientKey = getClientKey(req);
    if (limiter) {
      const { success, reset } = await limiter.limit(clientKey);
      if (!success) {
        logSecurityEvent({
          type: 'rate_limit',
          clientKey: sanitizeClientKey(clientKey),
          details: 'Redis rate limit exceeded',
          userAgent: req.headers.get('user-agent') || undefined,
          ip: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || undefined,
        });

        // Get latest blog post and contact email for friendly message
        let latestPostUrl = "/blog"; // fallback
        let contactEmail: string | undefined;
        try {
          const index = loadIndex();
          const latestPost = getLatestPost(index);
          if (latestPost) {
            latestPostUrl = latestPost.url;
          }
          const resumeDocs = index.filter((d) => d.type === "resume");
          const combined = resumeDocs.map((d) => d.text).join("\n\n");
          const match = combined.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
          if (match) contactEmail = match[0];
        } catch (error) {
          console.warn('[chat] Failed to get latest post for rate limit message:', error);
        }

        const emailLine = contactEmail
          ? `Oh, it seems like you'd like to know a lot more about me—feel free to email me at [${contactEmail}](mailto:${contactEmail}).\n\n`
          : "Oh, it seems like you'd like to know a lot more about me—please reach out via email if you see it on my resume.\n\n";

        const message = `${emailLine}You can also browse while you wait: [Latest Post](${latestPostUrl}) • [Resume](/resume)`;

        return new Response(JSON.stringify({
          error: "rate_limited",
          message,
          reset
        }), {
          status: 429,
          headers: { "content-type": "application/json" },
        });
      }
    } else {
      // Graceful in-memory fallback in any environment
      const { success, reset } = localRateLimit(clientKey);
      if (!success) {
        logSecurityEvent({
          type: 'rate_limit',
          clientKey: sanitizeClientKey(clientKey),
          details: 'Local rate limit exceeded',
          userAgent: req.headers.get('user-agent') || undefined,
          ip: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || undefined,
        });

        // Get latest blog post and contact email for friendly message
        let latestPostUrl = "/blog"; // fallback
        let contactEmail: string | undefined;
        try {
          const index = loadIndex();
          const latestPost = getLatestPost(index);
          if (latestPost) {
            latestPostUrl = latestPost.url;
          }
          const resumeDocs = index.filter((d) => d.type === "resume");
          const combined = resumeDocs.map((d) => d.text).join("\n\n");
          const match = combined.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
          if (match) contactEmail = match[0];
        } catch (error) {
          console.warn('[chat] Failed to get latest post for rate limit message:', error);
        }

        const emailLine = contactEmail
          ? `Oh, it seems like you'd like to know a lot more about me—feel free to email me at [${contactEmail}](mailto:${contactEmail}).\n\n`
          : "Oh, it seems like you'd like to know a lot more about me—please reach out via email if you see it on my resume.\n\n";

        const message = `${emailLine}You can also browse while you wait: [Latest Post](${latestPostUrl}) • [Resume](/resume)`;

        return new Response(JSON.stringify({
          error: "rate_limited",
          message,
          reset
        }), {
          status: 429,
          headers: { "content-type": "application/json" },
        });
      }
    }

    const body = await req.json().catch(() => null);
    const parsed = BodySchema.safeParse(body);
    if (!parsed.success) {
      const errorDetails = parsed.error.issues.map(err =>
        `${err.path.join('.')}: ${err.message}`
      ).join(', ');

      logSecurityEvent({
        type: 'validation_failed',
        clientKey: sanitizeClientKey(clientKey),
        details: `Validation failed: ${errorDetails}`,
        userAgent: req.headers.get('user-agent') || undefined,
        ip: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || undefined,
      });

      return new Response(JSON.stringify({
        error: "validation_failed",
        message: "Invalid request data",
        details: errorDetails
      }), {
        status: 400,
        headers: { "content-type": "application/json" }
      });
    }
    const userMessage = parsed.data.message.trim();
    const focusUrls = (parsed.data.focusUrls || []).filter((u) => typeof u === 'string');
    const history = (parsed.data.history || []).slice(-PROMPT_CONFIG.chat.maxHistoryLength); // limit context size

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error('[chat] OPENAI_API_KEY not configured');
      return new Response(JSON.stringify({
        error: "server_configuration",
        message: "Service temporarily unavailable"
      }), {
        status: 503,
        headers: { "content-type": "application/json" }
      });
    }

    const openai = new OpenAI({ apiKey });

    // Compute query embedding with timeout
    const t1 = Date.now();
    let queryEmbedding: number[] = [];
    try {
      // If follow-up pronoun, enrich embedding input with last user message
      const lastUser = [...history].reverse().find((h) => h.role === "user");
      const pronounFollowUp = /\b(it|that|this|the post|the blog)\b/i.test(userMessage);
      const embedInput = pronounFollowUp && lastUser ? `${lastUser.content}\nFollow-up: ${userMessage}` : userMessage;
      
      // Add timeout to embedding request (30 seconds)
      const embedPromise = openai.embeddings.create({ model: "text-embedding-3-small", input: embedInput });
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Embedding timeout')), 30000)
      );
      
      const embed = await Promise.race([embedPromise, timeoutPromise]) as OpenAI.Embeddings.CreateEmbeddingResponse;
      queryEmbedding = embed.data[0].embedding as unknown as number[];
    } catch (error) {
      // Embedding failure should return a controlled error
      const errorMessage = error instanceof Error ? error.message : 'Unknown embedding error';
      console.error("[chat] embedding failed:", { error: errorMessage, userMessage: userMessage.substring(0, 100) });

      return new Response(JSON.stringify({
        error: "embedding_failed",
        message: "Unable to process your query. Please try again."
      }), {
        status: 502,
        headers: { "content-type": "application/json" }
      });
    }
    const t2 = Date.now();

    // Retrieve with error handling
    let index;
    try {
      index = loadIndex();
      if (!index || index.length === 0) {
        console.error('[chat] No documents available in index');
        return new Response(JSON.stringify({
          error: "no_content",
          message: "Service is temporarily unavailable. Please try again later."
        }), {
          status: 503,
          headers: { "content-type": "application/json" }
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown index loading error';
      console.error('[chat] Failed to load index:', errorMessage);
      return new Response(JSON.stringify({
        error: "index_loading_failed",
        message: "Unable to access content. Please try again."
      }), {
        status: 500,
        headers: { "content-type": "application/json" }
      });
    }
    
    // Index loaded successfully
    
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
    // Additional synonyms to catch natural language like "last thing you wrote"
    const asksLastProject = /\b(last|most\s+recent)\s+(project|thing\s+you\s+built|work(ed)?\s+on)\b/i.test(userMessage);
    const asksLastPost = /\b(last|most\s+recent)\s+(blog|post|article|thing\s+you\s+wrote|write\w*)\b/i.test(userMessage);
    
    // Enhanced project detection - more specific patterns and stronger prioritization
    const asksProjectsOnly = (
      // Direct project questions
      /\b(what\s+(kind\s+of\s+)?(project|projects)|tell\s+me\s+about.*(project|projects)|show\s+me.*(project|projects))/i.test(userMessage) ||
      // "projects you worked on/built" patterns
      /(project|projects)\s+(you\s+)?(worked|built|made|created)/i.test(userMessage) ||
      // Numbered project requests
      /\b\d+\s+(project|projects)\b/i.test(userMessage) ||
      // General project inquiry without blog/post mentions
      (/\b(project|projects)\b/i.test(userMessage) && !/\b(post|blog|article|write|wrote|writing)\b/i.test(userMessage))
    );
    
    const asksPostsOnly = (
      // Direct blog/post questions
      /\b(what\s+(kind\s+of\s+)?(blog|post|article)|tell\s+me\s+about.*(blog|post|article)|show\s+me.*(blog|post|article))/i.test(userMessage) ||
      // "posts you wrote" patterns  
      /(blog|post|article)\s+(you\s+)?(wrote|written|published|created)/i.test(userMessage) ||
      // General blog/post inquiry without project mentions
      (/\b(post|blog|article|write|wrote|writing)\b/i.test(userMessage) && !/\b(project|projects)\b/i.test(userMessage))
    );
    const asksPrevious = /(previous|before\s+that|prior|earlier\s+than\s+that)/i.test(userMessage);
    const asksResume = /\b(resume|work\s+experience|job|employment|career|background|skills|education)\b/i.test(userMessage);
    const asksContact = /(what(?:'s| is)\s*(your)?\s*email|email\s*address|e-mail|contact\b|reach\s+(you|out)|how\s+can\s+i\s+contact\s+you)/i.test(userMessage);

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
          try { console.info("[chat] override_selected", { reason: "previous_of_same_type", anchor: { type: anchor.type, slug: anchor.slug, date: anchor.date }, selected: { type: prev.type, slug: prev.slug, date: prev.date } }); } catch { void 0; }
          contextDocs = [prev, ...contextDocs.filter((d) => d.slug !== prev.slug)].slice(0, 5);
        }
      }
    } else if (asksResume || asksContact) {
      // Prioritize resume information for work experience queries
      const resumeInfo = getResumeInfo(index);
      if (resumeInfo) {
        try { console.info("[chat] override_selected", { reason: asksContact ? "contact_resume_priority" : "resume_priority", selected: { type: resumeInfo.type, slug: resumeInfo.slug } }); } catch { void 0; }
        contextDocs = [resumeInfo, ...contextDocs.filter((d) => d.id !== resumeInfo.id)].slice(0, 5);
      }
    } else if (asksLatestProject || asksLastProject) {
      const latestProj = getLatestProject(index);
      if (latestProj) {
        try { console.info("[chat] override_selected", { reason: asksLatestProject ? "latest_project" : "last_project", selected: { type: latestProj.type, slug: latestProj.slug, date: latestProj.date } }); } catch { void 0; }
        contextDocs = [latestProj, ...contextDocs.filter((d) => d.slug !== latestProj.slug)].slice(0, 5);
      }
    } else if (asksLatestPost || asksLastPost) {
      const latestP = getLatestPost(index);
      if (latestP) {
        try { console.info("[chat] override_selected", { reason: asksLatestPost ? "latest_post" : "last_post", selected: { type: latestP.type, slug: latestP.slug, date: latestP.date } }); } catch { void 0; }
        contextDocs = [latestP, ...contextDocs.filter((d) => d.slug !== latestP.slug)].slice(0, 5);
      }
    } else if (asksProjectsOnly) {
      // For project queries, prioritize project content strongly
      const onlyProjects = filterByType(retrieved, "project");
      if (onlyProjects.length > 0) {
        // If we have projects from retrieval, use only those
        contextDocs = onlyProjects.slice(0, 10); // Allow more projects to be shown
        console.info("[chat] project_priority_applied", { 
          reason: "projects_only_intent", 
          projectCount: onlyProjects.length,
          originalRetrievalCount: retrieved.length 
        });
      } else {
        // Fallback: get all projects from index if none in retrieved
        const allProjects = filterByType(index, "project");
        if (allProjects.length > 0) {
          contextDocs = allProjects.slice(0, 10);
          console.info("[chat] project_fallback_applied", { 
            reason: "no_projects_in_retrieval", 
            fallbackProjectCount: allProjects.length 
          });
        }
      }
    } else if (asksPostsOnly) {
      const onlyPosts = filterByType(contextDocs, "post");
      if (onlyPosts.length > 0) contextDocs = onlyPosts;
    }
    if (earliest) {
      try { console.info("[chat] override_selected", { reason: "earliest_post", selected: { type: earliest.type, slug: earliest.slug, date: earliest.date } }); } catch { void 0; }
      contextDocs = [earliest, ...contextDocs.filter((d) => d.id !== earliest.id)].slice(0, 5);
    }
    // For technology queries, use larger context to fit more projects
    const isTechQuery = /\b(pytorch|tensorflow|react|next\.js|python|machine learning|ml|ai|nlp|data analysis)\b/i.test(userMessage.toLowerCase());
    const contextSize = isTechQuery ? PROMPT_CONFIG.search.techQueryContextSize : PROMPT_CONFIG.search.defaultContextSize;
    const { context, sources } = buildContext(contextDocs, contextSize, userMessage);
    // Provide current UTC time so the model can interpret relative time
    const nowIso = new Date().toISOString();
    try { console.info("[chat] time_context", { nowIso }); } catch { void 0; }
    // Lightweight diagnostics
    try {
      const diag = {
        indexSize: index.length,
        retrievedCount: retrieved.length,
        contextCount: contextDocs.length,
        intent: {
          asksLatestProject,
          asksLatestPost,
          asksLastProject,
          asksLastPost,
          asksProjectsOnly,
          asksPostsOnly,
          asksPrevious: Boolean(asksPrevious),
          asksResume,
          asksContact,
          earliest: Boolean(earliest),
        },
        typesInContext: contextDocs.reduce((acc: Record<string, number>, d) => {
          acc[d.type] = (acc[d.type] || 0) + 1;
          return acc;
        }, {}),
        topSlugs: contextDocs.map((d) => `${d.type}:${d.slug}`),
        nowIso,
      };
      console.info("[chat] retrieval_diag", diag);
    } catch {
      // best-effort diagnostics only
      void 0;
    }

    // If contact intent, try to extract an email string from resume/about-me context to nudge the model
    let contactRule = "";
    if (asksContact) {
      try {
        let resumeText = contextDocs.map(d => d.text).join("\n\n");
        if (!resumeText || !/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(resumeText)) {
          // Fallback: scan the entire index for an email in resume/about-me docs
          const resumeDocs = index.filter(d => d.type === "resume");
          resumeText = resumeDocs.map(d => d.text).join("\n\n");
        }
        const match = resumeText.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
        if (match) {
          contactRule = `- If the user asks for my email, reply with ${match[0]} as my contact email.`;
        } else {
          contactRule = `- If the user asks for my email, share it if present in Context. If not present, say you don't have it.`;
        }
      } catch {
        contactRule = `- If the user asks for my email, share it if present in Context.`;
        void 0;
      }
    }

    // Put current time, context and question into a single user message
    const combinedUser = `Now: ${nowIso} (UTC)\n\nContext:\n${context}\n\nRules:\n- When the question asks for the first blog/post, identify the earliest by date in the Context.\n- When asked for the latest project or post, use the most recent by date.\n- When interpreting relative time terms (today/this week/last month/yesterday), use the Now timestamp above.\n- When asked for the previous item ("before that"), select the chronologically previous item of the same type.\n- When asked about work experience, employment, skills, or education, prioritize resume information.\n- Prefer projects when the user asks about what I built or worked on.\n- Include inline links using markdown [Title](URL).\n- Use the conversation history to resolve pronouns and follow-ups, but never override or invent facts beyond Context.\n${contactRule ? contactRule + "\n" : ""}\nQuestion: ${userMessage}`;

    // Use model from prompts configuration
    const preferred = PROMPT_CONFIG.model;
    console.info("[chat] model selection", { preferred, source: "prompts.ts" });
    try {
      // Add timeout to chat completion request (60 seconds)
      const chatPromise = openai.chat.completions.create({
        model: preferred,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...history.map((h) => ({ role: h.role as "user" | "assistant", content: h.content })),
          { role: "user", content: combinedUser },
        ],
        // GPT-5 parameters (temperature removed, new parameters added)
        max_completion_tokens: PROMPT_CONFIG.maxCompletionTokens, // GPT-5 uses max_completion_tokens
        reasoning_effort: PROMPT_CONFIG.reasoningEffort, // Controls depth of reasoning
        verbosity: PROMPT_CONFIG.verbosity, // Controls response length/detail
        stream: true,
      });
      
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Chat completion timeout')), 60000)
      );
      
      const response = await Promise.race([chatPromise, timeoutPromise]) as unknown as AsyncIterable<OpenAI.Chat.Completions.ChatCompletionChunk>;
      const encoder = new TextEncoder();
      const stream = new ReadableStream<Uint8Array>({
        start(controller) {
          (async () => {
            try {
              for await (const chunk of response) {
                const choice = chunk.choices?.[0];
                const delta = choice?.delta?.content ?? "";
                if (delta) controller.enqueue(encoder.encode(delta));
              }
            } catch {
              controller.error(new Error("stream_error"));
            } finally {
              const genEnd = Date.now();
              // Server-side LLM analytics capture
              try {
                const clientKey = getClientKey(req);
                await captureAiGeneration({
                  model: preferred,
                  latencyMs: genEnd - t1,
                  inputMessages: [
                    ...history.map(h => ({ role: h.role, content: h.content })),
                    { role: 'user', content: userMessage } // Use original user message, not combined
                  ],
                  outputChoices: [],
                  userAgent: req.headers.get('user-agent') || undefined,
                  clientIp: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || undefined,
                  conversationLength: history.length + 1,
                  userMessageLength: userMessage.length,
                  distinctId: clientKey // Use client key as distinct ID for now
                });
              } catch {
                // ignore analytics errors
                void 0;
              }
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
      console.error("[chat] chat.completions failed", {
        status,
        message,
        preferred,
        userMessage: userMessage.substring(0, 100)
      });

      let errorResponse = {
        error: "model_unavailable",
        message: "AI service is temporarily unavailable. Please try again."
      };

      // Handle specific OpenAI error codes
      if (status === 429) {
        // Get latest blog post for friendly message
        let latestPostUrl = "/blog"; // fallback
        try {
          const index = loadIndex();
          const latestPost = getLatestPost(index);
          if (latestPost) {
            latestPostUrl = latestPost.url;
          }
        } catch (error) {
          console.warn('[chat] Failed to get latest post for rate limit message:', error);
        }

        errorResponse = {
          error: "rate_limited",
          message: `You've asked me a bunch of questions! I've temporarily rate limited you to prevent spam. You can ask me more questions soon. In the meantime, check out my latest blog post: [${latestPostUrl}](${latestPostUrl})`
        };
      } else if (status === 401) {
        errorResponse = {
          error: "authentication_failed",
          message: "Service configuration error. Please try again later."
        };
      }

      return new Response(JSON.stringify(errorResponse), {
        status: status || 502,
        headers: { "content-type": "application/json" }
      });
    }
    // (Unreachable: returns happen in both success paths above)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[chat] Unexpected error:', {
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
      url: req.url,
      method: req.method
    });

    return new Response(JSON.stringify({
      error: "internal_error",
      message: "An unexpected error occurred. Please try again."
    }), {
      status: 500,
      headers: { "content-type": "application/json" }
    });
  }
}