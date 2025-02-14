const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ['js', 'jsx', 'mdx', 'ts', 'tsx'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      ...(process.env.NEXT_PUBLIC_SUPABASE_URL ? [{
        protocol: 'https',
        hostname: new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname,
        pathname: '/storage/v1/object/public/**',
      }] : [])
    ],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],  // Optimize for common sizes
    imageSizes: [16, 32, 48, 64, 96, 128, 256],      // Optimize for common sizes
    formats: ['image/webp', 'image/avif'],           // Add AVIF support
    minimumCacheTTL: 31536000,                       // Cache for 1 year
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  output: 'standalone',
  reactStrictMode: true,
  poweredByHeader: false,

  // Performance Optimizations for both Development and Production
  onDemandEntries: {
    // Keep pages in memory for longer during development
    maxInactiveAge: 60 * 60 * 1000, // 1 hour
    pagesBufferLength: 5,
  },
  
  // Compiler options
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Experimental features
  experimental: {
    optimizeCss: true,
    webpackBuildWorker: true,
  },

  // Server configuration
  serverExternalPackages: [], // Updated from serverComponentsExternalPackages

  webpack: (config, { dev, isServer }) => {
    // Shared optimizations for both dev and prod
    config.optimization = {
      ...config.optimization,
      runtimeChunk: 'single',
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            priority: 20,
          },
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            priority: 10,
            reuseExistingChunk: true,
            enforce: true,
          },
        },
      },
    }

    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      }
    }

    // Development-specific optimizations
    if (dev) {
      // Enable fast refresh with minimal overhead
      config.optimization.moduleIds = 'named'
      config.optimization.chunkIds = 'named'
    }

    // Suppress punycode warning
    config.ignoreWarnings = [
      { module: /node_modules\/punycode/ }
    ]

    return config
  },
  transpilePackages: ['next-mdx-remote']
}

// Set higher memory limit for Node.js
if (process.env.NODE_ENV === 'development') {
  process.env.NODE_OPTIONS = process.env.NODE_OPTIONS || '--max-old-space-size=4096'
}

module.exports = withBundleAnalyzer(nextConfig)
