import Link from 'next/link'

export function Navbar() {
  return (
    <header className="flex justify-between items-center mb-12">
      <Link href="/" className="text-xl font-bold">
        SHREYASH GUPTA
      </Link>
      <nav className="space-x-6">
        <Link href="/" className="hover:text-gray-600 transition-colors">Home</Link>
        <Link href="/projects" className="hover:text-gray-600 transition-colors">Projects</Link>
        <Link href="/readings" className="hover:text-gray-600 transition-colors">Readings</Link>
        <Link href="/blogs" className="hover:text-gray-600 transition-colors">Blogs</Link>
        <Link href="/about" className="hover:text-gray-600 transition-colors">About</Link>
      </nav>
    </header>
  )
}