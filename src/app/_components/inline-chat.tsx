"use client";

import { useEffect, useRef, useState } from "react";

type Message = { role: "system" | "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "What's the latest project Shreyash has worked on?",
  "What was the latest blog post about?",
];

function renderMarkdown(md: string) {
  // Very small, safe markdown renderer: links, bold/italic, lists, paragraphs
  // 1) Escape HTML
  const escaped = md.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  // 2) Links [text](url) -> <a>
  const withLinks = escaped.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_m, text, url) => {
    try {
      const u = new URL(url, typeof window !== "undefined" ? window.location.origin : "http://localhost");
      return `<a href="${u.pathname}${u.search}${u.hash}" class="underline">${text}</a>`;
    } catch {
      return text;
    }
  });
  // 3) Bold **text** and Italic *text*
  const withBold = withLinks.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  const withItal = withBold.replace(/\*([^*]+)\*/g, "<em>$1</em>");
  // 4) Lists: - item
  const withLists = withItal.replace(/(?:^|\n)-\s+([^\n]+)/g, (m, item) => `\n<li>${item}</li>`);
  const wrappedLists = withLists.replace(/(?:<li>[^<]+<\/li>\n?)+/g, (m) => `<ul class="list-disc pl-5">${m}</ul>`);
  // 5) Newlines -> paragraphs
  const parts = wrappedLists.split(/\n\n+/).map((p) => `<p>${p.replace(/\n/g, "<br/>")}</p>`);
  return parts.join("");
}

export function InlineChat() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [sources, setSources] = useState<{ title: string; url: string }[]>([]);
  const [focusUrls, setFocusUrls] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const caretRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    const id = setInterval(() => {
      if (!caretRef.current) return;
      caretRef.current.style.opacity = caretRef.current.style.opacity === "0" ? "1" : "0";
    }, 650);
    return () => clearInterval(id);
  }, []);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    setMessages((m) => [...m, { role: "user", content: trimmed }]);
    setInput("");
    setLoading(true);
    setSources([]);
    try {
      const history = messages
        .filter((m) => m.role === "user" || m.role === "assistant")
        .map((m) => ({ role: m.role === "system" ? "user" : m.role, content: m.content }));
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ message: trimmed, focusUrls, history }),
      });
      if (!res.ok || !res.body) throw new Error("Request failed");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let assistantText = "";
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        const markerStart = chunk.indexOf("[[SOURCES]]");
        if (markerStart >= 0) {
          const jsonStart = markerStart + "[[SOURCES]]".length;
          const markerEnd = chunk.indexOf("[[/SOURCES]]", jsonStart);
          if (markerEnd > jsonStart) {
            const jsonPayload = chunk.slice(jsonStart, markerEnd);
            try {
              const parsed = JSON.parse(jsonPayload);
              setSources(parsed);
              const urls: string[] = Array.isArray(parsed) ? parsed.map((s: any) => s?.url).filter(Boolean) : [];
              if (urls.length > 0) setFocusUrls(urls);
            } catch {}
          }
          assistantText += chunk.slice(0, markerStart);
        } else {
          assistantText += chunk;
        }
        setMessages((m) => {
          const last = m[m.length - 1];
          if (last?.role === "assistant") {
            return [...m.slice(0, -1), { role: "assistant", content: assistantText }];
          }
          return [...m, { role: "assistant", content: assistantText }];
        });
      }
    } catch {
      setMessages((m) => [...m, { role: "assistant", content: "Sorry, something went wrong." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section aria-labelledby="inline-chat-heading" className="w-full">
      <div className="mx-auto max-w-3xl rounded-2xl border border-gray-200 dark:border-gray-800 bg-white/60 dark:bg-black/40 backdrop-blur p-4 sm:p-6 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h2 id="inline-chat-heading" className="text-base sm:text-lg font-semibold">
            Ask about me
          </h2>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="space-y-3 max-h-72 sm:max-h-80 overflow-y-auto pr-1">
          {messages.length === 0 && (
            <div className="text-sm sm:text-base opacity-80">
              Hi, I'm Shreyash (AI). What would you like to know about me?
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} className={m.role === "user" ? "text-right" : "text-left"}>
              <div
                className={
                  m.role === "user"
                    ? "inline-block rounded-xl bg-gray-900 text-white dark:bg-gray-100 dark:text-black px-3 py-2 max-w-[80%] text-sm sm:text-base"
                    : "inline-block rounded-xl bg-gray-100 text-black dark:bg-gray-900 dark:text-white px-3 py-2 max-w-[80%] text-sm sm:text-base"
                }
                dangerouslySetInnerHTML={
                  m.role === "assistant"
                    ? { __html: renderMarkdown(m.content) }
                    : undefined
                }
              >
                {m.role !== "assistant" ? m.content : null}
              </div>
            </div>
          ))}

          {/* Suggestion chips */}
          {messages.length === 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  className="text-left text-sm sm:text-base border border-gray-200 dark:border-gray-800 rounded-lg px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-950"
                  onClick={() => send(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Input */}
        <div className="mt-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="flex items-center gap-2"
          >
            <div className="relative flex-1">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-transparent pl-9 pr-3 py-3 text-sm sm:text-base focus:outline-none"
                maxLength={1000}
                aria-label="Ask a question"
              />
              {input.length === 0 && (
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm sm:text-base select-none flex items-center gap-2">
                  <span ref={caretRef}>▍</span>
                  <span>Ask me anything</span>
                </span>
              )}
            </div>
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-black text-white dark:bg-white dark:text-black px-4 py-3 text-sm sm:text-base disabled:opacity-50"
            >
              Send
            </button>
          </form>
          <div className="pt-2 text-[10px] opacity-70">
            AI can hallucinate. Answers are based only on content from this site.
          </div>
        </div>
      </div>
    </section>
  );
}


