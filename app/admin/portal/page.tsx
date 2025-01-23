'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function AdminPortal() {
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    console.log('AdminPortal: Component mounted')
    
    const getUser = async () => {
      try {
        console.log('AdminPortal: Checking session...')
        setLoading(true)
        
        // First check session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        console.log('AdminPortal: Session check result:', { 
          hasSession: !!session,
          error: sessionError?.message 
        })
        
        if (sessionError) {
          console.error('AdminPortal: Session error:', sessionError.message)
          throw new Error('Failed to get session')
        }

        if (!session) {
          console.log('AdminPortal: No session found, redirecting to login')
          router.replace('/login')
          return
        }

        // Then get user data
        console.log('AdminPortal: Getting user data...')
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        console.log('AdminPortal: User data result:', { 
          hasUser: !!user,
          error: userError?.message 
        })
        
        if (userError) {
          console.error('AdminPortal: User error:', userError.message)
          throw new Error('Failed to get user data')
        }

        if (!user) {
          console.log('AdminPortal: No user found, redirecting to login')
          router.replace('/login')
          return
        }

        // Verify the user email matches the authorized email
        const authorizedEmail = process.env.NEXT_PUBLIC_AUTHORIZED_EMAIL
        console.log('AdminPortal: Verifying email...', {
          userEmail: user.email,
          authorizedEmail,
          matches: user.email === authorizedEmail
        })
        
        if (user.email !== authorizedEmail) {
          console.error('AdminPortal: Unauthorized email')
          await supabase.auth.signOut()
          router.replace('/login')
          return
        }

        console.log('AdminPortal: Setting user data')
        setUser(user)
      } catch (err) {
        console.error('AdminPortal: Error in auth flow:', err)
        setError(err instanceof Error ? err.message : 'Failed to load user data')
        router.replace('/login')
      } finally {
        console.log('AdminPortal: Finishing loading')
        setLoading(false)
      }
    }

    getUser()

    // Cleanup function
    return () => {
      console.log('AdminPortal: Component unmounting')
    }
  }, [router, supabase.auth])

  // Add auth state change listener
  useEffect(() => {
    console.log('AdminPortal: Setting up auth listener')
    
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('AdminPortal: Auth state changed:', { event, hasSession: !!session })
      
      if (!session) {
        console.log('AdminPortal: No session in state change, redirecting to login')
        router.replace('/login')
      }
    })

    return () => {
      console.log('AdminPortal: Cleaning up auth listener')
      subscription.unsubscribe()
    }
  }, [router, supabase.auth])

  if (loading) {
    console.log('AdminPortal: Rendering loading state')
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-lg text-gray-600">Loading...</div>
        </div>
      </div>
    )
  }

  if (error) {
    console.log('AdminPortal: Rendering error state:', error)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-lg text-red-600">{error}</div>
          <button
            onClick={() => router.push('/login')}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Return to Login
          </button>
        </div>
      </div>
    )
  }

  if (!user) {
    console.log('AdminPortal: No user, redirecting to login')
    router.replace('/login')
    return null
  }

  console.log('AdminPortal: Rendering main content')
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold">Admin Portal</h1>
            </div>
            <div className="flex items-center">
              <span className="text-gray-500 mr-4">{user.email}</span>
              <button
                onClick={async () => {
                  try {
                    console.log('AdminPortal: Signing out...')
                    const { error } = await supabase.auth.signOut()
                    if (error) throw error
                    console.log('AdminPortal: Sign out successful')
                    router.replace('/login')
                  } catch (err) {
                    console.error('AdminPortal: Sign out error:', err)
                    setError('Failed to sign out')
                  }
                }}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Blog Management Card */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900">Blog Management</h3>
                <div className="mt-4 space-y-4">
                  <button
                    onClick={() => router.push('/admin/portal/new-blog')}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    Write New Blog Post
                  </button>
                  <button
                    onClick={() => router.push('/admin/portal/manage-blogs')}
                    className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Manage Existing Posts
                  </button>
                </div>
              </div>
            </div>

            {/* Reading List Management Card */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900">Reading List Management</h3>
                <div className="mt-4 space-y-4">
                  <button
                    onClick={() => router.push('/admin/portal/add-book')}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    Add New Book
                  </button>
                  <button
                    onClick={() => router.push('/admin/portal/manage-books')}
                    className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Manage Reading List
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 