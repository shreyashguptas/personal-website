'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { BlogWithFormattedDate, BlogTag } from '../types'
import { ChevronDown } from 'lucide-react'

interface BlogListProps {
  initialPosts: BlogWithFormattedDate[]
  availableTags: BlogTag[]
}

export default function BlogList({ initialPosts, availableTags }: BlogListProps) {
  const [selectedTag, setSelectedTag] = useState<BlogTag | 'All'>('All')
  const [isMobile, setIsMobile] = useState(false)
  const [isTagMenuOpen, setIsTagMenuOpen] = useState(false)

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkIfMobile()
    window.addEventListener('resize', checkIfMobile)
    return () => window.removeEventListener('resize', checkIfMobile)
  }, [])

  const filteredPosts = selectedTag === 'All' 
    ? initialPosts 
    : initialPosts.filter(post => post.tag === selectedTag)

  const TagSelector = () => {
    if (isMobile) {
      return (
        <div className="relative">
          <button
            onClick={() => setIsTagMenuOpen(!isTagMenuOpen)}
            className="flex items-center gap-2 px-4 py-2 bg-card rounded-lg border border-border hover:border-primary transition-colors"
          >
            {selectedTag} <ChevronDown className={`w-4 h-4 transition-transform ${isTagMenuOpen ? 'rotate-180' : ''}`} />
          </button>
          {isTagMenuOpen && (
            <div className="absolute top-full left-0 mt-2 w-full bg-card rounded-lg border border-border shadow-lg z-10">
              <button
                onClick={() => {
                  setSelectedTag('All')
                  setIsTagMenuOpen(false)
                }}
                className={`block w-full text-left px-4 py-2 hover:bg-primary/10 transition-colors ${selectedTag === 'All' ? 'bg-primary/20' : ''}`}
              >
                All
              </button>
              {availableTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => {
                    setSelectedTag(tag)
                    setIsTagMenuOpen(false)
                  }}
                  className={`block w-full text-left px-4 py-2 hover:bg-primary/10 transition-colors ${selectedTag === tag ? 'bg-primary/20' : ''}`}
                >
                  {tag}
                </button>
              ))}
            </div>
          )}
        </div>
      )
    }

    return (
      <div className="flex gap-2">
        <button
          onClick={() => setSelectedTag('All')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            selectedTag === 'All'
              ? 'bg-primary text-primary-foreground'
              : 'bg-card hover:bg-primary/10'
          }`}
        >
          All
        </button>
        {availableTags.map(tag => (
          <button
            key={tag}
            onClick={() => setSelectedTag(tag)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              selectedTag === tag
                ? 'bg-primary text-primary-foreground'
                : 'bg-card hover:bg-primary/10'
            }`}
          >
            {tag}
          </button>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">Blogs</h1>
        <TagSelector />
      </div>
      <div className="grid gap-6">
        {filteredPosts.map((post) => (
          <Link
            key={post.id}
            href={`/blogs/${post.slug}`}
            className="block p-6 bg-card rounded-lg border border-border hover:border-primary transition-colors"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
              <div className="space-y-2">
                <h2 className="text-xl font-semibold">{post.title}</h2>
                <div className="text-sm text-muted-foreground">{post.formattedDate}</div>
              </div>
              <span className="text-sm text-muted-foreground px-3 py-1 bg-primary/10 rounded-full">
                {post.tag}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

