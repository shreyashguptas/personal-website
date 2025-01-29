'use client'

import React from 'react'
import { MDXRemote, MDXRemoteSerializeResult } from 'next-mdx-remote'
import type { MDXComponents } from 'mdx/types'
import { MDXImage } from './mdx-image'

interface Props {
  source: MDXRemoteSerializeResult
}

// Define components outside of the render function to prevent recreation
const components: MDXComponents = {
  // Wrap image in a proper component to handle hooks
  img: (props: React.ImgHTMLAttributes<HTMLImageElement>) => (
    <MDXImage {...props} alt={props.alt || ''} src={props.src || ''} />
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

  return (
    <React.Suspense
      fallback={
        <div className="animate-pulse bg-muted rounded-lg p-4">
          Loading content...
        </div>
      }
    >
      <article className="mdx-content prose prose-neutral dark:prose-invert max-w-none">
        <MDXRemote
          {...source}
          components={components}
          // Disable static optimization to ensure proper hook context
          disableStaticRendering={true}
        />
      </article>
    </React.Suspense>
  )
} 