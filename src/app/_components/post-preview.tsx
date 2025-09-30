import { type Author } from "@/interfaces/author";
import Link from "next/link";
import Avatar from "./avatar";
import CoverImage from "./cover-image";
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
  coverImage,
  date,
  excerpt,
  author,
  slug,
}: Props) {
  return (
    <article className="group card-elevated p-6 hover-lift">
      {/* Only render cover image if it exists and is not empty */}
      {coverImage && coverImage.trim() !== "" && (
        <div className="mb-5 overflow-hidden rounded-lg">
          <CoverImage slug={slug} title={title} src={coverImage} />
        </div>
      )}
      <h3 className="text-2xl md:text-3xl mb-3 leading-snug font-bold">
        <Link 
          href={`/posts/${slug}`} 
          className="hover:text-muted-foreground transition-colors duration-200" 
          data-cursor-intent="hover"
        >
          {title}
        </Link>
      </h3>
      <div className="text-sm text-muted-foreground mb-4 font-medium">
        <DateFormatter dateString={date} />
      </div>
      <p className="text-base md:text-lg leading-relaxed mb-6 text-foreground/90">{excerpt}</p>
      <Avatar name={author.name} picture={author.picture} />
    </article>
  );
}
