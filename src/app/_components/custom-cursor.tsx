"use client";

import { useEffect, useState } from "react";

type CursorMode = "dot" | "text";

export function CustomCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [cursorMode, setCursorMode] = useState<CursorMode>("dot");
  const [isPointerArea, setIsPointerArea] = useState(false);
  const [shouldRender, setShouldRender] = useState(true);

  useEffect(() => {
    // Decide whether to render custom cursor:
    // - Render when there is ANY fine pointer available (mouse/trackpad), including hybrid touch laptops/tablets
    // - Do not render when only coarse pointers exist (touch-only phones)
    try {
      const hasFine = window.matchMedia && window.matchMedia('(any-pointer: fine)').matches;
      setShouldRender(!!hasFine);
    } catch {
      setShouldRender(true); // safe default
    }

    let rafId: number | null = null;
    let currentX = 0;
    let currentY = 0;

    const updatePosition = (e: MouseEvent) => {
      currentX = e.clientX;
      currentY = e.clientY;

      // Use RAF to throttle updates and sync with browser repaint
      if (rafId === null) {
        rafId = requestAnimationFrame(() => {
          setPosition({ x: currentX, y: currentY });
          setIsVisible(true);
          rafId = null;
        });
      }

      // Determine intent: turn into a typing caret when hovering over text inputs
      const target = e.target as Element | null;
      const isTypingTarget = !!target && !!(
        target.closest(
          'input, textarea, [contenteditable=""], [contenteditable="true"], [data-cursor-intent="text"]'
        )
      );
      const isClickableTarget = !!target && !!(
        target.closest('button:not([data-cursor-intent="hover"]), a[href]:not([data-cursor-intent="hover"]), [role="button"]:not([data-cursor-intent="hover"]), [data-cursor-intent="click"], input[type="submit"], input[type="button"]')
      );
      setIsPointerArea(isClickableTarget);
      setCursorMode(isTypingTarget ? "text" : "dot");
    };

    const handleMouseEnter = () => setIsVisible(true);
    const handleMouseLeave = () => setIsVisible(false);

    // no press/hand modes; use system pointer on clickable elements

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

    if (shouldRender) {
      document.addEventListener("mousemove", updatePosition);
      document.addEventListener("mouseenter", handleMouseEnter);
      document.addEventListener("mouseleave", handleMouseLeave);
    }

    return () => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
      if (shouldRender) {
        document.removeEventListener("mousemove", updatePosition);
        document.removeEventListener("mouseenter", handleMouseEnter);
        document.removeEventListener("mouseleave", handleMouseLeave);
      }
      observer.disconnect();
    };
  }, [shouldRender]);

  // Don't render on touch-only devices
  if (!shouldRender) return null;
  // Hide cursor when not visible
  if (!isVisible) return null;

  // When hovering over clickable areas, show a larger circle (pointer effect)
  const caretWidth = isPointerArea ? 22 : (cursorMode === "text" ? 4 : 16); // px - larger on clickable
  const caretHeight = isPointerArea ? 22 : (cursorMode === "text" ? 18 : 16); // px - larger on clickable
  const borderRadiusPx = cursorMode === "text" ? 2 : 9999;

  return (
    <div
      className="fixed pointer-events-none z-50"
      style={{
        left: position.x - caretWidth / 2,
        top: position.y - caretHeight / 2,
        transform: "translate3d(0, 0, 0)", // Hardware acceleration only
        willChange: "left, top", // Hint browser to optimize
      }}
    >
      <div
        className={isDark ? "bg-white" : "bg-black"}
        style={{
          width: caretWidth,
          height: caretHeight,
          borderRadius: borderRadiusPx,
          transition: "width 0.1s ease-out, height 0.1s ease-out", // Only transition size, instant
        }}
      />
    </div>
  );
}
