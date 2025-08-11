# Design System Documentation

## Overview
This website uses a clean, modern design system with automatic dark/light mode detection and comprehensive image optimization. The design emphasizes typography, performance, and user experience while maintaining excellent accessibility.

## Color Scheme

### Light Mode
- **Background**: White (`bg-white`)
- **Text**: Black (`text-black`)
- **Muted Text**: Gray-600 (`text-gray-600`)
- **Borders**: Gray-200 (`border-gray-200`)
- **Accent**: Blue tones for links and interactive elements

### Dark Mode
- **Background**: Black (`bg-black`)
- **Text**: White (`text-white`)
- **Muted Text**: Gray-400 (`text-gray-400`)
- **Borders**: Gray-800 (`border-gray-800`)
- **Accent**: Lighter blue tones for links and interactive elements

## Typography

### Font Family
- **Primary**: Inter font with `font-display: swap` for optimal loading
- **Fallback**: System font stack for progressive enhancement

### Heading Hierarchy
- **Hero Title**: `text-5xl md:text-8xl font-bold tracking-tighter leading-tight`
  - Used for main "Blog." and "Projects." headings
- **Page Titles**: `text-4xl md:text-6xl font-bold tracking-tighter leading-tight`
  - Used for individual post and project titles
- **Section Headings**: `text-3xl leading-snug font-bold`
  - Used for major sections within content
- **Subsection Headings**: `text-2xl leading-snug font-semibold`
  - Used for smaller content sections

### Body Text
- **Large Text**: `text-lg leading-relaxed`
  - Used for excerpts, introductions, and emphasized content
- **Regular Text**: `text-base leading-relaxed`
  - Standard body text for articles and descriptions
- **Small Text**: `text-sm`
  - Used for metadata, dates, and secondary information

## Theme System

### Theme Switcher Component
- **Location**: Top-right corner of the header
- **Modes**: System (auto), Light, Dark
- **Persistence**: Uses `next-themes` with localStorage
- **Smooth Transitions**: `transition-colors duration-200`

### Implementation
```tsx
// Theme-aware styling pattern
className="bg-white dark:bg-black text-black dark:text-white"
```

## Image Optimization System

### Next.js Image Component Usage
- **Responsive sizing**: Automatic `srcSet` generation (256w to 3840w)
- **Format optimization**: Automatic WebP/AVIF conversion
- **Lazy loading**: Built-in intersection observer
- **Priority loading**: For above-the-fold images

### Blog Image Processing
- **Markdown images**: Automatically converted to optimized URLs
- **Processing pipeline**: `markdownToHtml.ts` with regex-based optimization
- **GIF preservation**: Animated GIFs maintain animation with basic optimization

### Project Images
- **Component-based**: Uses Next.js `<Image>` with responsive props
- **Consistent sizing**: Standardized aspect ratios and dimensions

## Layout Components

### Container
- **Max Width**: Responsive container with proper padding
- **Usage**: Wraps all main content for consistent layout
- **Responsive**: Adapts padding and margins across breakpoints

### Navigation Components
- **SiteNavigation**: Main navigation with responsive design
- **MinimalNavigation**: Simplified navigation for content pages
- **Social Links**: Consistent icon styling and hover states

### Content Components
- **PostPreview**: Blog post cards with optimized images
- **ProjectPreview**: Project showcase cards with responsive layouts
- **SectionSeparator**: Consistent spacing between content sections

## Interactive Elements

### Links and Buttons
- **Default Links**: `text-blue-600 dark:text-blue-400 underline`
- **Hover States**: `hover:text-blue-800 dark:hover:text-blue-300`
- **Transitions**: `duration-200 transition-colors`
- **Focus States**: Visible focus rings for accessibility

### Image Interactions
- **Hover Effects**: Subtle scale transforms on project images
- **Loading States**: Smooth transitions with blur placeholders
- **Error Handling**: Graceful fallbacks for failed image loads

## Component Architecture

