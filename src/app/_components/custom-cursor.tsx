"use client";

import { useEffect, useState } from "react";

export function CustomCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [cursorMode, setCursorMode] = useState<"dot" | "text">("dot");

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
      setCursorMode(isTypingTarget ? "text" : "dot");
    };

    const handleMouseEnter = () => setIsVisible(true);
    const handleMouseLeave = () => setIsVisible(false);

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

    return () => {
      document.removeEventListener("mousemove", updatePosition);
      document.removeEventListener("mouseenter", handleMouseEnter);
      document.removeEventListener("mouseleave", handleMouseLeave);
      observer.disconnect();
    };
  }, []);

  if (!isVisible) return null;

  const caretWidth = cursorMode === "text" ? 4 : 16; // px
  const caretHeight = cursorMode === "text" ? 18 : 16; // px
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
    </div>
  );
}
