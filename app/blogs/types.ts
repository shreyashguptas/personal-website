export interface LocalBlogPost {
    slug: string
    title: string
    date: Date
    formattedDate: string
    description: string
    content: string
    type: 'local'
}

export interface SubstackBlogPost {
    title: string
    date: Date
    url: string
    type: 'substack'
}

export type BlogPost = LocalBlogPost | SubstackBlogPost
  
  