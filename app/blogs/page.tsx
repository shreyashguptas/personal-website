import { BlogList } from './components/blog-list'
import { BlogPost } from './types'

const posts: BlogPost[] = [
  {
    title: "Too Many Project Ideas, Too Little Time?",
    date: "Nov 9, 2024",
    url: "/blog/project-ideas"
  },
  {
    title: "The Hidden Value of Coding",
    date: "Sep 13, 2024",
    url: "/blog/hidden-value-coding"
  },
  {
    title: "Talk to AI about your questions",
    date: "Aug 30, 2024",
    url: "/blog/ai-questions"
  }
]

export default function BlogPage() {
  return (
    <div className="space-y-8">
      <h1>Blogs</h1>
      <BlogList posts={posts} />
    </div>
  )
}