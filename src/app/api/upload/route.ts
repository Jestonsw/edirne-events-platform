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
      console.error('❌ No file in upload request')
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    console.log('📤 Upload request received:', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      sizeInMB: (file.size / (1024 * 1024)).toFixed(2) + ' MB'
    })

    // Validate file type - include video formats and common MIME type variations
    const allowedImageTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/webp',
      'image/pjpeg', 'image/x-png' // Additional MIME types for compatibility
    ]
    const allowedVideoTypes = ['video/mp4', 'video/mov', 'video/avi', 'video/quicktime']
    const allAllowedTypes = [...allowedImageTypes, ...allowedVideoTypes]
    
    // Also check file extension as fallback for MIME type issues
    const fileExtension = file.name.toLowerCase().split('.').pop()
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp', 'mp4', 'mov', 'avi']
    
    if (!allAllowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension || '')) {
      console.error('❌ Invalid file type:', {
        fileName: file.name,
        fileType: file.type,
        fileExtension,
        allowedTypes: allAllowedTypes,
        allowedExtensions
      })
      return NextResponse.json({ 
        error: `Invalid file type. File: ${file.type}, Extension: ${fileExtension}. Supported: JPG, PNG, WebP, MP4, MOV, AVI` 
      }, { status: 400 })
    }
    
    // Determine if video by MIME type or file extension
    const isVideo = allowedVideoTypes.includes(file.type) || 
                   ['mp4', 'mov', 'avi'].includes(fileExtension || '')

    // Validate file size (5MB for images, 100MB for videos)
    const maxSize = isVideo ? 100 * 1024 * 1024 : 5 * 1024 * 1024 // 100MB for video, 5MB for image
    if (file.size > maxSize) {
      return NextResponse.json({ 
        error: `File too large. Max ${isVideo ? '100MB for videos' : '5MB for images'}` 
      }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    
    // Create unique filename
    const timestamp = Date.now()
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    let filename: string
    let processedBuffer: Buffer
    let contentType: string

    if (isVideo) {
      // For videos, keep original format and don't process
      const videoExtension = file.name.split('.').pop()?.toLowerCase() || 'mp4'
      filename = `event_${timestamp}_${originalName}`
      processedBuffer = buffer
      contentType = file.type
      
      console.log(`🎥 Video file uploaded: ${filename}`)
      console.log(`📊 Video size: ${file.size} bytes`)
    } else {
      // For images, convert to WebP using Sharp
      filename = `event_${timestamp}_${originalName.replace(/\.(jpg|jpeg|png|webp)$/i, '')}.webp`
      
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
      contentType = 'image/webp'
    }
    
    // Try to store in database first using Drizzle ORM
    try {
      const base64Data = processedBuffer.toString('base64')
      console.log(`🔄 Attempting database storage for ${filename}, size: ${processedBuffer.length} bytes`)
      
      await db.insert(imageStorage).values({
        filename: filename,
        contentType: contentType,
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