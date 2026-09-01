import { NextResponse } from "next/server";
import { loadIndex } from "@/lib/rag";
import { PROMPT_CONFIG } from "@/lib/prompts";

export const runtime = 'nodejs';

// Warm the upstream embedding/LLM connections in addition to pre-loading the index.
// Cheap (a 1-word embed + 1-token completion); set to false to only pre-load the index.
const WARM_UPSTREAMS = true;

// Lightweight warmup endpoint hit on page load so the chat serverless function is
// booted and its 11MB vector index is parsed into this instance's module cache
// BEFORE the visitor actually asks anything. Fire-and-forget; never throws to client.
export async function GET() {
  try {
    // Populate the per-instance index cache so the first real chat request is a cache hit.
    const index = loadIndex();

    if (WARM_UPSTREAMS) {
      const openRouterKey = process.env.OPENROUTER_API_KEY;
      const tasks: Promise<unknown>[] = [];

      // Prime the DeepInfra embedding path (TLS/DNS/provider routing).
      if (openRouterKey) {
        tasks.push(
          fetch("https://openrouter.ai/api/v1/embeddings", {
            method: "POST",
            headers: {
              "content-type": "application/json",
              "authorization": `Bearer ${openRouterKey}`,
            },
            body: JSON.stringify({
              model: PROMPT_CONFIG.embeddings.model,
              input: "warmup",
              encoding_format: "float",
              provider: { only: ["deepinfra"], allow_fallbacks: false },
            }),
          }).catch(() => {})
        );
      }

      // Prime the OpenRouter chat path with a 1-token throwaway completion.
      // Same key as the embedding call above - chat and embeddings are one vendor.
      if (openRouterKey) {
        tasks.push(
          fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
              "content-type": "application/json",
              "authorization": `Bearer ${openRouterKey}`,
            },
            body: JSON.stringify({
              model: process.env.OPENROUTER_MODEL || PROMPT_CONFIG.model,
              messages: [{ role: "user", content: "hi" }],
              max_tokens: 1,
              // Mirror the real chat call so the warmed route matches the routed
              // one: same provider pin, same retention filters, no thinking
              // tokens to eat the single warmup token.
              provider: {
                only: (process.env.OPENROUTER_PROVIDERS || PROMPT_CONFIG.providers)
                  .split(",")
                  .map((slug) => slug.trim())
                  .filter(Boolean),
                max_price: PROMPT_CONFIG.maxPrice,
                data_collection: "deny",
                zdr: true,
              },
              reasoning: { enabled: false },
              stream: false,
            }),
          }).catch(() => {})
        );
      }

      // Fire-and-forget; do not block the response on upstream warmups.
      void Promise.allSettled(tasks);
    }

    return NextResponse.json(
      { ok: true, indexed: index.length },
      { headers: { "cache-control": "no-store" } }
    );
  } catch {
    return NextResponse.json(
      { ok: false },
      { status: 200, headers: { "cache-control": "no-store" } }
    );
  }
}
