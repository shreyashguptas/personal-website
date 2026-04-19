import { type Author } from "@/interfaces/author";
import Link from "next/link";
import DateFormatter from "./date-formatter";

type Props = {
  title: string;
  coverImage?: string;
  date: string;
  excerpt: string;
  author: Author;
  slug: string;
};

export function PostPreview({
  title,
  date,
  excerpt,
  author,
  slug,
}: Props) {
  return (
    <article className="py-8 md:py-10">
      <div className="flex items-center gap-3 mb-3 label-eyebrow">
        <span className="tabular">
          <DateFormatter dateString={date} />
        </span>
        <span aria-hidden="true" className="text-border">·</span>
        <span>{author.name}</span>
      </div>
      <h3 className="display-md">
        <Link
          href={`/posts/${slug}`}
          className="hover:text-muted-foreground transition-colors"
          data-cursor-intent="hover"
        >
          {title}
        </Link>
      </h3>
      <p className="mt-4 font-serif text-lg leading-relaxed text-muted-foreground max-w-2xl">
        {excerpt}
      </p>
      <Link
        href={`/posts/${slug}`}
        className="mt-5 inline-flex items-center text-sm font-medium text-foreground underline decoration-border hover:decoration-foreground underline-offset-4"
        data-cursor-intent="hover"
      >
        Read essay →
      </Link>
    </article>
  );
}
