import Avatar from "./avatar";
import CoverImage from "./cover-image";
import DateFormatter from "./date-formatter";
import { PostTitle } from "@/app/_components/post-title";
import { type Author } from "@/interfaces/author";

type Props = {
  title: string;
  coverImage?: string;
  date: string;
  author: Author;
  eyebrow?: string;
};

export function PostHeader({ title, coverImage, date, author, eyebrow = "Essay" }: Props) {
  return (
    <header className="border-b border-border pb-8 md:pb-12">
      <p className="label-eyebrow mb-5 stagger-child" style={{ ["--stagger-index" as string]: 0 }}>
        {eyebrow}
      </p>
      <div className="stagger-child" style={{ ["--stagger-index" as string]: 1 }}>
        <PostTitle>{title}</PostTitle>
      </div>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3 mt-4 stagger-child" style={{ ["--stagger-index" as string]: 2 }}>
        <Avatar name={author.name} picture={author.picture} />
        <span aria-hidden="true" className="text-border">│</span>
        <span className="tabular text-xs uppercase tracking-wider text-muted-foreground">
          <DateFormatter dateString={date} />
        </span>
      </div>
      {coverImage && coverImage.trim() !== "" && (
        <div className="mt-10 stagger-child" style={{ ["--stagger-index" as string]: 3 }}>
          <CoverImage title={title} src={coverImage} variant="hero" />
        </div>
      )}
    </header>
  );
}
