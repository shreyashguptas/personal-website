import Avatar from "@/app/_components/avatar";
import CoverImage from "@/app/_components/cover-image";
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

export function HeroPost({
  title,
  coverImage,
  date,
  excerpt,
  author,
  slug,
}: Props) {
  return (
    <section className="py-10 md:py-14 border-b border-border">
      <p className="label-eyebrow mb-5">Featured · Latest Essay</p>
      <div className="grid grid-cols-1 md:grid-cols-12 md:gap-10">
        <div className="md:col-span-7">
          <h2 className="display-xl">
            <Link href={`/posts/${slug}`} data-cursor-intent="hover" className="group inline-flex transition-smooth hover:text-muted-foreground">
              <span className="text-tug">{title}</span>
            </Link>
          </h2>
          <p className="mt-6 font-serif text-lg leading-relaxed text-muted-foreground">
            {excerpt}
          </p>
          <div className="mt-6 flex items-center gap-4 flex-wrap">
            <Avatar name={author.name} picture={author.picture} />
            <span aria-hidden="true" className="text-border">│</span>
            <span className="tabular text-xs uppercase tracking-wider text-muted-foreground">
              <DateFormatter dateString={date} />
            </span>
          </div>
        </div>

        {coverImage && coverImage.trim() !== "" && (
          <div className="md:col-span-5 mt-8 md:mt-2">
            <CoverImage title={title} src={coverImage} slug={slug} variant="hero" />
          </div>
        )}
      </div>
    </section>
  );
}
