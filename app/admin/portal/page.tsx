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
      } finally {
        console.log('AdminPortal: Finishing loading')
        setLoading(false)
      }
    }

    getUser()
  }, [router, supabase.auth])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <div className="text-xl font-semibold text-gray-800">Loading Admin Portal...</div>
          <div className="text-sm text-gray-500">Please wait while we verify your session</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-4 p-8 bg-white rounded-lg shadow-lg max-w-md">
          <div className="text-red-600 text-5xl">⚠️</div>
          <div className="text-2xl font-bold text-red-600">Error Loading Portal</div>
          <div className="text-gray-600">{error}</div>
          <button
            onClick={() => router.push('/login')}
            className="mt-4 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Return to Login
          </button>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-4 p-8 bg-white rounded-lg shadow-lg">
          <div className="text-2xl font-bold text-gray-800">No User Session Found</div>
          <div className="text-gray-600">Please log in to access the admin portal</div>
          <button
            onClick={() => router.push('/login')}
            className="mt-4 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Success Banner */}
      <div className="bg-green-100 border-b border-green-200">
        <div className="max-w-7xl mx-auto py-3 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between flex-wrap">
            <div className="w-0 flex-1 flex items-center">
              <span className="flex p-2 rounded-lg bg-green-600">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </span>
              <p className="ml-3 font-medium text-green-900">
                Successfully logged in! Welcome to the Admin Portal
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Bar */}
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-indigo-600">Admin Portal</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-gray-600">{user.email}</span>
              </div>
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
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Welcome to Your Admin Dashboard</h2>
            <p className="mt-2 text-gray-600">You are successfully authenticated and authorized to access this page.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Blog Management Card */}
            <div className="bg-white overflow-hidden shadow-lg rounded-lg hover:shadow-xl transition-shadow">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-xl font-semibold text-gray-900">Blog Management</h3>
                <div className="mt-4 space-y-4">
                  <button
                    onClick={() => router.push('/admin/portal/new-blog')}
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                  >
                    Write New Blog Post
                  </button>
                  <button
                    onClick={() => router.push('/admin/portal/manage-blogs')}
                    className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                  >
                    Manage Existing Posts
                  </button>
                </div>
              </div>
            </div>

            {/* Reading List Management Card */}
            <div className="bg-white overflow-hidden shadow-lg rounded-lg hover:shadow-xl transition-shadow">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-xl font-semibold text-gray-900">Reading List Management</h3>
                <div className="mt-4 space-y-4">
                  <button
                    onClick={() => router.push('/admin/portal/add-book')}
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                  >
                    Add New Book
                  </button>
                  <button
                    onClick={() => router.push('/admin/portal/manage-books')}
                    className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
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