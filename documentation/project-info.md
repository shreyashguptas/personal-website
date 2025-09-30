# Shreyash Gupta - Personal Website & Blog

This is a modern personal website and blog built with Next.js 15, featuring optimized performance, image optimization, and analytics integration.

## 🚀 Features

- **Next.js 15.5.0** with App Router and React 19.1.0
- **Advanced AI-Powered Chat Interface**: Enhanced RAG system with intelligent content type detection
- **Semantic Vector Search**: Advanced chunking with paragraph-aware processing and structure preservation  
- **Content Type Intelligence**: Strong differentiation between projects, blog posts, and resume content
- **Fully optimized images** with automatic WebP/AVIF conversion
- **Dark/Light theme** with system preference detection
- **Static generation** for excellent performance
- **Analytics integration** with Vercel Web Analytics and Speed Insights
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Responsive design** with mobile-first approach
- **Enterprise-grade security** with XSS protection and rate limiting

## 📁 Project Structure

The website includes both a blog and a projects portfolio:

### Blog Posts
- Stored in `/_posts` as Markdown files with front matter
- Automatically converted to optimized HTML with image processing
- Support for cover images and author information
- SEO optimized with proper metadata

### Projects Portfolio
- Stored in `/_projects` as Markdown files
- Features project images, technologies, and live links
- Responsive grid layout with image optimization

## 🖼️ Image Optimization

The website features comprehensive image optimization:

- **Next.js Image component** for all static images
- **Automatic format conversion** to WebP and AVIF
- **Responsive image sizes** (256w to 3840w)
- **Blog image optimization** via custom markdown processor
- **GIF preservation** - animated GIFs maintain animation while getting basic optimization
- **Lazy loading** for improved performance

### Image Processing Pipeline
1. **Component Images**: Use Next.js `<Image>` component with responsive `srcSet`
2. **Blog Images**: Processed through `markdownToHtml.ts` with regex-based optimization
3. **Project Images**: Optimized through React components with proper sizing

## 📊 Analytics & Performance

- **Vercel Web Analytics**: Privacy-friendly visitor tracking
- **Speed Insights**: Core Web Vitals monitoring
- **Optimized builds**: Static generation for all pages
- **Performance-first**: Lazy loading, image optimization, and efficient bundling

## 🔍 SEO & Indexing

- **Environment**: Production defaults to `https://shreyashg.com`. Set `NEXT_PUBLIC_SITE_URL` (no trailing slash) only if you need a different domain.
- **Sitemap**: `/sitemap.xml` generated via `src/app/sitemap.ts`
- **Robots**: `/robots.txt` generated via `src/app/robots.ts` (includes `Sitemap` and `Host`)
- **RSS**: `/feed.xml` generated via `src/app/feed.xml/route.ts`
- **Metadata**: Page-level metadata via Next.js Metadata API
  - Global defaults in `src/app/layout.tsx`
  - Blog index in `src/app/blog/page.tsx`
  - Projects index in `src/app/projects/page.tsx`
  - Post-level `generateMetadata` in `src/app/posts/[slug]/page.tsx`
- **Structured data**: Blog posts include `BlogPosting` JSON-LD
- **Excerpts**: Auto-derived if front matter `excerpt` is missing (see `src/lib/api.ts`)
- See `documentation/seo.md` for full details

## 🎨 Design System

- **Clean typography** with Inter font
- **Automatic theme switching** based on system preference
- **Responsive design** with mobile-first approach
- **Consistent spacing** and component library
- **Accessible colors** with proper contrast ratios

## 🛠️ Tech Stack

### Core Framework
- **Framework**: Next.js 15.5.0 with App Router
- **Runtime**: React 19.1.0 with concurrent features
- **Language**: TypeScript 5.5.2 with strict type checking
- **Build Tool**: Turbopack for optimized development

### AI & Search
- **AI Provider**: OpenAI GPT-5 Mini (400B params, 400K context) and text-embedding-3-small
- **Enhanced Vector Search**: Advanced RAG with semantic chunking and content type intelligence
- **Content Processing**: Markdown parsing with structure preservation and paragraph-aware chunking
- **Intelligent Retrieval**: Strong content type differentiation with dedicated pathways for projects/blog posts/resume
- **Optimized Index**: 70 chunks (reduced from 127) with 2500-character semantic chunks
- **Caching**: In-memory vector index with file watching and TTL management

### Security & Validation
- **Input Validation**: Zod schemas with security filtering
- **XSS Protection**: DOMPurify with custom URL validation
- **Rate Limiting**: Upstash Redis with local fallback
- **Authentication**: API key management (server-side only)

### UI & Styling
- **Styling**: Tailwind CSS 3.4.17 with custom design system
- **Icons**: Lucide React for consistent iconography
- **Theme**: Dark/light mode with system preference detection
- **Accessibility**: ARIA labels and keyboard navigation

### Content & Media
- **Content**: Markdown with front matter (Gray Matter)
- **Images**: Next.js Image component with WebP/AVIF optimization
- **Rich Text**: Custom markdown processor with security features

### Infrastructure
- **Deployment**: Vercel with edge functions
- **Analytics**: Vercel Web Analytics & Speed Insights
- **Database**: File-based with JSON serialization
- **Caching**: Memory-based with TTL expiration

## 📝 Content Management

### Adding Blog Posts
1. Create a new `.md` file in `/_posts`
2. Include front matter with title, date, excerpt, optional `coverImage`, and author
3. Write content in Markdown
4. Images are automatically optimized when referenced

Notes:
- If `coverImage` is provided in front matter, it will be used as the blog post cover image.
- Alternatively, you can set `coverImageIndex` (1-based) to use the nth image from the content.
- If both are omitted, the first image referenced in the Markdown content is used as a fallback.

### Adding Projects
1. Create a new `.md` file in `/_projects`
2. Include front matter with project details
3. Add project image in `/public/project/`
4. Images are automatically optimized

## 🔧 Development

### Scripts
- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production (includes vector index generation)
- `npm run build:index` - Generate/update vector embeddings from content
- `npm run prebuild` - Automatically run before build (embedding generation)
- `npm start` - Start production server
- `npm run lint` - Run ESLint checks

### Key Components
- **InlineChat**: Enhanced AI-powered Q&A with intelligent content type recognition and real-time streaming
- **Advanced RAG System**: Semantic chunking with paragraph-aware processing and universal metadata
- **Content Type Intelligence**: Dedicated retrieval pathways preventing project/blog post confusion
- **ThemeSwitcher**: Automatic dark/light mode with system preference
- **SiteNavigation**: Main navigation with responsive design
- **Image Components**: Optimized image rendering across the site
- **Analytics**: Integrated Vercel analytics and speed monitoring
- **Security Layer**: Multi-tier input validation and XSS protection

## 🌐 Deployment

The website is optimized for Vercel deployment with:
- Static generation for all pages
- Automatic image optimization
- Edge function support
- Built-in analytics integration

Deploy with Vercel: [Deploy](https://vercel.com/new)

## 📈 Performance Optimizations

- **Image Optimization**: Automatic WebP/AVIF conversion with multiple sizes
- **Static Generation**: All pages pre-rendered at build time
- **Code Splitting**: Automatic code splitting with Next.js
- **Font Optimization**: Inter font with display swap
- **Bundle Analysis**: Optimized chunk sizes and loading strategies
