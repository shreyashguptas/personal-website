# Blog System Documentation

## Overview

The blog system uses static markdown files for content management, providing fast loading times and excellent SEO.

## File Structure

```
/posts          - Blog post markdown files
/public/images
  /blog         - Blog post cover images
  /authors      - Author profile pictures
/lib/blog.ts    - Blog processing utilities
/app/blogs      - Blog pages
```

## Creating a New Blog Post

1. Create a new markdown file in the `/posts` directory:
   ```
   posts/my-new-post.md
   ```

2. Add frontmatter at the top of the file:
   ```markdown
   ---
   title: 'My Blog Post Title'
   excerpt: 'A brief description of the post'
   coverImage: '/images/blog/cover.jpg'
   date: '2024-01-20'
   author:
     name: 'Your Name'
     picture: '/images/authors/avatar.jpg'
   ---
   ```

3. Write your content using standard markdown:
   ```markdown
   # Introduction
   
   Your content here...
   
   ## Subheading
   
   More content...
   ```

## Frontmatter Fields

- **title** (required): The title of your blog post
- **excerpt** (required): A brief description shown in the blog list
- **date** (required): Publication date in YYYY-MM-DD format
- **coverImage** (optional): Path to the cover image
- **author** (optional): Author information
  - **name**: Author's name
  - **picture**: Path to author's profile picture

## Markdown Features

The blog system supports:
- Headers (h1-h6)
- Bold and italic text
- Links
- Images
- Code blocks with syntax highlighting
- Lists (ordered and unordered)
- Blockquotes
- Tables
- Horizontal rules

## Image Management

1. Place cover images in `/public/images/blog/`
2. Place author pictures in `/public/images/authors/`
3. Reference them in your markdown:
   ```markdown
   coverImage: '/images/blog/my-image.jpg'
   ```

## Code Blocks

Use triple backticks with language specification for syntax highlighting:

```markdown
```javascript
function hello() {
  console.log('Hello, World!');
}
```
```

## Deployment

The blog posts are statically generated at build time. When you add or update posts:

1. Commit your changes
2. Push to your repository
3. The deployment will automatically rebuild with the new content

## Styling

Blog posts use Tailwind Typography plugin with custom styling defined in `/app/globals.css`. The prose classes handle typography automatically.

## Best Practices

1. Use descriptive file names (URL slugs)
2. Optimize images before uploading
3. Keep excerpts concise (1-2 sentences)
4. Use consistent date formatting
5. Include relevant metadata for SEO
6. Test your markdown locally before deploying