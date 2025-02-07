import { getAllReadings } from '@/lib/supabase'

export async function loadMoreReadings(page: number) {
  'use server'
  return getAllReadings(page)
} 