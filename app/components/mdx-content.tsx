'use client'

import { useEffect, useState } from 'react'
import { MDXProvider } from '@mdx-js/react'
import { MDXComponents } from 'mdx/types'
import { MDXImage } from './mdx-image'
import { processMdx } from '@/app/utils/mdx'

const components: MDXComponents = {
  img: MDXImage,
}

interface Props {
  content: string
}

export function MDXContent({ content }: Props) {
  const [html, setHtml] = useState('')

  useEffect(() => {
    async function parseMarkdown() {
      const result = await processMdx(content)
      setHtml(result)
    }

    parseMarkdown()
  }, [content])

  return (
    <MDXProvider components={components}>
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </MDXProvider>
  )
} 