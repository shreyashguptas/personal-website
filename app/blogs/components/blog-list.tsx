'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { BlogWithFormattedDate, BlogTag } from '@/lib/supabase'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

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
            className="flex items-center gap-2 px-4 py-2 rounded-lg border hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            {selectedTag} <ChevronDown className={`w-4 h-4 transition-transform ${isTagMenuOpen ? 'rotate-180' : ''}`} />
          </button>
          {isTagMenuOpen && (
            <div className="absolute top-full left-0 mt-2 w-full bg-background rounded-lg border shadow-lg z-10">
              <button
                onClick={() => {
                  setSelectedTag('All')
                  setIsTagMenuOpen(false)
                }}
                className={cn(
                  'block w-full text-left px-4 py-2 hover:bg-accent hover:text-accent-foreground transition-colors',
                  selectedTag === 'All' && 'bg-accent/50'
                )}
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
                  className={cn(
                    'block w-full text-left px-4 py-2 hover:bg-accent hover:text-accent-foreground transition-colors',
                    selectedTag === tag && 'bg-accent/50'
                  )}
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
          className={cn(
            'px-4 py-2 rounded-lg transition-colors hover:bg-accent hover:text-accent-foreground',
            selectedTag === 'All' && 'bg-accent text-accent-foreground'
          )}
        >
          All
        </button>
        {availableTags.map(tag => (
          <button
            key={tag}
            onClick={() => setSelectedTag(tag)}
            className={cn(
              'px-4 py-2 rounded-lg transition-colors hover:bg-accent hover:text-accent-foreground',
              selectedTag === tag && 'bg-accent text-accent-foreground'
            )}
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
            className="block p-6 rounded-lg border hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
              <div className="space-y-2">
                <h2 className="text-xl font-semibold">{post.title}</h2>
                <div className="text-sm text-muted-foreground">{post.formattedDate}</div>
              </div>
              <span className="text-sm text-muted-foreground px-3 py-1 bg-accent/50 rounded-full">
                {post.tag}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

