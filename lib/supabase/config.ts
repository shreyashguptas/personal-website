import { createClient } from '@supabase/supabase-js'
import { Database } from './types'

// Helper function to check if we're in browser
const isBrowser = typeof window !== 'undefined'

// Function to create Supabase client
function createSupabaseClient() {
  // During SSR/build, return a client with minimal config if env vars aren't available
  if (!isBrowser && (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)) {
    return createClient<Database>(
      'https://placeholder.supabase.co',
      'placeholder',
      { auth: { persistSession: false } }
    )
  }

  // In browser or when env vars are available, create real client
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  return createClient<Database>(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    }
  })
}

// Export the Supabase client
export const supabase = createSupabaseClient()

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
  url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  isProduction: process.env.NODE_ENV === 'production'
} 