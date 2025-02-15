'use client'

import dynamic from 'next/dynamic'
import { MDXRemote } from 'next-mdx-remote'
import type { MDXRemoteSerializeResult } from 'next-mdx-remote'
import Image from 'next/image'
import Link from 'next/link'
import { memo } from 'react'
import type { ComponentProps } from 'react'

// Optimize image loading
const components = {
  img: memo(function MDXImage({ src, alt, ...rest }: ComponentProps<'img'>) {
    if (!src) return null
    
    return (
      <div className="relative aspect-video my-8">
        <Image
          src={src}
          alt={alt || ''}
          fill
          priority={false}
          quality={75}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 85vw, 800px"
          className="rounded-lg object-cover"
        />
      </div>
    )
  }),
  a: memo(function MDXLink({ href, children }: ComponentProps<'a'>) {
    if (!href) return null

    return (
      <Link
        href={href}
        className="text-primary hover:underline"
        target={href.startsWith('http') ? '_blank' : undefined}
        rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
      >
        {children}
      </Link>
    )
  })
}

interface MDXContentProps {
  source: MDXRemoteSerializeResult
}

// Memoize the entire component to prevent unnecessary re-renders
export const MDXContent = memo(function MDXContent({ source }: MDXContentProps) {
  return (
    <article className="prose prose-neutral dark:prose-invert max-w-none">
      <MDXRemote {...source} components={components} />
    </article>
  )
}) 