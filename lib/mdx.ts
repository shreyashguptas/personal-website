import { serialize } from 'next-mdx-remote/serialize'
import rehypePrism from 'rehype-prism-plus'
import remarkGfm from 'remark-gfm'
import { MDXRemoteSerializeResult } from 'next-mdx-remote'
import { unstable_cache } from 'next/cache'

interface CompileMDXResult {
  source: MDXRemoteSerializeResult | string
}

// Cache MDX compilation results
const CACHE_DURATION = 7 * 24 * 60 * 60  // Cache for a week

export async function compileMDX(source: string): Promise<CompileMDXResult> {
  if (!source) return { source: '' }

  // Cache the MDX compilation result
  return unstable_cache(
    async () => {
      try {
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
    },
    [`mdx-${Buffer.from(source).toString('base64').slice(0, 32)}`],
    {
      revalidate: CACHE_DURATION,
      tags: ['mdx']
    }
  )()
} 