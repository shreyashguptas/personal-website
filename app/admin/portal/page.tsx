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
    const getUser = async () => {
      try {
        setLoading(true)
        // First check session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          console.error('Session error:', sessionError.message)
          throw new Error('Failed to get session')
        }

        if (!session) {
          console.error('No session found')
          router.replace('/login')
          return
        }

        // Then get user data
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        
        if (userError) {
          console.error('User error:', userError.message)
          throw new Error('Failed to get user data')
        }

        if (!user) {
          console.error('No user found')
          router.replace('/login')
          return
        }

        // Verify the user email matches the authorized email
        if (user.email !== process.env.NEXT_PUBLIC_AUTHORIZED_EMAIL) {
          console.error('Unauthorized email')
          await supabase.auth.signOut()
          router.replace('/login')
          return
        }

        setUser(user)
      } catch (err) {
        console.error('Error in auth flow:', err)
        setError(err instanceof Error ? err.message : 'Failed to load user data')
        router.replace('/login')
      } finally {
        setLoading(false)
      }
    }

    getUser()
  }, [router, supabase.auth])

  const handleSignOut = async () => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      router.replace('/login')
    } catch (err) {
      console.error('Error signing out:', err)
      setError('Failed to sign out')
    } finally {
      setLoading(false)
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

  if (error) {
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
    router.replace('/login')
    return null
  }

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
                onClick={handleSignOut}
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