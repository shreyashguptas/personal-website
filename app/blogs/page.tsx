import { getAllBlogs, getUniqueTags } from '@/lib/supabase'
import { BlogList } from '@/components/features/blogs/blog-list'

export const revalidate = 3600 // Revalidate every hour

export default async function BlogsPage() {
  const [initialData, tags] = await Promise.all([
    getAllBlogs(),
    getUniqueTags()
  ])

  async function loadMoreBlogs(page: number) {
    'use server'
    return getAllBlogs(page)
  }

  return (
    <BlogList
      initialBlogs={initialData.blogs}
      availableTags={tags}
      hasMore={initialData.hasMore}
      onLoadMore={loadMoreBlogs}
    />
  )
}

