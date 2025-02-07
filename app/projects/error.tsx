'use client'

import { ErrorMessage } from '@/components/ui/error-message'
import { useEffect } from 'react'

export default function ProjectsError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Projects page error:', error)
  }, [error])

  return (
    <ErrorMessage
      title="Failed to Load Projects"
      message="We encountered an error while loading the projects. This could be due to a network issue or a temporary server problem."
      onRetry={reset}
    />
  )
} 