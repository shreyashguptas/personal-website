import Link from 'next/link'

export default function Navbar() {
  return (
    <nav className="p-4">
      <div className="container mx-auto flex justify-between items-center max-w-6xl">
        <div className="text-xl font-bold">
          <Link href="/">SHREYASH GUPTA</Link>
        </div>
        <ul className="flex items-center space-x-8">
          <li>
            <Link href="/" className="hover:text-gray-600 transition-colors">
              Home
            </Link>
          </li>
          <li>
            <Link href="/projects" className="hover:text-gray-600 transition-colors">
              Projects
            </Link>
          </li>
          <li>
            <Link href="/readings" className="hover:text-gray-600 transition-colors">
              Readings
            </Link>
          </li>
          <li>
            <Link href="/blogs" className="hover:text-gray-600 transition-colors">
              Blogs
            </Link>
          </li>
          <li>
            <Link href="/about" className="hover:text-gray-600 transition-colors">
              About
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  )
}