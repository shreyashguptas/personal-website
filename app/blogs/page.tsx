import { getAllBlogs, getUniqueTags } from '@/lib/supabase'
import { BlogList } from '@/components/features/blogs/blog-list'
import { loadMoreBlogs } from './actions'

// Revalidate data every minute in production, but stay dynamic in development
export const revalidate = 60

export default async function BlogsPage() {
  try {
    const [initialData, tags] = await Promise.all([
      getAllBlogs(1),
      getUniqueTags()
    ])

    return (
      <BlogList
        initialBlogs={initialData.blogs}
        availableTags={tags}
        hasMore={initialData.hasMore}
        onLoadMore={loadMoreBlogs}
      />
    )
  } catch (error) {
    console.error('Error loading blogs:', error)
    return (
      <div className="space-y-8">
        <h1 className="text-3xl font-bold">Blogs</h1>
        <p className="text-muted-foreground">Failed to load blogs. Please try again later.</p>
      </div>
    )
  }
}

