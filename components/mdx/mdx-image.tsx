'use client'

import React from 'react'
import Image from 'next/image'
import { useCallback } from 'react'

interface MDXImageProps {
  src: string
  alt: string
  width?: number
  height?: number
}

export function MDXImage({ src, alt, width, height }: MDXImageProps) {
  const getOptimizedSrc = useCallback(() => {
    if (!src) return ''
    return src.startsWith('/images/blogs-images/')
      ? src.replace('/images/blogs-images/', '/images/blogs-images-optimized/').replace(/\.(jpg|jpeg|png)$/i, '.webp')
      : src
  }, [src])

  if (!src) {
    return (
      <div className="text-red-500 p-4 border border-red-200 rounded-lg my-4">
        Missing image source
      </div>
    )
  }

  return (
    <figure className="my-8">
      <div className="relative w-full aspect-[16/9]">
        <Image
          src={getOptimizedSrc()}
          alt={alt || 'Blog post image'}
          fill
          className="object-cover rounded-lg"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 85vw, 80vw"
          priority={false}
          quality={75}
        />
      </div>
      {alt && <figcaption className="text-sm text-center mt-2 text-muted-foreground">{alt}</figcaption>}
    </figure>
  )
} 
