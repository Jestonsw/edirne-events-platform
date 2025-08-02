import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { users } from '@/lib/schema'
import { eq } from 'drizzle-orm'

export async function GET() {
  try {
    const allUsers = await db.select({
      id: users.id,
      name: users.name,
      email: users.email,
      phone: users.phone,
      city: users.city,
      district: users.district,
      dateOfBirth: users.dateOfBirth,
      gender: users.gender,
      interests: users.interests,
      profileImageUrl: users.profileImageUrl,
      isActive: users.isActive,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt
    }).from(users)

    return NextResponse.json(allUsers)
  } catch (error) {
    return NextResponse.json({ error: 'Kullanıcılar yüklenirken hata oluştu' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { userId, isActive } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: 'Kullanıcı ID gerekli' }, { status: 400 })
    }

    await db.update(users)
      .set({ 
        isActive: isActive,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId))

    return NextResponse.json({ 
      message: isActive ? 'Kullanıcı aktifleştirildi' : 'Kullanıcı pasifleştirildi' 
    })
  } catch (error) {
    return NextResponse.json({ error: 'Kullanıcı durumu güncellenirken hata oluştu' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'Kullanıcı ID gerekli' }, { status: 400 })
    }

    await db.delete(users).where(eq(users.id, parseInt(userId)))

    return NextResponse.json({ message: 'Kullanıcı başarıyla silindi' })
  } catch (error) {
    return NextResponse.json({ error: 'Kullanıcı silinirken hata oluştu' }, { status: 500 })
  }
}