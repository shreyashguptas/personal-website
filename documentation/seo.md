# SEO and Indexing Guide

## Overview
This site is configured for search engine visibility using canonical URLs, Open Graph and Twitter metadata, XML sitemap, robots.txt, RSS feed, and JSON-LD structured data.

## Required environment variable
- NEXT_PUBLIC_SITE_URL: Your canonical site origin, without a trailing slash. Example: https://shreyashg.com
  - Used by src/lib/seo.ts to build absolute URLs and to set metadataBase.
  - If missing or invalid in production, the app defaults to https://shreyashg.com. In development, it defaults to http://localhost:3000.
  - Set this in your hosting provider’s environment variables if you need to override the default.

## Key routes/files
- Sitemap: GET /sitemap.xml implemented by src/app/sitemap.ts
  - Contains /, /blog, /projects, and all /posts/[slug] URLs.
  - Includes lastModified for posts when available.
- Robots: GET /robots.txt implemented by src/app/robots.ts
  - Allows all crawlers; adds Sitemap and Host using the configured site URL.
- RSS Feed: GET /feed.xml implemented by src/app/feed.xml/route.ts
  - Lists all posts with title, link, guid, pubDate, optional description (excerpt), and optional image enclosure.

## Metadata policy (Next.js Metadata API)
- Global defaults: src/app/layout.tsx
  - Sets metadataBase using getSiteUrl(), canonical /, OG/Twitter defaults, and site-wide description.
- Blog index: src/app/blog/page.tsx
  - Page-level metadata with canonical /blog.
- Projects index: src/app/projects/page.tsx
  - Page-level metadata with canonical /projects.
- Blog post pages: src/app/posts/[slug]/page.tsx
  - Per-post generateMetadata adds:
    - Canonical: /posts/[slug]
    - Description: from post excerpt (auto-derived if missing)
    - Open Graph: type article, absolute image URL when available
    - Twitter card: summary_large_image, absolute image URL when available

## Structured data (JSON-LD)
- Blog posts include BlogPosting JSON-LD injected in src/app/posts/[slug]/page.tsx with:
  - headline, datePublished, dateModified, and author name.
- Consider adding Person/Website/Organization JSON-LD on the home page if desired.

## Excerpts (meta descriptions)
- Preferred: Provide an excerpt in post front matter.
- If missing: src/lib/api.ts auto-derives a concise excerpt from the first meaningful paragraph (strips code blocks, images, markdown syntax).
- The excerpt is used as the meta description and in the RSS description.

## Cover image selection (used for OG/Twitter)
Priority used in src/lib/api.ts:
1. Front matter coverImage if provided
2. Front matter coverImageIndex (1-based) selects the Nth image from content
3. First image found in the markdown content
4. None (no image)

## SEO utilities
- src/lib/seo.ts
  - getSiteUrl(): Validates and returns the canonical base URL; warns if missing/invalid
  - absoluteUrl(path): Converts relative URLs to absolute using the site base

## How to change behavior
- Change host/canonical base: Update NEXT_PUBLIC_SITE_URL and redeploy
- Add/remove URLs from sitemap: Edit src/app/sitemap.ts
- Adjust robots policy: Edit src/app/robots.ts
- Modify feed fields: Edit src/app/feed.xml/route.ts
- Page-level metadata:
  - Global: src/app/layout.tsx
  - Blog index: src/app/blog/page.tsx
  - Projects index: src/app/projects/page.tsx
  - Posts: src/app/posts/[slug]/page.tsx
- Excerpt generation rules: src/lib/api.ts
- Cover image selection rules: src/lib/api.ts and markdown content/front matter

## Deployment checklist
- Ensure the canonical base is correct:
  - By default, production uses https://shreyashg.com; set NEXT_PUBLIC_SITE_URL if you need a different domain.
- Verify routes after deploy:
  - /robots.txt returns 200 and contains Sitemap and Host lines
  - /sitemap.xml returns 200 and lists expected URLs
  - /feed.xml returns 200 and lists posts
- Inspect a post page source:
  - <link rel="canonical" href="https://.../posts/slug" /> present
  - <meta name="description" ...> present
  - OG/Twitter image URLs are absolute
  - JSON-LD present with type BlogPosting

## Search engine submission & monitoring
- Submit https://<your-domain>/sitemap.xml in Google Search Console and Bing Webmaster Tools
- Use URL inspection to request indexing for new/updated posts
- Monitor coverage and enhancements reports for errors and warnings

## Content authoring guidelines
- Provide meaningful title, date, excerpt, and optional coverImage or coverImageIndex
- Include at least one image in content when possible (benefits OG/Twitter)
- Add relevant internal links across posts
- Ensure posts are readable and valuable for users


