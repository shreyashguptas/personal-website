import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';

const sizes = {
  favicon: 32,
  favicon96: 96,
  apple: 180,
  manifest192: 192,
  manifest512: 512
};

async function generateFavicons() {
  const inputImage = 'public/images/headshot.jpg';
  
  // Create square versions of the image for each size
  for (const [name, size] of Object.entries(sizes)) {
    const image = sharp(inputImage);
    
    // Resize maintaining aspect ratio and center crop to square
    await image
      .resize(size, size, {
        fit: 'cover',
        position: 'centre'
      })
      .toFormat('png')
      .toFile(`public/${name === 'favicon' ? 'favicon.ico' : `${name}.png`}`);
  }

  // Generate webmanifest
  const manifest = {
    name: 'Shreyash Gupta',
    short_name: 'Shreyash',
    icons: [
      {
        src: '/manifest192.png',
        sizes: '192x192',
        type: 'image/png'
      },
      {
        src: '/manifest512.png',
        sizes: '512x512',
        type: 'image/png'
      }
    ],
    theme_color: '#ffffff',
    background_color: '#ffffff',
    display: 'standalone'
  };

  await fs.writeFile(
    'public/site.webmanifest',
    JSON.stringify(manifest, null, 2),
    'utf-8'
  );
}

generateFavicons().catch(console.error); 