import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { users, userFavorites } from '@/lib/schema'
import { eq } from 'drizzle-orm'

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json({ error: 'Kullanıcı ID gereklidir' }, { status: 400 })
    }

    // First, verify user exists
    const [user] = await db.select().from(users).where(eq(users.id, userId))
    
    if (!user) {
      return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 })
    }

    // Delete user's favorites
    await db.delete(userFavorites).where(eq(userFavorites.userId, userId))

    // Finally, delete the user account
    await db.delete(users).where(eq(users.id, userId))

    return NextResponse.json({ 
      message: 'Hesabınız başarıyla silindi. Tüm verileriniz kalıcı olarak kaldırıldı.' 
    })
  } catch (error) {
    console.error('Account deletion error:', error)
    return NextResponse.json({ 
      error: 'Hesap silinirken hata oluştu. Lütfen tekrar deneyin.' 
    }, { status: 500 })
  }
}