/**
 * Keyboard shortcut badge component
 * Shows minimal, elegant keyboard hints on interactive elements
 */

"use client";

import { useEffect, useState } from "react";
import { getPlatform, formatShortcut, isTouchOnlyDevice, type Platform } from "@/lib/keyboard";

interface KbdProps {
  keys: string[];
  className?: string;
}

export function Kbd({ keys, className = "" }: KbdProps) {
  const [platform, setPlatform] = useState<Platform>('unknown');
  const [touchOnly, setTouchOnly] = useState<boolean>(false);
  
  useEffect(() => {
    setPlatform(getPlatform());
    setTouchOnly(isTouchOnlyDevice());
  }, []);
  
  // Don't render until we know the platform to avoid hydration mismatch
  if (platform === 'unknown') return null;
  // Hide entirely on touch-only devices (phones/tablets without fine pointer)
  if (touchOnly) return null;
  
  const shortcut = formatShortcut(keys, platform);
  
  return (
    <kbd 
      className={`inline-flex items-center justify-center px-1.5 py-0.5 text-[11px] font-mono font-medium text-muted-foreground/60 bg-muted/30 rounded-[4px] ${className}`}
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

