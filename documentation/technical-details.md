# Technical Documentation

## Project Overview
- Framework: Next.js 15.1.0
- Language: TypeScript
- Package Manager: npm
- Database: Supabase
- Content: MDX for blog posts
- Styling: Tailwind CSS

## Code Organization

### Directory Structure
```
/app
  /about      - About page and components
  /blogs      - Blog system with Supabase integration
  /components - Shared components
  /projects   - Projects showcase
  /readings   - Reading list and trends
  /utils      - Shared utilities
/documentation - Project documentation
/lib          - External service clients (Supabase)
/public       - Static assets
/scripts      - Build and utility scripts
```

### Key Dependencies
Essential dependencies that should not be removed:
- `@mdx-js/*` - MDX processing
- `@supabase/*` - Database integration
- `@vercel/*` - Analytics and performance insights
- `date-fns` - Date formatting
- `unified` + plugins - MDX content processing
- `tailwindcss` + plugins - Styling

## Key Technical Decisions

### Dynamic Route Handling
In Next.js 15.1, dynamic routes (like `/blogs/[slug]`) require specific handling of params:

```typescript
interface PageProps {
  params: Promise<{ slug: string }> // Note: params must be treated as a Promise
}

// Dynamic route configuration
export const dynamic = 'error'      // Proper error handling
export const dynamicParams = true   // Enable dynamic parameters
export const revalidate = 3600      // Cache invalidation time (1 hour)

// Example implementation
export default async function DynamicPage({ params }: PageProps): Promise<ReactElement> {
  try {
    const { slug } = await params   // Must await params
    // ... rest of the implementation
  } catch (error) {
    console.error('Error:', error)
    notFound()
  }
}
```

### Common Issues and Solutions

#### 1. Type Error with Dynamic Routes
If you encounter this error:
```
Type error: Type '{ params: { slug: string; }; }' does not satisfy the constraint 'PageProps'.
Types of property 'params' are incompatible.
```

Solution:
- Ensure params are typed as a Promise
- Await the params before using them
- Add proper error handling
- Use explicit return type annotations

#### 2. MDX Content Handling
- MDX content is processed using unified.js pipeline
- Custom components can be provided via MDXProvider
- Images in MDX are handled by a custom MDXImage component

### Database Structure (Supabase)

#### Blogs Table
```sql
create type blog_status as enum ('published', 'draft');

create table blogs (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text not null,
  content text not null,
  date timestamp with time zone default timezone('utc'::text, now()) not null,
  slug text not null unique,
  status blog_status default 'draft'::blog_status not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);
```

### Build Process
- Uses Next.js built-in build system
- Static pages are pre-rendered at build time
- Dynamic routes use generateStaticParams for static generation
- ISR (Incremental Static Regeneration) is configured per route

### Environment Variables
Required environment variables:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key
```

### Best Practices
1. Always handle async operations with try/catch
2. Use proper TypeScript types for all components
3. Implement proper error boundaries and fallbacks
4. Follow Next.js 15.1 conventions for dynamic routes
5. Use proper caching strategies (ISR) for dynamic content
6. Keep dependencies minimal and up-to-date
7. Remove unused code and dependencies promptly
8. Centralize shared types and utilities

### Performance Considerations
- Images are optimized using Next.js Image component
- MDX content is processed on the server side
- Static generation is used where possible
- Dynamic routes use ISR for optimal performance
- Client-side JavaScript is minimized
- Dependencies are kept minimal
- Unused code is regularly cleaned up 