"use client";

import { useEffect, useRef, useState } from "react";
import { capture, AnalyticsEvent } from "@/lib/analytics";
import Image from "next/image";
import DOMPurify from "dompurify";

// Constants
const MAX_MESSAGE_LENGTH = 1000;
const BUFFER_DISPLAY_THRESHOLD = 20;
const MAX_BUFFER_DISPLAY_LENGTH = 15;

// Types
type Message = { role: "system" | "user" | "assistant"; content: string };
type TimeOfDay = "Morning" | "Afternoon" | "Evening";

function getTimeOfDay(date: Date = new Date()): TimeOfDay {
  const hour = date.getHours();
  if (hour >= 5 && hour < 12) return "Morning";
  if (hour >= 12 && hour < 18) return "Afternoon";
  return "Evening";
}

function buildSuggestions(): string[] {
  const base: string[] = [
    "What was the latest blog you wrote about?",
    "What's the latest project you've worked on?"
  ];
  const returning: string[] = [];
  const set = [...base, ...returning];
  // De-dup while preserving order
  const seen = new Set<string>();
  const unique = set.filter((s) => (seen.has(s) ? false : (seen.add(s), true)));
  return unique.slice(0, 4);
}

// Enhanced URL validation for security
function validateUrl(url: string): boolean {
  try {
    // Prevent dangerous protocols
    const dangerousProtocols = ['javascript:', 'vbscript:', 'file:', 'ftp:'];
    const lowerUrl = url.toLowerCase();

    for (const protocol of dangerousProtocols) {
      if (lowerUrl.startsWith(protocol)) {
        return false;
      }
    }

    // Allow mailto and tel
    if (lowerUrl.startsWith('mailto:') || lowerUrl.startsWith('tel:')) {
      return true;
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
  // Shared sanitize configuration
  const allowConfig = {
    ALLOWED_TAGS: ['p', 'strong', 'em', 'a', 'ul', 'li'],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'class'],
    ALLOW_DATA_ATTR: false,
    ALLOW_UNKNOWN_PROTOCOLS: false,
    SANITIZE_DOM: true,
    KEEP_CONTENT: true,
    IN_PLACE: false,
  };

  // 1) Decode HTML entities (so &lt;a&gt; becomes <a>)
  let content = md;
  try {
    if (typeof window !== 'undefined') {
      const ta = document.createElement('textarea');
      ta.innerHTML = content;
      content = ta.value;
    }
  } catch {
    // If decoding fails, fall back to original content
    content = md;
  }

  // Helper: apply basic inline markdown formatting (bold/italic) after links are handled
  function applyInlineFormatting(input: string): string {
    let out = input;
    // Bold: **text** or __text__
    out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    out = out.replace(/__([^_]+)__/g, '<strong>$1</strong>');
    // Italic: *text* or _text_ (avoid bold which we already processed)
    out = out.replace(/(^|[^*])\*([^*]+)\*(?!\*)/g, '$1<em>$2</em>');
    out = out.replace(/(^|[^_])_([^_]+)_(?!_)/g, '$1<em>$2</em>');
    return out;
  }

  // 2) Convert markdown [text](url) to anchors (with validation)
  content = content.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_m, text, url) => {
    if (!validateUrl(url)) return text;
    try {
      let safeUrl: string;
      const lower = url.toLowerCase();
      if (lower.startsWith('mailto:') || lower.startsWith('tel:')) {
        safeUrl = url;
      } else if (url.startsWith('http://') || url.startsWith('https://')) {
        const parsed = new URL(url);
        // Normalize absolute URLs that map to internal paths, regardless of hostname
        const internalPathMatchers = [
          /^\/resume(\b|$)/i,
          /^\/posts\//i,
          /^\/projects(\b|\/|#)/i,
          /^\/blog(\b|\/)/i,
        ];
        const isInternalPath = internalPathMatchers.some((re) => re.test(parsed.pathname));

        if (isInternalPath) {
          safeUrl = parsed.pathname + parsed.search + parsed.hash;
        } else {
          // Otherwise, allow external absolute URLs as-is
          safeUrl = parsed.toString();
        }
      } else {
        const base = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
        const resolved = new URL(url, base);
        safeUrl = resolved.pathname + resolved.search + resolved.hash;
      }
      const safeText = String(text).replace(/"/g, '&quot;');
      return `<a href="${safeUrl}" class="underline hover:no-underline" target="_blank" rel="noopener noreferrer">${safeText}</a>`;
    } catch {
      return text;
    }
  });

  // 2b) Apply inline formatting such as bold/italic after links are converted
  content = applyInlineFormatting(content);

  // 3) Block wrapping without re-escaping (DOMPurify will sanitize)
  const blocks = content.trim().split(/\n{2,}/);
  const htmlParts: string[] = [];
  for (const rawBlock of blocks) {
    const block = rawBlock.trim();
    if (!block) continue;

    const lines = block.split(/\n/);
    const isBulletList = lines.every((ln) => /^[-*]\s+/.test(ln.trim()));

    if (isBulletList) {
      const items = lines
        .map((ln) => ln.trim().replace(/^[-*]\s+/, ''))
        .map((item) => `<li>${applyInlineFormatting(item)}</li>`) // allow inline formatting and links inside list items
        .join('');
      htmlParts.push(`<ul class="list-disc pl-5 my-2 space-y-1">${items}</ul>`);
    } else {
      const text = applyInlineFormatting(block.replace(/\n+/g, ' ').trim());
      if (text) htmlParts.push(`<p class="mb-2 last:mb-0 leading-relaxed">${text}</p>`);
    }
  }

  const rawHtml = htmlParts.join('');
  return DOMPurify.sanitize(rawHtml, allowConfig);
}

export function InlineChat() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);

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
    const built = buildSuggestions();
    setSuggestions(built);
    console.info("[inline-chat] greeting_context", { period, returningVisitor: isReturning, suggestions: built });
  }, []);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    capture(AnalyticsEvent.ChatMessageSent, { length: trimmed.length });
    setMessages((m) => [...m, { role: "user", content: trimmed }]);
    setInput("");
    setSuggestions([]); // Clear suggestions when any message is sent
    setLoading(true);
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
        capture(AnalyticsEvent.ChatResponseError, { status: res.status });
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
      capture(AnalyticsEvent.ChatResponseStreamStart);
      const decoder = new TextDecoder();
      let assistantText = "";      let buffer = ""; // Buffer to accumulate chunks before displaying

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        const markerStart = chunk.indexOf("[[SOURCES]]");

        let textToProcess = "";
        if (markerStart >= 0) {
          const jsonStart = markerStart + "[[SOURCES]]".length;
          const markerEnd = chunk.indexOf("[[/SOURCES]]", jsonStart);
          if (markerEnd > jsonStart) {
            const jsonPayload = chunk.slice(jsonStart, markerEnd);
            try {
              const parsed = JSON.parse(jsonPayload) as Array<{ title: string; url: string }>;
              const urls: string[] = Array.isArray(parsed) ? parsed.map((s) => s.url).filter(Boolean) : [];
              if (urls.length > 0) setFocusUrls(urls);
            } catch (err) {
              // Validate that source JSON is parseable and has shape
              console.warn("[inline-chat] invalid sources payload", { err });
            }
          }
          textToProcess = chunk.slice(0, markerStart);
        } else {
          textToProcess = chunk;
        }

        // Add the text to our buffer
        buffer += textToProcess;

        // Only display text when we have a complete word or sentence boundary
        // Look for word boundaries (spaces, punctuation) to avoid cutting words
        const lastSpaceIndex = buffer.lastIndexOf(' ');
        const lastPeriodIndex = buffer.lastIndexOf('.');
        const lastQuestionIndex = buffer.lastIndexOf('?');
        const lastExclamationIndex = buffer.lastIndexOf('!');
        const lastNewlineIndex = buffer.lastIndexOf('\n');

        // Find the rightmost boundary
        const boundaries = [lastSpaceIndex, lastPeriodIndex, lastQuestionIndex, lastExclamationIndex, lastNewlineIndex]
          .filter(idx => idx >= 0);

        let shouldDisplay = false;
        let displayUpTo = -1;

        if (boundaries.length > 0) {
          // If we have boundaries, display up to the rightmost one
          displayUpTo = Math.max(...boundaries);
          shouldDisplay = true;
        } else if (buffer.length > BUFFER_DISPLAY_THRESHOLD) {
          // If no boundaries but buffer is getting long, display up to last complete word
          // Look for the last space within the first N characters to avoid cutting words
          const lastSpaceInFirstN = buffer.lastIndexOf(' ', MAX_BUFFER_DISPLAY_LENGTH);
          if (lastSpaceInFirstN > 0) {
            displayUpTo = lastSpaceInFirstN;
            shouldDisplay = true;
          }
        }

        if (shouldDisplay) {
          const textToDisplay = buffer.slice(0, displayUpTo + 1);
          assistantText += textToDisplay;
          buffer = buffer.slice(displayUpTo + 1);

          setMessages((m) => {
            const last = m[m.length - 1];
            if (last?.role === "assistant") {
              return [...m.slice(0, -1), { role: "assistant", content: assistantText }];
            }
            return [...m, { role: "assistant", content: assistantText }];
          });
        }
      }

      // Display any remaining buffered text at the end
      if (buffer.length > 0) {
        assistantText += buffer;
        setMessages((m) => {
          const last = m[m.length - 1];
          if (last?.role === "assistant") {
            return [...m.slice(0, -1), { role: "assistant", content: assistantText }];
          }
          return [...m, { role: "assistant", content: assistantText }];
        });
      }
      capture(AnalyticsEvent.ChatResponseStreamComplete, { length: assistantText.length });
    } catch (error) {
      capture(AnalyticsEvent.ChatClientError);
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
                    if (typeof s !== 'string' || s.length === 0 || s.length > MAX_MESSAGE_LENGTH) {
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

                // Basic security sanitization
                let sanitized = value
                  // Remove dangerous HTML characters and protocol handlers
                  .replace(/[<>'"&]/g, '')
                  .replace(/javascript:/gi, '')
                  .replace(/data:/gi, '')
                  .replace(/vbscript:/gi, '')
                  .replace(/file:/gi, '')
                  .replace(/ftp:/gi, '')
                  // Remove potentially dangerous characters
                  .replace(/[`\\]/g, '')
                  .replace(/\0/g, ''); // Null bytes

                // Length limit
                if (sanitized.length > MAX_MESSAGE_LENGTH) {
                  sanitized = sanitized.substring(0, MAX_MESSAGE_LENGTH);
                }

                setInput(sanitized);
              }}
              onKeyDown={(e) => {
                // Allow normal typing - only prevent problematic combinations
                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey || e.shiftKey)) {
                  e.preventDefault();
                  return;
                }
              }}
              className="w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-transparent pl-4 pr-3 py-3 text-sm sm:text-base focus:outline-none placeholder:text-gray-400"
              data-cursor-intent="text"
              placeholder="What would you like to know about me?"
              maxLength={MAX_MESSAGE_LENGTH}
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


