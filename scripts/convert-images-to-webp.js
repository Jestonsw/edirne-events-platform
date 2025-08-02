// Use tsx for TypeScript support
const { execSync } = require('child_process')
const path = require('path')
const fs = require('fs')

// Create a temporary CommonJS wrapper
const conversionScript = `
import { db } from './src/lib/db';
import { imageStorage } from './src/lib/schema';
import { eq } from 'drizzle-orm';
import sharp from 'sharp';

async function convertImagesToWebP() {
  try {
    console.log('🔄 Starting WebP conversion process...');
    
    // Get all images from database
    const images = await db.select().from(imageStorage);
    console.log(\`📊 Found \${images.length} images to process\`);
    
    let convertedCount = 0;
    let skippedCount = 0;
    
    for (const image of images) {
      // Skip if already WebP
      if (image.contentType === 'image/webp') {
        console.log(\`⏭️  Skipping \${image.filename} (already WebP)\`);
        skippedCount++;
        continue;
      }
      
      try {
        // Decode base64
        const originalBuffer = Buffer.from(image.dataBase64, 'base64');
        console.log(\`🔄 Converting \${image.filename} (\${originalBuffer.length} bytes)\`);
        
        // Convert to WebP
        const webpBuffer = await sharp(originalBuffer)
          .webp({ 
            quality: 80,
            effort: 4
          })
          .resize(1200, 1200, { 
            fit: 'inside',
            withoutEnlargement: true 
          })
          .toBuffer();
        
        // Update filename to .webp
        const newFilename = image.filename.replace(/\\.(jpg|jpeg|png)$/i, '.webp');
        
        // Update database
        await db.update(imageStorage)
          .set({
            filename: newFilename,
            contentType: 'image/webp',
            dataBase64: webpBuffer.toString('base64')
          })
          .where(eq(imageStorage.id, image.id));
        
        console.log(\`✅ Converted \${image.filename} → \${newFilename}\`);
        console.log(\`📊 Size: \${originalBuffer.length} → \${webpBuffer.length} bytes (\${Math.round((1 - webpBuffer.length/originalBuffer.length) * 100)}% reduction)\`);
        
        convertedCount++;
        
      } catch (error) {
        console.error(\`❌ Failed to convert \${image.filename}:\`, error);
      }
    }
    
    console.log(\`\\n🎉 Conversion complete!\`);
    console.log(\`✅ Converted: \${convertedCount} images\`);
    console.log(\`⏭️  Skipped: \${skippedCount} images\`);
    
  } catch (error) {
    console.error('❌ Conversion script failed:', error);
  }
}

// Run the conversion
convertImagesToWebP().then(() => {
  console.log('🔄 Script finished');
  process.exit(0);
}).catch(error => {
  console.error('❌ Script error:', error);
  process.exit(1);
});
`;

// Write temp script and run with tsx
fs.writeFileSync('/tmp/webp-convert.ts', conversionScript);
execSync('cd /home/runner/workspace/edirne-events-v2 && npx tsx /tmp/webp-convert.ts', { 
  stdio: 'inherit',
  cwd: '/home/runner/workspace/edirne-events-v2'
});