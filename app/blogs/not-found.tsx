import Link from 'next/link'

export default function BlogNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
      <h2 className="text-2xl font-bold">Blog Post Not Found</h2>
      <p className="text-muted-foreground text-center max-w-md">
        Sorry, we couldn't find the blog post you're looking for. It may have been moved or deleted.
      </p>
      <Link
        href="/blogs"
        className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
      >
        Return to Blogs
      </Link>
    </div>
  )
} 