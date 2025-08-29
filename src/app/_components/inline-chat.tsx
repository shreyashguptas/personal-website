"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import DOMPurify from "dompurify";

type Message = { role: "system" | "user" | "assistant"; content: string };

type TimeOfDay = "Morning" | "Afternoon" | "Evening";

function getTimeOfDay(date: Date = new Date()): TimeOfDay {
  const hour = date.getHours();
  if (hour >= 5 && hour < 12) return "Morning";
  if (hour >= 12 && hour < 18) return "Afternoon";
  return "Evening";
}

function buildSuggestions(period: TimeOfDay, returningVisitor: boolean): string[] {
  const base: string[] = [
    "What was the latest blog you wrote about?",
    "What's the latest project you've worked on?",
  ];
  const byTime: Record<TimeOfDay, string[]> = {
    Morning: [
      "Give me a quick overview to start my day.",
      "Recommend one recent post to read this Morning.",
    ],
    Afternoon: [
      "What problem are you currently exploring?",
      "Show me a recent project update.",
    ],
    Evening: [
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

// Enhanced URL validation for security
function validateUrl(url: string): boolean {
  try {
    // Prevent dangerous protocols
    const dangerousProtocols = ['javascript:', 'data:', 'vbscript:', 'file:', 'ftp:'];
    const lowerUrl = url.toLowerCase();

    for (const protocol of dangerousProtocols) {
      if (lowerUrl.startsWith(protocol)) {
        return false;
      }
    }

    // Allow relative URLs or absolute HTTP/HTTPS URLs
    if (url.startsWith('/') || url.startsWith('./') || url.startsWith('../')) {
      return true;
    }

    if (url.startsWith('http://') || url.startsWith('https://')) {
      const parsedUrl = new URL(url);
      // Additional validation for absolute URLs
      return parsedUrl.hostname.length > 0;
    }

    return false;
  } catch {
    return false;
  }
}

function renderMarkdown(md: string) {
  // Enhanced XSS protection with comprehensive escaping
  // 1) Comprehensive HTML escaping - handle all dangerous characters
  const escaped = md
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;")
    .replace(/\\/g, "&#x5C;")
    .replace(/`/g, "&#x60;")
    .replace(/=/g, "&#x3D;");

  // 2) Enhanced link processing with strict validation
  const withLinks = escaped.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_m, text, url) => {
    // Validate URL for security
    if (!validateUrl(url)) {
      console.warn('[markdown] Invalid or dangerous URL blocked:', url);
      return text; // Return text only, no link
    }

    try {
      let safeUrl: string;
      if (url.startsWith('http://') || url.startsWith('https://')) {
        // For absolute URLs, validate and use as-is
        const parsedUrl = new URL(url);
        safeUrl = parsedUrl.toString();
      } else {
        // For relative URLs, resolve against current origin
        const baseUrl = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
        const resolvedUrl = new URL(url, baseUrl);
        safeUrl = resolvedUrl.pathname + resolvedUrl.search + resolvedUrl.hash;
      }

      // Escape text content to prevent XSS
      const safeText = text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#x27;");

      return `<a href="${safeUrl}" class="underline" target="_blank" rel="noopener noreferrer">${safeText}</a>`;
    } catch (error) {
      console.warn('[markdown] URL processing error:', error);
      return text;
    }
  });

  // 3) Safe bold and italic processing
  const withBold = withLinks.replace(/\*\*([^*]+)\*\*/g, (_m, content) => {
    // Escape content inside formatting
    const safeContent = content
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    return `<strong>${safeContent}</strong>`;
  });

  const withItal = withBold.replace(/\*([^*]+)\*/g, (_m, content) => {
    // Escape content inside formatting
    const safeContent = content
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    return `<em>${safeContent}</em>`;
  });

  // 4) Enhanced block processing with XSS protection
  const blocks = withItal.trim().split(/\n{2,}/);
  const htmlParts: string[] = [];

  for (const rawBlock of blocks) {
    const block = rawBlock.trim();
    if (!block) continue;

    const lines = block.split(/\n/);
    const isBulletList = lines.every((ln) => /^[-*]\s+/.test(ln.trim()));

    if (isBulletList) {
      const items = lines
        .map((ln) => ln.trim().replace(/^[-*]\s+/, ""))
        .map((content) => {
          // Escape list item content
          const safeContent = content
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");
          return `<li>${safeContent}</li>`;
        })
        .join("");
      htmlParts.push(`<ul class="list-disc pl-5 my-2 space-y-1">${items}</ul>`);
    } else {
      // Paragraph: collapse single newlines to spaces for tighter flow
      const text = block.replace(/\n+/g, " ").trim();
      if (text) {
        // Additional escaping for paragraph content
        const safeText = text
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;");
        htmlParts.push(`<p class="mb-2 last:mb-0 leading-relaxed">${safeText}</p>`);
      }
    }
  }

  const rawHtml = htmlParts.join("");

  // Enhanced DOMPurify configuration for maximum security
  return DOMPurify.sanitize(rawHtml, {
    ALLOWED_TAGS: ['p', 'strong', 'em', 'a', 'ul', 'li'],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'class'],
    ALLOW_DATA_ATTR: false,
    ALLOW_UNKNOWN_PROTOCOLS: false,
    SANITIZE_DOM: true,
    KEEP_CONTENT: true,
    IN_PLACE: false,
    FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'form', 'input', 'meta', 'link'],
    FORBID_ATTR: ['onclick', 'onload', 'onerror', 'onmouseover', 'onmouseout', 'onkeydown', 'onkeyup', 'onkeypress']
  });
}

export function InlineChat() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [, setSources] = useState<{ title: string; url: string }[]>([]);
  const [focusUrls, setFocusUrls] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>("Morning");
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
    setSuggestions([]); // Clear suggestions when any message is sent
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
      if (!res.ok) {
        let errorMessage = "Request failed";
        let userFriendlyMessage = "Sorry, something went wrong.";
        try {
          const errorData = await res.json();
          errorMessage = errorData.message || errorData.error || errorMessage;

          // Handle rate limiting with custom message
          if (errorData.error === "rate_limited" && errorData.message) {
            userFriendlyMessage = errorData.message;
          } else if (errorMessage.includes("rate_limited") || errorMessage.includes("Too many requests")) {
            userFriendlyMessage = "I'm receiving too many requests right now. Please wait a moment and try again.";
          } else if (errorMessage.includes("embedding") || errorMessage.includes("process")) {
            userFriendlyMessage = "I'm having trouble understanding your question. Please try rephrasing it.";
          } else if (errorMessage.includes("unavailable")) {
            userFriendlyMessage = "The service is temporarily unavailable. Please try again in a few minutes.";
          }
        } catch {
          // If we can't parse the error response, use the status text
          errorMessage = res.statusText || errorMessage;
        }

        // If we have a user-friendly message from the API, use it instead of throwing
        if (userFriendlyMessage !== "Sorry, something went wrong.") {
          setMessages((m) => [...m, { role: "assistant", content: userFriendlyMessage }]);
          setLoading(false);
          return;
        }

        throw new Error(errorMessage);
      }

      if (!res.body) throw new Error("No response body");
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
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
      console.error("[inline-chat] Chat error:", errorMessage);

      let userFriendlyMessage = "Sorry, something went wrong.";
      if (errorMessage.includes("rate_limited") || errorMessage.includes("Too many requests")) {
        userFriendlyMessage = "I'm receiving too many requests right now. Please wait a moment and try again.";
      } else if (errorMessage.includes("embedding") || errorMessage.includes("process")) {
        userFriendlyMessage = "I'm having trouble understanding your question. Please try rephrasing it.";
      } else if (errorMessage.includes("unavailable")) {
        userFriendlyMessage = "The service is temporarily unavailable. Please try again in a few minutes.";
      }

      setMessages((m) => [...m, { role: "assistant", content: userFriendlyMessage }]);
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
            <>
              <div className="flex items-start justify-start">
                <Image src="/headshot/headshot.jpg" alt="Shreyash" width={28} height={28} className="rounded-full object-cover mr-2 flex-shrink-0 mt-2" />
                <div className="inline-block rounded-2xl bg-gray-100 text-black dark:bg-gray-900 dark:text-white px-3 py-2 max-w-[80%] text-sm sm:text-base">
                  {`Good ${timeOfDay}${returningVisitor ? "!!" : ""}
                  Ask me anything about my work, projects, or blog posts. 
                  `}
                </div>
              </div>
              <div className="flex items-start justify-start">
                <Image src="/headshot/headshot.jpg" alt="Shreyash" width={24} height={24} className="rounded-full object-cover mr-2 flex-shrink-0 mt-2" />
                <div className="inline-block rounded-2xl bg-gray-100 text-black dark:bg-gray-900 dark:text-white px-3 py-2 max-w-[80%] text-sm sm:text-base">
                If you're not sure where to start, try a quick question below.
                </div>
              </div>
            </>
          )}
          {messages.map((m, i) => (
            <div key={i} className={m.role === "user" ? "flex items-start justify-end" : "flex items-start justify-start"}>
              {m.role !== "user" && (
                <Image src="/headshot/headshot.jpg" alt="Shreyash" width={24} height={24} className="rounded-full object-cover mt-2 mr-2 flex-shrink-0" />
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
          {/* Suggestion prompts above input - only show when no messages */}
          {messages.length === 0 && (
            <div className="flex flex-col items-end gap-2 mb-3">
              {suggestions.map((s) => (
                <button
                  key={s}
                  className="text-left text-sm sm:text-base rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-950 transition self-end max-w-[80%]"
                  onClick={() => {
                    // Validate suggestion before sending
                    if (typeof s !== 'string' || s.length === 0 || s.length > 1000) {
                      console.warn("[inline-chat] Invalid suggestion clicked");
                      return;
                    }
                    console.info("[inline-chat] suggestion_click", { suggestion: s });
                    setSuggestions([]);
                    send(s);
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          )}
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
              onChange={(e) => {
                const value = e.target.value;

                // Comprehensive input sanitization for security
                let sanitized = value;

                // Remove dangerous HTML/script injection characters
                sanitized = sanitized.replace(/[<>'"&]/g, '');

                // Remove dangerous protocol handlers
                sanitized = sanitized.replace(/javascript:/gi, '');
                sanitized = sanitized.replace(/data:/gi, '');
                sanitized = sanitized.replace(/vbscript:/gi, '');
                sanitized = sanitized.replace(/file:/gi, '');
                sanitized = sanitized.replace(/ftp:/gi, '');

                // Remove potentially dangerous characters that could be used in injections
                sanitized = sanitized.replace(/`/g, '');
                sanitized = sanitized.replace(/\\/g, '');
                sanitized = sanitized.replace(/\0/g, ''); // Null bytes

                // Remove control characters except for common whitespace
                // Use character code filtering to avoid ESLint regex issues
                sanitized = sanitized.split('').filter(char => {
                  const code = char.charCodeAt(0);
                  // Allow common whitespace (space, tab, line feed, carriage return)
                  if (code === 32 || code === 9 || code === 10 || code === 13) {
                    return true;
                  }
                  // Remove control characters (0-31 except whitespace, and DEL at 127)
                  return code >= 32 && code !== 127;
                }).join('');

                // Trim excessive whitespace
                sanitized = sanitized.trim();

                // Prevent extremely long inputs (additional frontend validation)
                if (sanitized.length > 1000) {
                  sanitized = sanitized.substring(0, 1000);
                }

                // Log if sanitization occurred
                if (sanitized !== value) {
                  console.warn('[chat] Input sanitized - potentially dangerous content removed');
                  console.warn('[chat] Original length:', value.length, 'Sanitized length:', sanitized.length);
                }

                setInput(sanitized);
              }}
              onKeyDown={(e) => {
                // Enhanced protection against keyboard-based attacks
                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey || e.shiftKey)) {
                  e.preventDefault();
                  console.warn('[chat] Multi-line input attempt blocked');
                  return;
                }

                // Prevent potentially dangerous key combinations
                const dangerousKeys = ['F12', 'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11'];
                if (dangerousKeys.includes(e.key)) {
                  // Allow normal function key usage but log it
                  console.info('[chat] Function key pressed:', e.key);
                  return;
                }

                // Prevent paste of dangerous content (handled in onChange)
                if (e.ctrlKey && e.key === 'v') {
                  // Allow normal paste but content will be sanitized in onChange
                  return;
                }
              }}
              className="w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-transparent pl-4 pr-3 py-3 text-sm sm:text-base focus:outline-none placeholder:text-gray-400"
              data-cursor-intent="text"
              placeholder="Ask me anything about me, my projects, or posts"
              maxLength={1000}
              minLength={1}
              required
              aria-label="Ask a question"
              autoFocus
              pattern=".*\S.*"
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


