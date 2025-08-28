"use client";

import { useEffect, useRef, useState } from "react";

type Message = { role: "system" | "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "What is Shreyash working on lately?",
  "Show projects Shreyash has built.",
  "What are the latest blog posts?",
  "How to contact Shreyash?",
];

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "system",
      content:
        "Hi, I'm Shreyash (AI). What would you like to know about me?",
    },
  ]);
  const [sources, setSources] = useState<{ title: string; url: string }[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open]);

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
      if (!res.ok || !res.body) {
        throw new Error("Request failed");
      }
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
    <>
      <button
        aria-label="Open chat"
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-4 right-4 z-40 rounded-full bg-black text-white dark:bg-white dark:text-black px-4 py-3 shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
      >
        {open ? "Close" : "Chat"}
      </button>

      {open && (
        <div className="fixed bottom-20 right-4 z-40 w-[92vw] sm:w-96 max-w-[92vw] bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl shadow-2xl flex flex-col overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
            <div className="font-semibold">Chat with Shreyash (AI)</div>
            <button
              aria-label="Close chat"
              onClick={() => setOpen(false)}
              className="text-sm opacity-70 hover:opacity-100"
            >
              ✕
            </button>
          </div>
          <div ref={scrollRef} className="p-4 space-y-3 h-80 overflow-y-auto">
            {messages.map((m, i) => (
              <div key={i} className={m.role === "user" ? "text-right" : "text-left"}>
                <div
                  className={
                    m.role === "user"
                      ? "inline-block rounded-lg bg-gray-900 text-white dark:bg-gray-100 dark:text-black px-3 py-2 max-w-[80%]"
                      : "inline-block rounded-lg bg-gray-100 text-black dark:bg-gray-900 dark:text-white px-3 py-2 max-w-[80%]"
                  }
                >
                  {m.content}
                </div>
              </div>
            ))}

            {!loading && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    className="text-left text-sm border border-gray-200 dark:border-gray-800 rounded-lg px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-950"
                    onClick={() => send(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {sources.length > 0 && (
              <div className="pt-2 text-xs opacity-70">
                Sources:
                <ul className="list-disc pl-5">
                  {sources.map((s, idx) => (
                    <li key={idx}>
                      <a className="underline" href={s.url}>
                        {s.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <div className="p-3 border-t border-gray-200 dark:border-gray-800">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
              className="flex items-center gap-2"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about me..."
                className="flex-1 rounded-lg border border-gray-200 dark:border-gray-800 bg-transparent px-3 py-2 focus:outline-none"
                maxLength={1000}
              />
              <button
                type="submit"
                disabled={loading}
                className="rounded-lg bg-black text-white dark:bg-white dark:text-black px-3 py-2 disabled:opacity-50"
              >
                Send
              </button>
            </form>
            <div className="pt-2 text-[10px] opacity-70">
              AI can hallucinate. Answers are based only on content from this site.
            </div>
          </div>
        </div>
      )}
    </>
  );
}


