/*
  Build-time embeddings script.
  - Reads markdown from `_posts`, `_projects`, and `_resume` (e.g., `about-me.md`)
  - Normalizes and chunks text
  - Generates embeddings using OpenAI `text-embedding-3-small`
  - Writes `src/data/vector-index.json`
*/

import fs from "fs";
import path from "path";
import matter from "gray-matter";
import OpenAI from "openai";
import 'dotenv/config';
import { PROMPT_CONFIG } from "../src/lib/prompts";
import { captureAiEmbedding, flushPosthog } from "../src/lib/analytics-server";

type SourceType = "post" | "project" | "resume";

interface RawDoc {
  id: string;
  type: SourceType;
  title: string;
  slug: string;
  url: string;
  text: string;
  date?: string; // ISO date if present
  summary?: string;
  technologies?: string[];
  projectUrl?: string;
  lastUpdated?: string; // For resume updates
}

interface EmbeddedChunk extends RawDoc {
  embedding: number[];
}

function readMarkdownDirectory(dirPath: string, type: SourceType): RawDoc[] {
  const absDir = path.join(process.cwd(), dirPath);
  if (!fs.existsSync(absDir)) return [];
  const files = fs.readdirSync(absDir).filter((f) => f.endsWith(".md"));

  const docs: RawDoc[] = [];
  console.info(`[build-embeddings] Processing ${type}s from ${dirPath}:`);
  
  for (const file of files) {
    const fullPath = path.join(absDir, file);
    const raw = fs.readFileSync(fullPath, "utf8");
    const parsed = matter(raw);
    const slug = file.replace(/\.md$/, "");
    const fmRecord = parsed.data as Record<string, unknown>;
    const title = String((fmRecord?.title as string | undefined) || slug);
    const dateRaw = fmRecord?.date as string | undefined;
    let date: string | undefined = undefined;
    
    if (dateRaw) {
      const d = new Date(dateRaw);
      if (!isNaN(d.getTime())) {
        date = d.toISOString();
        console.info(`  ✓ ${slug}: ${dateRaw} -> ${date}`);
      } else {
        console.info(`  ✗ ${slug}: Invalid date "${dateRaw}"`);
      }
    } else {
      console.info(`  ✗ ${slug}: No date found`);
    }
    const url = type === "post" ? `/posts/${slug}` : type === "project" ? `/projects#${slug}` : `/resume`;
    const content = String(parsed.content || "");
    // For projects with no content, use the description as content
    let normalized: string;
    if (type === "project" && content.trim().length === 0) {
      const description = String((fmRecord?.description as string | undefined) || "");
      normalized = description.trim();
    } else {
      normalized = normalizeMarkdown(content);
    }

    // Keep only a reasonable amount per source to control index size
    const limited = normalized.slice(0, PROMPT_CONFIG.embeddings.maxContentLength);

    const fm = (parsed.data || {}) as Record<string, unknown>;
    const summary = type === "post"
      ? (typeof fm.excerpt === "string" ? fm.excerpt : "")
      : (typeof fm.description === "string" ? fm.description : "");
    const technologies: string[] | undefined = type === "project" && Array.isArray(fm.technologies)
      ? (fm.technologies as unknown[]).map((t) => String(t))
      : undefined;
    const projectUrl: string | undefined = type === "project" && typeof fm.projectUrl === "string" ? (fm.projectUrl as string) : undefined;
    const lastUpdated: string | undefined = type === "resume" && typeof fm.lastUpdated === "string" ? fm.lastUpdated : undefined;


    const chunks = chunkText(limited, PROMPT_CONFIG.embeddings.chunkSize, PROMPT_CONFIG.embeddings.chunkOverlap);
    chunks.forEach((text, idx) => {
      // CRITICAL FIX: Add metadata to ALL chunks, not just the first one
      // This prevents content type confusion in RAG retrieval
      const chunkMetaLines = [
        `Type: ${type}`,
        `Title: ${title}`,
        `ChunkIndex: ${idx}`,
        date ? `Date: ${date}` : undefined,
        summary ? `Summary: ${summary}` : undefined,
        technologies && technologies.length ? `Technologies: ${technologies.join(", ")}` : undefined,
        projectUrl ? `ProjectURL: ${projectUrl}` : undefined,
        lastUpdated ? `LastUpdated: ${lastUpdated}` : undefined,
      ].filter(Boolean).join("\n");
      
      const textWithMeta = `${chunkMetaLines}\n\n${text}`;
      
      docs.push({
        id: `${type}:${slug}:${idx}`,
        type,
        title,
        slug,
        url,
        text: textWithMeta,
        date,
        summary,
        technologies,
        projectUrl,
        lastUpdated,
      });
    });
  }
  return docs;
}

