import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { events, pendingEvents, pendingEventCategories, eventCategories } from '@/lib/schema'
import { eq } from 'drizzle-orm'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { eventId, eventData } = body

    if (!eventId) {
      return NextResponse.json({ error: 'Event ID gerekli' }, { status: 400 })
    }

    // Get the pending event
    const [pendingEvent] = await db.select().from(pendingEvents).where(eq(pendingEvents.id, eventId))
    
    if (!pendingEvent) {
      return NextResponse.json({ error: 'Bekleyen etkinlik bulunamadı' }, { status: 404 })
    }

    // Merge pending event data with admin updates
    const finalEventData = {
      title: eventData.title || pendingEvent.title,
      description: eventData.description || pendingEvent.description,
      venue: eventData.venue || pendingEvent.venue,
      startDate: eventData.startDate ? new Date(eventData.startDate) : pendingEvent.startDate,
      endDate: eventData.endDate ? new Date(eventData.endDate) : pendingEvent.endDate,
      startTime: eventData.startTime || pendingEvent.startTime,
      endTime: eventData.endTime || pendingEvent.endTime,
      address: eventData.address || pendingEvent.address,
      latitude: eventData.latitude || pendingEvent.latitude,
      longitude: eventData.longitude || pendingEvent.longitude,
      websiteUrl: eventData.websiteUrl || pendingEvent.websiteUrl,
      ticketUrl: eventData.ticketUrl || pendingEvent.ticketUrl,
      imageUrl: eventData.imageUrl || pendingEvent.imageUrl,
      imageUrl2: eventData.imageUrl2 || pendingEvent.imageUrl2,
      imageUrl3: eventData.imageUrl3 || pendingEvent.imageUrl3,
      mediaFiles: eventData.mediaFiles || pendingEvent.mediaFiles,
      isFeatured: eventData.isFeatured || false,
      rating: eventData.rating || 0,
      reviewCount: eventData.reviewCount || 0,
      categoryId: pendingEvent.categoryId,
      isActive: true,
      createdAt: pendingEvent.createdAt,
      updatedAt: new Date()
    }

    // Insert into events table (fix data structure)
    const [newEvent] = await db.insert(events).values([{
      ...finalEventData,
      location: finalEventData.venue, // events table uses location field
      price: '0' // Add required price field
    }]).returning()

    // Move categories from pending_event_categories to event_categories
    const pendingCategories = await db.select()
      .from(pendingEventCategories)
      .where(eq(pendingEventCategories.pendingEventId, eventId))

    if (pendingCategories.length > 0) {
      await db.insert(eventCategories).values(
        pendingCategories.map(cat => ({
          eventId: newEvent.id,
          categoryId: cat.categoryId
        }))
      )
    }

    // Delete categories from pending_event_categories first
    await db.delete(pendingEventCategories)
      .where(eq(pendingEventCategories.pendingEventId, eventId))

    // Delete from pending_events
    await db.delete(pendingEvents).where(eq(pendingEvents.id, eventId))

    return NextResponse.json({ 
      success: true, 
      message: 'Etkinlik başarıyla onaylandı ve yayımlandı',
      event: newEvent 
    })

  } catch (error) {
    console.error('Approve event error:', error)
    return NextResponse.json(
      { error: 'Etkinlik onaylanırken hata oluştu' },
      { status: 500 }
    )
  }
}