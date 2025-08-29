import { Post } from "@/interfaces/post";
import { Project } from "@/interfaces/project";
import { extractFirstImageFromMarkdown, extractNthImageFromMarkdown } from "@/lib/utils";
import fs from "fs";
import matter from "gray-matter";
import { join } from "path";

const postsDirectory = join(process.cwd(), "_posts");
const projectsDirectory = join(process.cwd(), "_projects");

// Cache for file system operations to improve performance
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const postsCache = new Map<string, CacheEntry<Post>>();
const projectsCache = new Map<string, CacheEntry<Project>>();
const slugsCache = new Map<string, CacheEntry<string[]>>();
const CACHE_TTL = 30 * 1000; // 30 seconds for file-based cache

export function getPostSlugs() {
  const cacheKey = 'posts';
  const cached = slugsCache.get(cacheKey);

  if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
    return cached.data;
  }

  try {
    const slugs = fs.readdirSync(postsDirectory);
    slugsCache.set(cacheKey, { data: slugs, timestamp: Date.now() });
    return slugs;
  } catch (error) {
    console.error('[api] Error reading posts directory:', error);
    return [];
  }
}

export function getPostBySlug(slug: string) {
  const realSlug = slug.replace(/\.md$/, "");
  const cacheKey = `post:${realSlug}`;
  const cached = postsCache.get(cacheKey);

  if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
    return cached.data;
  }

  const fullPath = join(postsDirectory, `${realSlug}.md`);

  try {
    const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(fileContents);

  // Determine cover image with front matter override and content fallback
  const contentFirstImage = extractFirstImageFromMarkdown(content);
  const frontMatter = data as Partial<Post> & { coverImageIndex?: number | string };
  const frontmatterCoverImage = frontMatter.coverImage?.toString().trim();
  const frontmatterCoverImageIndexRaw = frontMatter.coverImageIndex;
  const coverImageIndex = typeof frontmatterCoverImageIndexRaw === "number"
    ? frontmatterCoverImageIndexRaw
    : typeof frontmatterCoverImageIndexRaw === "string" && frontmatterCoverImageIndexRaw.trim() !== ""
      ? Number(frontmatterCoverImageIndexRaw)
      : undefined;

  let resolvedCoverImage: string | undefined = undefined;
  if (frontmatterCoverImage && frontmatterCoverImage.length > 0) {
    resolvedCoverImage = frontmatterCoverImage;
  } else if (coverImageIndex && Number.isFinite(coverImageIndex) && coverImageIndex > 0) {
    const nthImage = extractNthImageFromMarkdown(content, coverImageIndex);
    if (nthImage) {
      resolvedCoverImage = nthImage;
    } else {
      if (contentFirstImage) {
        resolvedCoverImage = contentFirstImage;
      }
    }
  } else if (contentFirstImage && contentFirstImage.length > 0) {
    resolvedCoverImage = contentFirstImage;
  }

  // Build excerpt: prefer front matter; otherwise derive from first paragraph
  const frontmatterExcerptRaw = (data as Partial<Post>).excerpt;
  const frontmatterExcerpt = typeof frontmatterExcerptRaw === "string" ? frontmatterExcerptRaw.trim() : "";
  const derivedExcerpt = (() => {
    const withoutCode = content.replace(/```[\s\S]*?```/g, " ");
    const firstParagraph = withoutCode.split(/\n\s*\n/).find((p) => p.trim().length > 0) || "";
    const text = firstParagraph
      // strip images ![alt](url)
      .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
      // strip links [text](url)
      .replace(/\[[^\]]*\]\([^)]*\)/g, "$1")
      // strip markdown emphasis/headers/inline code
      .replace(/[#*_`>~-]+/g, " ")
      // collapse whitespace
      .replace(/\s+/g, " ")
      .trim();
    return text.slice(0, 180);
  })();
    const resolvedExcerpt = frontmatterExcerpt.length > 0 ? frontmatterExcerpt : derivedExcerpt;
    // No verbose console output during dev or build

    const post = {
      ...(data as object),
      slug: realSlug,
      content,
      excerpt: resolvedExcerpt,
      // Ensure precedence: computed resolvedCoverImage takes priority over any raw data.coverImage
      coverImage: resolvedCoverImage || undefined,
    } as Post;

    // Cache the result
    postsCache.set(cacheKey, { data: post, timestamp: Date.now() });
    return post;
  } catch (error) {
    console.error(`[api] Error reading post "${realSlug}":`, error);
    return null;
  }
}

export function getAllPosts(): Post[] {
  const slugs = getPostSlugs();
  const posts = slugs
    .map((slug) => getPostBySlug(slug))
    .filter((post): post is Post => post !== null) // Filter out null values
    // sort posts by date in descending order
    .sort((post1, post2) => (post1.date > post2.date ? -1 : 1));
  return posts;
}

export function getProjectSlugs() {
  const cacheKey = 'projects';
  const cached = slugsCache.get(cacheKey);

  if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
    return cached.data;
  }

  try {
    const slugs = fs.readdirSync(projectsDirectory);
    slugsCache.set(cacheKey, { data: slugs, timestamp: Date.now() });
    return slugs;
  } catch (error) {
    console.error('[api] Error reading projects directory:', error);
    return [];
  }
}

export function getProjectBySlug(slug: string) {
  const realSlug = slug.replace(/\.md$/, "");
  const cacheKey = `project:${realSlug}`;
  const cached = projectsCache.get(cacheKey);

  if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
    return cached.data;
  }

  const fullPath = join(projectsDirectory, `${realSlug}.md`);

  try {
    const fileContents = fs.readFileSync(fullPath, "utf8");
    const { data, content } = matter(fileContents);

    const project = { ...data, slug: realSlug, content } as Project;

    // Cache the result
    projectsCache.set(cacheKey, { data: project, timestamp: Date.now() });
    return project;
  } catch (error) {
    console.error(`[api] Error reading project "${realSlug}":`, error);
    return null;
  }
}

export function getAllProjects(): Project[] {
  const slugs = getProjectSlugs();
  const projects = slugs
    .map((slug) => getProjectBySlug(slug))
    .filter((project): project is Project => project !== null) // Filter out null values
    // sort projects by date in descending order
    .sort((project1, project2) => (project1.date > project2.date ? -1 : 1));
  return projects;
}
