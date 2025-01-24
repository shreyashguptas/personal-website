import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
      <h1 className="text-4xl font-bold">404 - Page Not Found</h1>
      <p className="text-muted-foreground text-lg">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link 
        href="/"
        className="px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
      >
        Return Home
      </Link>
    </div>
  )
} 