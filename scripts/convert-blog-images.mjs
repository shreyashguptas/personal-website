import sharp from 'sharp'
import fs from 'fs/promises'
import path from 'path'

const SOURCE_DIR = './public/images/blogs-images'
const OUTPUT_DIR = './public/images/blogs-images-optimized'
const MAX_WIDTH = 1440 // Reduced from 1920px
const TARGET_SIZE_KB = 400 // Target file size in KB
const MIN_QUALITY = 40 // Won't go below this quality
const MAX_QUALITY = 80 // Initial quality

async function ensureOutputDirExists() {
  try {
    await fs.access(OUTPUT_DIR)
  } catch {
    await fs.mkdir(OUTPUT_DIR, { recursive: true })
    console.log('Created output directory:', OUTPUT_DIR)
  }
}

async function optimizeImage(inputPath, outputPath, metadata) {
  let quality = MAX_QUALITY
  let result = null
  
  // Create base pipeline
  const pipeline = sharp(inputPath, { failOnError: false })
    .withMetadata()
    .rotate()

  // Always resize if width is larger than MAX_WIDTH
  if (metadata.width > MAX_WIDTH) {
    pipeline.resize(MAX_WIDTH, null, {
      fit: 'inside',
      withoutEnlargement: true
    })
  }

  // Binary search for optimal quality to meet target size
  while (quality >= MIN_QUALITY) {
    try {
      result = await pipeline
        .webp({
          quality,
          effort: 6,
          nearLossless: false,
          smartSubsample: true // Better quality for text
        })
        .toBuffer({ resolveWithObject: true })

      const sizeMB = result.info.size / 1024 / 1024
      const sizeKB = sizeMB * 1024

      if (sizeKB <= TARGET_SIZE_KB || quality === MIN_QUALITY) {
        // Write the file if we hit target size or min quality
        await fs.writeFile(outputPath, result.data)
        return {
          quality,
          size: result.info.size,
          width: result.info.width,
          height: result.info.height
        }
      }

      // Reduce quality more aggressively if we're far from target
      const reduction = sizeKB > TARGET_SIZE_KB * 2 ? 10 : 5
      quality = Math.max(MIN_QUALITY, quality - reduction)
    } catch (error) {
      console.error('Error processing image:', error)
      throw error
    }
  }
}

async function convertToWebP() {
  try {
    await ensureOutputDirExists()
    const files = await fs.readdir(SOURCE_DIR)
    
    for (const file of files) {
      if (!/\.(jpg|jpeg|png|JPG|JPEG|PNG)$/.test(file)) {
        continue
      }

      const inputPath = path.join(SOURCE_DIR, file)
      const outputPath = path.join(OUTPUT_DIR, `${path.parse(file).name}.webp`)

      // Get image metadata
      const metadata = await sharp(inputPath).metadata()
      
      console.log(`Processing ${file}...`)
      const inputStats = await fs.stat(inputPath)
      const inputSizeKB = inputStats.size / 1024

      // Optimize the image
      const result = await optimizeImage(inputPath, outputPath, metadata)
      const outputSizeKB = result.size / 1024
      const savedSpace = ((inputStats.size - result.size) / inputStats.size * 100).toFixed(2)

      console.log(`✓ Converted ${file} to WebP`)
      console.log(`  Original size: ${(inputSizeKB / 1024).toFixed(2)}MB (${Math.round(inputSizeKB)}KB)`)
      console.log(`  WebP size: ${(outputSizeKB / 1024).toFixed(2)}MB (${Math.round(outputSizeKB)}KB)`)
      console.log(`  Quality used: ${result.quality}`)
      console.log(`  Original dimensions: ${metadata.width}x${metadata.height}`)
      if (metadata.width > MAX_WIDTH) {
        console.log(`  Resized to: ${result.width}x${result.height}`)
      }
      console.log(`  Saved: ${savedSpace}%\n`)
    }

    console.log('All images converted successfully!')
    console.log('Original images preserved in:', SOURCE_DIR)
    console.log('Optimized WebP images saved to:', OUTPUT_DIR)
  } catch (error) {
    console.error('Error converting images:', error)
    process.exit(1)
  }
}

// Run the conversion
convertToWebP() 