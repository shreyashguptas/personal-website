import { Post } from "@/interfaces/post";
import { Project } from "@/interfaces/project";
import { extractFirstImageFromMarkdown, extractNthImageFromMarkdown } from "@/lib/utils";
import fs from "fs";
import matter from "gray-matter";
import { join } from "path";

const postsDirectory = join(process.cwd(), "_posts");
const projectsDirectory = join(process.cwd(), "_projects");

export function getPostSlugs() {
  return fs.readdirSync(postsDirectory);
}

export function getPostBySlug(slug: string) {
  const realSlug = slug.replace(/\.md$/, "");
  const fullPath = join(postsDirectory, `${realSlug}.md`);
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
    // Logging to validate behavior and precedence
    console.log(`[posts] Using front matter coverImage for slug "${realSlug}": ${frontmatterCoverImage}`);
    if (contentFirstImage && contentFirstImage !== frontmatterCoverImage) {
      console.log(
        `[posts] Front matter coverImage overrides first content image for slug "${realSlug}". Content first image: ${contentFirstImage}`
      );
    }
  } else if (coverImageIndex && Number.isFinite(coverImageIndex) && coverImageIndex > 0) {
    const nthImage = extractNthImageFromMarkdown(content, coverImageIndex);
    if (nthImage) {
      resolvedCoverImage = nthImage;
      console.log(`[posts] Using nth content image (index=${coverImageIndex}) as coverImage for slug "${realSlug}": ${nthImage}`);
    } else {
      console.log(`[posts] coverImageIndex=${coverImageIndex} specified but not found; falling back to first image if available for slug "${realSlug}"`);
      if (contentFirstImage) {
        resolvedCoverImage = contentFirstImage;
      }
    }
  } else if (contentFirstImage && contentFirstImage.length > 0) {
    resolvedCoverImage = contentFirstImage;
    console.log(`[posts] Using first content image as coverImage for slug "${realSlug}": ${contentFirstImage}`);
  } else {
    console.log(`[posts] No cover image found for slug "${realSlug}"`);
  }

  // Build excerpt: prefer front matter; otherwise derive from first paragraph
  const frontmatterExcerptRaw = (data as Partial<Post>).excerpt;
  const frontmatterExcerpt = typeof frontmatterExcerptRaw === "string" ? frontmatterExcerptRaw.trim() : "";
  const derivedExcerpt = (() => {
    const withoutCode = content.replace(/```[\s\S]*?```/g, " ");
    const firstParagraph = withoutCode.split(/\n\s*\n/).find((p) => p.trim().length > 0) || "";
    const text = firstParagraph
      // strip images ![alt](url)
      .replace(/!\[[^\]]*\]\([^\)]*\)/g, " ")
      // strip links [text](url)
      .replace(/\[[^\]]*\]\([^\)]*\)/g, "$1")
      // strip markdown emphasis/headers/inline code
      .replace(/[#*_`>~\-]+/g, " ")
      // collapse whitespace
      .replace(/\s+/g, " ")
      .trim();
    return text.slice(0, 180);
  })();
  const resolvedExcerpt = frontmatterExcerpt.length > 0 ? frontmatterExcerpt : derivedExcerpt;
  if (!(frontmatterExcerpt.length > 0) && resolvedExcerpt.length > 0) {
    console.log(`[posts] Auto-generated excerpt for slug "${realSlug}": "${resolvedExcerpt.slice(0, 80)}"...`);
  }

  return {
    ...(data as object),
    slug: realSlug,
    content,
    excerpt: resolvedExcerpt,
    // Ensure precedence: computed resolvedCoverImage takes priority over any raw data.coverImage
    coverImage: resolvedCoverImage || undefined,
  } as Post;
}

export function getAllPosts(): Post[] {
  const slugs = getPostSlugs();
  const posts = slugs
    .map((slug) => getPostBySlug(slug))
    // sort posts by date in descending order
    .sort((post1, post2) => (post1.date > post2.date ? -1 : 1));
  return posts;
}

export function getProjectSlugs() {
  return fs.readdirSync(projectsDirectory);
}

export function getProjectBySlug(slug: string) {
  const realSlug = slug.replace(/\.md$/, "");
  const fullPath = join(projectsDirectory, `${realSlug}.md`);
  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(fileContents);

  return { ...data, slug: realSlug, content } as Project;
}

export function getAllProjects(): Project[] {
  const slugs = getProjectSlugs();
  const projects = slugs
    .map((slug) => getProjectBySlug(slug))
    // sort projects by date in descending order
    .sort((project1, project2) => (project1.date > project2.date ? -1 : 1));
  return projects;
}
