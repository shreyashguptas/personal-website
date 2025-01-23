import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export const createClient = () => {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          // @ts-expect-error - Next.js types are incorrect
          return cookies().get(name)?.value ?? ''
        },
        set(name: string, value: string, options: CookieOptions) {
          // @ts-expect-error - Next.js types are incorrect
          cookies().set({
            name,
            value,
            ...options,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            httpOnly: true,
            path: '/'
          })
        },
        remove(name: string) {
          // @ts-expect-error - Next.js types are incorrect
          cookies().delete(name)
        }
      }
    }
  )
} 