import { supabase, handleDatabaseError } from '../config'
import type { Database } from '@/types/supabase'
import { format } from 'date-fns'

type Reading = Database['public']['Tables']['readings']['Row']
type ReadingInsert = Database['public']['Tables']['readings']['Insert']
type ReadingUpdate = Database['public']['Tables']['readings']['Update']

export interface ReadingWithFormattedDate extends Reading {
  formattedDate: string
}

export interface PaginatedReadings {
  readings: ReadingWithFormattedDate[]
  hasMore: boolean
}

export async function getAllReadings(page: number = 1, pageSize: number = 15): Promise<PaginatedReadings> {
  try {
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    const { count } = await supabase
      .from('readings')
      .select('*', { count: 'exact', head: true })

    const { data: readings, error } = await supabase
      .from('readings')
      .select('*')
      .order('date', { ascending: false })
      .range(from, to)

    if (error) throw error

    const formattedReadings = (readings || []).map(reading => ({
      ...reading,
      formattedDate: format(new Date(reading.date), 'MMMM d, yyyy')
    }))

    return {
      readings: formattedReadings,
      hasMore: count ? from + readings.length < count : false
    }
  } catch (error) {
    return handleDatabaseError(error, 'getAllReadings')
  }
}

export async function getUniqueReadingTags(): Promise<string[]> {
  try {
    const { data: readings, error } = await supabase
      .from('readings')
      .select('tags')

    if (error) throw error

    // Get all tags and flatten them into a single array
    const allTags = readings.flatMap(reading => reading.tags)
    
    // Remove duplicates and sort alphabetically
    return Array.from(new Set(allTags)).sort()
  } catch (error) {
    return handleDatabaseError(error, 'getUniqueReadingTags')
  }
}

export async function createReading(reading: ReadingInsert): Promise<Reading> {
  try {
    const { data, error } = await supabase
      .from('readings')
      .insert([reading])
      .select()
      .single()

    if (error) throw error
    if (!data) throw new Error('No data returned from insert')

    return data
  } catch (error) {
    return handleDatabaseError(error, 'createReading')
  }
}

export async function updateReading(id: string, updates: ReadingUpdate): Promise<Reading> {
  try {
    const { data, error } = await supabase
      .from('readings')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    if (!data) throw new Error('No data returned from update')

    return data
  } catch (error) {
    return handleDatabaseError(error, `updateReading: ${id}`)
  }
}

export async function deleteReading(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('readings')
      .delete()
      .eq('id', id)

    if (error) throw error
  } catch (error) {
    handleDatabaseError(error, `deleteReading: ${id}`)
  }
} 