import Link from 'next/link'

export function Footer() {
  return (
    <footer className="mt-16 border-t pt-8 pb-16">
      <div className="flex flex-col items-center gap-4 text-muted-foreground">
        <p>© 2024 Shreyash Gupta</p>
        <div className="flex gap-4">
          <Link 
            href="https://github.com/shreyashguptas" 
            className="hover:text-foreground transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </Link>
          <Link 
            href="https://www.linkedin.com/in/shreyashgupta5/" 
            className="hover:text-foreground transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            LinkedIn
          </Link>
          <Link 
            href="https://x.com/shreyashguptas" 
            className="hover:text-foreground transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            X
          </Link>
        </div>
        <p className="text-sm">
          Last updated on November 14, 2024
        </p>
      </div>
    </footer>
  )
}
