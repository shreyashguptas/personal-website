'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const navigationItems = [
  { name: 'Home', href: '/' },
  { name: 'Projects', href: '/projects' },
  { name: 'Blogs', href: '/blogs' },
  { name: 'Readings', href: '/readings' },
  { name: 'Personal Life', href: '/about' },
]

export function Navbar() {
  const pathname = usePathname()

  return (
    <header className="flex justify-center mb-8">
      <nav className="relative z-10 flex gap-1 rounded-lg bg-background p-1 items-center">
        {navigationItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'relative select-none rounded-md px-3 py-1.5 text-sm font-medium outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground',
              pathname === item.href && 'bg-background text-foreground shadow-sm'
            )}
          >
            {pathname === item.href && (
              <span
                className="absolute inset-0 rounded-md bg-muted/40"
                aria-hidden="true"
              />
            )}
            <span className="relative z-10">{item.name}</span>
          </Link>
        ))}
      </nav>
    </header>
  )
}
