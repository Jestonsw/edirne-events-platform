import { NextRequest, NextResponse } from 'next/server'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { venues } from '@/lib/schema'
import { eq } from 'drizzle-orm'

const client = postgres(process.env.DATABASE_URL!)
const db = drizzle(client)

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const venueId = parseInt(params.id)
    const body = await request.json()

    // Update the pending venue with admin changes
    const [updatedVenue] = await db
      .update(venues)
      .set({
        name: body.name,
        description: body.description,
        address: body.address,
        phone: body.phone,
        phone2: body.phone2,
        email: body.email,
        website: body.website,
        capacity: body.capacity ? parseInt(body.capacity) : null,
        amenities: body.amenities,
        latitude: body.latitude ? parseFloat(body.latitude) : null,
        longitude: body.longitude ? parseFloat(body.longitude) : null,
        openingHours: body.openingHours,
        rating: body.rating ? parseFloat(body.rating) : 0
      })
      .where(eq(venues.id, venueId))
      .returning()

    return NextResponse.json({ 
      success: true, 
      venue: updatedVenue 
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update pending venue' },
      { status: 500 }
    )
  }
}