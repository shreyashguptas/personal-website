"use client";

import { useEffect, useRef, useState } from "react";

type Message = { role: "system" | "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "What is Shreyash working on lately?",
  "Show projects Shreyash has built.",
  "What are the latest blog posts?",
  "How to contact Shreyash?",
];

export function InlineChat() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [sources, setSources] = useState<{ title: string; url: string }[]>([]);
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
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ message: trimmed }),
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
        <div ref={scrollRef} className="space-y-3 max-h-56 sm:max-h-64 overflow-y-auto pr-1">
          {messages.map((m, i) => (
            <div key={i} className={m.role === "user" ? "text-right" : "text-left"}>
              <div
                className={
                  m.role === "user"
                    ? "inline-block rounded-xl bg-gray-900 text-white dark:bg-gray-100 dark:text-black px-3 py-2 max-w-[80%]"
                    : "inline-block rounded-xl bg-gray-100 text-black dark:bg-gray-900 dark:text-white px-3 py-2 max-w-[80%]"
                }
              >
                {m.content}
              </div>
            </div>
          ))}

          {!loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {SUGGESTIONS.slice(0, 2).map((s) => (
                <button
                  key={s}
                  className="text-left text-xs sm:text-sm border border-gray-200 dark:border-gray-800 rounded-lg px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-950"
                  onClick={() => send(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {sources.length > 0 && (
            <details className="pt-2 text-xs opacity-70">
              <summary className="cursor-pointer select-none">Sources</summary>
              <ul className="list-disc pl-5 mt-1">
                {sources.map((s, idx) => (
                  <li key={idx}>
                    <a className="underline" href={s.url}>
                      {s.title}
                    </a>
                  </li>
                ))}
              </ul>
            </details>
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
                placeholder="Ask me about my projects, posts, or background..."
                className="w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-transparent px-3 py-3 text-sm sm:text-base focus:outline-none"
                maxLength={1000}
                aria-label="Ask a question"
              />
              {input.length === 0 && (
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs sm:text-sm select-none">
                  Ask me anything <span ref={caretRef}>▍</span>
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


