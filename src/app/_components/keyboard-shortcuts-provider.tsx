"use client";

import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";

/**
 * Provider component that enables global keyboard shortcuts
 * Must be a client component to use hooks
 */
export function KeyboardShortcutsProvider() {
  useKeyboardShortcuts();
  return null;
}

