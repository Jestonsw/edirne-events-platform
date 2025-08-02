import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export async function GET(
  request: NextRequest,
  context: { params: { filename: string } }
) {
  const { params } = context
  try {
    const filename = params.filename
    
    if (!filename) {
      return new NextResponse('Filename not provided', { status: 400 })
    }
    
    const filePath = join(process.cwd(), 'public', 'uploads', filename)
    
    if (!existsSync(filePath)) {
      console.error('Image not found:', filePath)
      return new NextResponse('Image not found', { status: 404 })
    }
    
    const imageBuffer = await readFile(filePath)
    
    // Determine content type based on file extension
    const extension = filename.split('.').pop()?.toLowerCase()
    let contentType = 'image/jpeg' // default
    
    switch (extension) {
      case 'png':
        contentType = 'image/png'
        break
      case 'gif':
        contentType = 'image/gif'
        break
      case 'webp':
        contentType = 'image/webp'
        break
      case 'jpg':
      case 'jpeg':
        contentType = 'image/jpeg'
        break
    }
    
    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Content-Length': imageBuffer.length.toString(),
      },
    })
  } catch (error) {
    console.error('Error serving image:', error)
    return new NextResponse('Error serving image', { status: 500 })
  }
}