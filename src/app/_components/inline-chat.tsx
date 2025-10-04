"use client";

import { useEffect, useRef, useState } from "react";
import { capture, AnalyticsEvent } from "@/lib/analytics";
import Image from "next/image";
import DOMPurify from "dompurify";
import { Kbd } from "./kbd";

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
    "What email can I reach you at?",
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
      return `<a href="${safeUrl}" class="underline hover:no-underline" target="_blank" rel="noopener noreferrer" data-chat-source="${encodeURIComponent(safeUrl)}">${safeText}</a>`;
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
  const [isTouchDevice, setIsTouchDevice] = useState(false);

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

  // Do not auto-focus on mount to prevent browsers from auto-scrolling the page on first load
  // Focus will be handled by explicit user interaction (e.g., pressing "/" via keyboard shortcut)
  // This avoids unexpected initial scroll-to-input behavior
  // (See: https://html.spec.whatwg.org/multipage/interaction.html#dom-focus)
  useEffect(() => {
    // intentionally no-op to avoid initial focus-induced scrolling
  }, []);

  // Track clicks on chat source links
  useEffect(() => {
    const handleSourceClick = (event: Event) => {
      const target = event.target as HTMLElement;
      if (target.tagName === 'A' && target.hasAttribute('data-chat-source')) {
        const sourceUrl = decodeURIComponent(target.getAttribute('data-chat-source') || '');
        const linkText = target.textContent || '';
        capture(AnalyticsEvent.ChatSourceClick, { 
          source_url: sourceUrl,
          link_text: linkText,
          message_count: messages.length
        });
      }
    };

    // Add event listener to the scroll container that contains the messages
    const scrollContainer = scrollRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener('click', handleSourceClick);
      return () => scrollContainer.removeEventListener('click', handleSourceClick);
    }
  }, [messages.length]);

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

  // Detect touch-capable devices to tailor UI hints (e.g., hide keyboard shortcuts on phones)
  useEffect(() => {
    try {
      const hasTouch = matchMedia("(any-pointer: coarse)").matches || 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      setIsTouchDevice(hasTouch);
    } catch {
      setIsTouchDevice(false);
    }
  }, []);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    capture(AnalyticsEvent.ChatMessageSent, { 
      message_length: trimmed.length,
      character_count: trimmed.length,
      word_count: trimmed.split(/\s+/).length,
      returning_visitor: returningVisitor,
      time_of_day: timeOfDay,
      conversation_length: messages.length,
      has_focus_urls: focusUrls.length > 0,
      focus_url_count: focusUrls.length
    });
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
        capture(AnalyticsEvent.ChatResponseError, { 
          status: res.status,
          status_text: res.statusText,
          user_message_length: trimmed.length,
          conversation_length: messages.length + 1,
          has_focus_urls: focusUrls.length > 0
        });
        let errorMessage = "Request failed";
        let userFriendlyMessage = "Sorry, something went wrong.";
        try {
          const errorData = await res.json();
          errorMessage = errorData.message || errorData.error || errorMessage;

          // Handle specific error types with custom messages
          if (errorData.error === "rate_limited" && errorData.message) {
            userFriendlyMessage = errorData.message;
          } else if (errorData.error === "off_topic" && errorData.message) {
            userFriendlyMessage = errorData.message;
          } else if (errorData.error === "insufficient_context" && errorData.message) {
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
      const streamStartTime = Date.now();
      capture(AnalyticsEvent.ChatResponseStreamStart, {
        conversation_length: messages.length + 1, // +1 for the user message we just added
        has_focus_urls: focusUrls.length > 0,
        focus_url_count: focusUrls.length,
        user_message_length: trimmed.length,
        time_to_start: streamStartTime - Date.now() // This will be near 0, but good for consistency
      });
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
      const streamEndTime = Date.now();
      const responseWordCount = assistantText.split(/\s+/).filter(w => w.length > 0).length;
      const hasLinks = assistantText.includes('[') && assistantText.includes('](');
      const hasBulletPoints = assistantText.includes('- ') || assistantText.includes('* ');
      
      capture(AnalyticsEvent.ChatResponseStreamComplete, { 
        response_length: assistantText.length,
        response_word_count: responseWordCount,
        response_time_ms: streamEndTime - streamStartTime,
        has_markdown_links: hasLinks,
        has_bullet_points: hasBulletPoints,
        conversation_length: messages.length + 2, // +1 for user message, +1 for assistant response
        sources_provided: focusUrls.length > 0,
        source_count: focusUrls.length
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
      capture(AnalyticsEvent.ChatClientError, {
        error_message: errorMessage,
        error_type: error instanceof Error ? error.name : 'unknown',
        user_message_length: trimmed.length,
        conversation_length: messages.length + 1,
        has_focus_urls: focusUrls.length > 0
      });
      console.error("[inline-chat] Chat error:", errorMessage);

      let userFriendlyMessage = "Sorry, something went wrong.";
      if (errorMessage.includes("rate_limited") || errorMessage.includes("Too many requests")) {
        userFriendlyMessage = "I'm receiving too many requests right now. Please wait a moment and try again.";
      } else if (errorMessage.includes("off_topic") || errorMessage.includes("insufficient_context")) {
        userFriendlyMessage = "I focus on answering questions about my work, projects, and blog posts. Please try asking about my technical projects, writing, or professional experience!";
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
    <section aria-labelledby="inline-chat-heading" className="w-full h-full">
      <div className="mx-auto w-full flex flex-col h-full min-h-[55svh] md:min-h-[60svh] max-h-[85svh]">
        {/* Messages */}
        <div ref={scrollRef} className="space-y-4 flex-1 min-h-0 overflow-y-auto pr-1 sm:pr-2 mb-4" aria-live="polite">
          {messages.length === 0 && (
            <>
              <div className="flex items-start justify-start animate-fade-in">
                <div className="relative flex-shrink-0 mr-3">
                  <Image 
                    src="/headshot/headshot.jpg" 
                    alt="Shreyash" 
                    width={36} 
                    height={36} 
                    className="rounded-full object-cover ring-2 ring-accent/50" 
                  />
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full ring-2 ring-background" />
                </div>
                <div className="inline-block rounded-2xl rounded-tl-sm bg-accent/50 px-4 py-3 max-w-[85%] text-sm md:text-base shadow-premium-sm">
                  <p className="font-medium mb-1">
                    Good {timeOfDay}{returningVisitor ? ", welcome back! 👋" : "! I'm Shreyash 👋"}
                  </p>
                  <p className="text-foreground/80">
                    {returningVisitor 
                      ? "What would you like to know today?" 
                      : "Ask me anything about my work, projects, or what I've been writing about!"}
                  </p>
                </div>
              </div>
              
              {!returningVisitor && (
                <div className="flex items-start justify-start animate-fade-in" style={{ animationDelay: '400ms' }}>
                  <div className="relative flex-shrink-0 mr-3">
                    <Image 
                      src="/headshot/headshot.jpg" 
                      alt="Shreyash" 
                      width={36} 
                      height={36} 
                      className="rounded-full object-cover ring-2 ring-accent/50" 
                    />
                  </div>
                  <div className="inline-block rounded-2xl rounded-tl-sm bg-accent/50 px-4 py-3 max-w-[85%] text-sm md:text-base shadow-premium-sm">
                    <p className="text-foreground/80">
                      Try one of the questions below, or type your own! 💬
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
          {messages.map((m, i) => (
            <div key={i} className={m.role === "user" ? "flex items-start justify-end animate-fade-in" : "flex items-start justify-start animate-fade-in"}>
              {m.role !== "user" && (
                <div className="relative flex-shrink-0 mr-3">
                  <Image 
                    src="/headshot/headshot.jpg" 
                    alt="Shreyash" 
                    width={36} 
                    height={36} 
                    className="rounded-full object-cover ring-2 ring-accent/50" 
                  />
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full ring-2 ring-background" />
                </div>
              )}
              <div
                className={
                  m.role === "user"
                    ? "inline-block rounded-2xl rounded-tr-sm bg-primary text-primary-foreground px-4 py-3 max-w-[85%] text-sm md:text-base shadow-premium-sm"
                    : "inline-block rounded-2xl rounded-tl-sm bg-accent/50 px-4 py-3 max-w-[85%] text-sm md:text-base shadow-premium-sm"
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
          
          {/* Typing indicator when loading */}
          {loading && (
            <div className="flex items-start justify-start animate-fade-in">
              <div className="relative flex-shrink-0 mr-3">
                <Image 
                  src="/headshot/headshot.jpg" 
                  alt="Shreyash" 
                  width={36} 
                  height={36} 
                  className="rounded-full object-cover ring-2 ring-accent/50" 
                />
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full ring-2 ring-background" />
              </div>
              <div className="inline-block rounded-2xl rounded-tl-sm bg-accent/50 px-4 py-3 shadow-premium-sm">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="mt-auto pt-4">
          {/* Suggestion prompts above input - only show when no messages */}
          {messages.length === 0 && (
            <div className="mb-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3 text-center">
                Quick Start Questions
              </p>
              <div className="flex flex-col gap-2">
                {suggestions.map((s, index) => (
                  <button
                    key={s}
                    className="group text-left text-sm md:text-base rounded-xl bg-accent/30 hover:bg-accent/50 border border-border/50 hover:border-border text-foreground px-4 py-3 transition-all duration-200 hover:shadow-premium-sm hover:-translate-y-0.5 animate-fade-in flex items-center justify-between"
                    style={{ animationDelay: `${800 + (index * 100)}ms` }}
                    data-cursor-intent="hover"
                    data-suggestion-index={index}
                    onClick={() => {
                      // Validate suggestion before sending
                      if (typeof s !== 'string' || s.length === 0 || s.length > MAX_MESSAGE_LENGTH) {
                        console.warn("[inline-chat] Invalid suggestion clicked");
                        return;
                      }
                      console.info("[inline-chat] suggestion_click", { suggestion: s });
                      // Clear input in case user was typing
                      setInput('');
                      setSuggestions([]);
                      send(s);
                    }}
                  >
                    <span className="inline-flex items-center gap-2 flex-1">
                      <svg 
                        className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors flex-shrink-0" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      {s}
                    </span>
                    <Kbd keys={[(index + 1).toString()]} />
                  </button>
                ))}
              </div>
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
            className="flex items-center gap-3"
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
                className="w-full rounded-xl border-2 border-border bg-background px-4 py-3.5 text-sm md:text-base focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/60"
                data-cursor-intent="text"
                placeholder="Type your question here... (Press / to focus)"
                maxLength={MAX_MESSAGE_LENGTH}
                minLength={1}
                required
                aria-label="Ask a question"
                pattern=".*\S.*"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="group rounded-xl bg-primary text-primary-foreground px-5 py-3.5 text-sm md:text-base font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:opacity-90 shadow-premium-sm hover:shadow-premium-md flex-shrink-0 flex items-center gap-2"
              aria-label="Send message"
            >
              {loading ? (
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <>
                  {/* Always show label to keep size/shape consistent on mobile */}
                  <span className="inline">Send</span>
                  {/* Hide keyboard shortcut hint on touch devices */}
                  {!isTouchDevice && (
                    <Kbd keys={['enter']} className="bg-primary-foreground/20 text-primary-foreground border-primary-foreground/30 hidden sm:inline" />
                  )}
                </>
              )}
            </button>
          </form>
          <p className="mt-3 text-xs text-center text-muted-foreground/70">
            💡 Powered by AI • Responses based on site content
          </p>
        </div>
      </div>
    </section>
  );
}


