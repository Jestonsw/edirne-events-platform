import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { pendingVenues, venueCategories, venues } from '@/lib/schema'
import { eq, desc } from 'drizzle-orm'

export async function GET() {
  try {
    // Get venues from pendingVenues table with status 'pending'
    const pendingVenuesList = await db.select().from(pendingVenues)
      .leftJoin(venueCategories, eq(pendingVenues.categoryId, venueCategories.id))
      .where(eq(pendingVenues.status, 'pending'))
      .orderBy(desc(pendingVenues.createdAt))
    
    // Transform the data to match the expected format
    const transformedVenues = pendingVenuesList.map(row => ({
      id: row.pending_venues.id,
      name: row.pending_venues.name,
      description: row.pending_venues.description,
      categoryId: row.pending_venues.categoryId,
      address: row.pending_venues.address,
      phone: row.pending_venues.phone,
      phone2: null, // phone2 field not available in pendingVenues
      email: row.pending_venues.email,
      website: row.pending_venues.website,
      capacity: row.pending_venues.capacity,
      amenities: row.pending_venues.amenities,
      imageUrl: row.pending_venues.imageUrl,
      imageUrl2: row.pending_venues.imageUrl2,
      imageUrl3: row.pending_venues.imageUrl3,
      latitude: row.pending_venues.latitude,
      longitude: row.pending_venues.longitude,
      openingHours: row.pending_venues.openingHours,
      rating: 0, // rating field not available in pendingVenues
      reviewCount: 0, // reviewCount field not available in pendingVenues
      priceRange: row.pending_venues.priceRange,
      status: row.pending_venues.status,
      submitterName: row.pending_venues.submitterName,
      submitterEmail: row.pending_venues.submitterEmail,
      submitterPhone: row.pending_venues.submitterPhone,
      createdAt: row.pending_venues.createdAt,
      updatedAt: row.pending_venues.updatedAt,
      category: row.venue_categories?.displayName || 'Unknown'
    }))
    
    return NextResponse.json(transformedVenues)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch pending venues' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { venueId, action } = await request.json()
    

    
    if (action === 'approve') {
      // Get the pending venue first
      const [pendingVenue] = await db.select().from(pendingVenues)
        .where(eq(pendingVenues.id, venueId))
      
      if (!pendingVenue) {
        return NextResponse.json({ error: 'Mekan bulunamadı' }, { status: 404 })
      }
      
      // Create new venue in main venues table
      const [newVenue] = await db.insert(venues).values({
        name: pendingVenue.name,
        description: pendingVenue.description,
        categoryId: pendingVenue.categoryId,
        address: pendingVenue.address,
        phone: pendingVenue.phone,
        phone2: null, // phone2 field not available in pendingVenues
        email: pendingVenue.email,
        website: pendingVenue.website,
        capacity: pendingVenue.capacity,
        amenities: pendingVenue.amenities,
        imageUrl: pendingVenue.imageUrl,
        imageUrl2: pendingVenue.imageUrl2,
        imageUrl3: pendingVenue.imageUrl3,
        latitude: pendingVenue.latitude,
        longitude: pendingVenue.longitude,
        openingHours: pendingVenue.openingHours,
        rating: 0, // rating field not available in pendingVenues  
        reviewCount: 0, // reviewCount field not available in pendingVenues
        priceRange: pendingVenue.priceRange,
        isActive: true,
        isFeatured: false
      }).returning()
      
      // Delete from pending table
      await db.delete(pendingVenues)
        .where(eq(pendingVenues.id, venueId))
      

      return NextResponse.json({ message: 'Mekan onaylandı ve yayınlandı', venue: newVenue })
    } else if (action === 'reject') {
      // Delete from pending table
      const [deletedVenue] = await db.delete(pendingVenues)
        .where(eq(pendingVenues.id, venueId))
        .returning()
      

      return NextResponse.json({ message: 'Mekan reddedildi ve silindi', venue: deletedVenue })
    } else {
      return NextResponse.json({ error: 'Geçersiz işlem' }, { status: 400 })
    }
  } catch (error) {

    return NextResponse.json({ error: 'İşlem başarısız' }, { status: 500 })
  }
}