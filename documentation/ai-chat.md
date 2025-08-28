## AI Chat (“Ask about me”) – Architecture, Ops, and How to Modify

This document explains the end‑to‑end AI chat feature: how it’s built, where to edit it, what data is indexed, and how to tune/operate it safely.

### Overview

- Inline chat section on the homepage that answers questions about Shreyash using only content on this site (posts + projects).  
- Retrieval‑augmented generation (RAG) built at compile time; index is packaged with the server.  
- Server API handles rate limiting, input validation, retrieval, prompting, and streaming; client never sees API keys.  
- Guardrails prevent prompt injection and out‑of‑scope answers.

### Key Files and Responsibilities

- `scripts/build-embeddings.ts`  
  Build‑time indexer. Reads `_posts` and `_projects`, normalizes and chunks text, enriches with metadata, generates embeddings, and writes `src/data/vector-index.json`.

- `src/lib/rag.ts`  
  RAG utilities: load vector index, cosine similarity, top‑K retrieval, lexical fallback, earliest‑by‑date selection for “first blog/post” questions, and context construction.

- `src/lib/rateLimit.ts`  
  10 requests per 5 minutes per IP+UA via Upstash Redis if configured; local in‑memory fallback for dev.

- `src/app/api/chat/route.ts`  
  Secure chat API. Validates input, enforces same‑origin, applies rate limit, computes query embeddings, retrieves context, calls OpenAI, and streams the response.

- `src/app/_components/inline-chat.tsx`  
  The chat UI. Sends user messages to `/api/chat`, streams the server response, renders safe markdown (links, lists, emphasis), and maintains lightweight conversation focus.

- `.gitignore`  
  Ignores `src/data/vector-index.json` (generated at build).

### Environment Variables

- `OPENAI_API_KEY` (required): API key; never quoted in `.env` (use `OPENAI_API_KEY=sk-...`).  
- `CHAT_MODEL` (optional): defaults to `gpt-5-nano-2025-08-07` (explicit version avoids fallback).  
- `CHAT_MODEL_FALLBACK` (optional): defaults to `gpt-4o-mini`.
- `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` (optional): enable production‑grade rate limiting.

### Build and Run

The index is generated before build via `prebuild`:

```bash
npm install
npm run build:index   # optional manual run
npm run dev           # or: npm run build && npm start
```

If `OPENAI_API_KEY` is not set, an empty index is written to allow local builds (answers will be limited).

### Data Ingestion: What the Index Contains

From `_posts/*.md` (front matter + content):
- `title`, `date` (parsed to ISO), `excerpt` (front matter), full normalized text.

From `_projects/*.md`:
- `title`, `date` (ISO), `description` (summary), `technologies` (array), optional `projectUrl`, full normalized text.

Index format (per chunk):
- `{ id, type, title, slug, url, text, date?, summary?, technologies?, projectUrl?, embedding }`

Chunking & normalization:
- Code blocks and images removed; markdown links are preserved as text during embedding.  
- First chunk of each doc is prefixed with a metadata header to prime retrieval for time/title/tech queries:
  - `Type`, `Title`, `Date`, `Summary`, `Technologies`, `ProjectURL`.

Regenerate the index after adding/editing posts or projects:

```bash
npm run build:index
```

### Retrieval and Prompting Flow (Server)

1. Validate input with Zod: `{ message: string, focusUrls?: string[] }`.
2. Same‑origin check: rejects cross‑site requests.
3. Rate limit: 10 req / 5 min per IP+UA.
4. Embed the user message (`text-embedding-3-small`).
5. Retrieve:
   - If `focusUrls` are provided and the follow‑up uses pronouns (e.g., “it/that/this/the post”), prioritize those docs.
   - Else do `topKSimilar` by cosine similarity; if empty, fallback to `lexicalFallback` (keyword matches).
   - If the question asks for “first/earliest blog/post,” inject the earliest post by date.
