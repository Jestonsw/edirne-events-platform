import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { users } from '@/lib/schema'
import { eq } from 'drizzle-orm'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { firstName, lastName, email, password, phone, birthDate, gender, profileImageUrl } = body

    // Validate required fields
    if (!firstName || !lastName || !email || !password || !phone || !birthDate || !gender) {
      return NextResponse.json({ error: 'Ad, soyad, e-posta, telefon, doğum tarihi, cinsiyet ve şifre gereklidir' }, { status: 400 })
    }

    // Check if user already exists with phone or email
    const existingUser = await db.select().from(users).where(eq(users.phone, phone))
    if (existingUser.length > 0) {
      return NextResponse.json({ error: 'Bu telefon numarası zaten kayıtlı' }, { status: 400 })
    }

    const existingEmail = await db.select().from(users).where(eq(users.email, email))
    if (existingEmail.length > 0) {
      return NextResponse.json({ error: 'Bu e-posta adresi zaten kayıtlı' }, { status: 400 })
    }

    // Create new user in database
    const [newUser] = await db.insert(users).values({
      name: `${firstName} ${lastName}`.trim(),
      email,
      password, // In production, hash this with bcrypt
      phone,
      dateOfBirth: birthDate ? new Date(birthDate) : null,
      gender,
      profileImageUrl: profileImageUrl || null,
      isActive: true
    }).returning()

    const userData = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      phone: newUser.phone,
      city: newUser.city,
      profileImageUrl: newUser.profileImageUrl,
      isActive: true,
      createdAt: newUser.createdAt?.toISOString() || new Date().toISOString()
    }

    return NextResponse.json({
      message: 'Kayıt başarılı',
      user: userData
    })
  } catch (error) {
    return NextResponse.json({ error: 'Kayıt sırasında bir hata oluştu' }, { status: 500 })
  }
}