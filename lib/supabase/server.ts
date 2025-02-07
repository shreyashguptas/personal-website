import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'

// Environment variable keys
const ENV_KEYS = {
  SUPABASE_URL: 'NEXT_PUBLIC_SUPABASE_URL',
  SUPABASE_ANON_KEY: 'NEXT_PUBLIC_SUPABASE_ANON_KEY'
} as const;

export const createClient = () => {
  const url = process.env[ENV_KEYS.SUPABASE_URL];
  const key = process.env[ENV_KEYS.SUPABASE_ANON_KEY];

  if (!url || !key) {
    throw new Error(
      `Missing required environment variables. Required: ${Object.values(ENV_KEYS).join(', ')}`
    );
  }

  return createSupabaseClient<Database>(url, key);
} 
