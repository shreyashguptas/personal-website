"use client";

import { useEffect, useState } from "react";
import { Sun, Moon, Monitor } from "lucide-react";
import type { ThemeDetail, ThemePref } from "@/lib/theme";

type SgTheme = {
  apply: (reason?: string) => ThemeDetail | undefined;
  get: () => ThemePref;
  set: (pref: ThemePref) => ThemeDetail | undefined;
  subscribe: (cb: (detail: ThemeDetail) => void) => () => void;
};

declare global {
  interface Window {
    __sgTheme?: SgTheme;
  }
}

const OPTIONS: { value: ThemePref; label: string; Icon: typeof Sun }[] = [
  { value: "light", label: "Light", Icon: Sun },
  { value: "dark", label: "Dark", Icon: Moon },
  { value: "system", label: "System", Icon: Monitor },
];

export function ThemeToggle() {
  const [pref, setPref] = useState<ThemePref | null>(null);

  useEffect(() => {
    const api = window.__sgTheme;
    if (!api) return;
    setPref(api.get());
    return api.subscribe((detail) => setPref(detail.pref));
  }, []);

  const handleSelect = (next: ThemePref) => {
    window.__sgTheme?.set(next);
  };

  return (
    <div
      role="radiogroup"
      aria-label="Theme"
      className="inline-flex items-center border border-border bg-background"
    >
      {OPTIONS.map(({ value, label, Icon }) => {
        const isActive = pref === value;
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={isActive}
            aria-label={label}
            onClick={() => handleSelect(value)}
            className={[
              "h-8 w-10 inline-flex items-center justify-center transition-colors",
              "border-r border-border last:border-r-0",
              isActive
                ? "bg-foreground text-background"
                : "bg-transparent text-muted-foreground hover:text-foreground",
            ].join(" ")}
          >
            <Icon className="w-3.5 h-3.5" strokeWidth={1.75} aria-hidden="true" />
          </button>
        );
      })}
    </div>
  );
}
