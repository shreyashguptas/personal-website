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
    contentSecurityPolicy: "default-src 'self'; script-src 'self' 'nonce-{nonce}'; style-src 'self' 'nonce-{nonce}'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://us.i.posthog.com https://us-assets.i.posthog.com; media-src 'self'; object-src 'none'; frame-src 'none'; base-uri 'self'; form-action 'self';",
    
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

  // Set output file tracing root to avoid workspace detection issues
  outputFileTracingRoot: __dirname,

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

  // Security headers (replaces middleware for zero runtime cost)
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
          { key: "X-DNS-Prefetch-Control", value: "off" },
          { key: "X-Download-Options", value: "noopen" },
          { key: "X-Permitted-Cross-Domain-Policies", value: "none" },
        ],
      },
    ];
  },
};

module.exports = nextConfig;