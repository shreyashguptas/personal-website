export default function Navbar() {
  return (
    <nav className="p-4">
      <div className="container mx-auto flex justify-between items-center max-w-6xl">
        <div className="text-xl font-bold">SHREYASH GUPTA</div>
        <ul className="flex items-center space-x-8">
          <li><a href="#" className="hover:text-gray-600 transition-colors">Home</a></li>
          <li><a href="#" className="hover:text-gray-600 transition-colors">Projects</a></li>
          <li><a href="#" className="hover:text-gray-600 transition-colors">Readings</a></li>
          <li><a href="#" className="hover:text-gray-600 transition-colors">Blog</a></li>
          <li><a href="#" className="hover:text-gray-600 transition-colors">About</a></li>
        </ul>
      </div>
    </nav>
  )
}