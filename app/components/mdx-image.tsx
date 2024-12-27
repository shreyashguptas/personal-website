import Image from 'next/image'
import { DetailedHTMLProps, ImgHTMLAttributes } from 'react'

type Props = DetailedHTMLProps<ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement>

export function MDXImage({ src, alt, ...props }: Props) {
  if (!src) {
    return null
  }

  return (
    <Image
      src={src}
      alt={alt || ''}
      width={800}
      height={400}
      className="rounded-lg"
      sizes="(max-width: 800px) 100vw, 800px"
      quality={100}
      style={{
        maxWidth: '100%',
        height: 'auto',
      }}
    />
  )
} 