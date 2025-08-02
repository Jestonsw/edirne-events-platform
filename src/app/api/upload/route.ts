import { NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { db } from '@/lib/db'
import { sql } from 'drizzle-orm'
import { imageStorage } from '@/lib/schema'
import sharp from 'sharp'

export async function POST(request: Request) {
  try {
    const data = await request.formData()
    const file: File | null = (data.get('file') || data.get('image')) as unknown as File

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 })
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File too large' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    
    // Create unique filename with .webp extension
    const timestamp = Date.now()
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const filename = `event_${timestamp}_${originalName.replace(/\.(jpg|jpeg|png|webp)$/i, '')}.webp`
    
    // Convert image to WebP format using Sharp
    let processedBuffer: Buffer
    try {
      processedBuffer = await sharp(buffer)
        .webp({ 
          quality: 80,  // Good quality/size balance
          effort: 4     // Compression effort
        })
        .resize(1200, 1200, { 
          fit: 'inside',
          withoutEnlargement: true 
        })
        .toBuffer()
      
      console.log(`🔄 Image converted to WebP: ${filename}`)
      console.log(`📊 Size reduction: ${file.size} bytes → ${processedBuffer.length} bytes`)
      
    } catch (sharpError) {
      console.error('Sharp conversion failed:', sharpError)
      // Fallback to original buffer
      processedBuffer = buffer
    }
    
    // Try to store in database first using Drizzle ORM
    try {
      const base64Data = processedBuffer.toString('base64')
      console.log(`🔄 Attempting database storage for ${filename}, size: ${processedBuffer.length} bytes`)
      
      await db.insert(imageStorage).values({
        filename: filename,
        contentType: 'image/webp',
        dataBase64: base64Data
      })
      
      console.log(`✅ Database storage successful for ${filename}`)
      
      console.log(`✅ Image stored in database: ${filename}`)
      const imageUrl = `/api/image/${filename}`
      return NextResponse.json({ imageUrl })
      
    } catch (dbError: any) {
      console.error('Database storage FAILED:', {
        error: dbError,
        message: dbError?.message,
        stack: dbError?.stack,
        filename,
        fileType: file.type,
        fileSize: file.size
      })
      
      return NextResponse.json({ 
        error: 'Database storage failed', 
        details: dbError?.message 
      }, { status: 500 })
    }
    
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ 
      error: 'Upload failed' 
    }, { status: 500 })
  }
}