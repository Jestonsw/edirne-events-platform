import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { announcements } from '@/lib/schema'
import { eq } from 'drizzle-orm'

export async function GET() {
  try {
    const allAnnouncements = await db.select()
      .from(announcements)
      .orderBy(announcements.createdAt)

    return NextResponse.json(allAnnouncements)
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    const newAnnouncement = await db.insert(announcements).values({
      title: data.title,
      message: data.message,
      imageUrl: data.imageUrl || null,
      buttonText: data.buttonText || null,
      buttonUrl: data.buttonUrl || null,
      isActive: data.isActive ?? true,
      showOnce: data.showOnce ?? false,
      startDate: data.startDate ? new Date(data.startDate) : null,
      endDate: data.endDate ? new Date(data.endDate) : null,
    }).returning()

    return NextResponse.json(newAnnouncement[0])
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    const data = await request.json()
    
    const updatedAnnouncement = await db.update(announcements)
      .set({
        title: data.title,
        message: data.message,
        imageUrl: data.imageUrl || null,
        buttonText: data.buttonText || null,
        buttonUrl: data.buttonUrl || null,
        isActive: data.isActive,
        showOnce: data.showOnce,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
        updatedAt: new Date(),
      })
      .where(eq(announcements.id, parseInt(id)))
      .returning()

    return NextResponse.json(updatedAnnouncement[0])
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    await db.delete(announcements)
      .where(eq(announcements.id, parseInt(id)))

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}