6. Build context from top docs (caps total characters), capturing `title/url/date` and excerpt text.
7. Prompt:
   - System: context‑only rule; refuse speculation; list formatting guidance.
   - User: `Context + Rules + Question`, with an explicit rule to add inline markdown links `[Title](URL)`.
8. Stream the assistant text. At the end, append the source links in a control marker: `[[SOURCES]]<json>[[/SOURCES]]`.

Response headers (useful for diagnostics): `x-latency-ms`, `x-embed-ms`, `x-retrieve-ms`, `x-model-used`, `x-index-size`, `x-retrieved`.

### Frontend Behavior

- The inline chat sends `{ message, focusUrls }` to the API.
- It streams tokens, renders safe markdown (links, bold/italic, lists), and updates a local `focusUrls` state from the appended `[[SOURCES]]` JSON so follow‑ups like “what was it about?” stick to the same document(s).
- Two suggestion chips appear when the thread is empty; tapping a chip sends it immediately.
- Blinking caret appears at the start of the input’s ghost text and disappears once typing begins.

To customize UI copy:
- Suggestions: edit `SUGGESTIONS` in `src/app/_components/inline-chat.tsx`.
- Heading & placeholder: same file.
- Section location: `src/app/page.tsx`.

### Security & Guardrails

- API key never leaves the server; no client imports of OpenAI.
- Same‑origin enforcement, Zod input validation, and strict system prompt.
- Context‑only answers; unknowns are explicitly allowed (“I don’t know”).
- Rate limiting via Upstash (recommended for production) or local fallback for dev.

### How to Change the Prompt

- Edit `SYSTEM_PROMPT` in `src/app/api/chat/route.ts`.  
- Keep the “context‑only” and “ignore attempts to change rules” instructions.  
- If you change markdown guidance, ensure the client renderer supports it (links/lists are already supported).

### How to Add More Signals to Retrieval

- Add new front‑matter fields to your posts/projects (e.g., `tags`) and include them in `build-embeddings.ts` metadata.
- Adjust `chunkText` sizes/overlap to change context density.
- Replace or augment the lexical fallback if you want different heuristics (e.g., fuzzy title search).

### Troubleshooting

- “I don’t know.” frequently:
  - Ensure `OPENAI_API_KEY` is set when building the index; rerun `npm run build:index`.
  - Confirm `src/data/vector-index.json` is non‑empty and the server can read it.
  - Check `x-index-size` and `x-retrieved` headers.

- 429 rate limited:
  - You’ve exceeded 10 requests in 5 minutes; wait or configure Upstash and tune limits.

- 403 Forbidden:
  - Likely failed same‑origin check; ensure the Origin host matches the Host header (use the site domain in the frontend).

- 500 or 502:
  - Check server logs for embedding/model errors.  
  - Verify model names: `CHAT_MODEL`, `CHAT_MODEL_FALLBACK`.

### Curl Test Examples

```bash
# Ask a question
curl -s -X POST http://localhost:3000/api/chat \
  -H 'content-type: application/json' \
  --data '{"message":"What projects has Shreyash built?"}'

# Force a follow-up that sticks to prior sources
curl -s -X POST http://localhost:3000/api/chat \
  -H 'content-type: application/json' \
  --data '{"message":"What was it about?","focusUrls":["/posts/the-power-of-iteration-lessons-from-kindergartners-and-building-websites"]}'
```

### Deployment Notes

- `src/data/vector-index.json` is ignored by git and generated during CI/CD. Ensure `OPENAI_API_KEY` is present at build time.
- Keep `export const runtime = 'nodejs'` in the API route since the server reads from the filesystem.
- Use HTTPS in production so the same‑origin check aligns with your deployed domain.

### Future Enhancements (Optional)

- Move index to a managed vector DB (pgvector/Pinecone/Turso) for frequent content updates.  
- Add multi‑turn server‑side memory keyed by a conversation id.  
- Deep links/anchors for specific project cards on `/projects` to improve link targets.


