import Link from "next/link";
import { type Post } from "@/interfaces/post";
import DateFormatter from "./date-formatter";

type Props = {
  post: Post;
};

export function MinimalPostPreview({ post }: Props) {
  return (
    <article className="group">
      <p className="label-eyebrow mb-3">Latest Essay</p>
      <Link href={`/posts/${post.slug}`} className="block" data-cursor-intent="hover">
        <h3 className="display-sm group-hover:text-muted-foreground transition-colors">
          {post.title}
        </h3>
      </Link>
      <p className="tabular mt-3 text-xs uppercase tracking-wider text-muted-foreground">
        <DateFormatter dateString={post.date} />
      </p>
    </article>
  );
}
