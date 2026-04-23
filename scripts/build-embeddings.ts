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

    const fm = (parsed.data || {}) as Record<string, unknown>;
    const summary = type === "post"
      ? (typeof fm.excerpt === "string" ? fm.excerpt : "")
      : (typeof fm.description === "string" ? fm.description : "");
    const technologies: string[] | undefined = type === "project" && Array.isArray(fm.technologies)
      ? (fm.technologies as unknown[]).map((t) => String(t))
      : undefined;
    const projectUrl: string | undefined = type === "project" && typeof fm.projectUrl === "string" ? (fm.projectUrl as string) : undefined;
    const lastUpdated: string | undefined = type === "resume" && typeof fm.lastUpdated === "string" ? fm.lastUpdated : undefined;

    // Projects with no body: embed the frontmatter description as a single chunk
    let sectionChunks: { section: string; text: string }[];
    if (type === "project" && content.trim().length === 0) {
      const description = String((fmRecord?.description as string | undefined) || "").trim();
      sectionChunks = description ? [{ section: "", text: description }] : [];
    } else {
      sectionChunks = chunkBySection(
        content,
        PROMPT_CONFIG.embeddings.chunkSize,
        PROMPT_CONFIG.embeddings.chunkOverlap,
        PROMPT_CONFIG.embeddings.maxContentLength,
      );
    }

    sectionChunks.forEach(({ section, text }, idx) => {
      const chunkMetaLines = [
        `Type: ${type}`,
        `Title: ${title}`,
        `ChunkIndex: ${idx}`,
        section ? `Section: ${section}` : undefined,
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

function chunkBySection(
  rawContent: string,
  chunkSize: number,
  overlap: number,
  maxContentLength: number,
): { section: string; text: string }[] {
  if (!rawContent.trim()) return [];

  // No section headings? Fall back to the existing paragraph/semantic chunker.
  if (!/^#{2,3}\s+/m.test(rawContent)) {
    const normalized = normalizeMarkdown(rawContent).slice(0, maxContentLength);
    return chunkText(normalized, chunkSize, overlap).map((t) => ({ section: "", text: t }));
  }

  // Split at ^## / ^### boundaries, keeping each heading with its body.
  const lines = rawContent.split("\n");
  const sections: { heading: string; body: string }[] = [];
  let current: { heading: string; body: string } = { heading: "", body: "" };
  for (const line of lines) {
    if (/^#{2,3}\s+/.test(line)) {
      if (current.body.trim() || current.heading) sections.push(current);
      current = { heading: line.replace(/^#{2,3}\s+/, "").trim(), body: "" };
    } else {
      current.body += line + "\n";
    }
  }
  if (current.body.trim() || current.heading) sections.push(current);

  // Fold tiny sections (<200 chars of body) into the preceding one so we don't
  // embed slivers that lose context on their own.
  const minSize = 200;
  const merged: { heading: string; body: string }[] = [];
  for (const s of sections) {
    if (merged.length > 0 && s.body.trim().length < minSize) {
      const prev = merged[merged.length - 1];
      prev.body += (s.heading ? `\n\n${s.heading}\n` : "") + s.body;
    } else {
      merged.push({ heading: s.heading, body: s.body });
    }
  }

  // Normalize each section; keep as one chunk if it fits, otherwise sub-chunk.
  const chunks: { section: string; text: string }[] = [];
  let budget = maxContentLength;
  for (const s of merged) {
    if (budget <= 0) break;
    const normalized = normalizeMarkdown(s.body);
    if (!normalized) continue;
    const slice = normalized.slice(0, budget);
    budget -= slice.length;
    if (slice.length <= chunkSize) {
      chunks.push({ section: s.heading, text: slice });
    } else {
      for (const sub of chunkText(slice, chunkSize, overlap)) {
        chunks.push({ section: s.heading, text: sub });
      }
    }
  }

  return chunks;
}

async function main() {
  const embedUrl = process.env.EMBED_URL;
  const embedSecret = process.env.EMBED_SECRET;
  const outDir = path.join(process.cwd(), "src", "data");
  const outPath = path.join(outDir, "vector-index.json");
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  if (!embedUrl || !embedSecret) {
    console.warn("[build-embeddings] EMBED_URL or EMBED_SECRET not set. Writing empty index for dev builds.");
    fs.writeFileSync(outPath, JSON.stringify([]), "utf8");
    return;
  }

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

  // Batch in small groups — Ollama /api/embed accepts an input array.
  // Cloudflare Tunnel (and most proxies) will reset idle keep-alive connections,
  // so any single fetch can hit ECONNRESET. Retry transient network errors and
  // 5xx responses with exponential backoff.
  const batchSize = PROMPT_CONFIG.embeddings.batchSize;
  const maxAttempts = 5;
  const isTransient = (err: unknown) => {
    const code = (err as { cause?: { code?: string }; code?: string } | null)?.cause?.code
      ?? (err as { code?: string } | null)?.code;
    return code === "ECONNRESET" || code === "UND_ERR_SOCKET" || code === "ETIMEDOUT"
      || code === "ECONNREFUSED" || code === "EAI_AGAIN";
  };
  for (let i = 0; i < all.length; i += batchSize) {
    const batch = all.slice(i, i + batchSize);
    const input = batch.map((d) => d.text);
    const embStart = Date.now();
    let payload: { embeddings: number[][] } | null = null;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const res = await fetch(`${embedUrl}/api/embed`, {
          method: "POST",
          headers: {
            "content-type": "application/json",
            "authorization": `Bearer ${embedSecret}`,
          },
          body: JSON.stringify({ model, input }),
        });
        if (!res.ok) {
          const body = await res.text();
          if (res.status >= 500 && attempt < maxAttempts) {
            const wait = 500 * 2 ** (attempt - 1);
            console.warn(`[build-embeddings] upstream ${res.status}, retry ${attempt}/${maxAttempts - 1} in ${wait}ms`);
            await new Promise((r) => setTimeout(r, wait));
            continue;
          }
          throw new Error(`embed upstream ${res.status}: ${body}`);
        }
        payload = (await res.json()) as { embeddings: number[][] };
        break;
      } catch (err) {
        if (attempt < maxAttempts && isTransient(err)) {
          const wait = 500 * 2 ** (attempt - 1);
          console.warn(`[build-embeddings] transient fetch error (${(err as Error).message}), retry ${attempt}/${maxAttempts - 1} in ${wait}ms`);
          await new Promise((r) => setTimeout(r, wait));
          continue;
        }
        throw err;
      }
    }
    if (!payload) throw new Error("embed: no payload after retries");
    const embEnd = Date.now();
    try {
      await captureAiEmbedding({ model, latencyMs: embEnd - embStart, input: input.slice(0, 1) });
    } catch {
      void 0;
    }
    payload.embeddings.forEach((embedding, idx: number) => {
      embedded.push({ ...batch[idx], embedding });
    });
    console.info(`Embedded ${Math.min(i + batchSize, all.length)} / ${all.length}`);
  }

  fs.writeFileSync(outPath, JSON.stringify(embedded), "utf8");

  // Validation: Verify the generated index
  console.info(`\n[build-embeddings] 📊 Validation Results:`);
  console.info(`  ✓ Generated ${embedded.length} embeddings`);

  const fileStats = fs.statSync(outPath);
  const fileSizeMB = (fileStats.size / 1024 / 1024).toFixed(2);
  console.info(`  ✓ Index size: ${fileSizeMB} MB`);

  if (embedded.length === 0) {
    console.error(`  ✗ WARNING: No embeddings generated!`);
    console.error(`  ✗ Check that markdown files exist in _posts/, _projects/, _resume/`);
  } else {
    // Count by type
    const postCount = embedded.filter(e => e.type === 'post').length;
    const projectCount = embedded.filter(e => e.type === 'project').length;
    const resumeCount = embedded.filter(e => e.type === 'resume').length;
    console.info(`  ✓ Type distribution:`);
    console.info(`    - Posts: ${postCount} chunks`);
    console.info(`    - Projects: ${projectCount} chunks`);
    console.info(`    - Resume: ${resumeCount} chunks`);

    // Verify embeddings have correct dimensions
    const firstEmbedding = embedded[0].embedding;
    if (firstEmbedding && firstEmbedding.length > 0) {
      console.info(`  ✓ Embedding dimensions: ${firstEmbedding.length}`);
    } else {
      console.error(`  ✗ WARNING: Embeddings may be malformed!`);
    }
  }

  console.info(`\n[build-embeddings] ✓ Index written to ${outPath}`);
  console.info(`[build-embeddings] ✓ Build complete! Run "npm run dev" to test.`);

  try { await flushPosthog(); } catch {
    // no-op
    void 0;
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});