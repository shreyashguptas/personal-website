import Link from 'next/link'

export default function BlogNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
      <h1 className="text-4xl font-bold">Blog Not Found</h1>
      <p className="text-center text-muted-foreground max-w-md">
        The blog post you're looking for doesn't exist or has been moved.
      </p>
      <Link
        href="/blogs"
        className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
      >
        View All Blogs
      </Link>
    </div>
  )
} 