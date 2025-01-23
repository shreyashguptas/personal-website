import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  console.log('Middleware: Processing request for:', request.nextUrl.pathname)
  
  try {
    // Create a response that we can modify
    const response = NextResponse.next()

    // Skip auth check for auth-related routes and public assets
    if (request.nextUrl.pathname.startsWith('/auth/') || 
        request.nextUrl.pathname.startsWith('/_next/') ||
        request.nextUrl.pathname.includes('.')) {
      console.log('Middleware: Skipping auth check for public route')
      return response
    }

    // Create supabase client
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            response.cookies.set({
              name,
              value,
              ...options,
            })
          },
          remove(name: string, options: any) {
            response.cookies.set({
              name,
              value: '',
              ...options,
            })
          },
        },
      }
    )

    // Get the session
    const { data: { session } } = await supabase.auth.getSession()

    // Handle protected routes (/admin/*)
    if (request.nextUrl.pathname.startsWith('/admin')) {
      if (!session) {
        console.log('Middleware: No session for protected route, redirecting to login')
        return NextResponse.redirect(new URL('/login', request.url))
      }

      // Get user data
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user || user.email !== process.env.NEXT_PUBLIC_AUTHORIZED_EMAIL) {
        console.log('Middleware: Unauthorized user for protected route')
        return NextResponse.redirect(new URL('/login', request.url))
      }
    }

    // Only redirect from login page if user is already authenticated
    if (request.nextUrl.pathname === '/login' && session) {
      console.log('Middleware: Authenticated user on login page, redirecting to portal')
      return NextResponse.redirect(new URL('/admin/portal', request.url))
    }

    return response
  } catch (error) {
    console.error('Middleware: Unexpected error:', error)
    // On error, allow the request to continue
    return NextResponse.next()
  }
}

export const config = {
  matcher: [
    '/login',
    '/admin/:path*',
    '/auth/:path*'
  ],
} 