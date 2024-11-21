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
            <Link href="/" className="nav-link">
              Home
            </Link>
          </li>
          <li>
            <Link href="/projects" className="nav-link">
              Projects
            </Link>
          </li>
          <li>
            <Link href="/readings" className="nav-link">
              Readings
            </Link>
          </li>
          <li>
            <Link href="/blogs" className="nav-link">
              Blogs
            </Link>
          </li>
          <li>
            <Link href="/about" className="nav-link">
              About
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  )
}