import { createClient } from '@supabase/supabase-js'
import { Database } from './types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

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