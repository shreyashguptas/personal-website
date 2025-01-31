'use server'

import { getAllProjects } from '@/lib/supabase'

export async function loadMoreProjects(page: number) {
  const data = await getAllProjects(page)
  return data
} 