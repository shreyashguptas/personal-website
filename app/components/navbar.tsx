import Link from 'next/link'

export function Navbar() {
  return (
    <header className="flex flex-col md:flex-row md:justify-between md:items-center mb-12 gap-4 md:gap-0">
      <Link href="/" className="text-xl font-bold text-center md:text-left">
        SHREYASH GUPTA
      </Link>
      <nav className="flex flex-wrap justify-center gap-4 md:gap-6">
        <Link href="/" className="hover:text-gray-600 transition-colors">Home</Link>
        <Link href="/projects" className="hover:text-gray-600 transition-colors">Projects</Link>
        <Link href="/blogs" className="hover:text-gray-600 transition-colors">Blogs</Link>
        <Link href="/readings" className="hover:text-gray-600 transition-colors">Readings</Link>
        <Link href="/about" className="hover:text-gray-600 transition-colors">Personal Life</Link>
      </nav>
    </header>
  )
}
