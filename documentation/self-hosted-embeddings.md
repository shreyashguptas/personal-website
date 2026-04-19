---
title: Self-Hosted Embeddings — Pi + Cloudflare Tunnel + Ollama
description: How the chat's RAG embeddings are generated on a home-hosted Raspberry Pi and reached securely from Vercel.
lastUpdated: 2026-04-19
---

# Self-Hosted Embeddings

The AI chat on shreyashg.com uses retrieval-augmented generation (RAG). The embeddings that power retrieval — both the pre-computed corpus vectors and the live query vectors — are generated on a self-hosted Raspberry Pi in the home network, reached by Vercel through a Cloudflare Tunnel. This document explains the architecture, where everything lives, and how to operate it.

## Overview

- **Chat model (Groq):** `groq/compound`, called from the Vercel function in `src/app/api/chat/route.ts`. Not related to this document.
- **Embedding model (self-hosted):** `bge-m3` running on Ollama on a Raspberry Pi 5 (8GB, Debian Trixie). 1024-dim vectors, 8192-token context, open-source, top-tier retrieval quality.
- **Access path:** Vercel function → `https://embed.blockscopes.com/api/embed` → Cloudflare Tunnel → Pi auth proxy → Ollama.

## Architecture

```
┌────────────────────────┐
│ Vercel (shreyashg.com) │
│   /api/chat route      │
└──────────┬─────────────┘
           │ HTTPS + Bearer token
           ▼
┌────────────────────────┐
│  Cloudflare Edge       │
│  embed.blockscopes.com │
└──────────┬─────────────┘
           │ Cloudflare Tunnel
           │ (outbound from Pi)
           ▼
┌────────────────────────────────┐
│ Raspberry Pi 5 (pi-5-1)        │
│                                │
│  cloudflared ──┐               │
│                ▼               │
│  Python auth proxy  :11435     │
│    (bearer check, rate limit)  │
│                │               │
│                ▼               │
│  Ollama        :11434          │
│    model: bge-m3               │
└────────────────────────────────┘
```

- Nothing inbound on the home router. The tunnel is an outbound connection from the Pi to Cloudflare.
- Only the auth proxy's `/api/embed` endpoint is reachable from the internet. Ollama itself is bound to `127.0.0.1`.

## Components on the Pi

| Component | Purpose | Bind address | Systemd unit |
|---|---|---|---|
| `ollama` | Serves the `bge-m3` embedding model | `127.0.0.1:11434` | `ollama.service` |
| `embed-proxy` | Bearer auth, path allowlist, rate limiting | `127.0.0.1:11435` | `embed-proxy.service` |
| `cloudflared` | Outbound tunnel to Cloudflare | — | `cloudflared.service` |

All three are systemd units and auto-start on boot.

## File map on the Pi

| Path | What it is |
|---|---|
| `/usr/local/bin/ollama` | Ollama binary (downloaded from GitHub releases) |
| `/usr/share/ollama/` | Ollama's home dir (models cached here) |
| `/opt/embed-proxy/proxy.py` | The Python auth+rate-limit proxy |
| `/etc/embed-proxy.env` | Bearer secret (mode 600, root-readable only) |
| `/etc/systemd/system/ollama.service` | Ollama service definition |
| `/etc/systemd/system/embed-proxy.service` | Proxy service definition (DynamicUser, PrivateTmp, ProtectSystem=strict) |
| `/etc/cloudflared/config.yml` | Tunnel ingress rules |
| `/etc/cloudflared/<tunnel-uuid>.json` | Tunnel credentials |

## Secrets inventory

The bearer secret (`EMBED_SECRET`) is the only secret in this setup. It lives in three places and must match in all three:

| Location | How to read / edit |
|---|---|
| Pi: `/etc/embed-proxy.env` | `sudo vi /etc/embed-proxy.env`, then `sudo systemctl restart embed-proxy` |
| Local dev: `.env` at repo root | Edit the `EMBED_SECRET=` line. `.env` is gitignored; never commit it. |
| Vercel: Project Settings → Environment Variables | `npx vercel env ls` / `add` / `rm` |

Do **not** store the secret in `documentation/`, in git history, or in chat logs.

### Rotating the secret

1. Generate a new value: `openssl rand -hex 32`
2. Update `/etc/embed-proxy.env` on the Pi: `sudo vi /etc/embed-proxy.env`, then `sudo systemctl restart embed-proxy`.
3. Update `.env` at the repo root.
4. Update Vercel for each scope:
   ```
   npx vercel env rm EMBED_SECRET production
   npx vercel env add EMBED_SECRET production --value '<new-secret>' --yes
   # repeat for development, preview
   ```
5. Redeploy so running functions pick up the new value: `npx vercel --prod`.

Expected downtime during rotation: ~10 seconds while the proxy restarts. Existing chat conversations in flight will fail once and be retryable.

## Service management

```bash
# Check status of all three
ssh shreyash@pi-5-1 'systemctl is-active ollama embed-proxy cloudflared'

# Restart a service
ssh shreyash@pi-5-1 'sudo systemctl restart embed-proxy'

# Tail logs
ssh shreyash@pi-5-1 'sudo journalctl -u embed-proxy -f'
ssh shreyash@pi-5-1 'sudo journalctl -u ollama -f'
ssh shreyash@pi-5-1 'sudo journalctl -u cloudflared -f'
```

## Rate-limit configuration

Rate limiting happens in the proxy (`/opt/embed-proxy/proxy.py`) via a global token bucket.

