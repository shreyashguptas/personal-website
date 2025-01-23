import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')
    const token_hash = requestUrl.searchParams.get('token_hash')
    const type = requestUrl.searchParams.get('type')
    const next = requestUrl.searchParams.get('next') ?? '/admin/portal'

    console.log('Auth callback started:', { 
      hasCode: !!code,
      hasToken: !!token_hash,
      type,
      next,
      origin: requestUrl.origin 
    })

    const supabase = createClient()

    // Handle the magic link token
    if (token_hash) {
      const { error: signInError } = await supabase.auth.verifyOtp({
        token_hash,
        type: type === 'recovery' ? 'recovery' : 'email',
      })

      if (signInError) {
        console.error('Error verifying OTP:', {
          error: signInError.message,
          code: signInError.status
        })
        return NextResponse.redirect(new URL('/login', requestUrl.origin))
      }
    }
    // Handle the code exchange
    else if (code) {
      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
      
      if (exchangeError) {
        console.error('Error exchanging code for session:', {
          error: exchangeError.message,
          code: exchangeError.status
        })
        return NextResponse.redirect(new URL('/login', requestUrl.origin))
      }
    } else {
      console.error('No code or token_hash provided')
      return NextResponse.redirect(new URL('/login', requestUrl.origin))
    }

    // Verify the session was created
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError) {
      console.error('Error getting user:', {
        error: userError.message,
        code: userError.status
      })
      return NextResponse.redirect(new URL('/login', requestUrl.origin))
    }

    if (!user) {
      console.error('No user found after authentication')
      return NextResponse.redirect(new URL('/login', requestUrl.origin))
    }

    // Verify email matches
    if (user.email !== process.env.NEXT_PUBLIC_AUTHORIZED_EMAIL) {
      console.error('Unauthorized email attempt:', {
        attempted: user.email,
        authorized: process.env.NEXT_PUBLIC_AUTHORIZED_EMAIL
      })
      await supabase.auth.signOut()
      return NextResponse.redirect(new URL('/login', requestUrl.origin))
    }

    console.log('Auth successful, redirecting to:', next)
    
    // Add cache control headers to prevent caching
    const response = NextResponse.redirect(new URL(next, requestUrl.origin))
    response.headers.set('Cache-Control', 'no-store, max-age=0')
    return response

  } catch (error) {
    console.error('Callback error:', error)
    // If there's an error, redirect to login
    return NextResponse.redirect(new URL('/login', request.url))
  }
} 