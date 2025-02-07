'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useState, useEffect } from 'react'

const navigationItems = [
  { name: 'Home', href: '/' },
  { name: 'Projects', href: '/projects' },
  { name: 'Blogs', href: '/blogs' },
  { name: 'Readings', href: '/readings' },
]

export function Navbar() {
  const pathname = usePathname()
  const [isNavigating, setIsNavigating] = useState(false)
  const [prevPath, setPrevPath] = useState(pathname)

  useEffect(() => {
    if (pathname !== prevPath) {
      setIsNavigating(true)
      setPrevPath(pathname)
      
      const timer = setTimeout(() => {
        setIsNavigating(false)
      }, 400) // Increased duration for smoother transition
      
      return () => clearTimeout(timer)
    }
  }, [pathname, prevPath])

  return (
    <header className="flex justify-center mb-8">
      <nav className="relative z-10 flex gap-1 rounded-lg bg-background p-1 items-center">
        {navigationItems.map((item) => {
          const isActive = pathname === item.href
          const wasActive = prevPath === item.href
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'group relative select-none rounded-md px-3 py-1.5 text-sm outline-none transition-colors duration-200',
                'text-muted-foreground hover:text-foreground',
                isActive && 'text-foreground'
              )}
            >
              <span className="relative z-10">
                {item.name}
                <span 
                  className={cn(
                    'absolute -bottom-1.5 h-[2px] bg-foreground',
                    'transition-all duration-400 ease-in-out',
                    // Default state
                    'w-0 left-1/2 transform -translate-x-1/2',
                    // Hover state when not active and not navigating
                    !isActive && !isNavigating && 'group-hover:w-[calc(100%+0.5rem)] group-hover:left-[50%] group-hover:-translate-x-1/2',
                    // Active state
                    isActive && !isNavigating && 'w-[calc(100%+0.5rem)] left-[50%] -translate-x-1/2',
                    // Exit animation
                    wasActive && isNavigating && 'w-0 left-[50%] -translate-x-1/2',
                    // Entry animation
                    isActive && isNavigating && 'w-[calc(100%+0.5rem)] left-[50%] -translate-x-1/2'
                  )}
                />
              </span>
            </Link>
          )
        })}
      </nav>
    </header>
  )
}
