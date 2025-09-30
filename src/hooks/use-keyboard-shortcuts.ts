/**
 * Global keyboard shortcuts hook
 * Manages keyboard navigation throughout the site
 */

"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { isModifierPressed, getPlatform } from "@/lib/keyboard";

export function useKeyboardShortcuts() {
  const router = useRouter();
  const pathname = usePathname();
  
  useEffect(() => {
    const platform = getPlatform();
    
    const handleKeyPress = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in input fields
      const target = e.target as HTMLElement;
      const isTyping = target.tagName === 'INPUT' || 
                       target.tagName === 'TEXTAREA' || 
                       target.isContentEditable;
      
      // Navigation shortcuts (Cmd/Ctrl + Number)
      if (isModifierPressed(e, platform) && !e.shiftKey && !e.altKey) {
        switch (e.key) {
          case '1':
            e.preventDefault();
            router.push('/');
            break;
          case '2':
            e.preventDefault();
            router.push('/blog');
            break;
          case '3':
            e.preventDefault();
            router.push('/projects');
            break;
        }
      }
      
      // Quick action shortcuts (without modifier)
      if (!isTyping && !e.metaKey && !e.ctrlKey && !e.altKey && !e.shiftKey) {
        switch (e.key) {
          case '/':
            // Focus chat input on homepage
            if (pathname === '/') {
              e.preventDefault();
              const chatInput = document.querySelector('[aria-label="Ask a question"]') as HTMLInputElement;
              chatInput?.focus();
            }
            break;
          case '?':
            // Show keyboard shortcuts help (future enhancement)
            e.preventDefault();
            // TODO: Show shortcuts modal
            break;
        }
      }
      
      // Quick start question shortcuts (1, 2, 3) - work even when input is focused!
      if (!e.metaKey && !e.ctrlKey && !e.altKey && !e.shiftKey && pathname === '/') {
        if (['1', '2', '3'].includes(e.key)) {
          const suggestionButtons = document.querySelectorAll('[data-suggestion-index]');
          const index = parseInt(e.key) - 1;
          const button = suggestionButtons[index] as HTMLButtonElement;
          if (button) {
            e.preventDefault();
            // Button's onClick handler will clear the input and send the message
            button.click();
          }
        }
      }
    };
    
    document.addEventListener('keydown', handleKeyPress);
    
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [router, pathname]);
}

