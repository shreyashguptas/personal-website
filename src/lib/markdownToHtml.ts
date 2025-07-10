import { remark } from "remark";
import html from "remark-html";

export default async function markdownToHtml(markdown: string) {
  const result = await remark().use(html).process(markdown);
  let htmlContent = result.toString();
  
  // Simple regex-based replacement to optimize images (except GIFs)
  // This converts: <img src="/path/to/image.jpg" alt="alt text">
  // To: <img src="/_next/image?url=%2Fpath%2Fto%2Fimage.jpg&w=1920&q=75" alt="alt text" loading="lazy" class="rounded-lg w-full h-auto object-contain my-6">
  htmlContent = htmlContent.replace(
    /<img\s+([^>]*?)src=["']([^"']+)["']([^>]*?)>/g,
    (match, beforeSrc, src, afterSrc) => {
      // Skip GIFs to preserve animation
      if (src.toLowerCase().endsWith('.gif')) {
        return `<img ${beforeSrc}src="${src}"${afterSrc} class="rounded-lg w-full h-auto object-contain my-6">`;
      }
      
      // Optimize other images
      const optimizedSrc = `/_next/image?url=${encodeURIComponent(src)}&w=1920&q=75`;
      return `<img ${beforeSrc}src="${optimizedSrc}"${afterSrc} loading="lazy" decoding="async" class="rounded-lg w-full h-auto object-contain my-6" style="color: transparent;">`;
    }
  );
  
  return htmlContent;
}
