import { serialize } from 'next-mdx-remote/serialize'
import rehypePrism from 'rehype-prism-plus'
import remarkGfm from 'remark-gfm'
import { MDXRemoteSerializeResult } from 'next-mdx-remote'

interface CompileMDXResult {
  source: MDXRemoteSerializeResult | string
}

export async function compileMDX(source: string): Promise<CompileMDXResult> {
  if (!source) return { source: '' }

  try {
    // Serialize MDX content with syntax highlighting
    const mdxSource = await serialize(source, {
      parseFrontmatter: true,
      mdxOptions: {
        development: process.env.NODE_ENV === 'development',
        remarkPlugins: [remarkGfm],
        // @ts-ignore - Types are incorrect but the plugin works
        rehypePlugins: [rehypePrism],
      },
    })

    return { source: mdxSource }
  } catch (error) {
    console.error('Error compiling MDX:', error)
    return { source: '**Error processing content**' }
  }
} 