import Link from 'next/link'

export function Footer() {
  const currentYear = new Date().getFullYear()
  
  return (
    <footer className="mt-16 pt-8 pb-16">
      <div className="flex flex-col md:flex-row justify-between items-start gap-8">
        <div className="flex flex-col items-start gap-4 text-muted-foreground">
          <p>© {currentYear} Shreyash Gupta</p>
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
            <Link 
              href="https://www.youtube.com/@Shreyashguptas" 
              className="hover:text-foreground transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              YouTube
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
