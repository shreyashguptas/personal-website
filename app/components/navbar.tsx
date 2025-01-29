import Link from 'next/link'

export function Navbar() {
  return (
    <header className="flex justify-center mb-8">
      <nav className="flex flex-wrap justify-center gap-6 md:gap-8">
        <Link href="/" className="hover:text-gray-600 transition-colors">Home</Link>
        <Link href="/projects" className="hover:text-gray-600 transition-colors">Projects</Link>
        <Link href="/blogs" className="hover:text-gray-600 transition-colors">Blogs</Link>
        <Link href="/readings" className="hover:text-gray-600 transition-colors">Readings</Link>
        <Link href="/about" className="hover:text-gray-600 transition-colors">Personal Life</Link>
      </nav>
    </header>
  )
}
