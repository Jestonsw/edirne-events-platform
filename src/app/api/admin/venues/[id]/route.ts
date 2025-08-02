import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { venues } from '@/lib/schema'
import { eq } from 'drizzle-orm'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    const body = await request.json()
    
    const [updatedVenue] = await db.update(venues)
      .set({
        name: body.name,
        description: body.description,
        categoryId: body.categoryId,
        address: body.address,
        phone: body.phone,
        phone2: body.phone2,
        email: body.email,
        website: body.website,
        capacity: body.capacity ? parseInt(body.capacity) : null,
        amenities: body.amenities,
        imageUrl: body.imageUrl,
        imageUrl2: body.imageUrl2,
        imageUrl3: body.imageUrl3,
        latitude: body.latitude ? parseFloat(body.latitude) : null,
        longitude: body.longitude ? parseFloat(body.longitude) : null,
        openingHours: body.openingHours,
        rating: body.rating || 4.0,
        isActive: body.isActive ?? true,
        isFeatured: body.isFeatured ?? false,
        updatedAt: new Date(),
      })
      .where(eq(venues.id, id))
      .returning()
    
    if (!updatedVenue) {
      return NextResponse.json({ error: 'Venue not found' }, { status: 404 })
    }
    
    return NextResponse.json(updatedVenue)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update venue' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    
    const [deletedVenue] = await db.delete(venues)
      .where(eq(venues.id, id))
      .returning()
    
    if (!deletedVenue) {
      return NextResponse.json({ error: 'Venue not found' }, { status: 404 })
    }
    
    return NextResponse.json({ message: 'Venue deleted successfully' })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete venue' }, { status: 500 })
  }
}