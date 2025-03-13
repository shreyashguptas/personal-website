/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://shreyashg.com',
  generateRobotsTxt: false, // We already have a robots.txt file
  outDir: 'public',
  priority: 0.7,
  changefreq: 'weekly',
  exclude: [
    '/404',
    '/500',
    '/blogs/error',
    '/blogs/not-found',
    '/projects/error',
    '/readings/error'
  ],
  generateIndexSitemap: false,
  // Additional configuration for dynamic routes will be handled in postBuild script
} 