function normalizeMarkdown(md: string): string {
  if (PROMPT_CONFIG.embeddings.preserveStructure) {
    return md
      // Convert headers to plain text with structure indicators
      .replace(/^### (.+)$/gm, "SECTION: $1\n")
      .replace(/^## (.+)$/gm, "CHAPTER: $1\n")
      .replace(/^# (.+)$/gm, "TITLE: $1\n")
      // Preserve list structure
      .replace(/^\* (.+)$/gm, "• $1")
      .replace(/^- (.+)$/gm, "• $1")
      .replace(/^\d+\. (.+)$/gm, "($1)")
      // Remove images but preserve alt text
      .replace(/!\[([^\]]*)\]\([^)]*\)/g, "IMAGE: $1")
      // Remove links but preserve text
      .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
      // Remove code blocks but preserve placeholder
      .replace(/```[\s\S]*?```/g, " [CODE_BLOCK] ")
      // Clean up inline code
      .replace(/`([^`]+)`/g, "$1")
      // Remove remaining markdown tokens while preserving emphasis indicators
      .replace(/\*\*([^*]+)\*\*/g, "IMPORTANT: $1")
      .replace(/\*([^*]+)\*/g, "$1")
      // Clean up extra whitespace
      .replace(/\s+/g, " ")
      .trim();
  } else {
    // Original aggressive normalization
    return md
      .replace(/```[\s\S]*?```/g, " ")
      .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
      .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
      .replace(/[>#*_`~-]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }
}

