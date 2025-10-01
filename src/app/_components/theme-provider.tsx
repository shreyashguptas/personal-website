"use client";

import { useEffect, useState } from "react";

type ThemeDetail = {
  isDark: boolean;
  reason: string;
  applied: boolean;
  timestamp: number;
};

type ThemeChangeCallback = (detail: ThemeDetail) => void;

declare global {
  interface Window {
    __sgApplyTheme?: (reason?: string) => ThemeDetail | undefined;
    __sgOnThemeChange?: (callback: ThemeChangeCallback) => () => void;
  }
}

export function ThemeProvider() {
  const [lastDetail, setLastDetail] = useState<ThemeDetail | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const apply = window.__sgApplyTheme;
    const subscribe = window.__sgOnThemeChange;

    // Fallback when script is not loaded for some reason
    if (!apply) {
      try {
        const media = window.matchMedia?.("(prefers-color-scheme: dark)");
        const isDark = Boolean(media?.matches);
        const html = document.documentElement;
        html.classList.remove("dark", "light");
        html.classList.add(isDark ? "dark" : "light");
        html.setAttribute("data-theme", isDark ? "dark" : "light");

        const backupDetail: ThemeDetail = {
          isDark,
          reason: "provider-fallback",
          applied: true,
          timestamp: Date.now(),
        };
        setLastDetail(backupDetail);
      } catch {
        // ignore
      }
      return;
    }

    const detail = apply("provider-init");
    if (detail) {
      setLastDetail(detail);
    }

    let unsubscribe: (() => void) | undefined;
    if (subscribe) {
      unsubscribe = subscribe((nextDetail) => {
        setLastDetail(nextDetail);
      });
    }

    return () => {
      if (unsubscribe) {
        try {
          unsubscribe();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  useEffect(() => {
    if (process.env.NODE_ENV === "development" && lastDetail) {
      console.info("[theme-provider] theme updated", lastDetail);
    }
  }, [lastDetail]);

  return null;
}
