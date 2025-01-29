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
  experimental: {
    mdxRs: false,
    esmExternals: 'loose',
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      }
    }
    // Suppress punycode warning
    config.ignoreWarnings = [
      { module: /node_modules\/punycode/ }
    ]
    return config
  },
}

module.exports = withBundleAnalyzer(nextConfig)
