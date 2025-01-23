import { createServerClient } from '@/lib/supabase/middleware'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  console.log('Middleware: Processing request for:', request.nextUrl.pathname)
  
  try {
    // Create a response that we can modify
    const response = NextResponse.next()

    // Skip auth check for auth-related routes
    if (request.nextUrl.pathname.startsWith('/auth/')) {
      console.log('Middleware: Skipping auth check for auth route')
      return response
    }

    // Create supabase client with cookie handling for Next.js 15
    const supabase = createServerClient(request, response)

    // Get the session
    console.log('Middleware: Checking session...')
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      console.error('Middleware: Session error:', sessionError)
      // Continue to handle as if no session
    }

    console.log('Middleware: Session status:', { hasSession: !!session })

    // Handle protected routes
    if (request.nextUrl.pathname.startsWith('/admin')) {
      console.log('Middleware: Handling protected route')
      
      if (!session) {
        console.log('Middleware: No session, redirecting to login')
        return NextResponse.redirect(new URL('/login', request.url))
      }

      // Get user data
      console.log('Middleware: Getting user data...')
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError) {
        console.error('Middleware: User error:', userError)
        return NextResponse.redirect(new URL('/login', request.url))
      }

      if (!user) {
        console.log('Middleware: No user found, redirecting to login')
        return NextResponse.redirect(new URL('/login', request.url))
      }

      // Check if user email matches authorized email
      console.log('Middleware: Verifying email authorization')
      if (user.email !== process.env.NEXT_PUBLIC_AUTHORIZED_EMAIL) {
        console.error('Middleware: Unauthorized email:', {
          userEmail: user.email,
          authorizedEmail: process.env.NEXT_PUBLIC_AUTHORIZED_EMAIL
        })
        await supabase.auth.signOut()
        return NextResponse.redirect(new URL('/login', request.url))
      }
    }

    // Redirect authenticated users away from login page
    if (request.nextUrl.pathname === '/login' && session) {
      console.log('Middleware: Authenticated user on login page, redirecting to portal')
      return NextResponse.redirect(new URL('/admin/portal', request.url))
    }

    console.log('Middleware: Request processed successfully')
    return response
  } catch (error) {
    console.error('Middleware: Unexpected error:', error)
    // On error, allow the request to continue but log the error
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