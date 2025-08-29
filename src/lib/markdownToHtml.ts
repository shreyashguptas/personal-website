import { remark } from "remark";
import html from "remark-html";
import DOMPurify from "dompurify";
import { JSDOM } from "jsdom";

// Create a server-side DOM environment for DOMPurify
const createDOMPurify = () => {
  const window = new JSDOM('').window;
  const DOMPurifyServer = DOMPurify(window);

  // Configure sanitization to allow necessary HTML elements for blog content
  // while preventing XSS attacks
  return DOMPurifyServer;
};

export default async function markdownToHtml(markdown: string) {
  // Convert markdown to HTML using remark
  const result = await remark().use(html).process(markdown);
  let htmlContent = result.toString();

  // SANITIZE HTML OUTPUT - This is the critical security fix
  // We sanitize BEFORE doing any further processing to ensure no malicious HTML gets through
  const DOMPurifyServer = createDOMPurify();
  htmlContent = DOMPurifyServer.sanitize(htmlContent, {
    // Allow only safe HTML elements that are needed for blog content
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'b', 'i', 'u', 'strike', 's', // Text formatting
      'a', 'ul', 'ol', 'li', 'blockquote', 'code', 'pre', // Structure
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6', // Headings
      'img', 'hr', 'table', 'thead', 'tbody', 'tr', 'th', 'td' // Media and tables
    ],
    // Allow only safe attributes
    ALLOWED_ATTR: [
      'href', 'src', 'alt', 'title', 'class', 'id', // Basic attributes
      'target', 'rel', 'loading', 'decoding', 'style', // Performance attributes
      'width', 'height', 'colspan', 'rowspan' // Table attributes
    ],
    // Ensure external links open safely
    ALLOW_DATA_ATTR: false, // No data attributes
    FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed'], // Explicitly forbid dangerous tags
    FORBID_ATTR: ['onload', 'onerror', 'onclick', 'onmouseover'] // Forbid event handlers
  });

  // AFTER sanitization, safely optimize images
  // This regex replacement is now safe because we've already sanitized the HTML
  htmlContent = htmlContent.replace(
    /<img\s+([^>]*?)src=["']([^"']+)["']([^>]*?)>/g,
    (match, beforeSrc, src, afterSrc) => {
      // Skip GIFs to preserve animation
      if (src.toLowerCase().endsWith('.gif')) {
        return `<img ${beforeSrc}src="${src}"${afterSrc} class="rounded-lg w-full h-auto object-contain my-6">`;
      }

      // Optimize other images with Next.js Image Optimization
      const optimizedSrc = `/_next/image?url=${encodeURIComponent(src)}&w=1920&q=75`;
      return `<img ${beforeSrc}src="${optimizedSrc}"${afterSrc} loading="lazy" decoding="async" class="rounded-lg w-full h-auto object-contain my-6" style="color: transparent;">`;
    }
  );

  return htmlContent;
}
