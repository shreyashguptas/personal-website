import { BlogList } from '@/components/features/blogs/blog-list'
import { getAllBlogs, getUniqueTags } from '@/lib/supabase'
import { loadMoreBlogs } from './actions'

// Force dynamic rendering for fresh data
export const dynamic = 'force-dynamic'

export default async function BlogsPage() {
  const [initialData, tags] = await Promise.all([
    getAllBlogs(1),
    getUniqueTags()
  ])

  return (
    <main className="container py-6 md:py-8">
      <BlogList
        initialPosts={initialData.blogs}
        availableTags={tags}
        hasMore={initialData.hasMore}
        onLoadMore={loadMoreBlogs}
      />
    </main>
  )
}