### Theme-Aware Components
All components follow the theme-aware pattern:
```tsx
// Example component with theme support
export default function Component() {
  return (
    <div className="bg-white dark:bg-black text-black dark:text-white">
      <h2 className="text-gray-600 dark:text-gray-400">
        Content with theme support
      </h2>
    </div>
  );
}
```

### Performance Components
- **Lazy Loading**: All images use lazy loading by default
- **Code Splitting**: Components are automatically split
- **Static Generation**: All pages pre-rendered at build time

## Analytics Integration

### Vercel Analytics
- **Privacy-friendly**: No cookies, GDPR compliant
- **Performance tracking**: Page views and user interactions
- **Real-time insights**: Live visitor data

### Speed Insights
- **Core Web Vitals**: LCP, FID, CLS monitoring
- **Performance metrics**: Load times and optimization scores
- **User experience**: Real user monitoring data

## SEO Integration

- Canonical URLs: Managed via Next.js Metadata API. Global canonical `/` in `src/app/layout.tsx`; per-page canonicals for `/blog`, `/projects`, and each post.
- Open Graph/Twitter: Defaults in layout; per-post overrides include absolute image URLs when available.
- Structured Data: `BlogPosting` JSON-LD injected on post pages.
- Discovery: `/sitemap.xml` and `/robots.txt` generated at build/runtime; `/feed.xml` for subscribers and discovery tools.
- Base URL: Production defaults to `https://shreyashg.com`. Set `NEXT_PUBLIC_SITE_URL` only if you need a different canonical domain.

## Responsive Design

### Breakpoints (Tailwind CSS)
- **sm**: 640px and up
- **md**: 768px and up
- **lg**: 1024px and up
- **xl**: 1280px and up

### Mobile-First Approach
- Base styles target mobile devices
- Progressive enhancement for larger screens
- Touch-friendly interactive elements

## Accessibility Features

### Color Contrast
- **WCAG AA compliance**: All color combinations meet contrast requirements
- **Theme consistency**: Both light and dark modes fully accessible
- **Focus indicators**: Clear visual focus states

### Semantic HTML
- **Proper heading hierarchy**: h1 → h2 → h3 structure
- **Alt text**: All images include descriptive alt attributes
- **ARIA labels**: Enhanced accessibility for interactive elements

## Creating New Components

### Component Guidelines
1. **Theme Awareness**: Always include dark mode variants
2. **Responsive Design**: Mobile-first approach with breakpoint classes
3. **Performance**: Use Next.js Image for all images
4. **Accessibility**: Include proper ARIA attributes and semantic HTML
5. **TypeScript**: Full type safety with proper interfaces

### Example New Component
```tsx
import Image from "next/image";

interface ComponentProps {
  title: string;
  description: string;
  imageUrl: string;
}

export default function NewComponent({ title, description, imageUrl }: ComponentProps) {
  return (
    <div className="bg-white dark:bg-black rounded-lg overflow-hidden transition-colors duration-200">
      <Image
        src={imageUrl}
        alt={title}
        width={400}
        height={200}
        className="w-full h-auto"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />
      <div className="p-6">
        <h3 className="text-2xl font-semibold text-black dark:text-white mb-2">
          {title}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
}
```

## Development Guidelines

### Code Quality
- **ESLint**: Zero warnings/errors in production
- **TypeScript**: Strict type checking enabled
- **Performance**: Lighthouse scores above 90 for all metrics

### Testing Approach
- **Build Verification**: Production builds must succeed
- **Route Testing**: All pages must load without errors
- **Image Optimization**: Verify WebP/AVIF conversion is working
- **Theme Testing**: Both light and dark modes fully functional

### Deployment Checklist
- [ ] TypeScript compilation passes
- [ ] ESLint shows no errors
- [ ] Production build succeeds
- [ ] All routes accessible
- [ ] Images optimized correctly
- [ ] Analytics functioning
- [ ] Theme switching works 