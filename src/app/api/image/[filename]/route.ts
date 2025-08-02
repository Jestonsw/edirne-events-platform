import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { sql } from 'drizzle-orm'
import { imageStorage } from '@/lib/schema'

export async function GET(
  request: Request,
  { params }: { params: { filename: string } }
) {
  try {
    const { filename } = params

    // Get image from database using Drizzle ORM
    const result = await db.select({
      contentType: imageStorage.contentType,
      dataBase64: imageStorage.dataBase64
    }).from(imageStorage)
    .where(sql`${imageStorage.filename} = ${filename}`)
    .limit(1)

    if (result.length === 0) {
      return new NextResponse('Image not found', { status: 404 })
    }

    const row = result[0]
    const imageBuffer = Buffer.from(row.dataBase64, 'base64')
    
    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': row.contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Access-Control-Allow-Origin': '*',
      },
    })
  } catch (error) {
    console.error('Image serving error:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}