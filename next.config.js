/* eslint-env node */
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Enable modern image formats (WebP, AVIF)
    formats: ['image/avif', 'image/webp'],
    
    // Image optimization settings
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    
    // Enable placeholder blur for better UX
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self'; media-src 'self'; object-src 'none'; frame-src 'none'; base-uri 'self'; form-action 'self';",
    
    // Custom loader configuration to handle different image types
    loader: 'default',
    
    // Domains for external images (if any)
    domains: [],
    
    // Disable static imports optimization for GIFs to preserve animation
    disableStaticImages: false,
  },
  
  // Enable experimental features for better performance
  experimental: {
    // Enable image optimization for better performance
    optimizePackageImports: ['next/image'],
  },

  // Rewrites for PostHog ingestion
  async rewrites() {
    return [
      {
        source: "/ingest/static/:path*",
        destination: "https://us-assets.i.posthog.com/static/:path*",
      },
      {
        source: "/ingest/:path*",
        destination: "https://us.i.posthog.com/:path*",
      },
    ]
  },

  // This is required to support PostHog trailing slash API requests
  skipTrailingSlashRedirect: true,
};

module.exports = nextConfig;