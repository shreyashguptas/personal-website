declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'production'
  }
}

declare module '*.mdx' {
  let MDXComponent: (props: any) => JSX.Element
  export default MDXComponent
}

declare module 'next/types' {
  interface PageProps {
    params: { [key: string]: string }
    searchParams?: { [key: string]: string | string[] | undefined }
  }
} 