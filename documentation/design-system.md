# Design System Documentation

## Overview
This website uses a clean, modern design system with automatic dark/light mode detection and comprehensive image optimization. The design emphasizes typography, performance, and user experience while maintaining excellent accessibility.

## Color Scheme

### Premium Neutral Palette with Warm Tones
The website uses a sophisticated color system with HSL CSS variables for consistent theming:

#### Light Mode
- **Background**: `hsl(40, 10%, 98%)` - Warm near-white
- **Foreground**: `hsl(240, 10%, 5%)` - Deep charcoal
- **Muted Background**: `hsl(60, 5%, 96%)` - Subtle warm gray
- **Muted Foreground**: `hsl(240, 5%, 45%)` - Medium gray
- **Accent**: `hsl(240, 5%, 93%)` - Light accent gray
- **Primary**: `hsl(240, 10%, 10%)` - Rich black
- **Border**: `hsl(240, 6%, 90%)` - Soft border gray

#### Dark Mode
- **Background**: `hsl(240, 10%, 5%)` - Deep dark
- **Foreground**: `hsl(40, 10%, 98%)` - Warm white
- **Muted Background**: `hsl(240, 5%, 10%)` - Subtle dark gray
- **Muted Foreground**: `hsl(240, 5%, 60%)` - Medium light gray
- **Accent**: `hsl(240, 5%, 15%)` - Dark accent
- **Primary**: `hsl(40, 10%, 98%)` - Bright primary
- **Border**: `hsl(240, 6%, 20%)` - Soft border dark

### Usage
```css
/* Use semantic color variables */
bg-background text-foreground
bg-accent text-accent-foreground
border-border
text-muted-foreground
```

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

## Premium Shadow System

Custom shadow system for depth and elevation:

### Shadow Classes
- **Extra Small**: `shadow-premium-xs` - Subtle depth for small elements
- **Small**: `shadow-premium-sm` - Cards and buttons
- **Medium**: `shadow-premium-md` - Elevated cards and containers
- **Large**: `shadow-premium-lg` - Modal dialogs and popovers
- **Extra Large**: `shadow-premium-xl` - Maximum elevation

### Implementation
```css
/* Light mode shadows */
--shadow-xs: 0 1px 2px 0 rgb(0 0 0 / 0.05);
--shadow-sm: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
--shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);

/* Dark mode shadows - slightly stronger */
--shadow-xs: 0 1px 2px 0 rgb(0 0 0 / 0.3);
/* ... etc */
```

## Utility Classes

### Premium Utilities
- **`transition-premium`**: Smooth transitions for hover effects
- **`glass-subtle`**: Subtle backdrop blur for layered UI
- **`card-elevated`**: Premium card styling with hover effects
- **`text-gradient-premium`**: Subtle text gradients
- **`hover-lift`**: Smooth hover micro-interactions with scale and translate
- **`animate-fade-in`**: Fade-in animation for content reveals

### Usage Examples
```tsx
// Elevated card with hover effect
<div className="card-elevated hover-lift">
  {/* Content */}
</div>

// Fade-in animation
<div className="animate-fade-in">
  {/* Content */}
</div>
```

## Interactive Elements

### Links and Buttons
- **Default Links**: Semantic color with hover transitions
- **Hover States**: `hover:text-muted-foreground transition-colors duration-200`
- **Transitions**: `transition-premium` for smooth interactions
- **Focus States**: Visible focus rings for accessibility
- **Primary Buttons**: `bg-primary text-primary-foreground` with shadow elevation

### Keyboard Shortcuts
- **Kbd Component**: Displays keyboard shortcuts with OS detection
- **Platform Awareness**: Shows ⌘ on Mac, Ctrl on Windows/Linux
- **Styling**: `text-sm font-mono font-semibold` with subtle background
- **Usage**: Navigation (⌘1-3), Chat (/, 1-3, Enter)

### Image Interactions
- **Hover Effects**: Scale transforms (`group-hover:scale-[1.02]`) on project images
- **Glow Effects**: Headshot with hover glow and enhanced shadows
- **Loading States**: Smooth transitions with blur placeholders
- **Error Handling**: Graceful fallbacks for failed image loads

### Custom Cursor
- **Custom Cursor Component**: Circle cursor that follows mouse movement
- **Hover Intent**: Hides on clickable elements, shows on hover elements
- **Smooth Tracking**: Uses transform for GPU-accelerated positioning

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

## Keyboard Accessibility

### Global Keyboard Shortcuts
- **Navigation**: `⌘1` (Home), `⌘2` (Blog), `⌘3` (Projects)
- **Chat Focus**: `/` to focus chat input
- **Quick Actions**: `1`, `2`, `3` for quick start questions
- **Submit**: `Enter` to send chat messages

### Implementation
- **OS Detection**: Automatically shows ⌘ on Mac, Ctrl on Windows/Linux
- **Visual Hints**: Kbd badges on all interactive elements
- **Provider**: `KeyboardShortcutsProvider` for global shortcuts
- **Hook**: `useKeyboardShortcuts` for custom shortcuts

## Accessibility Features

### Color Contrast
- **WCAG AA compliance**: All color combinations meet contrast requirements
- **Theme consistency**: Both light and dark modes fully accessible
- **Focus indicators**: Clear visual focus states with premium styling

### Semantic HTML
- **Proper heading hierarchy**: h1 → h2 → h3 structure
- **Alt text**: All images include descriptive alt attributes
- **ARIA labels**: Enhanced accessibility for interactive elements
- **Keyboard Navigation**: Full keyboard support with visible shortcuts

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