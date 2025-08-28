import fs from "fs";
import path from "path";

export interface RetrievedDoc {
  id: string;
  type: "post" | "project";
  title: string;
  slug: string;
  url: string;
  text: string;
  embedding: number[];
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
  return scored.slice(0, k).map((s) => s.doc);
}

export function buildContext(
  docs: RetrievedDoc[],
  tokenLimitChars = 6000,
  query?: string
): { context: string; sources: { title: string; url: string }[]; keywords: string[] } {
  const sources: { title: string; url: string }[] = [];
  let acc = "";
  for (const d of docs) {
    const header = `\n\n[Title] ${d.title}\n[URL] ${d.url}\n[Excerpt]\n`;
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
    "projects","project","blog","blogs","latest","new","recent","worked","work","built","build"
  ]);
  return Array.from(new Set(words.filter((w) => !stop.has(w)).slice(0, 8)));
}

export function lexicalFallback(index: RetrievedDoc[], query: string, k = 3): RetrievedDoc[] {
  const kw = extractKeywords(query);
  if (kw.length === 0) return [];
  const scored = index.map((d) => {
    const hay = `${d.title} ${d.text}`.toLowerCase();
    let score = 0;
    for (const w of kw) {
      if (hay.includes(w)) score += 1;
    }
    return { d, score };
  });
  scored.sort((a, b) => b.score - a.score);
  return scored.filter((s) => s.score > 0).slice(0, k).map((s) => s.d);
}


