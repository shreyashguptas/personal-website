import { serialize } from 'next-mdx-remote/serialize'
import rehypePrism from 'rehype-prism-plus'
import remarkGfm from 'remark-gfm'
import type { MDXRemoteSerializeResult } from 'next-mdx-remote'

interface CompileMDXResult {
  source: MDXRemoteSerializeResult | string
}

export async function compileMDX(source: string): Promise<CompileMDXResult> {
  if (!source) return { source: '' }

  try {
    const mdxSource = await serialize(source, {
      parseFrontmatter: true,
      mdxOptions: {
        remarkPlugins: [remarkGfm],
        rehypePlugins: [[rehypePrism, { ignoreMissing: true }]],
      },
    })

    return { source: mdxSource }
  } catch (error) {
    console.error('Error compiling MDX:', error)
    return { source: '**Error processing content**' }
  }
} 