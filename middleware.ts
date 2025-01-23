import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Create a response object to modify
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  try {
    // Skip auth check for auth-related routes
    if (request.nextUrl.pathname.startsWith('/auth/')) {
      return response
    }

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            request.cookies.set({
              name,
              value,
              ...options,
            })
            response = NextResponse.next({
              request: {
                headers: request.headers,
              },
            })
            response.cookies.set({
              name,
              value,
              ...options,
            })
          },
          remove(name: string, options: any) {
            request.cookies.set({
              name,
              value: '',
              ...options,
            })
            response = NextResponse.next({
              request: {
                headers: request.headers,
              },
            })
            response.cookies.set({
              name,
              value: '',
              ...options,
            })
          },
        },
      }
    )

    const { data: { session } } = await supabase.auth.getSession()

    // Handle protected routes
    if (request.nextUrl.pathname.startsWith('/admin')) {
      if (!session) {
        const redirectUrl = new URL('/login', request.url)
        return NextResponse.redirect(redirectUrl)
      }

      // Verify user email matches authorized email
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || user.email !== process.env.NEXT_PUBLIC_AUTHORIZED_EMAIL) {
        const redirectUrl = new URL('/login', request.url)
        return NextResponse.redirect(redirectUrl)
      }
    }

    // Handle login page access when already authenticated
    if (request.nextUrl.pathname === '/login' && session) {
      const redirectUrl = new URL('/admin/portal', request.url)
      return NextResponse.redirect(redirectUrl)
    }

    return response
  } catch (error) {
    console.error('Middleware error:', error)
    // On error, allow the request to continue but log the error
    return response
  }
}

export const config = {
  matcher: [
    '/login',
    '/admin/:path*',
    '/auth/:path*'
  ],
} 