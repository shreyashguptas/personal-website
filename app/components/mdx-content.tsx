'use client'

import { useEffect, useState } from 'react'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import rehypePrism from 'rehype-prism-plus'
import rehypeStringify from 'rehype-stringify'
import { MDXProvider } from '@mdx-js/react'
import { MDXComponents } from 'mdx/types'
import { MDXImage } from './mdx-image'

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
      const result = await unified()
        .use(remarkParse)
        .use(remarkRehype)
        .use(rehypePrism)
        .use(rehypeStringify)
        .process(content)
      setHtml(result.toString())
    }

    parseMarkdown()
  }, [content])

  return (
    <MDXProvider components={components}>
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </MDXProvider>
  )
} 