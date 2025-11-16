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

interface CacheEntry {
  data: RetrievedDoc[];
  timestamp: number;
  fileSize: number;
}

// Cache configuration
const CACHE_TTL = process.env.NODE_ENV === 'production' ? 30 * 60 * 1000 : 5 * 60 * 1000; // 30min prod, 5min dev
const MAX_MEMORY_USAGE = 50 * 1024 * 1024; // 50MB limit
let cachedIndex: CacheEntry | null = null;
let fileWatcher: fs.FSWatcher | null = null;

// Cache metrics for monitoring
const cacheMetrics = {
  hits: 0,
  misses: 0,
  loads: 0,
  lastLoadTime: null as Date | null,
  errors: 0
};



function setupFileWatcher(filePath: string): void {
  if (fileWatcher) return;

  try {
    fileWatcher = fs.watch(filePath, (eventType) => {
      if (eventType === 'change') {
        console.info('[rag] Vector index file changed, invalidating cache');
        cachedIndex = null;
      }
    });
  } catch (error) {
    console.warn('[rag] Failed to setup file watcher:', error);
  }
}

export function loadIndex(): RetrievedDoc[] {
  const p = path.join(process.cwd(), "src", "data", "vector-index.json");

  // Check if file exists
  if (!fs.existsSync(p)) {
    console.warn('[rag] Vector index file not found at', p);
    console.warn('[rag] Run "npm run build:index" to generate embeddings');
    cacheMetrics.errors++;
    cachedIndex = { data: [], timestamp: Date.now(), fileSize: 0 };
    return cachedIndex.data;
  }

  // Check if we have a valid cache
  if (cachedIndex) {
    const now = Date.now();
    const isExpired = (now - cachedIndex.timestamp) > CACHE_TTL;
    const currentFileSize = fs.statSync(p).size;

    // Invalidate cache if expired or file size changed
    if (isExpired || cachedIndex.fileSize !== currentFileSize) {
      console.info('[rag] Cache invalidated - expired or file changed');
      cacheMetrics.misses++;
      cachedIndex = null;
    } else {
      cacheMetrics.hits++;
      return cachedIndex.data;
    }
  } else {
    cacheMetrics.misses++;
  }

  // Load fresh data
  try {
    const raw = fs.readFileSync(p, "utf8");
    const data = JSON.parse(raw) as RetrievedDoc[];
    const fileSize = fs.statSync(p).size;

    // Check memory usage before caching
    const estimatedSize = Buffer.byteLength(raw, 'utf8');
    if (estimatedSize > MAX_MEMORY_USAGE) {
      console.warn(`[rag] Vector index too large (${(estimatedSize / 1024 / 1024).toFixed(2)}MB), consider optimization`);
    }

    cachedIndex = {
      data,
      timestamp: Date.now(),
      fileSize
    };

    // Update metrics
    cacheMetrics.loads++;
    cacheMetrics.lastLoadTime = new Date();

    // Setup file watcher for cache invalidation
    setupFileWatcher(p);

    console.info(`[rag] ✓ Loaded vector index: ${data.length} documents, ${(estimatedSize / 1024 / 1024).toFixed(2)}MB`);
    return data;
  } catch (error) {
    console.error('[rag] ✗ Failed to load vector index:', error);
    cacheMetrics.errors++;
    cachedIndex = { data: [], timestamp: Date.now(), fileSize: 0 };
    return cachedIndex.data;
  }
}

