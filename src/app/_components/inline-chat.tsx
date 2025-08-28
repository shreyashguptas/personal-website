"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

type Message = { role: "system" | "user" | "assistant"; content: string };

type TimeOfDay = "morning" | "afternoon" | "evening";

function getTimeOfDay(date: Date = new Date()): TimeOfDay {
  const hour = date.getHours();
  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 12 && hour < 18) return "afternoon";
  return "evening";
}

function buildSuggestions(period: TimeOfDay, returningVisitor: boolean): string[] {
  const base: string[] = [
    "What was the latest blog you wrote about?",
    "What’s the latest project you’ve worked on?",
  ];
  const byTime: Record<TimeOfDay, string[]> = {
    morning: [
      "Give me a quick overview to start my day.",
      "Recommend one recent post to read this morning.",
    ],
    afternoon: [
      "What problem are you currently exploring?",
      "Show me a recent project update.",
    ],
    evening: [
      "Summarize a project I should explore tonight.",
      "Recommend a short read from your blog.",
    ],
  };
  const returning = returningVisitor ? ["What changed since my last visit?"] : [];
  const set = [...byTime[period], ...base, ...returning];
  // De-dup while preserving order
  const seen = new Set<string>();
  const unique = set.filter((s) => (seen.has(s) ? false : (seen.add(s), true)));
  return unique.slice(0, 4);
}

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
  const [, setSources] = useState<{ title: string; url: string }[]>([]);
  const [focusUrls, setFocusUrls] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>("morning");
  const [returningVisitor, setReturningVisitor] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Try to auto-focus on mount; some mobile browsers may ignore for security.
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Removed custom blinking caret to rely on native caret for consistency

  // Compute greeting context and build suggestion list
  useEffect(() => {
    const period = getTimeOfDay();
    setTimeOfDay(period);
    let isReturning = false;
    try {
      isReturning = localStorage.getItem("sg_hasVisited") === "1";
      localStorage.setItem("sg_hasVisited", "1");
    } catch {
      // best-effort only
    }
    setReturningVisitor(isReturning);
    const built = buildSuggestions(period, isReturning);
    setSuggestions(built);
    console.info("[inline-chat] greeting_context", { period, returningVisitor: isReturning, suggestions: built });
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
              const parsed = JSON.parse(jsonPayload) as Array<{ title: string; url: string }>;
              setSources(parsed);
              const urls: string[] = Array.isArray(parsed) ? parsed.map((s) => s.url).filter(Boolean) : [];
              if (urls.length > 0) setFocusUrls(urls);
            } catch (err) {
              // Validate that source JSON is parseable and has shape
              console.warn("[inline-chat] invalid sources payload", { err });
            }
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
      <div className="mx-auto w-full rounded-2xl border border-gray-200 dark:border-gray-800 bg-white/60 dark:bg-black/40 backdrop-blur p-5 sm:p-8 shadow-sm flex flex-col min-h-[55svh] md:min-h-[60svh] max-h-[85svh]">
        <div className="mb-3 flex items-center justify-between">
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="space-y-3 flex-1 min-h-0 overflow-y-auto pr-1 sm:pr-2" aria-live="polite">
          {messages.length === 0 && (
            <div className="flex items-start gap-2">
              <Image src="/headshot/headshot.jpg" alt="Shreyash" width={28} height={28} className="rounded-full object-cover" />
              <div className="inline-block rounded-2xl bg-gray-100 text-black dark:bg-gray-900 dark:text-white px-3 py-2 max-w-[80%] text-sm sm:text-base">
                {`Hey, good ${timeOfDay}${returningVisitor ? ", welcome back" : ""} — I’m Shreyash. Ask me anything about my work, projects, or blog posts. If you’re not sure where to start, try a quick question below or take a shortcut.`}
              </div>
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} className={m.role === "user" ? "flex items-start justify-end" : "flex items-start gap-2"}>
              {m.role !== "user" && (
                <Image src="/headshot/headshot.jpg" alt="Shreyash" width={24} height={24} className="rounded-full object-cover mt-1" />
              )}
              <div
                className={
                  m.role === "user"
                    ? "inline-block rounded-2xl bg-gray-900 text-white dark:bg-gray-100 dark:text-black px-3 py-2 max-w-[80%] text-sm sm:text-base"
                    : "inline-block rounded-2xl bg-gray-100 text-black dark:bg-gray-900 dark:text-white px-3 py-2 max-w-[80%] text-sm sm:text-base"
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
          
        </div>

        {/* Input */}
        <div className="mt-4">
          {/* Suggestion prompts above input */}
          <div className="flex flex-col items-end gap-2 mb-3">
            {suggestions.map((s) => (
              <button
                key={s}
                className="text-left text-sm sm:text-base rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-950 transition self-end max-w-[80%]"
                onClick={() => {
                  console.info("[inline-chat] suggestion_click", { suggestion: s });
                  setSuggestions((prev) => prev.filter((t) => t !== s));
                  send(s);
                }}
              >
                {s}
              </button>
            ))}
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const trimmed = input.trim();
              if (!trimmed || loading) {
                console.info("[inline-chat] typed_submit_ignored", { reason: !trimmed ? "empty" : "loading" });
                return;
              }
              console.info("[inline-chat] typed_submit", { hideSuggestions: true });
              setSuggestions([]);
              send(trimmed);
            }}
            className="flex items-center gap-2"
          >
            <div className="relative flex-1">
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-transparent pl-4 pr-3 py-3 text-sm sm:text-base focus:outline-none placeholder:text-gray-400"
                data-cursor-intent="text"
                placeholder="Ask me anything about me, my projects, or posts"
                maxLength={1000}
                aria-label="Ask a question"
                autoFocus
              />
              
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
            AI can hallucinate. Answers are based only on content from this website.
          </div>
        </div>
      </div>
    </section>
  );
}


