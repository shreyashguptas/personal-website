import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

// Define error types
export interface DatabaseErrorDetails {
  code: string;
  message: string;
  context?: string | undefined;
}

// Environment variable keys
const ENV_KEYS = {
  SUPABASE_URL: 'NEXT_PUBLIC_SUPABASE_URL',
  SUPABASE_ANON_KEY: 'NEXT_PUBLIC_SUPABASE_ANON_KEY'
} as const;

// Simple check for build time vs runtime
const isBuildTime = process.env['NODE_ENV'] === 'production' && typeof window === 'undefined';

// Type-safe environment variable getter
function getEnvVar(key: keyof typeof ENV_KEYS): string {
  const value = process.env[ENV_KEYS[key]];
  if (!value) {
    throw new Error(`Missing required environment variable: ${ENV_KEYS[key]}`);
  }
  return value;
}

// Simplified client creation with build-time handling
function createSupabaseClient() {
  try {
    const supabaseUrl = getEnvVar('SUPABASE_URL');
    const supabaseKey = getEnvVar('SUPABASE_ANON_KEY');
    const isClient = typeof window !== 'undefined';

    return createClient<Database>(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: isClient,
        autoRefreshToken: isClient,
      }
    });
  } catch (error) {
    // During build time, return a minimal client
    if (isBuildTime) {
      console.warn('Using placeholder Supabase client for build time');
      return createClient<Database>(
        'http://placeholder-for-build.com',
        'placeholder-key-for-build',
        { 
          auth: { persistSession: false }
        }
      );
    }
    throw error;
  }
}

// Export the Supabase client
export const supabase = createSupabaseClient();

// Improved error handling with proper types
export class DatabaseError extends Error {
  public readonly code: string;
  public readonly context: string | undefined;

  constructor(details: DatabaseErrorDetails) {
    super(details.message);
    this.name = 'DatabaseError';
    this.code = details.code;
    this.context = details.context;

    // Maintains proper stack trace for where error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, DatabaseError);
    }
  }
}

// Error codes enum for consistency
export enum DatabaseErrorCode {
  UNKNOWN = 'UNKNOWN_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  VALIDATION = 'VALIDATION_ERROR',
  PERMISSION = 'PERMISSION_ERROR',
}

// Utility function for consistent error handling with proper type checking
export function handleDatabaseError(error: unknown, context: string): never {
  console.error(`Database error in ${context}:`, error);
  
  if (error instanceof DatabaseError) {
    throw error; // Re-throw if it's already a DatabaseError
  }
  
  if (error instanceof Error) {
    throw new DatabaseError({
      code: DatabaseErrorCode.UNKNOWN,
      message: error.message,
      context
    });
  }
  
  if (typeof error === 'object' && error !== null && 'code' in error && 'message' in error) {
    const errorObj = error as { code: unknown; message: unknown };
    throw new DatabaseError({
      code: String(errorObj.code),
      message: String(errorObj.message),
      context
    });
  }

  throw new DatabaseError({
    code: DatabaseErrorCode.UNKNOWN,
    message: 'An unknown error occurred',
    context
  });
}

// Export the configuration
export const supabaseConfig = {
  url: getEnvVar('SUPABASE_URL'),
  anonKey: getEnvVar('SUPABASE_ANON_KEY'),
  isProduction: process.env['NODE_ENV'] === 'production'
} as const; 