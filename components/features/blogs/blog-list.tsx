'use client'

import Link from 'next/link'
import { useState, useEffect, useRef, useCallback } from 'react'
import { BlogWithFormattedDate, BlogTag, PaginatedBlogs } from '@/lib/supabase'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card } from '@/components/ui/card'

interface BlogListProps {
  initialPosts: BlogWithFormattedDate[]
  availableTags: BlogTag[]
  hasMore: boolean
  onLoadMore: (page: number) => Promise<PaginatedBlogs>
}

export function BlogList({ initialPosts, availableTags, hasMore: initialHasMore, onLoadMore }: BlogListProps) {
  const [posts, setPosts] = useState<BlogWithFormattedDate[]>(initialPosts)
  const [hasMore, setHasMore] = useState(initialHasMore)
  const [selectedTag, setSelectedTag] = useState<BlogTag | 'All'>('All')
  const [isMobile, setIsMobile] = useState(false)
  const [isTagMenuOpen, setIsTagMenuOpen] = useState(false)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const observerTarget = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkIfMobile()
    window.addEventListener('resize', checkIfMobile)
    return () => window.removeEventListener('resize', checkIfMobile)
  }, [])

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return
    
    try {
      setLoading(true)
      const nextPage = page + 1
      const data = await onLoadMore(nextPage)
      
      setPosts(prev => [...prev, ...data.blogs])
      setHasMore(data.hasMore)
      setPage(nextPage)
    } catch (error) {
      console.error('Error loading more posts:', error)
    } finally {
      setLoading(false)
    }
  }, [loading, hasMore, page, onLoadMore])

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          loadMore()
        }
      },
      { threshold: 0.1 }
    )

    if (observerTarget.current) {
      observer.observe(observerTarget.current)
    }

    return () => observer.disconnect()
  }, [loadMore])

  const filteredPosts = selectedTag === 'All' 
    ? posts 
    : posts.filter(post => post.tag === selectedTag)

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
    <div className="space-y-16">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">Blogs</h1>
        <TagSelector />
      </div>
      <div className="space-y-16">
        {filteredPosts.map((post) => (
          <div key={post.id}>
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="flex-1 max-w-[calc(100%-632px)] space-y-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">{post.formattedDate}</p>
                  <h2 className="text-2xl font-semibold">{post.title}</h2>
                </div>
                
                <p className="text-muted-foreground">{post.description}</p>
                
                <Link
                  href={`/blogs/${post.slug}`}
                  className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                >
                  Read
                </Link>
              </div>

              <Link 
                href={`/blogs/${post.slug}`}
                className="block w-full md:w-[600px] group"
              >
                <Card className="h-[300px] p-8 bg-muted/50 transition-colors hover:bg-muted group-hover:border-primary">
                  <p className="text-base text-muted-foreground leading-relaxed line-clamp-[10]">
                    {post.content}
                  </p>
                </Card>
              </Link>
            </div>
            
            {post.id !== filteredPosts[filteredPosts.length - 1].id && (
              <div className="mt-16 border-t border-border" />
            )}
          </div>
        ))}
        
        {/* Intersection Observer target */}
        {hasMore && (
          <div 
            ref={observerTarget} 
            className="h-10 flex items-center justify-center"
          >
            {loading && (
              <div className="text-sm text-muted-foreground">Loading more blogs...</div>
            )}
          </div>
        )}
      </div>
    </div>
  )
} 