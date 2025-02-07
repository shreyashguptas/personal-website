'use client'

import { ErrorMessage } from '@/components/ui/error-message'
import { useEffect } from 'react'

export default function ReadingsError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Readings page error:', error)
  }, [error])

  return (
    <ErrorMessage
      title="Failed to Load Reading"
      message="We encountered an error while loading the reading. This could be due to a network issue or a temporary server problem."
      onRetry={reset}
    />
  )
} 