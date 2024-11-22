import { BlogList } from './components/blog-list'
import { posts } from './data'

export default function BlogPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Blog</h1>
      <BlogList posts={posts} />
    </div>
  )
}

