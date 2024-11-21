export default function Navbar() {
  return (
    <nav className="p-4 bg-gray-800 text-white">
      <div className="container mx-auto flex justify-between items-center">
        <div className="text-xl font-bold">Your Logo</div>
        <ul className="flex space-x-4">
          <li><a href="/">Home</a></li>
          <li><a href="/projects">Projects</a></li>
          <li><a href="/about">About</a></li>
        </ul>
      </div>
    </nav>
  )
} 