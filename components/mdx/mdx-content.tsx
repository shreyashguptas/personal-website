'use client'

import React from 'react'
import { MDXRemote } from 'next-mdx-remote'
import type { MDXRemoteSerializeResult } from 'next-mdx-remote'
import type { MDXComponents } from 'mdx/types'
import { MDXImage } from './mdx-image'

interface Props {
  source: MDXRemoteSerializeResult
}

// Define components outside of the render function to prevent recreation
const components: MDXComponents = {
  // Wrap image in a proper component to handle hooks
  img: ({ alt, src, width, height, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) => (
    <MDXImage
      alt={alt || ''}
      src={src || ''}
      width={typeof width === 'string' ? parseInt(width, 10) : width}
      height={typeof height === 'string' ? parseInt(height, 10) : height}
      {...props}
    />
  ),
  // Handle other potentially problematic elements
  p: ({ children, ...props }) => {
    // Check if children contain an image
    const childrenArray = React.Children.toArray(children)
    const hasImage = childrenArray.some(
      child => React.isValidElement(child) && child.type === 'img'
    )

    // If there's an image, render without p wrapper to avoid nesting issues
    if (hasImage) {
      return <>{children}</>
    }

    return <p {...props}>{children}</p>
  }
}

export function MDXContent({ source }: Props) {
  if (!source) {
    return (
      <div className="text-red-500 p-4 border border-red-200 rounded-lg">
        No content available
      </div>
    )
  }

  // Handle string source (error case) gracefully
  if (typeof source === 'string') {
    return (
      <div className="text-red-500 p-4 border border-red-200 rounded-lg">
        {source}
      </div>
    )
  }

  return (
    <article className="mdx-content prose prose-neutral dark:prose-invert max-w-none">
      <MDXRemote {...source} components={components} />
    </article>
  )
} 