import BlogList from './components/blog-list'
import { getAllBlogs, getUniqueTags } from './service'

// Force dynamic rendering for fresh data
export const dynamic = 'force-dynamic'

export default async function BlogPage() {
  const [initialPosts, availableTags] = await Promise.all([
    getAllBlogs(),
    getUniqueTags()
  ])
  
  return <BlogList initialPosts={initialPosts} availableTags={availableTags} />
}