| Constant | Current value | Meaning |
|---|---|---|
| `BUCKET_CAPACITY` | `30` | Max burst of authenticated requests |
| `REFILL_PER_SEC` | `0.1` | Sustained rate: 1 token per 10s = 6/min |

Properties:
- Only authenticated (`Bearer <secret>`) requests count against the bucket. 401s are free — brute-force attempts don't deplete your quota.
- When exhausted, the proxy returns `429 rate_limited` with a `Retry-After: <seconds>` header.
- Events are logged: `sudo journalctl -u embed-proxy | grep rate_limited`.

To tune: edit the constants in `proxy.py`, then `sudo systemctl restart embed-proxy`. No code outside the Pi needs to know.

**Sizing guidance:**
- A single chat message = 1 embed request.
- A full Vercel deploy = as many embed requests as the index has chunks (currently ~80–120, batched at 8 per call so ~10–15 requests).
- Default config handles both comfortably.

## Swapping the embedding model

The embedding model is named in one place: `PROMPT_CONFIG.embeddings.model` in `src/lib/prompts.ts`.

To switch to a different model (e.g., `nomic-embed-text`, `mxbai-embed-large`):

1. Pull the model on the Pi: `ssh shreyash@pi-5-1 'sudo -u ollama /usr/local/bin/ollama pull <model-name>'`.
2. Update `src/lib/prompts.ts` with the new model name.
3. **Important:** vectors from different models are not comparable. You must rebuild the whole index.
4. Locally: `npm run build:index`.
5. Commit the updated `src/data/vector-index.json` — actually, the index file is gitignored (it's regenerated by Vercel's `prebuild`).
6. Deploy: `npx vercel --prod`. Vercel's prebuild will hit the Pi and regenerate the index fresh.

If the new model has a different vector dimensionality (e.g., 768 vs. 1024), nothing else needs to change — the retrieval code is dimension-agnostic.

## Rebuilding the vector index

The index lives at `src/data/vector-index.json` and is gitignored.

| When it's rebuilt | What runs |
|---|---|
| `npm run build` (local or Vercel) | `prebuild` hook → `npm run build:index` → hits Pi |
| Manually: `npm run build:index` | Same, without running `next build` after |

A rebuild takes ~60 seconds on a warm Pi (bge-m3 already in RAM). First build after a reboot adds ~3s to load the model.

## Troubleshooting

| Symptom | Likely cause | Where to look |
|---|---|---|
| Chat returns `503 server_configuration` | Env vars missing on Vercel | `npx vercel env ls` — confirm `EMBED_URL`, `EMBED_SECRET`, `GROQ_API_KEY` |
| Chat returns `502 embed upstream` | Pi or proxy is down | `ssh pi-5-1 systemctl is-active ollama embed-proxy cloudflared` |
| Chat returns `401 unauthorized` from upstream | Secret mismatch | Compare `/etc/embed-proxy.env` on Pi to Vercel env var value |
| Chat returns `429 rate_limited` | Burst or DoS | `journalctl -u embed-proxy -f` — count rate_limit events |
| Pi up but `embed.blockscopes.com` unreachable | Cloudflared tunnel down | `systemctl status cloudflared` on Pi; check Cloudflare dashboard for tunnel status |
| Build fails at `npm run build:index` | Pi offline during build | Either bring Pi online, or skip the build-index step (the route will 503 on chat until the index is regenerated) |

Quick end-to-end smoke test from anywhere:

```bash
curl -s https://embed.blockscopes.com/healthz
# → "ok"

curl -s -X POST https://embed.blockscopes.com/api/embed \
  -H "authorization: Bearer $EMBED_SECRET" \
  -H "content-type: application/json" \
  -d '{"model":"bge-m3","input":"smoke test"}' \
  | python3 -c "import sys,json; print('dims:', len(json.load(sys.stdin)['embeddings'][0]))"
# → "dims: 1024"
```

## Security threat model

What's actually reachable from the internet: one endpoint, `POST https://embed.blockscopes.com/api/embed`, only with a valid bearer token. Everything else returns 401 or 404.

Layers of defense (outside in):
1. **No inbound ports on the home router.** Cloudflare Tunnel is outbound-only.
2. **Cloudflare edge.** TLS termination, DDoS protection, IP reputation filtering — all free.
3. **Tunnel ingress allowlist.** Exactly one hostname routes to exactly one internal service. Everything else gets `http_status:404`.
4. **Python auth proxy.** Bearer check (256-bit random), path allowlist (only `POST /api/embed` and `GET /healthz`), body size cap (256KB), token-bucket rate limit.
5. **Ollama bound to `127.0.0.1`.** Unreachable from the tunnel — only the proxy can talk to it.
6. **Systemd hardening** on the proxy: `DynamicUser`, `NoNewPrivileges`, `PrivateTmp`, `ProtectSystem=strict`, `ProtectHome`.

Worst case if the bearer secret leaks: an attacker can generate embeddings (CPU DoS, capped by the rate limiter). They cannot reach SSH, LAN, other services, the filesystem, or other Ollama endpoints (chat, generate, pull). Mitigation: rotate the secret (see above).

## Setup history

This infrastructure was stood up in one session on 2026-04-19. The commits that introduced it are on `main`:
- `feat(chat): self-host bge-m3 embeddings, drop OpenAI`
- Rate-limit proxy upgrades applied on the Pi only (not in git — proxy source is on the Pi).

The proxy's Python source is intentionally kept on the Pi rather than checked in, because it references nothing from the repo and belongs with the server, not the site.
