'use server'

import { getAllBlogs } from '@/lib/supabase'

export async function loadMoreBlogs(page: number) {
  return getAllBlogs(page)
} 