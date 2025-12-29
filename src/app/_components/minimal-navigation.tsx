import Link from "next/link";

export function MinimalNavigation() {
  return (
    <div className="flex items-center gap-4 text-sm">
      <Link
        href="/blog"
        className="text-muted-foreground hover:text-primary transition-colors duration-200 inline-flex items-center gap-1"
        data-cursor-intent="hover"
      >
        Blog
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17L17 7M17 7H7M17 7V17" />
        </svg>
      </Link>
      <span className="text-muted-foreground/40">•</span>
      <Link
        href="/projects"
        className="text-muted-foreground hover:text-primary transition-colors duration-200 inline-flex items-center gap-1"
        data-cursor-intent="hover"
      >
        Project
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17L17 7M17 7H7M17 7V17" />
        </svg>
      </Link>
    </div>
  );
} 