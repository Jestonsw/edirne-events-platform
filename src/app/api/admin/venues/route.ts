import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { venues, venueCategories } from '@/lib/schema'
import { eq, desc } from 'drizzle-orm'

export async function GET() {
  try {
    const venuesList = await db.select().from(venues)
      .leftJoin(venueCategories, eq(venues.categoryId, venueCategories.id))
      .orderBy(desc(venues.createdAt))
    
    // Transform the data to match the expected format
    const transformedVenues = venuesList.map(row => ({
      id: row.venues.id,
      name: row.venues.name,
      description: row.venues.description,
      categoryId: row.venues.categoryId,
      address: row.venues.address,
      phone: row.venues.phone,
      email: row.venues.email,
      website: row.venues.website,
      capacity: row.venues.capacity,
      amenities: row.venues.amenities,
      imageUrl: row.venues.imageUrl,
      imageUrl2: row.venues.imageUrl2,
      imageUrl3: row.venues.imageUrl3,
      latitude: row.venues.latitude,
      longitude: row.venues.longitude,
      openingHours: row.venues.openingHours,
      rating: row.venues.rating,
      reviewCount: row.venues.reviewCount,
      priceRange: row.venues.priceRange,
      isActive: row.venues.isActive,
      isFeatured: row.venues.isFeatured,
      createdAt: row.venues.createdAt,
      updatedAt: row.venues.updatedAt,
      category: row.venue_categories?.displayName || 'Unknown'
    }))
    
    return NextResponse.json(transformedVenues)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch venues' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const [newVenue] = await db.insert(venues).values({
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
    }).returning()
    
    return NextResponse.json(newVenue, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create venue' }, { status: 500 })
  }
}