'use client'

import { MDXRemote } from 'next-mdx-remote'
import type { MDXRemoteSerializeResult } from 'next-mdx-remote'
import Image from 'next/image'
import Link from 'next/link'

const components = {
  img: (props: any) => (
    <Image
      {...props}
      width={800}
      height={400}
      quality={75}
      sizes="(max-width: 800px) 100vw, 800px"
      className="rounded-lg"
    />
  ),
  a: (props: any) => (
    <Link
      {...props}
      href={props.href}
      className="text-primary hover:underline"
      target={props.href.startsWith('http') ? '_blank' : undefined}
      rel={props.href.startsWith('http') ? 'noopener noreferrer' : undefined}
    />
  )
}

interface MDXContentProps {
  source: MDXRemoteSerializeResult
}

export function MDXContent({ source }: MDXContentProps) {
  return <MDXRemote {...source} components={components} />
} 