import fs from "fs";
import path from "path";

export interface RetrievedDoc {
  id: string;
  type: "post" | "project" | "resume";
  title: string;
  slug: string;
  url: string;
  text: string;
  embedding: number[];
  date?: string;
  lastUpdated?: string;
  technologies?: string[];
  projectUrl?: string;
}

let cachedIndex: RetrievedDoc[] | null = null;

export function loadIndex(): RetrievedDoc[] {
  if (cachedIndex) return cachedIndex;
  const p = path.join(process.cwd(), "src", "data", "vector-index.json");
  if (!fs.existsSync(p)) {
    cachedIndex = [];
    return cachedIndex;
  }
  const raw = fs.readFileSync(p, "utf8");
  cachedIndex = JSON.parse(raw) as RetrievedDoc[];
  return cachedIndex;
}

export function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  const len = Math.min(a.length, b.length);
  for (let i = 0; i < len; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

export function topKSimilar(index: RetrievedDoc[], queryEmbedding: number[], k: number): RetrievedDoc[] {
  const scored = index.map((doc) => ({ doc, score: cosineSimilarity(doc.embedding, queryEmbedding) }));
  scored.sort((a, b) => b.score - a.score);
  const results = scored.slice(0, k).map((s) => s.doc);
  

  
  return results;
}

export function buildContext(
  docs: RetrievedDoc[],
  tokenLimitChars = 6000, // This can stay as a parameter since it's configurable per call
  query?: string
): { context: string; sources: { title: string; url: string }[]; keywords: string[] } {
  const sources: { title: string; url: string }[] = [];
  let acc = "";
  for (const d of docs) {
    const dateLine = d.date ? ` [Date] ${d.date}` : "";
    const techLine = d.technologies && d.technologies.length > 0 ? ` [Technologies] ${d.technologies.join(", ")}` : "";
    const projectUrlLine = d.projectUrl ? ` [ProjectURL] ${d.projectUrl}` : "";
    const header = `\n\n[Title] ${d.title}${dateLine}${techLine}${projectUrlLine}\n[URL] ${d.url}\n[Excerpt]\n`;
    if ((acc + header).length > tokenLimitChars) break;
    acc += header;
    const chunk = d.text.slice(0, Math.max(0, tokenLimitChars - acc.length));
    acc += chunk;
    sources.push({ title: d.title, url: d.url });
    if (acc.length >= tokenLimitChars) break;
  }
  const keywords = extractKeywords(query ?? "");
  return { context: acc.trim(), sources, keywords };
}

function extractKeywords(q: string): string[] {
  const words = q.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter(Boolean);
  const stop = new Set([
    "what","is","the","a","an","of","has","have","on","to","for","about","me","show",
    "projects","project","blog","blogs","latest","new","recent","worked","work","built","build",
    "in","you","used","use","using","with","have","had","do","does","did","are","were"
  ]);
  
  // Special handling for technology terms - don't filter them out
  const techTerms = new Set([
    "pytorch", "tensorflow", "react", "next.js", "python", "machine learning", "ml", "ai", "nlp", 
    "data analysis", "typescript", "javascript", "node", "supabase", "postgresql", "gradio", 
    "stable diffusion", "whisper", "raspberry pi", "home assistant", "terraform", "google cloud"
  ]);
  
  const filtered = words.filter((w) => !stop.has(w) || techTerms.has(w));
  return Array.from(new Set(filtered)).slice(0, 8);
}

export function lexicalFallback(index: RetrievedDoc[], query: string, k = 3): RetrievedDoc[] {
  const kw = extractKeywords(query);
  if (kw.length === 0) return [];
  
  // Check if this is a technology query
  const isTechQuery = /\b(pytorch|tensorflow|react|next\.js|python|machine learning|ml|ai|nlp|data analysis)\b/i.test(query.toLowerCase());
  
  const scored = index.map((d) => {
    const hay = `${d.title} ${d.text}`.toLowerCase();
    let score = 0;
    
    // Basic text matching
    for (const w of kw) {
      if (hay.includes(w)) score += 1;
    }
    
    // Boost score for technology matches in the technologies array
    if (isTechQuery && d.technologies && d.technologies.length > 0) {
      const techMatch = kw.some(keyword => 
        d.technologies!.some(tech => 
          tech.toLowerCase().includes(keyword.toLowerCase()) || 
          keyword.toLowerCase().includes(tech.toLowerCase())
        )
      );
      if (techMatch) {
        score += 10; // Significant boost for technology matches
      }
    }
    
    return { d, score };
  });
  
  scored.sort((a, b) => b.score - a.score);
  
  // For technology queries, return more results to ensure we don't miss any
  const resultCount = isTechQuery ? Math.min(k * 2, 8) : k;
  return scored.filter((s) => s.score > 0).slice(0, resultCount).map((s) => s.d);
}

export function getEarliestPost(index: RetrievedDoc[]): RetrievedDoc | null {
  const posts = index.filter((d) => d.type === "post" && d.date);
  if (posts.length === 0) return null;
  posts.sort((a, b) => new Date(a.date as string).getTime() - new Date(b.date as string).getTime());
  return posts[0] || null;
}

// Prefer the representative chunk for a slug (chunk index 0 when available)
function selectRepresentativeChunk(docs: RetrievedDoc[]): RetrievedDoc {
  const chunk0 = docs.find((d) => /:\d+$/.test(d.id) && d.id.endsWith(":0"));
  return chunk0 || docs[0];
}

export function filterByType(index: RetrievedDoc[], type: "post" | "project" | "resume"): RetrievedDoc[] {
  return index.filter((d) => d.type === type);
}

export function getLatestPost(index: RetrievedDoc[]): RetrievedDoc | null {
  const posts = index.filter((d) => d.type === "post" && d.date);
  if (posts.length === 0) return null;
  // Group by slug to pick one representative chunk per post
  const slugToDocs = new Map<string, RetrievedDoc[]>();
  for (const d of posts) {
    const list = slugToDocs.get(d.slug) || [];
    list.push(d);
    slugToDocs.set(d.slug, list);
  }
  const representatives: RetrievedDoc[] = [];
  for (const [, docs] of slugToDocs) {
    // use the same date across chunks; any doc with date will do
    const rep = selectRepresentativeChunk(docs);
    representatives.push(rep);
  }
  representatives.sort((a, b) => new Date(b.date as string).getTime() - new Date(a.date as string).getTime());
  return representatives[0] || null;
}

export function getLatestProject(index: RetrievedDoc[]): RetrievedDoc | null {
  const projects = index.filter((d) => d.type === "project" && d.date);
  if (projects.length === 0) return null;
  // Group by slug to pick one representative chunk per project
  const slugToDocs = new Map<string, RetrievedDoc[]>();
  for (const d of projects) {
    const list = slugToDocs.get(d.slug) || [];
    list.push(d);
    slugToDocs.set(d.slug, list);
  }
  const representatives: RetrievedDoc[] = [];
  for (const [, docs] of slugToDocs) {
    const rep = selectRepresentativeChunk(docs);
    representatives.push(rep);
  }
  representatives.sort((a, b) => new Date(b.date as string).getTime() - new Date(a.date as string).getTime());
  return representatives[0] || null;
}

export function getResumeInfo(index: RetrievedDoc[]): RetrievedDoc | null {
  const resume = index.filter((d) => d.type === "resume");
  if (resume.length === 0) return null;
  // Return the representative chunk (first chunk with metadata)
  return selectRepresentativeChunk(resume);
}

export function getWorkExperience(index: RetrievedDoc[]): RetrievedDoc | null {
  const resume = getResumeInfo(index);
  if (!resume) return null;
  // For now, return the full resume. In the future, we could parse specific sections
  return resume;
}

export function getPreviousOfSameType(index: RetrievedDoc[], anchor: RetrievedDoc): RetrievedDoc | null {
  if (!anchor.date) return null;
  const sameType = index.filter((d) => d.type === anchor.type && d.date);
  if (sameType.length === 0) return null;
  const slugToDocs = new Map<string, RetrievedDoc[]>();
  for (const d of sameType) {
    const list = slugToDocs.get(d.slug) || [];
    list.push(d);
    slugToDocs.set(d.slug, list);
  }
  const reps: RetrievedDoc[] = [];
  for (const [, docs] of slugToDocs) reps.push(selectRepresentativeChunk(docs));
  reps.sort((a, b) => new Date(b.date as string).getTime() - new Date(a.date as string).getTime());
  const anchorIdx = reps.findIndex((d) => d.slug === anchor.slug);
  if (anchorIdx >= 0 && anchorIdx + 1 < reps.length) {
    return reps[anchorIdx + 1];
  }
  // Fallback: pick the latest item strictly older than anchor date
  const anchorTime = new Date(anchor.date as string).getTime();
  const older = reps.find((d) => new Date(d.date as string).getTime() < anchorTime);
  return older || null;
}

