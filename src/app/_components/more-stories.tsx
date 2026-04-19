import { Post } from "@/interfaces/post";
import { PostPreview } from "./post-preview";

type Props = {
  posts: Post[];
};

export function MoreStories({ posts }: Props) {
  return (
    <section className="py-10 md:py-14">
      <header className="flex items-baseline justify-between mb-2 border-b border-border pb-4">
        <h2 className="label-eyebrow">Archive</h2>
        <p className="label-eyebrow tabular">
          {posts.length} {posts.length === 1 ? "essay" : "essays"}
        </p>
      </header>
      <div className="divide-y divide-border">
        {posts.map((post) => (
          <PostPreview
            key={post.slug}
            title={post.title}
            coverImage={post.coverImage}
            date={post.date}
            author={post.author}
            slug={post.slug}
            excerpt={post.excerpt}
          />
        ))}
      </div>
    </section>
  );
}
