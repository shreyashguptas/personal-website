'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        if (sessionError) throw sessionError
        if (session) {
          router.replace('/admin/portal')
          return
        }
      } catch (err) {
        console.error('Session check error:', err)
      } finally {
        setLoading(false)
      }
    }

    checkSession()
  }, [router, supabase.auth])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setSending(true)
    setMessage(null)
    setError(null)

    try {
      const authorizedEmail = process.env.NEXT_PUBLIC_AUTHORIZED_EMAIL
      if (!authorizedEmail) {
        throw new Error('Authorized email not configured')
      }

      const { error: authError } = await supabase.auth.signInWithOtp({
        email: authorizedEmail,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (authError) throw authError
      setMessage('Magic link sent! Check your email.')
    } catch (err) {
      console.error('Login error:', err)
      setError(err instanceof Error ? err.message : 'Error sending magic link')
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-lg text-gray-600">Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Admin Login
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Click below to receive a magic link
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div>
            <button
              type="submit"
              disabled={sending}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sending ? 'Sending magic link...' : 'Send Magic Link'}
            </button>
          </div>

          {message && (
            <div className="mt-2 text-center text-sm text-green-600 bg-green-50 p-2 rounded">
              {message}
            </div>
          )}

          {error && (
            <div className="mt-2 text-center text-sm text-red-600 bg-red-50 p-2 rounded">
              {error}
            </div>
          )}
        </form>
      </div>
    </div>
  )
} 