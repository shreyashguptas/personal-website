import Image from 'next/image'
import { DetailedHTMLProps, ImgHTMLAttributes } from 'react'

type Props = DetailedHTMLProps<ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement>

export function MDXImage({ src, alt, ...props }: Props) {
  if (!src) {
    return null
  }

  // Ensure src is absolute for Next.js Image optimization
  const imageSrc = src.startsWith('/') ? src : `/${src}`

  return (
    <div className="my-8">
      <Image
        src={imageSrc}
        alt={alt || ''}
        width={800}
        height={400}
        className="rounded-lg"
        sizes="(max-width: 800px) 100vw, 800px"
        quality={75} // Reduced quality for better performance while maintaining good visuals
        priority={false} // Only set to true for above-the-fold images
        style={{
          maxWidth: '100%',
          height: 'auto',
        }}
      />
    </div>
  )
} 