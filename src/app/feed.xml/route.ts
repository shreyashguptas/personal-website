import { NextResponse } from "next/server";
import { getAllPosts } from "@/lib/api";
import { absoluteUrl, getSiteUrl } from "@/lib/seo";

export async function GET() {
  const base = getSiteUrl();
  const posts = getAllPosts();

  const items = posts
    .map((p) => {
      const url = `${base}/posts/${p.slug}`;
      const pubDate = p.date ? new Date(p.date).toUTCString() : new Date().toUTCString();
      const image = absoluteUrl(p.coverImage);
      return `
      <item>
        <title><![CDATA[${p.title}]]></title>
        <link>${url}</link>
        <guid isPermaLink="true">${url}</guid>
        <pubDate>${pubDate}</pubDate>
        ${p.excerpt ? `<description><![CDATA[${p.excerpt}]]></description>` : ""}
        ${image ? `<enclosure url="${image}" type="image/*"/>` : ""}
      </item>`;
    })
    .join("\n");

  const rss = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
  <channel>
    <title>Shreyash Gupta — Blog</title>
    <link>${base}</link>
    <description>Personal blog by Shreyash Gupta</description>
    ${items}
  </channel>
</rss>`;

  return new NextResponse(rss, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "s-maxage=3600, stale-while-revalidate",
    },
  });
}


