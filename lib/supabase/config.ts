import { createClient } from '@supabase/supabase-js'
import { Database } from './types'

// Helper function to check if we're in browser
const isBrowser = typeof window !== 'undefined'

// Function to validate environment variables
function validateEnvVariables() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      'Missing Supabase environment variables. Please ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set.'
    )
  }

  return { url: supabaseUrl, key: supabaseKey }
}

// Function to create Supabase client
function createSupabaseClient() {
  const { url, key } = validateEnvVariables()
  
  return createClient<Database>(url, key, {
    auth: {
      persistSession: isBrowser,
      autoRefreshToken: isBrowser,
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
  if (error instanceof Error) {
    throw new DatabaseError(`Error in ${context}: ${error.message}`, error)
  }
  throw new DatabaseError(`Error in ${context}: Unknown error`, error)
}

// Configuration object
export const supabaseConfig = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL,
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  isProduction: process.env.NODE_ENV === 'production'
} 