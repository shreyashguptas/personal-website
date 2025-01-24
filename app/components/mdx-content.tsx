'use client'

import { MDXRemote, MDXRemoteSerializeResult } from 'next-mdx-remote'
import { MDXComponents } from 'mdx/types'
import { MDXImage } from './mdx-image'

const components: MDXComponents = {
  img: MDXImage,
}

interface Props {
  source: MDXRemoteSerializeResult
}

export function MDXContent({ source }: Props) {
  if (!source) {
    return (
      <div className="text-red-500">
        Error loading content. Please try again later.
      </div>
    )
  }

  return (
    <div className="mdx-content">
      <MDXRemote {...source} components={components} />
    </div>
  )
} 