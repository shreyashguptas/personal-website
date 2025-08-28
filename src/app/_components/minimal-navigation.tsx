import Link from "next/link";

export function MinimalNavigation() {
  return (
    <div className="flex items-center gap-4 text-sm">
      <Link
        href="/blog"
        className="text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors inline-flex items-center gap-1"
      >
        Blog
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17L17 7M17 7H7M17 7V17" />
        </svg>
      </Link>
      <span className="text-gray-300 dark:text-gray-600">•</span>
      <Link
        href="/projects"
        className="text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors inline-flex items-center gap-1"
      >
        Project
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17L17 7M17 7H7M17 7V17" />
        </svg>
      </Link>
    </div>
  );
} 