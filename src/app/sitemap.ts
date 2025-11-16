import type { MetadataRoute } from "next";
import { getAllPosts, getAllProjects } from "@/lib/api";
import { getSiteUrl } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl();
  const posts = getAllPosts();
  const projects = getAllProjects();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/blog`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/projects`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/resume`, changeFrequency: "monthly", priority: 0.7 },
  ];

  const postRoutes: MetadataRoute.Sitemap = posts.map((p) => ({
    url: `${base}/posts/${p.slug}`,
    lastModified: p.date ? new Date(p.date) : new Date(),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const projectRoutes: MetadataRoute.Sitemap = projects.map((p) => ({
    url: `${base}/projects/${p.slug}`,
    lastModified: p.date ? new Date(p.date) : new Date(),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...postRoutes, ...projectRoutes];
}


