export type BlogStatus = 'published' | 'draft'

export type BlogTag = 
  | 'Technology' 
  | 'Politics' 
  | 'Business'
  | 'Personal'
  | 'Finance'
  | 'AI'
  | 'Career'

interface BlogsTable {
  id: string
  title: string
  description: string
  content: string
  date: string
  slug: string
  status: BlogStatus
  tag: BlogTag
  created_at: string
  updated_at: string
}

interface ReadingsTable {
  id: string
  title: string
  author: string
  url: string
  date: string
  tags: string[]
  recommendation?: 1 | 2 | 3
  created_at: string
  updated_at: string
}

export interface Database {
  public: {
    Tables: {
      blogs: {
        Row: BlogsTable
        Insert: Omit<BlogsTable, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<BlogsTable, 'id' | 'created_at' | 'updated_at'>>
      }
      readings: {
        Row: ReadingsTable
        Insert: Omit<ReadingsTable, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<ReadingsTable, 'id' | 'created_at' | 'updated_at'>>
      }
    }
  }
} 