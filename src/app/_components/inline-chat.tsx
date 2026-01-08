"use client";

import { useEffect, useRef, useState } from "react";
import { capture, AnalyticsEvent } from "@/lib/analytics";
import DOMPurify from "dompurify";
import { Kbd } from "./kbd";
import { User, ArrowRight, Loader2 } from "lucide-react";
import Image from "next/image";
import { cn } from "./utils/cn";

// Sanitization cache to avoid re-sanitizing the same content
const sanitizedCache = new Map<string, string>();
const MAX_CACHE_SIZE = 50;

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
    "What are your main skills?",
    "Tell me about your latest project",
    "How can I contact you?",
    "What do you write about?"
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

// Lightweight render for streaming - basic escaping and formatting only
// Used during active streaming to reduce INP impact
function renderMarkdownStreaming(md: string): string {
  // Basic HTML escaping
  let content = md
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Basic markdown: bold and italic only
  content = content.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  content = content.replace(/__([^_]+)__/g, '<strong>$1</strong>');
  content = content.replace(/(^|[^*])\*([^*]+)\*(?!\*)/g, '$1<em>$2</em>');
  content = content.replace(/(^|[^_])_([^_]+)_(?!_)/g, '$1<em>$2</em>');

  // Simple paragraph wrapping
  const paragraphs = content.split(/\n{2,}/).filter(p => p.trim());
  return paragraphs.map(p => `<p class="mb-2 last:mb-0 leading-relaxed">${p.trim()}</p>`).join('');
}

