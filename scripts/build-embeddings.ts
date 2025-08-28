/*
  Build-time embeddings script.
  - Reads markdown from `_posts` and `_projects`
  - Normalizes and chunks text
  - Generates embeddings using OpenAI `text-embedding-3-small`
  - Writes `src/data/vector-index.json`
*/

import fs from "fs";
import path from "path";
import matter from "gray-matter";
import OpenAI from "openai";
import 'dotenv/config';

type SourceType = "post" | "project";

interface RawDoc {
  id: string;
  type: SourceType;
  title: string;
  slug: string;
  url: string;
  text: string;
}

interface EmbeddedChunk extends RawDoc {
  embedding: number[];
}

function readMarkdownDirectory(dirPath: string, type: SourceType): RawDoc[] {
  const absDir = path.join(process.cwd(), dirPath);
  if (!fs.existsSync(absDir)) return [];
  const files = fs.readdirSync(absDir).filter((f) => f.endsWith(".md"));

  const docs: RawDoc[] = [];
  for (const file of files) {
    const fullPath = path.join(absDir, file);
    const raw = fs.readFileSync(fullPath, "utf8");
    const parsed = matter(raw);
    const slug = file.replace(/\.md$/, "");
    const title = String((parsed.data as any)?.title || slug);
    const url = type === "post" ? `/posts/${slug}` : `/projects#${slug}`;
    const content = String(parsed.content || "");
    const normalized = normalizeMarkdown(content);

    // Keep only a reasonable amount per source to control index size
    const limited = normalized.slice(0, 16000);

    const chunks = chunkText(limited, 1200, 200);
    chunks.forEach((text, idx) => {
      docs.push({
        id: `${type}:${slug}:${idx}`,
        type,
        title,
        slug,
        url,
        text,
      });
    });
  }
  return docs;
}

function normalizeMarkdown(md: string): string {
  return md
    // Remove code blocks
    .replace(/```[\s\S]*?```/g, " ")
    // Remove images ![alt](url)
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    // Remove links [text](url) -> text
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    // Strip markdown tokens
    .replace(/[>#*_`~\-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function chunkText(text: string, chunkSize: number, overlap: number): string[] {
  const chunks: string[] = [];
  let start = 0;
  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    chunks.push(text.slice(start, end));
    if (end === text.length) break;
    start = end - overlap;
    if (start < 0) start = 0;
  }
  return chunks;
}

async function main() {
  const key = process.env.OPENAI_API_KEY;
  const outDir = path.join(process.cwd(), "src", "data");
  const outPath = path.join(outDir, "vector-index.json");
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  if (!key) {
    console.warn("[build-embeddings] OPENAI_API_KEY not set. Writing empty index for dev builds.");
    fs.writeFileSync(outPath, JSON.stringify([]), "utf8");
    return;
  }

  const openai = new OpenAI({ apiKey: key });

  const posts = readMarkdownDirectory("_posts", "post");
  const projects = readMarkdownDirectory("_projects", "project");
  const all = [...posts, ...projects];

  console.log(`Embedding ${all.length} chunks...`);

  const embedded: EmbeddedChunk[] = [];
  const model = "text-embedding-3-small";

  // Batch in small groups for reliability
  const batchSize = 64;
  for (let i = 0; i < all.length; i += batchSize) {
    const batch = all.slice(i, i + batchSize);
    const input = batch.map((d) => d.text);
    const res = await openai.embeddings.create({ model, input });
    res.data.forEach((item: any, idx: number) => {
      embedded.push({ ...batch[idx], embedding: (item.embedding as number[]) });
    });
    console.log(`Embedded ${Math.min(i + batchSize, all.length)} / ${all.length}`);
  }

  fs.writeFileSync(outPath, JSON.stringify(embedded), "utf8");
  console.log(`Wrote index to ${outPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});


