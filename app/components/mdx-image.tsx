import Image from 'next/image'
import { DetailedHTMLProps, ImgHTMLAttributes } from 'react'

type Props = DetailedHTMLProps<ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement>

export function MDXImage(props: Props) {
  const { src, alt = '', ...rest } = props

  if (!src) {
    return null
  }

  return (
    <Image
      {...rest}
      src={src}
      alt={alt}
      width={1200}
      height={675}
      className="rounded-lg my-8 w-full h-auto"
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 60vw"
      quality={75}
      style={{
        maxWidth: '100%',
        height: 'auto'
      }}
    />
  )
} 