import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { feedback } from '@/lib/schema'
import { eq } from 'drizzle-orm'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, email, message } = body

    if (!type || !message) {
      return NextResponse.json(
        { error: 'Konu türü ve mesaj zorunludur' }, 
        { status: 400 }
      )
    }

    const [newFeedback] = await db.insert(feedback).values({
      type,
      email: email || null,
      message,
      isRead: false
    }).returning()

    return NextResponse.json({ 
      message: 'Geri bildiriminiz başarıyla gönderildi. Teşekkür ederiz!',
      id: newFeedback.id 
    }, { status: 201 })

  } catch (error) {
    return NextResponse.json(
      { error: 'Geri bildirim gönderilirken hata oluştu' }, 
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const feedbackList = await db.select().from(feedback).orderBy(feedback.createdAt)
    return NextResponse.json(feedbackList)
  } catch (error) {
    return NextResponse.json(
      { error: 'Geri bildirimler yüklenirken hata oluştu' }, 
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Geri bildirim ID gerekli' }, 
        { status: 400 }
      )
    }

    await db.delete(feedback).where(eq(feedback.id, parseInt(id)))

    return NextResponse.json({ 
      message: 'Geri bildirim başarıyla silindi' 
    })

  } catch (error) {
    return NextResponse.json(
      { error: 'Geri bildirim silinirken hata oluştu' }, 
      { status: 500 }
    )
  }
}