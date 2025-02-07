import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

// Simple check for build time vs runtime
const isBuildTime = process.env.NODE_ENV === 'production' && typeof window === 'undefined'

// Simplified client creation with build-time handling
function createSupabaseClient() {
  // During build time, return a minimal client to allow static generation
  if (isBuildTime) {
    return createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://placeholder-for-build.com',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key-for-build',
      { 
        auth: { persistSession: false }
      }
    )
  }

  // Runtime check for environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables')
  }

  return createClient<Database>(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: typeof window !== 'undefined',
      autoRefreshToken: typeof window !== 'undefined',
    }
  })
}

// Export the Supabase client
export const supabase = createSupabaseClient()

// Simplified error handling
export class DatabaseError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'DatabaseError'
  }
}

// Utility function for consistent error handling
export function handleDatabaseError(error: any, context: string): never {
  console.error(`Database error in ${context}:`, error)
  if (error instanceof Error) {
    throw new DatabaseError(`Error in ${context}: ${error.message}`)
  }
  throw new DatabaseError(`Error in ${context}: Unknown error`)
}

// Configuration object
export const supabaseConfig = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL,
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  isProduction: process.env.NODE_ENV === 'production'
} 