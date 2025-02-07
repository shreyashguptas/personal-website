'use client'

import { AlertCircle } from 'lucide-react'
import Link from 'next/link'

interface ErrorMessageProps {
  title?: string
  message?: string
  showHomeLink?: boolean
  showRetry?: boolean
  onRetry?: () => void
}

export function ErrorMessage({
  title = 'Something went wrong',
  message = 'An error occurred while loading the content. Please try again later.',
  showHomeLink = true,
  showRetry = true,
  onRetry
}: ErrorMessageProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4 text-center px-4">
      <div className="rounded-full bg-destructive/10 p-3">
        <AlertCircle className="h-6 w-6 text-destructive" />
      </div>
      <h1 className="text-2xl font-bold">{title}</h1>
      <p className="text-muted-foreground max-w-md">
        {message}
      </p>
      <div className="flex gap-4">
        {showRetry && onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Try Again
          </button>
        )}
        {showHomeLink && (
          <Link
            href="/"
            className="inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
          >
            Return Home
          </Link>
        )}
      </div>
    </div>
  )
} 