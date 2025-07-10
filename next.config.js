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
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    
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
};

module.exports = nextConfig; 