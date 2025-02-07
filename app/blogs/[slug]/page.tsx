import { getBlogBySlug } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { MDXContent } from '@/components/mdx/mdx-content'

// Force dynamic rendering for blog posts
export const dynamic = 'force-dynamic'
export const dynamicParams = true

type PageProps = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  try {
    const params = await props.params
    const blog = await getBlogBySlug(params.slug)
    
    if (!blog) {
      return {
        title: 'Blog Not Found',
        description: 'The requested blog post could not be found.'
      }
    }

    return {
      title: blog.title,
      description: blog.description,
      openGraph: {
        title: blog.title,
        description: blog.description,
        type: 'article',
        publishedTime: new Date(blog.date).toISOString(),
        authors: ['Shreyash Gupta'],
      },
      twitter: {
        card: 'summary_large_image',
        title: blog.title,
        description: blog.description,
      }
    }
  } catch (error) {
    console.error(`Error generating metadata for blog:`, error)
    return {
      title: 'Blog',
      description: 'Read our latest blog posts'
    }
  }
}

export default async function BlogPost(props: PageProps) {
  try {
    const params = await props.params
    const blog = await getBlogBySlug(params.slug)
    
    if (!blog) {
      notFound()
    }

    return (
      <article className="max-w-4xl mx-auto space-y-8">
        <header className="space-y-4">
          <h1 className="text-4xl font-bold">{blog.title}</h1>
          <p className="text-muted-foreground">{blog.formattedDate}</p>
          {blog.description && (
            <p className="text-xl text-muted-foreground">{blog.description}</p>
          )}
        </header>
        
        <div className="prose dark:prose-invert">
          <MDXContent source={blog.source} />
        </div>
      </article>
    )
  } catch (error) {
    console.error(`Error rendering blog:`, error)
    throw error // Let the error boundary handle it
  }
} 