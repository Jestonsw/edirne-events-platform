import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { venueCategories, venues } from '@/lib/schema'
import { eq, asc } from 'drizzle-orm'

export async function GET() {
  try {
    const categories = await db.select().from(venueCategories).where(eq(venueCategories.isActive, true)).orderBy(asc(venueCategories.sortOrder))
    
    return NextResponse.json({ categories })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch venue categories' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const [newCategory] = await db.insert(venueCategories).values({
      name: body.name,
      displayName: body.displayName,
      color: body.color || '#6B7280',
      icon: body.icon || 'building',
      description: body.description,
      isActive: body.isActive ?? true,
    }).returning()
    
    return NextResponse.json(newCategory, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create venue category' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'Category ID is required' }, { status: 400 })
    }
    
    const body = await request.json()
    
    const [updatedCategory] = await db.update(venueCategories)
      .set({
        name: body.name,
        displayName: body.displayName,
        color: body.color,
        icon: body.icon,
        description: body.description,
        isActive: body.isActive,
        updatedAt: new Date()
      })
      .where(eq(venueCategories.id, parseInt(id)))
      .returning()
    
    if (!updatedCategory) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }
    
    return NextResponse.json(updatedCategory)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update venue category' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'Category ID is required' }, { status: 400 })
    }

    const categoryId = parseInt(id)

    // Check if category is used by any venues
    const venuesWithCategory = await db.select().from(venues).where(eq(venues.categoryId, categoryId)).limit(1)
    
    if (venuesWithCategory.length > 0) {
      return NextResponse.json({ 
        error: 'Bu kategori mekanlarda kullanılıyor. Önce bu kategorideki mekanları silin veya başka kategoriye taşıyın.' 
      }, { status: 400 })
    }
    
    const [deletedCategory] = await db.delete(venueCategories)
      .where(eq(venueCategories.id, categoryId))
      .returning()
    
    if (!deletedCategory) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }
    
    return NextResponse.json({ message: 'Category deleted successfully' })
  } catch (error) {
    if ((error as any).code === '23503') {
      return NextResponse.json({ 
        error: 'Bu kategori başka tablolarda kullanılıyor. Önce ilgili kayıtları silin.' 
      }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to delete venue category' }, { status: 500 })
  }
}