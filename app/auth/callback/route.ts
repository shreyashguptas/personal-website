import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')

    if (!code) {
      console.error('No code provided in callback')
      return NextResponse.redirect(new URL('/login', requestUrl.origin))
    }

    const supabase = createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      console.error('Error exchanging code for session:', error)
      return NextResponse.redirect(new URL('/login', requestUrl.origin))
    }

    if (!data.session) {
      console.error('No session created')
      return NextResponse.redirect(new URL('/login', requestUrl.origin))
    }

    // Add cache control headers to prevent caching
    const response = NextResponse.redirect(new URL('/admin/portal', requestUrl.origin))
    response.headers.set('Cache-Control', 'no-store, max-age=0')
    return response

  } catch (error) {
    console.error('Callback error:', error)
    // If there's an error, redirect to login
    return NextResponse.redirect(new URL('/login', request.url))
  }
} 