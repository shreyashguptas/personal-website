"use client";

import { useEffect, useState } from "react";

export function CustomCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const updatePosition = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      setIsVisible(true);
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

  return (
    <div
      className="fixed pointer-events-none z-50 transition-transform duration-75 ease-out"
      style={{
        left: position.x - 8, // Center the 16x16 dot
        top: position.y - 8,
        transform: "translate3d(0, 0, 0)", // Hardware acceleration
      }}
    >
      <div
        className={`w-4 h-4 rounded-full ${
          isDark 
            ? "bg-white shadow-lg" 
            : "bg-black shadow-lg"
        }`}
        style={{
          boxShadow: isDark 
            ? "0 0 8px rgba(255, 255, 255, 0.3)" 
            : "0 0 8px rgba(0, 0, 0, 0.3)"
        }}
      />
    </div>
  );
}
