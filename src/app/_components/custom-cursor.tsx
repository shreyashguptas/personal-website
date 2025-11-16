"use client";

import { useEffect, useReducer, useRef, useCallback } from "react";

type CursorMode = "dot" | "text";

interface CursorState {
  isVisible: boolean;
  isDark: boolean;
  cursorMode: CursorMode;
  isPointerArea: boolean;
}

type CursorAction =
  | { type: "SET_VISIBLE"; payload: boolean }
  | { type: "SET_DARK"; payload: boolean }
  | { type: "SET_INTENT"; payload: { mode: CursorMode; isPointer: boolean } };

function cursorReducer(state: CursorState, action: CursorAction): CursorState {
  switch (action.type) {
    case "SET_VISIBLE":
      return { ...state, isVisible: action.payload };
    case "SET_DARK":
      return { ...state, isDark: action.payload };
    case "SET_INTENT":
      // Batch mode and pointer area updates together
      if (
        state.cursorMode === action.payload.mode &&
        state.isPointerArea === action.payload.isPointer
      ) {
        return state; // No change, skip update
      }
      return {
        ...state,
        cursorMode: action.payload.mode,
        isPointerArea: action.payload.isPointer,
      };
    default:
      return state;
  }
}

// Throttle helper - limits function execution to once per interval
function throttle<T extends (...args: unknown[]) => void>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  let lastResult: void;

  return function (this: unknown, ...args: Parameters<T>) {
    if (!inThrottle) {
      lastResult = func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
    return lastResult;
  };
}

