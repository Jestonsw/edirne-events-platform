import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { venues, venueCategories, pendingVenues } from '@/lib/schema'
import { eq, desc, and } from 'drizzle-orm'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const categoryId = searchParams.get('categoryId')
    
    let venuesList
    
    if (categoryId && categoryId !== 'all') {
      venuesList = await db.select().from(venues)
        .leftJoin(venueCategories, eq(venues.categoryId, venueCategories.id))
        .where(and(
          eq(venues.isActive, true),
          eq(venues.categoryId, parseInt(categoryId))
        ))
        .orderBy(desc(venues.isFeatured), desc(venues.createdAt))
    } else {
      venuesList = await db.select().from(venues)
        .leftJoin(venueCategories, eq(venues.categoryId, venueCategories.id))
        .where(eq(venues.isActive, true))
        .orderBy(desc(venues.isFeatured), desc(venues.createdAt))
    }
    
    // Transform the data to match the expected format
    const transformedVenues = venuesList.map(row => ({
      id: row.venues.id,
      name: row.venues.name,
      description: row.venues.description,
      categoryId: row.venues.categoryId,
      address: row.venues.address,
      phone: row.venues.phone,
      phone2: row.venues.phone2,
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
      // Add category information for VenueCard compatibility
      venue_categories: {
        name: row.venue_categories?.name,
        displayName: row.venue_categories?.displayName,
        color: row.venue_categories?.color
      }
    }))
    
    return NextResponse.json(transformedVenues)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch venues' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    console.log('🏢 Venue API - received data:', body)
    
    // Handle categoryIds array - use first category as primary for backward compatibility
    let primaryCategoryId = null
    if (body.categoryIds && Array.isArray(body.categoryIds) && body.categoryIds.length > 0) {
      primaryCategoryId = parseInt(body.categoryIds[0])
      console.log('🏢 Using primary category ID:', primaryCategoryId)
    } else if (body.categoryId) {
      primaryCategoryId = parseInt(body.categoryId)
    }
    
    // Validate required fields
    if (!body.name || !body.description || !primaryCategoryId) {
      return NextResponse.json({ 
        error: 'Eksik alanlar: Mekan adı, açıklama ve en az bir kategori seçimi gerekli' 
      }, { status: 400 })
    }
    
    // Check if this is admin creating venue directly (has isActive/isFeatured properties)
    const isAdminCreate = 'isActive' in body && 'isFeatured' in body
    
    if (!isAdminCreate && (!body.submitterName || !body.submitterEmail)) {
      return NextResponse.json({ 
        error: 'Gönderen bilgileri eksik: Ad soyad ve e-posta gerekli' 
      }, { status: 400 })
    }
    
    if (isAdminCreate) {
      // Admin creates venue directly in venues table
      const [newVenue] = await db.insert(venues).values({
        name: body.name,
        description: body.description,
        categoryId: primaryCategoryId,
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
        isActive: body.isActive,
        isFeatured: body.isFeatured,
      }).returning()
      
      console.log('🏢 Admin created venue directly:', newVenue.id)
      return NextResponse.json(newVenue, { status: 201 })
    }
    
    // User submission goes to pending venues
    const [newVenue] = await db.insert(pendingVenues).values({
      name: body.name,
      description: body.description,
      categoryId: primaryCategoryId,
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
      submitterName: body.submitterName,
      submitterEmail: body.submitterEmail,
      submitterPhone: body.submitterPhone,
      status: 'pending',
    }).returning()
    
    console.log('🏢 New venue created:', newVenue.id)
    
    return NextResponse.json(newVenue, { status: 201 })
  } catch (error) {
    console.error('🏢 Venue API - error:', error)
    return NextResponse.json({ error: 'Failed to create venue' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'Venue ID is required' }, { status: 400 })
    }
    
    const body = await request.json()
    
    // Check if this is a simple status toggle (only isActive field)
    if (Object.keys(body).length === 1 && 'isActive' in body) {
      const [updatedVenue] = await db.update(venues)
        .set({
          isActive: body.isActive,
          updatedAt: new Date(),
        })
        .where(eq(venues.id, parseInt(id)))
        .returning()

      return NextResponse.json(updatedVenue)
    }
    
    // Handle categoryIds array - use first category as primary for backward compatibility
    let primaryCategoryId = null
    if (body.categoryIds && Array.isArray(body.categoryIds) && body.categoryIds.length > 0) {
      primaryCategoryId = parseInt(body.categoryIds[0])
    } else if (body.categoryId) {
      primaryCategoryId = parseInt(body.categoryId)
    }

    // Full venue update
    const [updatedVenue] = await db.update(venues)
      .set({
        name: body.name,
        description: body.description,
        categoryId: primaryCategoryId,
        address: body.address,
        phone: body.phone,
        phone2: body.phone2,
        email: body.email,
        website: body.website,
        capacity: body.capacity,
        amenities: body.amenities,
        imageUrl: body.imageUrl,
        imageUrl2: body.imageUrl2,
        imageUrl3: body.imageUrl3,
        latitude: body.latitude,
        longitude: body.longitude,
        openingHours: body.openingHours,
        rating: body.rating,
        isActive: body.isActive,
        isFeatured: body.isFeatured,
        updatedAt: new Date()
      })
      .where(eq(venues.id, parseInt(id)))
      .returning()
    
    if (!updatedVenue) {
      return NextResponse.json({ error: 'Venue not found' }, { status: 404 })
    }
    
    return NextResponse.json(updatedVenue)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update venue' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'Venue ID is required' }, { status: 400 })
    }
    
    const [deletedVenue] = await db.delete(venues)
      .where(eq(venues.id, parseInt(id)))
      .returning()
    
    if (!deletedVenue) {
      return NextResponse.json({ error: 'Venue not found' }, { status: 404 })
    }
    
    return NextResponse.json({ message: 'Venue deleted successfully' })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete venue' }, { status: 500 })
  }
}