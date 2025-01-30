'use server'

import { getAllBlogs } from '@/lib/supabase'

export async function loadMoreBlogs(page: number) {
  const data = await getAllBlogs(page)
  return data
} 