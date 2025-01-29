import { BlogList } from '@/components/features/blogs/blog-list'
import { getAllBlogs, getUniqueTags, DatabaseError } from '@/lib/supabase'

// Force dynamic rendering for fresh data
export const dynamic = 'force-dynamic'

export default async function BlogPage() {
  try {
    const [initialPosts, availableTags] = await Promise.all([
      getAllBlogs(),
      getUniqueTags()
    ])
    
    return <BlogList initialPosts={initialPosts} availableTags={availableTags} />
  } catch (error) {
    if (error instanceof DatabaseError) {
      // You might want to log this error to your error tracking service
      console.error('Database error:', error)
      
      // Return a user-friendly error message
      return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
          <h1 className="text-2xl font-bold">Unable to Load Blogs</h1>
          <p className="text-muted-foreground">
            We're having trouble connecting to our database. Please try again later.
          </p>
        </div>
      )
    }
    
    // For other types of errors, rethrow them
    throw error
  }
}

