import BlogList from './components/blog-list'
import { getAllBlogs } from './service'

// Force dynamic rendering for fresh data
export const dynamic = 'force-dynamic'

export default async function BlogPage() {
  const initialPosts = await getAllBlogs()
  
  return <BlogList initialPosts={initialPosts} />
}

