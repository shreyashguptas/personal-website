/**
 * Keyboard shortcut badge component
 * Shows minimal, elegant keyboard hints on interactive elements
 */

"use client";

import { useEffect, useState } from "react";
import { getPlatform, formatShortcut, type Platform } from "@/lib/keyboard";

interface KbdProps {
  keys: string[];
  className?: string;
}

export function Kbd({ keys, className = "" }: KbdProps) {
  const [platform, setPlatform] = useState<Platform>('unknown');
  
  useEffect(() => {
    setPlatform(getPlatform());
  }, []);
  
  // Don't render until we know the platform to avoid hydration mismatch
  if (platform === 'unknown') return null;
  
  const shortcut = formatShortcut(keys, platform);
  
  return (
    <kbd 
      className={`inline-flex items-center justify-center px-2.5 py-1.5 text-sm font-mono font-semibold text-muted-foreground/85 bg-muted/50 border border-border/50 rounded shadow-premium-xs ${className}`}
      aria-label={`Keyboard shortcut: ${keys.join(' + ')}`}
    >
      {shortcut}
    </kbd>
  );
}

/**
 * Inline keyboard hint for buttons
 */
export function KbdHint({ keys }: { keys: string[] }) {
  return (
    <span className="ml-auto pl-3 opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity duration-200">
      <Kbd keys={keys} />
    </span>
  );
}

