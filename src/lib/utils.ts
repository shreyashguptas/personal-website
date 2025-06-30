import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Extracts the first image URL from markdown content
 * @param content - The markdown content string
 * @returns The first image URL found, or empty string if none found
 */
export function extractFirstImageFromMarkdown(content: string): string {
  // Regex to match markdown image syntax: ![alt text](image-url)
  const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/;
  const match = content.match(imageRegex);
  
  if (match && match[2]) {
    return match[2];
  }
  
  return "";
}

export function extractYearFromDate(dateString: string): string {
  return new Date(dateString).getFullYear().toString();
} 