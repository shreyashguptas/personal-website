"use client";

import { useEffect } from "react";

// Fires a one-time, fire-and-forget warmup the moment the homepage mounts, so the
// chat serverless function boots and its index pre-loads while the visitor reads —
// before they ever type. Guarded to once per tab session.
export function ChatWarmup() {
  useEffect(() => {
    try {
      if (sessionStorage.getItem("sg_chatWarmed") === "1") return;
      sessionStorage.setItem("sg_chatWarmed", "1");
    } catch {
      // sessionStorage unavailable (e.g. private mode) — proceed with warmup anyway.
    }
    // keepalive so the request survives a fast navigation away from the homepage.
    fetch("/api/chat/warmup", { method: "GET", keepalive: true }).catch(() => {});
  }, []);

  return null;
}
