import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Base URL for the site
const BASE_URL = 'https://shreyashg.com';

async function generateSitemap() {
  try {
    console.log('Fetching dynamic routes from database...');
    
    // Get database credentials from environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase credentials. Using existing sitemap without adding dynamic routes.');
      return;
    }
    
    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Fetch all blog slugs
    const { data: blogs, error: blogsError } = await supabase
      .from('blogs')
      .select('slug')
      .eq('status', 'published');
    
    if (blogsError) {
      throw blogsError;
    }
    
    // Read the existing sitemap.xml file
    const sitemapPath = path.join(process.cwd(), 'public', 'sitemap.xml');
    let sitemapContent = fs.readFileSync(sitemapPath, 'utf8');
    
    // Find the closing </urlset> tag
    const closingTag = '</urlset>';
    const closingTagIndex = sitemapContent.lastIndexOf(closingTag);
    
    if (closingTagIndex === -1) {
      throw new Error('Invalid sitemap.xml format: missing </urlset> closing tag');
    }
    
    // Prepare the dynamic URLs content
    let dynamicUrlsContent = '';
    
    // Add blog URLs
    for (const blog of blogs) {
      dynamicUrlsContent += `
  <url>
    <loc>${BASE_URL}/blogs/${blog.slug}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`;
    }
    
    // Insert the dynamic URLs before the closing tag
    const updatedSitemapContent = 
      sitemapContent.substring(0, closingTagIndex) + 
      dynamicUrlsContent + 
      sitemapContent.substring(closingTagIndex);
    
    // Write the updated sitemap back to the file
    fs.writeFileSync(sitemapPath, updatedSitemapContent);
    
    console.log(`Sitemap updated with ${blogs.length} dynamic blog routes`);
  } catch (error) {
    console.error('Error generating sitemap:', error);
    process.exit(1);
  }
}

generateSitemap(); 