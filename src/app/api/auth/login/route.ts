import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { users } from '@/lib/schema'
import { eq } from 'drizzle-orm'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { phone, password } = body

    // Validate required fields
    if (!phone || !password) {
      return NextResponse.json({ error: 'Telefon numarası ve şifre gereklidir' }, { status: 400 })
    }

    // Normalize phone number (remove spaces, dashes, parentheses)
    const normalizedPhone = phone.replace(/[\s\-\(\)]/g, '')
    
    // Find user by phone number - try exact match first, then normalized versions
    let user = null
    
    // Try exact match first
    const [exactMatch] = await db.select().from(users).where(eq(users.phone, phone))
    if (exactMatch) {
      user = exactMatch
    } else {
      // Try normalized phone number
      const [normalizedMatch] = await db.select().from(users).where(eq(users.phone, normalizedPhone))
      if (normalizedMatch) {
        user = normalizedMatch
      } else {
        // Try with 0 prefix
        const phoneWith0 = normalizedPhone.startsWith('0') ? normalizedPhone : '0' + normalizedPhone
        const [prefixMatch] = await db.select().from(users).where(eq(users.phone, phoneWith0))
        if (prefixMatch) {
          user = prefixMatch
        } else {
          // Try without 0 prefix
          const phoneWithout0 = normalizedPhone.startsWith('0') ? normalizedPhone.slice(1) : normalizedPhone
          const [noPrefixMatch] = await db.select().from(users).where(eq(users.phone, phoneWithout0))
          if (noPrefixMatch) {
            user = noPrefixMatch
          }
        }
      }
    }
    
    if (!user) {
      return NextResponse.json({ 
        error: 'Kullanıcı bulunamadı. Telefon numaranızı kontrol edin.',
        debug: `Aranan: ${phone}, Normalleştirilmiş: ${normalizedPhone}` 
      }, { status: 401 })
    }

    // Check password (in real app, use bcrypt)
    if (user.password !== password) {
      return NextResponse.json({ error: 'Geçersiz şifre' }, { status: 401 })
    }

    const userData = {
      id: user.id,
      name: user.name,
      phone: user.phone,
      city: user.city || 'Edirne',
      profileImageUrl: user.profileImageUrl,
      isActive: true,
      loginAt: new Date().toISOString()
    }


    return NextResponse.json({
      message: 'Giriş başarılı',
      user: userData
    })
  } catch (error) {
    return NextResponse.json({ error: 'Giriş sırasında bir hata oluştu' }, { status: 500 })
  }
}