import { createClient } from '@supabase/supabase-js'
import { Database } from './types'

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL is required')
}

if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY is required')
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Create client with error handling
export const supabase = createClient<Database>(supabaseUrl, supabaseKey)

// Error handling utility
export class DatabaseError extends Error {
  constructor(message: string, public originalError: any) {
    super(message)
    this.name = 'DatabaseError'
  }
}

// Utility function for consistent error handling
export function handleDatabaseError(error: any, context: string): never {
  console.error(`Database error in ${context}:`, error)
  throw new DatabaseError(`Error in ${context}`, error)
}

// Configuration object
export const supabaseConfig = {
  url: supabaseUrl,
  anonKey: supabaseKey,
  isProduction: process.env.NODE_ENV === 'production'
} 