// Full render with DOMPurify - used for completed messages
// Includes caching to avoid re-sanitization on re-renders
function renderMarkdown(md: string) {
  // Check cache first
  const cached = sanitizedCache.get(md);
  if (cached) return cached;
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
  const sanitized = DOMPurify.sanitize(rawHtml, allowConfig);

  // Cache the result (only for non-trivial content)
  if (md.length > 20) {
    // Limit cache size to prevent memory issues
    if (sanitizedCache.size >= MAX_CACHE_SIZE) {
      const firstKey = sanitizedCache.keys().next().value;
      if (firstKey) sanitizedCache.delete(firstKey);
    }
    sanitizedCache.set(md, sanitized);
  }

  return sanitized;
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
  const [demoShown, setDemoShown] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [showSuggestionsAfterDemo, setShowSuggestionsAfterDemo] = useState(false);
  const demoTriggeredRef = useRef(false);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Auto-trigger demo conversation on first visit
  useEffect(() => {
    // Only trigger if demo hasn't been shown, suggestions are loaded, no messages yet, and we haven't already triggered
    if (!demoShown && !demoTriggeredRef.current && suggestions.length > 0 && messages.length === 0 && !loading) {
      const demoQuestion = suggestions[0]; // Use first suggestion: "What are your main skills?"
      if (demoQuestion) {
        demoTriggeredRef.current = true;
        // Mark demo as shown in sessionStorage
        try {
          sessionStorage.setItem("sg_demoShown", "1");
        } catch {
          // best-effort only
        }
        setDemoShown(true);
        setIsDemoMode(true);
        
        // Small delay to ensure UI is ready, then trigger demo
        const timer = setTimeout(() => {
          send(demoQuestion);
        }, 500);
        return () => clearTimeout(timer);
      }
    }
    // Note: send is intentionally omitted from deps - it uses stable state setters and we use a ref to prevent multiple triggers
  }, [demoShown, suggestions.length, messages.length, loading]);

  // Auto-focus on mount for all visitors (but skip during demo mode)
  useEffect(() => {
    // Don't auto-focus during demo mode to avoid interrupting animation
    if (inputRef.current && !isDemoMode && messages.length > 0) {
      // Small delay to ensure the component is fully rendered
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isDemoMode, messages.length]);

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

  // Check if demo has been shown in this session
  useEffect(() => {
    try {
      const demoShownInSession = sessionStorage.getItem("sg_demoShown") === "1";
      setDemoShown(demoShownInSession);
    } catch {
      // best-effort only
      setDemoShown(false);
    }
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

  // Detect touch-capable devices to tailor UI hints (e.g., hide keyboard shortcuts on phones)
  useEffect(() => {
    try {
      const hasTouch = matchMedia("(any-pointer: coarse)").matches || 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      setIsTouchDevice(hasTouch);
    } catch {
      setIsTouchDevice(false);
    }
  }, []);

  // Handle keyboard shortcuts (e.g., "/" to focus input)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only handle "/" key when not already focused on input and not typing in input
      if (event.key === '/' && document.activeElement !== inputRef.current && !loading) {
        // Prevent the "/" from appearing in any focused input
        event.preventDefault();
        inputRef.current?.focus();
      }
    };

    // Add event listener to document
    document.addEventListener('keydown', handleKeyDown);
    
    // Cleanup
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [loading]);

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
      // Check if response is JSON error (even with 200 status) or actual error
      const contentType = res.headers.get("content-type");
      const isJsonError = contentType?.includes("application/json");
      
      if (!res.ok || isJsonError) {
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

        // Always use the user-friendly message for JSON errors, even if it's the default
        if (isJsonError) {
          setMessages((m) => [...m, { role: "assistant", content: userFriendlyMessage }]);
          setLoading(false);
          return;
        }

        // For actual HTTP errors, only use user-friendly message if it's not the default
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

        // Safety check: if we detect JSON in the buffer, treat it as an error
        if (buffer.includes('{"error":') || buffer.includes('"error":')) {
          console.warn("[inline-chat] Detected JSON error in stream, handling as error");
          const jsonMatch = buffer.match(/\{"error":.*?\}/);
          if (jsonMatch) {
            try {
              const errorData = JSON.parse(jsonMatch[0]);
              const userFriendlyMessage = errorData.message || "I don't have information about that topic in my knowledge base. Please try asking about my work, projects, or professional experience instead!";
              setMessages((m) => [...m, { role: "assistant", content: userFriendlyMessage }]);
              setLoading(false);
              return;
            } catch {
              // If JSON parsing fails, use fallback message
              setMessages((m) => [...m, { role: "assistant", content: "I don't have information about that topic in my knowledge base. Please try asking about my work, projects, or professional experience instead!" }]);
              setLoading(false);
              return;
            }
          }
        }

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
      
      // Handle demo completion
      if (isDemoMode) {
        setIsDemoMode(false);
        // Show suggestions after a short delay
        setTimeout(() => {
          setShowSuggestionsAfterDemo(true);
          // Re-enable auto-focus after demo
          if (inputRef.current) {
            setTimeout(() => {
              inputRef.current?.focus();
            }, 100);
          }
        }, 500);
      }
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
        userFriendlyMessage = "I don't have information about that topic in my knowledge base. I focus on answering questions about my work, projects, and blog posts. Feel free to ask about my technical projects, writing, or professional experience instead!";
      } else if (errorMessage.includes("embedding") || errorMessage.includes("process")) {
        userFriendlyMessage = "I'm having trouble understanding your question. Please try rephrasing it.";
      } else if (errorMessage.includes("unavailable")) {
        userFriendlyMessage = "The service is temporarily unavailable. Please try again in a few minutes.";
      }

      setMessages((m) => [...m, { role: "assistant", content: userFriendlyMessage }]);
      
      // Handle demo completion even on error
      if (isDemoMode) {
        setIsDemoMode(false);
        setTimeout(() => {
          setShowSuggestionsAfterDemo(true);
          if (inputRef.current) {
            setTimeout(() => {
              inputRef.current?.focus();
            }, 100);
          }
        }, 500);
      }
    } finally {
      setLoading(false);
    }
  };

  // Input form component (reused in both states)
  const inputForm = (
    <form
        onSubmit={(e) => {
          e.preventDefault();
          const trimmed = input.trim();
          if (!trimmed || loading) return;
          setSuggestions([]);
          setShowSuggestionsAfterDemo(false);
          send(trimmed);
        }}
      className="relative group w-full"
    >
      <input
        ref={inputRef}
        value={input}
        onChange={(e) => {
          const value = e.target.value;
          if (value.length <= MAX_MESSAGE_LENGTH) setInput(value);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (input.trim() && !loading) {
              setSuggestions([]);
              setShowSuggestionsAfterDemo(false);
              send(input);
            }
          }
        }}
        disabled={loading}
        placeholder="Type a message..."
        className="w-full bg-card/90 border border-border/60 rounded-full pl-5 pr-14 py-3.5 text-sm shadow-premium-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all placeholder:text-muted-foreground/60 disabled:opacity-60 backdrop-blur-sm"
      />
      <button
        type="submit"
        disabled={!input.trim() || loading}
        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-primary text-primary-foreground shadow-premium-md hover:shadow-premium-lg hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 disabled:shadow-none transition-all duration-200 glow-green"
      >
        {loading ? <Loader2 size={18} className="animate-spin" /> : <ArrowRight size={18} />}
      </button>
    </form>
  );

  // EMPTY STATE: Centered layout like Grok
  // Only show if demo hasn't been triggered yet (not in demo mode and demo hasn't been shown)
  if (messages.length === 0 && !isDemoMode) {
    return (
      <section
        aria-label="Chat with Shreyash"
        className="w-full flex-1 flex flex-col items-center justify-center"
      >
        {/* Centered branding - removed since it's now in hero */}
        <div className="flex flex-col items-center mb-6 animate-fade-in" style={{ animationDelay: '100ms' }}>
          <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-muted-foreground">
            Ask me anything
          </h2>
          <p className="text-sm text-muted-foreground/70 mt-1">
            I can answer questions about my work, projects, and experience
          </p>
        </div>

        {/* Suggestions - full width above input */}
        <div className="w-full mb-4 animate-fade-in" style={{ animationDelay: '200ms' }}>
          <div className="grid grid-cols-2 gap-2">
            {suggestions.map((s, i) => (
              <button
                key={s}
                onClick={() => {
                  setInput("");
                  setSuggestions([]);
                  setShowSuggestionsAfterDemo(false);
                  send(s);
                }}
                className="p-3 text-center text-sm rounded-xl border border-border/40 bg-card/50 hover:bg-accent/60 hover:border-[hsl(var(--primary))]/30 hover:shadow-premium-sm transition-all duration-200"
                style={{ animationDelay: `${250 + (i * 50)}ms` }}
              >
                <span className="line-clamp-2">{s}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Input */}
        <div className="w-full animate-fade-in" style={{ animationDelay: '300ms' }}>
          {inputForm}
          <div className="mt-2 flex items-center justify-center gap-3 text-[10px] text-muted-foreground/60">
            {!isTouchDevice && (
              <span className="flex items-center gap-1">
                <Kbd keys={['/']} className="text-[9px] py-0 px-1 min-h-0 h-4" /> to focus
              </span>
            )}
            <span>•</span>
            <span>AI can make mistakes.</span>
          </div>
        </div>
      </section>
    );
  }

  // CHAT STATE: Messages + input at bottom
  return (
    <section
      aria-label="Chat with Shreyash"
      className="w-full flex-1 flex flex-col"
    >
      {/* Messages Area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-6 scroll-smooth"
        aria-live="polite"
      >
        {messages.map((m, i) => (
          <div
            key={i}
            className={cn(
              "flex gap-3 animate-fade-in",
              m.role === "user" ? "flex-row-reverse" : "flex-row"
            )}
          >
            {/* Avatar */}
            {m.role === "user" ? (
              <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-premium-sm mt-1 bg-primary text-primary-foreground ring-2 ring-primary/20">
                <User size={14} />
              </div>
            ) : (
              <div className="w-8 h-8 rounded-full shrink-0 shadow-premium-sm mt-1 overflow-hidden ring-2 ring-[hsl(var(--primary))]/20">
                <Image
                  src="/headshot/headshot.jpg"
                  alt="Shreyash"
                  width={32}
                  height={32}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Message Bubble */}
            <div className={cn(
              "max-w-[85%] rounded-2xl px-4 py-2.5 shadow-premium-sm text-sm md:text-base leading-relaxed",
              m.role === "user"
                ? "bg-primary text-primary-foreground rounded-tr-sm shadow-premium-md"
                : "bg-card/80 border border-border/40 rounded-tl-sm backdrop-blur-sm"
            )}>
              <div
                dangerouslySetInnerHTML={
                  m.role === "assistant"
                    ? {
                        // Use lightweight streaming render during active loading for better INP
                        // Full render with DOMPurify only for completed messages
                        __html: loading && i === messages.length - 1
                          ? renderMarkdownStreaming(m.content)
                          : renderMarkdown(m.content)
                      }
                    : undefined
                }
              >
                {m.role !== "assistant" ? m.content : null}
              </div>
            </div>
          </div>
        ))}

        {/* Loading Indicator */}
        {loading && (
          <div className="flex gap-3 animate-fade-in">
            <div className="w-8 h-8 rounded-full shrink-0 shadow-sm mt-1 overflow-hidden ring-1 ring-border/50">
              <Image
                src="/headshot/headshot.jpg"
                alt="Shreyash"
                width={32}
                height={32}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="bg-card border border-border/40 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
      </div>

      {/* Suggestions after demo - fade in below messages */}
      {showSuggestionsAfterDemo && suggestions.length > 0 && (
        <div className="px-4 pb-4 animate-fade-in">
          <div className="grid grid-cols-2 gap-2">
            {suggestions.slice(1).map((s, i) => (
              <button
                key={s}
                onClick={() => {
                  setInput("");
                  setShowSuggestionsAfterDemo(false);
                  send(s);
                }}
                className="p-3 text-center text-sm rounded-xl border border-border/40 bg-card/50 hover:bg-accent/60 hover:border-[hsl(var(--primary))]/30 hover:shadow-premium-sm transition-all duration-200"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <span className="line-clamp-2">{s}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area - pinned at bottom */}
      <div className="p-4 border-t border-border/30 bg-card/90 backdrop-blur-xl">
        {inputForm}
        <div className="mt-2 flex items-center justify-center gap-3 text-[10px] text-muted-foreground/60">
          {!isTouchDevice && (
            <span className="flex items-center gap-1">
              <Kbd keys={['/']} className="text-[9px] py-0 px-1 min-h-0 h-4" /> to focus
            </span>
          )}
          <span>•</span>
          <span>AI can make mistakes.</span>
        </div>
      </div>
    </section>
  );
}
