---
title: "Self-Hosted AI Chat (powers this site)"
date: "2026-04-19T00:00:00.000Z"
description: "The AI chat on shreyashg.com's home page runs on a Raspberry Pi 5 in my house. A 568M-parameter open-source embedding model (bge-m3) on Ollama generates vectors for every question; Groq handles the actual answer. Traffic reaches the Pi through a Cloudflare Tunnel — no open ports on my home network — and a small Python auth proxy with bearer-token authentication, path allowlisting, and token-bucket rate limiting. The full writeup, including architecture, security model, and the 9-minute build-time tradeoff, is in the blog post."
image: "/blog/content/self-hosted-embeddings-raspberry-pi.jpeg"
projectUrl: "https://shreyashg.com/posts/self-hosting-embeddings-on-a-raspberry-pi"
technologies: ["Raspberry Pi 5", "Ollama", "bge-m3", "Cloudflare Tunnel", "Groq", "Next.js", "RAG", "Python"]
---
