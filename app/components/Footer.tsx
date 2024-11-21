export default function Footer() {
    return (
      <footer className="py-8 px-4">
        <div className="container mx-auto max-w-3xl">
          <div className="space-y-4">
            <p className="text-gray-500">© 2024 Shreyash Gupta</p>
            
            <div className="flex space-x-4">
              <a 
                href="https://github.com/shreyashguptas" 
                className="text-gray-600 hover:text-gray-900 transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub
              </a>
              <a 
                href="https://www.linkedin.com/in/shreyashgupta5/" 
                className="text-gray-600 hover:text-gray-900 transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                LinkedIn
              </a>
              <a 
                href="https://x.com/ShreyashGuptas" 
                className="text-gray-600 hover:text-gray-900 transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                X
              </a>
            </div>
  
            <p className="text-gray-500">Last updated on November 14, 2024</p>
          </div>
        </div>
      </footer>
    )
  }