// Optimized cosine similarity with early termination and caching
function cosineSimilarity(a: number[], b: number[], earlyThreshold = 0.7): number {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  const len = Math.min(a.length, b.length);

  // Early termination optimization for poor matches
  for (let i = 0; i < len; i++) {
    const ai = a[i];
    const bi = b[i];
    dot += ai * bi;
    normA += ai * ai;
    normB += bi * bi;

    // Early exit if similarity is impossible to reach threshold
    if (i > len * 0.3) { // After 30% of calculations
      const maxPossibleSimilarity = (dot + Math.sqrt((normA - ai * ai) * (normB - bi * bi))) /
                                   Math.sqrt(normA * normB);
      if (maxPossibleSimilarity < earlyThreshold) {
        return maxPossibleSimilarity;
      }
    }
  }

  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Optimized top-k similar with heap-based selection for better performance
export function topKSimilar(index: RetrievedDoc[], queryEmbedding: number[], k: number): RetrievedDoc[] {
  if (index.length === 0) return [];
  if (k >= index.length) return index;

  // Use a min-heap to maintain top-k results efficiently
  const heap: Array<{doc: RetrievedDoc, score: number}> = [];

  function heapPush(item: {doc: RetrievedDoc, score: number}) {
    heap.push(item);
    let i = heap.length - 1;
    while (i > 0) {
      const parent = Math.floor((i - 1) / 2);
      if (heap[parent].score <= heap[i].score) break;
      [heap[parent], heap[i]] = [heap[i], heap[parent]];
      i = parent;
    }
  }

  function heapPop(): {doc: RetrievedDoc, score: number} {
    const result = heap[0];
    const last = heap.pop()!;
    if (heap.length > 0) {
      heap[0] = last;
      let i = 0;
      while (true) {
        const left = 2 * i + 1;
        const right = 2 * i + 2;
        let smallest = i;

        if (left < heap.length && heap[left].score < heap[smallest].score) {
          smallest = left;
        }
        if (right < heap.length && heap[right].score < heap[smallest].score) {
          smallest = right;
        }

        if (smallest === i) break;
        [heap[i], heap[smallest]] = [heap[smallest], heap[i]];
        i = smallest;
      }
    }
    return result;
  }

  // Process documents with early termination for better performance
  const minScoreThreshold = 0.1; // Minimum similarity threshold
  let processedCount = 0;
  const batchSize = Math.min(100, index.length); // Process in batches for memory efficiency

  for (let start = 0; start < index.length; start += batchSize) {
    const end = Math.min(start + batchSize, index.length);
    const batch = index.slice(start, end);

    for (const doc of batch) {
      processedCount++;
      const score = cosineSimilarity(doc.embedding, queryEmbedding);

      // Skip if below minimum threshold
      if (score < minScoreThreshold) continue;

      if (heap.length < k) {
        heapPush({ doc, score });
      } else if (score > heap[0].score) {
        heapPop();
        heapPush({ doc, score });
      }
    }

    // Early termination if we've processed enough and have good matches
    if (processedCount > k * 10 && heap.length === k && heap[0].score > 0.5) {
      break;
    }
  }

  // Extract results from heap
  const results: RetrievedDoc[] = [];
  while (heap.length > 0) {
    results.push(heapPop().doc);
  }

  // Reverse to get highest scores first
  results.reverse();

  console.info(`[rag] Optimized retrieval: processed ${processedCount}/${index.length} docs, found ${results.length} matches`);
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
  
  // Check content type intent
  const isProjectQuery = (
    /\b(what\s+(kind\s+of\s+)?(project|projects)|tell\s+me\s+about.*(project|projects)|show\s+me.*(project|projects))/i.test(query) ||
    /(project|projects)\s+(you\s+)?(worked|built|made|created)/i.test(query) ||
    /\b\d+\s+(project|projects)\b/i.test(query) ||
    (/\b(project|projects)\b/i.test(query) && !/\b(post|blog|article|write|wrote|writing)\b/i.test(query))
  );
  
  const isPostQuery = (
    /\b(what\s+(kind\s+of\s+)?(blog|post|article)|tell\s+me\s+about.*(blog|post|article)|show\s+me.*(blog|post|article))/i.test(query) ||
    /(blog|post|article)\s+(you\s+)?(wrote|written|published|created)/i.test(query) ||
    (/\b(post|blog|article|write|wrote|writing)\b/i.test(query) && !/\b(project|projects)\b/i.test(query))
  );
  
  const scored = index.map((d) => {
    const hay = `${d.title} ${d.text}`.toLowerCase();
    let score = 0;
    
    // Basic text matching
    for (const w of kw) {
      if (hay.includes(w)) score += 1;
    }
    
    // Strong content type boost
    if (isProjectQuery && d.type === "project") {
      score += 50; // Very strong boost for project matches when asking about projects
    } else if (isProjectQuery && d.type === "post") {
      score = Math.max(0, score - 20); // Penalize posts when asking about projects
    } else if (isPostQuery && d.type === "post") {
      score += 50; // Very strong boost for post matches when asking about posts
    } else if (isPostQuery && d.type === "project") {
      score = Math.max(0, score - 20); // Penalize projects when asking about posts
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
  
  // For technology queries or content type queries, return more results
  const resultCount = (isTechQuery || isProjectQuery) ? Math.min(k * 2, 12) : k;
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
  // Exclude future-dated items relative to current time (UTC)
  const nowTime = Date.now();
  const nonFuture = posts.filter((d) => {
    const t = new Date(d.date as string).getTime();
    return !isNaN(t) && t <= nowTime;
  });
  if (nonFuture.length === 0) return null;
  // Group by slug to pick one representative chunk per post
  const slugToDocs = new Map<string, RetrievedDoc[]>();
  for (const d of nonFuture) {
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
  // Exclude future-dated items relative to current time (UTC)
  const nowTime = Date.now();
  const nonFuture = projects.filter((d) => {
    const t = new Date(d.date as string).getTime();
    return !isNaN(t) && t <= nowTime;
  });
  if (nonFuture.length === 0) return null;
  
  // Group by slug to pick one representative chunk per project
  const slugToDocs = new Map<string, RetrievedDoc[]>();
  for (const d of nonFuture) {
    const list = slugToDocs.get(d.slug) || [];
    list.push(d);
    slugToDocs.set(d.slug, list);
  }
  
  const representatives: RetrievedDoc[] = [];
  for (const [, docs] of slugToDocs) {
    const rep = selectRepresentativeChunk(docs);
    representatives.push(rep);
  }
  
  // Sort by date descending (latest first)
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

// Cleanup function to properly close file watcher
export function cleanupCache(): void {
  if (fileWatcher) {
    fileWatcher.close();
    fileWatcher = null;
    console.info('[rag] Cache cleanup completed');
  }
  cachedIndex = null;
}

// Export cache statistics for monitoring
export function getCacheStats(): {
  isCached: boolean;
  cacheAge?: number;
  memoryUsage?: number;
  documentCount?: number;
  metrics: {
    hits: number;
    misses: number;
    loads: number;
    errors: number;
    lastLoadTime: Date | null;
    hitRate: number;
  };
} {
  const totalRequests = cacheMetrics.hits + cacheMetrics.misses;
  const hitRate = totalRequests > 0 ? (cacheMetrics.hits / totalRequests) * 100 : 0;

  if (!cachedIndex) {
    return {
      isCached: false,
      metrics: {
        ...cacheMetrics,
        hitRate
      }
    };
  }

  const now = Date.now();
  const jsonString = JSON.stringify(cachedIndex.data);
  const memoryUsage = Buffer.byteLength(jsonString, 'utf8');

  return {
    isCached: true,
    cacheAge: now - cachedIndex.timestamp,
    memoryUsage,
    documentCount: cachedIndex.data.length,
    metrics: {
      ...cacheMetrics,
      hitRate
    }
  };
}

// Cache warming: Preload vector index on server startup
// This ensures the first API request doesn't experience cold start delay
if (typeof window === 'undefined') {
  // Only run on server side (Node.js), not in browser
  try {
    console.info('[rag] Warming cache on startup...');
    const startTime = Date.now();
    const index = loadIndex();
    const loadTime = Date.now() - startTime;
    if (index.length > 0) {
      console.info(`[rag] ✓ Cache warmed successfully: ${index.length} documents loaded in ${loadTime}ms`);
    } else {
      console.warn('[rag] ⚠️  Cache warming: No documents found in index');
    }
  } catch (error) {
    console.error('[rag] ✗ Cache warming failed:', error);
  }
}
