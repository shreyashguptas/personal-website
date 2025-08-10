import { type Author } from "./author";

export type Post = {
  slug: string;
  title: string;
  date: string;
  coverImage?: string;
  // Optional: allow specifying which image index from markdown to use as cover
  // Not persisted to UI, only used when building `coverImage`
  coverImageIndex?: number | string;
  author: Author;
  excerpt: string;
  content: string;
  preview?: boolean;
};
