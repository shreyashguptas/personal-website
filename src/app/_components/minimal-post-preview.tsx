import Link from "next/link";
import { type Post } from "@/interfaces/post";
import DateFormatter from "./date-formatter";

type Props = {
  post: Post;
};

export function MinimalPostPreview({ post }: Props) {
  return (
    <div className="group">
      <div className="flex items-center gap-3 mb-2">
        <div className="text-sm text-gray-500 dark:text-gray-400">Latest Blog</div>
        <div className="h-px bg-gray-200 dark:bg-gray-700 flex-1"></div>
      </div>
      
      <Link href={`/posts/${post.slug}`} className="block">
        <div className="space-y-2 py-3 group-hover:translate-x-1 transition-transform duration-200">
          <h3 className="text-lg font-medium leading-snug group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors">
            {post.title}
          </h3>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            <DateFormatter dateString={post.date} />
          </div>
        </div>
      </Link>
    </div>
  );
} 