export function CustomCursor() {
  const [state, dispatch] = useReducer(cursorReducer, {
    isVisible: false,
    isDark: false,
    cursorMode: "dot",
    isPointerArea: false,
  });

  // Refs for DOM manipulation (no re-renders on position updates!)
  const cursorRef = useRef<HTMLDivElement>(null);
  const innerCursorRef = useRef<HTMLDivElement>(null);
  const shouldRenderRef = useRef(true);

  // Cache for intent detection to avoid repeated DOM queries
  const intentCacheRef = useRef<WeakMap<Element, { mode: CursorMode; isPointer: boolean }>>(
    new WeakMap()
  );

  // Separate text input selectors for better performance
  const isTextInput = (element: Element): boolean => {
    const tagName = element.tagName.toLowerCase();
    if (tagName === "input" || tagName === "textarea") return true;
    if (element.getAttribute("contenteditable") === "" ||
        element.getAttribute("contenteditable") === "true") return true;
    if (element.hasAttribute("data-cursor-intent")) {
      return element.getAttribute("data-cursor-intent") === "text";
    }
    return false;
  };

  // Separate clickable element detection
  const isClickable = (element: Element): boolean => {
    // Skip elements explicitly marked as hover-only
    if (element.getAttribute("data-cursor-intent") === "hover") return false;
    if (element.getAttribute("data-cursor-intent") === "click") return true;

    const tagName = element.tagName.toLowerCase();
    if (tagName === "button") return true;
    if (tagName === "a" && element.hasAttribute("href")) return true;
    if (element.getAttribute("role") === "button") return true;
    if (tagName === "input") {
      const type = element.getAttribute("type");
      if (type === "submit" || type === "button") return true;
    }
    return false;
  };

  // Check element and ancestors for intent
  const detectIntent = useCallback((target: Element | null): { mode: CursorMode; isPointer: boolean } => {
    if (!target) return { mode: "dot", isPointer: false };

    // Check cache first
    const cached = intentCacheRef.current.get(target);
    if (cached) return cached;

    let isTyping = false;
    let isPointer = false;
    let current: Element | null = target;

    // Traverse up to 10 ancestors (prevents excessive traversal)
    let depth = 0;
    while (current && depth < 10) {
      if (!isTyping && isTextInput(current)) {
        isTyping = true;
      }
      if (!isPointer && isClickable(current)) {
        isPointer = true;
      }

      // Early exit if we found both
      if (isTyping && isPointer) break;

      current = current.parentElement;
      depth++;
    }

    const result = {
      mode: (isTyping ? "text" : "dot") as CursorMode,
      isPointer,
    };

    // Cache result
    intentCacheRef.current.set(target, result);

    return result;
  }, []);

  useEffect(() => {
    // Decide whether to render custom cursor
    try {
      const hasFine = window.matchMedia && window.matchMedia("(any-pointer: fine)").matches;
      shouldRenderRef.current = !!hasFine;
    } catch {
      shouldRenderRef.current = true; // safe default
    }

    if (!shouldRenderRef.current) return;

    let rafId: number | null = null;

    // GPU-accelerated position update using transform
    const updatePosition = (e: MouseEvent) => {
      const cursorEl = cursorRef.current;
      if (!cursorEl) return;

      // Cancel any pending RAF
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }

      // Use RAF to sync with browser repaint (60fps)
      rafId = requestAnimationFrame(() => {
        // Direct DOM manipulation - no React re-render!
        // Using translate3d triggers GPU acceleration (composite-only, no layout!)
        cursorEl.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;

        // Show cursor on first move
        if (!state.isVisible) {
          dispatch({ type: "SET_VISIBLE", payload: true });
        }

        rafId = null;
      });
    };

    // Throttled intent detection - runs max 20 times/sec instead of 60-120
    const throttledIntentDetection = throttle((e) => {
      const target = (e as MouseEvent).target as Element | null;
      const intent = detectIntent(target);
      dispatch({ type: "SET_INTENT", payload: intent });
    }, 50); // 50ms = ~20 updates/sec

    // Combined mousemove handler
    const handleMouseMove = (e: MouseEvent) => {
      updatePosition(e);
      throttledIntentDetection(e);
    };

    const handleMouseEnter = () => dispatch({ type: "SET_VISIBLE", payload: true });
    const handleMouseLeave = () => dispatch({ type: "SET_VISIBLE", payload: false });

    // Theme detection
    const checkTheme = () => {
      dispatch({
        type: "SET_DARK",
        payload: document.documentElement.classList.contains("dark"),
      });
    };

    // Initial theme check
    checkTheme();

    // Listen for theme changes
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    // Add event listeners
    document.addEventListener("mousemove", handleMouseMove, { passive: true });
    document.addEventListener("mouseenter", handleMouseEnter);
    document.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseenter", handleMouseEnter);
      document.removeEventListener("mouseleave", handleMouseLeave);
      observer.disconnect();
    };
  }, []); // Empty deps - runs once, uses refs for updates

  // Don't render on touch-only devices
  if (!shouldRenderRef.current) return null;

  // Hide cursor when not visible
  if (!state.isVisible) return null;

  // Dynamic sizing based on intent
  const caretWidth = state.isPointerArea ? 22 : state.cursorMode === "text" ? 4 : 16;
  const caretHeight = state.isPointerArea ? 22 : state.cursorMode === "text" ? 18 : 16;
  const borderRadiusPx = state.cursorMode === "text" ? 2 : 9999;

  return (
    <div
      ref={cursorRef}
      className="fixed pointer-events-none z-50"
      style={{
        // Static positioning at 0,0 - all movement via transform!
        left: 0,
        top: 0,
        // GPU-accelerated transform (composite-only operation)
        transform: "translate3d(0px, 0px, 0)",
        // Hint browser to create GPU layer
        willChange: "transform",
        // Center the cursor on the pointer
        marginLeft: -caretWidth / 2,
        marginTop: -caretHeight / 2,
      }}
    >
      <div
        ref={innerCursorRef}
        className={state.isDark ? "bg-white" : "bg-black"}
        style={{
          width: caretWidth,
          height: caretHeight,
          borderRadius: borderRadiusPx,
          // Hardware-accelerated transitions
          transition: "width 0.15s cubic-bezier(0.4, 0, 0.2, 1), height 0.15s cubic-bezier(0.4, 0, 0.2, 1), border-radius 0.15s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      />
    </div>
  );
}
