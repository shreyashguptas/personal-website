# Design System Documentation

## Overview
This website uses a clean black/white design system with dark mode support. The design emphasizes typography and simplicity while maintaining excellent readability.

## Color Scheme

### Light Mode
- **Background**: White (`bg-white`)
- **Text**: Black (`text-black`)
- **Muted Text**: Gray-600 (`text-gray-600`)
- **Borders**: Gray-200 (`border-gray-200`)

### Dark Mode
- **Background**: Black (`bg-black`)
- **Text**: White (`text-white`)
- **Muted Text**: Gray-400 (`text-gray-400`)
- **Borders**: Gray-800 (`border-gray-800`)

## Typography

### Headings
- **Main Title**: `text-5xl md:text-8xl font-bold tracking-tighter leading-tight`
  - Used for the main "Blog." heading
- **Section Headings**: `text-3xl leading-snug`
  - Used for post titles and major sections
- **Subsection Headings**: `text-2xl leading-snug`
  - Used for smaller headings

### Body Text
- **Large Text**: `text-lg leading-relaxed`
  - Used for excerpts and important content
- **Regular Text**: Default size
  - Used for most body content

## Layout Components

### Container
- Uses the `Container` component for consistent max-width and padding
- Automatically adapts to theme colors

### Section Separator
- Uses `SectionSeparator` component
- Creates consistent spacing between sections
- Automatically adapts border colors to theme

### Theme Switcher
- Positioned in the top-right corner
- Supports system, light, and dark modes
- Smooth transitions between themes

## Interactive Elements

### Links
- **Default**: `underline`
- **Hover**: `hover:text-gray-600 dark:hover:text-gray-400`
- **Transition**: `duration-200 transition-colors`

### Buttons
- Use consistent hover states with theme-appropriate colors
- Maintain accessibility with proper contrast ratios

## Creating New Pages

When creating new pages, follow these guidelines:

1. **Use the Container component** for consistent layout
2. **Apply theme-aware colors** using Tailwind's dark: prefix
3. **Maintain typography hierarchy** using the established heading sizes
4. **Use consistent spacing** (mt-16, mb-16, etc.)
5. **Test in both light and dark modes**

### Example Page Structure
```tsx
import Container from "@/app/_components/container";

export default function NewPage() {
  return (
    <main>
      <Container>
        <h1 className="text-5xl md:text-8xl font-bold tracking-tighter leading-tight">
          Page Title
        </h1>
        <div className="text-lg leading-relaxed">
          Content goes here...
        </div>
      </Container>
    </main>
  );
}
```

## CSS Classes Reference

### Background Colors
- `bg-white dark:bg-black` - Main background
- `bg-gray-50 dark:bg-gray-900` - Secondary background

### Text Colors
- `text-black dark:text-white` - Primary text
- `text-gray-600 dark:text-gray-400` - Muted text

### Border Colors
- `border-gray-200 dark:border-gray-800` - Standard borders

### Transitions
- `transition-colors duration-200` - Smooth color transitions

## Accessibility
- All color combinations meet WCAG contrast requirements
- Theme switching preserves user preferences
- Focus states are clearly visible in both themes 