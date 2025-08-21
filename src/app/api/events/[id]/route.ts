import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { events, eventCategories, categories } from '@/lib/schema'
import { eq, and } from 'drizzle-orm'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const eventId = parseInt(params.id)

    if (isNaN(eventId)) {
      return NextResponse.json({ error: 'Invalid event ID' }, { status: 400 })
    }

    // Fetch the event
    const event = await db.select().from(events).where(eq(events.id, eventId)).limit(1)
    
    if (event.length === 0) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    // Fetch categories for this event
    const eventCats = await db.select({
      categoryId: eventCategories.categoryId,
      categoryName: categories.name,
      categoryDisplayName: categories.displayName,
      categoryColor: categories.color,
      categoryIcon: categories.icon
    })
    .from(eventCategories)
    .leftJoin(categories, eq(eventCategories.categoryId, categories.id))
    .where(eq(eventCategories.eventId, eventId))

    const eventWithCategories = {
      ...event[0],
      categories: eventCats
    }

    return NextResponse.json(eventWithCategories)
  } catch (error) {
    console.error('❌ Error fetching event:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch event' 
    }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const eventId = parseInt(params.id)
    const data = await request.json()

    console.log('🔄 PUT request received for event ID:', eventId)
    console.log('🔄 Event ID type:', typeof eventId, 'Is valid number:', !isNaN(eventId))
    console.log('🔄 Request data keys:', Object.keys(data))

    // Prepare dates properly
    const startDate = data.startDate ? new Date(data.startDate) : null
    const endDate = data.endDate ? new Date(data.endDate) : null

    // First check if event exists
    const existingEvent = await db.select().from(events).where(eq(events.id, eventId))
    console.log('🔍 Existing event check:', existingEvent.length > 0 ? 'Found' : 'Not found')
    
    if (existingEvent.length === 0) {
      console.log('❌ Event not found in database for ID:', eventId)
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    // Update the main event
    const updatedEvent = await db.update(events)
      .set({
        title: data.title,
        description: data.description,
        venue: data.venue || null,
        startDate: startDate,
        endDate: endDate,
        startTime: data.startTime,
        endTime: data.endTime || null,
        location: data.location || data.address,
        address: data.address || data.location,
        latitude: data.latitude ? parseFloat(data.latitude) : null,
        longitude: data.longitude ? parseFloat(data.longitude) : null,
        organizerName: data.organizerName || null,
        organizerContact: data.organizerContact || null,
        capacity: data.capacity ? parseInt(data.capacity) : null,
        imageUrl: data.imageUrl || null,
        imageUrl2: data.imageUrl2 || null,
        imageUrl3: data.imageUrl3 || null,
        mediaFiles: JSON.stringify(data.mediaFiles || []), // Store unlimited media as JSON
        websiteUrl: data.websiteUrl || null,
        ticketUrl: data.ticketUrl || null,
        participantType: data.participantType || 'Herkes',
        isActive: data.isActive ?? true,
        isFeatured: data.isFeatured ?? false,
        rating: data.rating ?? 0,
        reviewCount: data.reviewCount ?? 0,
        hashtags: data.hashtags || null,
        likesCount: data.likesCount ?? 0,
        viewsCount: data.viewsCount ?? 0,
        updatedAt: new Date()
      })
      .where(eq(events.id, eventId))
      .returning()

    console.log('📝 Update result:', updatedEvent.length > 0 ? 'Success' : 'Failed')

    // Update categories - First delete existing, then insert new ones
    if (data.categoryIds && Array.isArray(data.categoryIds)) {
      // Delete existing categories
      await db.delete(eventCategories)
        .where(eq(eventCategories.eventId, eventId))

      // Insert new categories
      if (data.categoryIds.length > 0) {
        const categoryInserts = data.categoryIds.map((categoryId: number) => ({
          eventId: eventId,
          categoryId: categoryId
        }))
        
        await db.insert(eventCategories).values(categoryInserts)
      }
    }

    console.log('✅ Event updated successfully:', eventId)

    return NextResponse.json({ 
      message: 'Event updated successfully',
      event: updatedEvent[0]
    })
  } catch (error) {
    console.error('❌ Event update error:', error)
    return NextResponse.json({ 
      error: 'Failed to update event' 
    }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const eventId = parseInt(params.id)

    // Delete event categories first (foreign key constraint)
    await db.delete(eventCategories)
      .where(eq(eventCategories.eventId, eventId))

    // Delete the event
    const deletedEvent = await db.delete(events)
      .where(eq(events.id, eventId))
      .returning()

    if (deletedEvent.length === 0) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    console.log('🗑️ Event deleted successfully:', eventId)

    return NextResponse.json({ 
      message: 'Event deleted successfully'
    })
  } catch (error) {
    console.error('❌ Event delete error:', error)
    return NextResponse.json({ 
      error: 'Failed to delete event' 
    }, { status: 500 })
  }
}