'use server'

import { getAllProjects } from '@/lib/supabase'

export async function loadMoreProjects(page: number) {
  return getAllProjects(page)
} 