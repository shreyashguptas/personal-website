import Link from 'next/link'

export function Footer() {
  return (
    <footer className="mt-16 pt-8 pb-16">
      <div className="flex justify-between items-start">
        <div className="flex flex-col items-start gap-4 text-muted-foreground">
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

        <div className="flex-shrink-0">
          <iframe 
            src="https://shreyashgupta.substack.com/embed" 
            width="400" 
            height="120" 
            style={{ border: '0px solid #EEE', background: 'white' }}
            frameBorder="0" 
            scrolling="no"
          />
        </div>
      </div>
    </footer>
  )
}