function chunkText(text: string, chunkSize: number, overlap: number): string[] {
  const chunks: string[] = [];
  
  if (PROMPT_CONFIG.embeddings.semanticChunking) {
    // Split by paragraphs first, then chunk semantically
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
    
    let currentChunk = "";
    
    for (const paragraph of paragraphs) {
      const trimmedParagraph = paragraph.trim();
      
      // If adding this paragraph would exceed chunk size
      if (currentChunk.length + trimmedParagraph.length + 2 > chunkSize) {
        // Save current chunk if it has content
        if (currentChunk.trim().length > 0) {
          chunks.push(currentChunk.trim());
        }
        
        // Handle very long paragraphs that exceed chunk size
        if (trimmedParagraph.length > chunkSize) {
          // Split long paragraph by sentences
          const sentences = trimmedParagraph.split(/(?<=[.!?])\s+/);
          let sentenceChunk = "";
          
          for (const sentence of sentences) {
            if (sentenceChunk.length + sentence.length + 1 > chunkSize) {
              if (sentenceChunk.trim().length > 0) {
                chunks.push(sentenceChunk.trim());
              }
              sentenceChunk = sentence;
            } else {
              sentenceChunk += (sentenceChunk.length > 0 ? " " : "") + sentence;
            }
          }
          
          if (sentenceChunk.trim().length > 0) {
            currentChunk = sentenceChunk;
          } else {
            currentChunk = "";
          }
        } else {
          currentChunk = trimmedParagraph;
        }
      } else {
        currentChunk += (currentChunk.length > 0 ? "\n\n" : "") + trimmedParagraph;
      }
    }
    
    // Add final chunk
    if (currentChunk.trim().length > 0) {
      chunks.push(currentChunk.trim());
    }
  } else {
    // Original character-based chunking
    let start = 0;
    while (start < text.length) {
      const end = Math.min(start + chunkSize, text.length);
      chunks.push(text.slice(start, end));
      if (end === text.length) break;
      start = end - overlap;
      if (start < 0) start = 0;
    }
  }
  
  // Apply overlap for semantic chunks
  if (PROMPT_CONFIG.embeddings.semanticChunking && chunks.length > 1) {
    const overlapChunks: string[] = [];
    
    for (let i = 0; i < chunks.length; i++) {
      let chunkWithOverlap = chunks[i];
      
      // Add overlap from previous chunk
      if (i > 0) {
        const prevChunk = chunks[i - 1];
        const overlapText = prevChunk.slice(-overlap);
        chunkWithOverlap = overlapText + "\n\n" + chunkWithOverlap;
      }
      
      overlapChunks.push(chunkWithOverlap);
    }
    
    return overlapChunks;
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
  const resume = readMarkdownDirectory("_resume", "resume");

  console.info(`\n[build-embeddings] Summary:`);
  console.info(`  Posts: ${posts.length}`);
  console.info(`  Projects: ${projects.length}`);
  console.info(`  Resume: ${resume.length}`);

  // Explicitly list resume sources to validate inclusion (e.g., about-me.md)
  if (resume.length > 0) {
    const bySlug = new Map<string, RawDoc[]>();
    for (const r of resume) {
      const list = bySlug.get(r.slug) || [];
      list.push(r);
      bySlug.set(r.slug, list);
    }
    console.info(`\n[build-embeddings] Resume sources:`);
    for (const [slug, docs] of bySlug) {
      // Prefer the first chunk which contains metadata
      const first = docs.find(d => d.id.endsWith(":0")) || docs[0];
      console.info(`  - ${slug} -> title="${first.title}" lastUpdated=${first.lastUpdated ?? "(none)"}`);
    }
  }

  // Log projects with dates for verification
  if (projects.length > 0) {
    console.info(`\n[build-embeddings] Projects with dates:`);
    const projectsWithDates = projects.filter(p => p.date).sort((a, b) => new Date(b.date!).getTime() - new Date(a.date!).getTime());
    projectsWithDates.forEach(p => {
      console.info(`  ${p.date}: ${p.title}`);
    });
  }

  const all = [...posts, ...projects, ...resume];

  console.info(`\n[build-embeddings] Enhanced Vectorization Settings:`);
  console.info(`  Chunk Size: ${PROMPT_CONFIG.embeddings.chunkSize} (was 1200)`);
  console.info(`  Chunk Overlap: ${PROMPT_CONFIG.embeddings.chunkOverlap} (was 200)`);
  console.info(`  Max Content Length: ${PROMPT_CONFIG.embeddings.maxContentLength} (was 16000)`);
  console.info(`  Structure Preservation: ${PROMPT_CONFIG.embeddings.preserveStructure ? 'ON' : 'OFF'}`);
  console.info(`  Semantic Chunking: ${PROMPT_CONFIG.embeddings.semanticChunking ? 'ON' : 'OFF'}`);
  console.info(`  Metadata in All Chunks: ENABLED (prevents content type confusion)`);

  console.info(`\nEmbedding ${all.length} chunks...`);

  const embedded: EmbeddedChunk[] = [];
  const model = PROMPT_CONFIG.embeddings.model;

  // Batch in small groups for reliability
  const batchSize = PROMPT_CONFIG.embeddings.batchSize;
  for (let i = 0; i < all.length; i += batchSize) {
    const batch = all.slice(i, i + batchSize);
    const input = batch.map((d) => d.text);
    const embStart = Date.now();
    const res = await openai.embeddings.create({ model, input });
    const embEnd = Date.now();
    try {
      await captureAiEmbedding({ model, latencyMs: embEnd - embStart, input: input.slice(0, 1) });
    } catch {
      // no-op analytics
      void 0;
    }
    res.data.forEach((item, idx: number) => {
      const embedding = Array.isArray((item as { embedding: unknown }).embedding)
        ? ((item as { embedding: number[] }).embedding)
        : [];
      embedded.push({ ...batch[idx], embedding });
    });
    console.info(`Embedded ${Math.min(i + batchSize, all.length)} / ${all.length}`);
  }

  fs.writeFileSync(outPath, JSON.stringify(embedded), "utf8");
  console.info(`Wrote index to ${outPath}`);
  try { await flushPosthog(); } catch {
    // no-op
    void 0;
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});