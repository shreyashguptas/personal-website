"use client";

import { useEffect } from "react";

export function ThemeProvider() {
  useEffect(() => {
    // Ensure theme is applied after hydration
    const applyTheme = () => {
      const media = matchMedia('(prefers-color-scheme: dark)');
      const isDark = media.matches;
      const html = document.documentElement;
      
      // Remove any existing theme classes
      html.classList.remove('dark', 'light');
      
      if (isDark) {
        html.classList.add('dark');
      } else {
        html.classList.add('light');
      }
      
      html.setAttribute('data-theme', isDark ? 'dark' : 'light');
      
      // Debug logging in development
      if (process.env.NODE_ENV === 'development') {
        console.info('Theme provider applied:', isDark ? 'dark' : 'light');
      }
    };

    // Apply theme immediately
    applyTheme();
    
    // Listen for system theme changes
    const media = matchMedia('(prefers-color-scheme: dark)');
    media.addEventListener('change', applyTheme);
    
    return () => {
      media.removeEventListener('change', applyTheme);
    };
  }, []);

  return null;
}
