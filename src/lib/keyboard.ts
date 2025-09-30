/**
 * Keyboard shortcuts utility
 * Detects platform and provides keyboard shortcut helpers
 */

export type Platform = 'mac' | 'windows' | 'linux' | 'unknown';

/**
 * Detect the user's platform
 */
export function getPlatform(): Platform {
  if (typeof window === 'undefined') return 'unknown';
  
  const userAgent = window.navigator.userAgent.toLowerCase();
  const platform = window.navigator.platform?.toLowerCase() || '';
  
  if (platform.includes('mac') || userAgent.includes('mac')) {
    return 'mac';
  } else if (platform.includes('win') || userAgent.includes('win')) {
    return 'windows';
  } else if (platform.includes('linux') || userAgent.includes('linux')) {
    return 'linux';
  }
  
  return 'unknown';
}

/**
 * Get the modifier key symbol for the current platform
 */
export function getModifierKey(platform: Platform = getPlatform()): string {
  return platform === 'mac' ? '⌘' : 'Ctrl';
}

/**
 * Get the modifier key name for the current platform
 */
export function getModifierKeyName(platform: Platform = getPlatform()): string {
  return platform === 'mac' ? 'Cmd' : 'Ctrl';
}

/**
 * Check if the modifier key is pressed in an event
 */
export function isModifierPressed(e: KeyboardEvent | React.KeyboardEvent, platform: Platform = getPlatform()): boolean {
  return platform === 'mac' ? e.metaKey : e.ctrlKey;
}

/**
 * Format a keyboard shortcut for display
 */
export function formatShortcut(keys: string[], platform: Platform = getPlatform()): string {
  return keys.map(key => {
    if (key === 'mod') return getModifierKey(platform);
    if (key === 'enter') return '↵';
    if (key === 'esc') return 'Esc';
    if (key === 'shift') return '⇧';
    if (key === 'alt') return platform === 'mac' ? '⌥' : 'Alt';
    return key.toUpperCase();
  }).join('');
}

/**
 * Keyboard shortcut component props
 */
export interface ShortcutKeys {
  keys: string[];
  description?: string;
}

