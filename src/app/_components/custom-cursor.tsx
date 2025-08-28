"use client";

import { useEffect, useState } from "react";

type CursorMode = "dot" | "text" | "hand" | "hand-press";

export function CustomCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [cursorMode, setCursorMode] = useState<CursorMode>("dot");

  useEffect(() => {
    const updatePosition = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      setIsVisible(true);

      // Determine intent: turn into a typing caret when hovering over text inputs
      const target = e.target as Element | null;
      const isTypingTarget = !!target && !!(
        target.closest(
          'input, textarea, [contenteditable=""], [contenteditable="true"], [data-cursor-intent="text"]'
        )
      );
      const isClickableTarget = !!target && !!(
        target.closest('button, a[href], [role="button"], [data-cursor-intent="click"], input[type="submit"], input[type="button"]')
      );
      if (isTypingTarget) {
        setCursorMode("text");
      } else if (cursorMode === "hand-press") {
        // keep press visual until mouseup sets it back
        setCursorMode("hand-press");
      } else {
        setCursorMode(isClickableTarget ? "hand" : "dot");
      }
    };

    const handleMouseEnter = () => setIsVisible(true);
    const handleMouseLeave = () => setIsVisible(false);

    const handleMouseDown = (e: MouseEvent) => {
      const target = e.target as Element | null;
      const isClickableTarget = !!target && !!(
        target.closest('button, a[href], [role="button"], [data-cursor-intent="click"], input[type="submit"], input[type="button"]')
      );
      if (isClickableTarget) setCursorMode("hand-press");
    };

    const handleMouseUp = (e: MouseEvent) => {
      const target = e.target as Element | null;
      const isTypingTarget = !!target && !!(
        target.closest(
          'input, textarea, [contenteditable=""], [contenteditable="true"], [data-cursor-intent="text"]'
        )
      );
      if (isTypingTarget) {
        setCursorMode("text");
        return;
      }
      const isClickableTarget = !!target && !!(
        target.closest('button, a[href], [role="button"], [data-cursor-intent="click"], input[type="submit"], input[type="button"]')
      );
      setCursorMode(isClickableTarget ? "hand" : "dot");
    };

    // Check theme by looking for dark class on document element
    const checkTheme = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };

    // Initial theme check
    checkTheme();

    // Listen for theme changes by observing class changes
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    document.addEventListener("mousemove", updatePosition);
    document.addEventListener("mouseenter", handleMouseEnter);
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", updatePosition);
      document.removeEventListener("mouseenter", handleMouseEnter);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("mouseup", handleMouseUp);
      observer.disconnect();
    };
  }, []);

  if (!isVisible) return null;

  const isHand = cursorMode === "hand" || cursorMode === "hand-press";
  const caretWidth = cursorMode === "text" ? 4 : isHand ? 28 : 16; // px
  const caretHeight = cursorMode === "text" ? 18 : isHand ? 28 : 16; // px
  const borderRadiusPx = cursorMode === "text" ? 2 : 9999;

  return (
    <div
      className="fixed pointer-events-none z-50 transition-transform duration-75 ease-out"
      style={{
        left: position.x - caretWidth / 2,
        top: position.y - caretHeight / 2,
        transform: "translate3d(0, 0, 0)", // Hardware acceleration
      }}
    >
      {isHand ? (
        <svg
          width={caretWidth}
          height={caretHeight}
          viewBox="0 0 28 28"
          style={{
            transition: "transform 120ms ease, filter 200ms ease",
            transform: cursorMode === "hand-press" ? "translateY(1px) translateX(-2px) scale(0.98)" : "translateY(0) translateX(-2px) scale(1)",
            filter: isDark ? "drop-shadow(0 0 6px rgba(255,255,255,0.3))" : "drop-shadow(0 0 6px rgba(0,0,0,0.25))",
          }}
        >
          {/* Classic pointer: index finger on the left, no thumb */}
          <rect x="6" y={cursorMode === "hand-press" ? 6 : 4} width="3.5" height={cursorMode === "hand-press" ? 10.5 : 13.5} rx="1.75" fill={isDark ? "#fff" : "#000"} />
          <rect x="10" y="12" width="12" height="10" rx="4" fill={isDark ? "#fff" : "#000"} />
          {/* knuckle hints */}
          <rect x="12.5" y="11.5" width="2.8" height="2.8" rx="1.4" fill={isDark ? "#fff" : "#000"} />
          <rect x="15.9" y="11.9" width="2.6" height="2.6" rx="1.3" fill={isDark ? "#fff" : "#000"} />
          <rect x="19.0" y="12.4" width="2.4" height="2.4" rx="1.2" fill={isDark ? "#fff" : "#000"} />
        </svg>
      ) : (
        <div
          className={`${isDark ? "bg-white shadow-lg" : "bg-black shadow-lg"} transition-all duration-200 ease-out`}
          style={{
            width: caretWidth,
            height: caretHeight,
            borderRadius: borderRadiusPx,
            boxShadow: isDark
              ? "0 0 8px rgba(255, 255, 255, 0.3)"
              : "0 0 8px rgba(0, 0, 0, 0.3)"
          }}
        />
      )}
    </div>
  );
}
