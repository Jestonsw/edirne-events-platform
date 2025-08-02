import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { users } from '@/lib/schema'
import { eq, desc } from 'drizzle-orm'

export async function GET() {
  try {
    const usersList = await db.select().from(users)
      .orderBy(desc(users.createdAt))
    
    return NextResponse.json(usersList)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Check if email already exists
    const existingUser = await db.select().from(users)
      .where(eq(users.email, body.email))
      .limit(1)
    
    if (existingUser.length > 0) {
      return NextResponse.json({ error: 'Bu e-posta adresi zaten kayıtlı' }, { status: 400 })
    }
    
    // Create new user
    const [newUser] = await db.insert(users).values({
      name: body.name,
      email: body.email,
      password: body.password || '', // Add required password field
      phone: body.phone,
      dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth) : null,
      gender: body.gender,
      city: body.city || 'Edirne',
      district: body.district,
      interests: body.interests ? JSON.stringify(body.interests) : null,
      profileImageUrl: body.profileImageUrl,
    }).returning()
    
    return NextResponse.json(newUser, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Kullanıcı kaydı başarısız' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }
    
    const body = await request.json()
    
    const [updatedUser] = await db.update(users)
      .set({
        name: body.name,
        email: body.email,
        phone: body.phone,
        dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth) : null,
        gender: body.gender,
        city: body.city,
        district: body.district,
        interests: body.interests ? JSON.stringify(body.interests) : null,
        profileImageUrl: body.profileImageUrl,
        isActive: body.isActive,
        emailVerified: body.emailVerified,
        lastLoginAt: body.lastLoginAt ? new Date(body.lastLoginAt) : null,
        updatedAt: new Date()
      })
      .where(eq(users.id, parseInt(id)))
      .returning()
    
    if (!updatedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    
    return NextResponse.json(updatedUser)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }
    
    const [deletedUser] = await db.delete(users)
      .where(eq(users.id, parseInt(id)))
      .returning()
    
    if (!deletedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    
    return NextResponse.json({ message: 'User deleted successfully' })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 })
  }
}