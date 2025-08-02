import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { pendingEvents, categories, pendingEventCategories, events, eventCategories } from '@/lib/schema'
import { eq, desc, and } from 'drizzle-orm'

export async function GET() {
  try {
    // Get events from pendingEvents table with status 'pending'
    const pendingEventsList = await db.select().from(pendingEvents)
      .where(eq(pendingEvents.status, 'pending'))
      .orderBy(desc(pendingEvents.createdAt))
    
    // Get categories for each pending event
    const eventsWithCategories = await Promise.all(
      pendingEventsList.map(async (event) => {
        const eventCats = await db.select({
          categoryId: categories.id,
          categoryName: categories.name,
          categoryDisplayName: categories.displayName,
          categoryColor: categories.color,
          categoryIcon: categories.icon
        })
        .from(pendingEventCategories)
        .leftJoin(categories, eq(pendingEventCategories.categoryId, categories.id))
        .where(eq(pendingEventCategories.pendingEventId, event.id))

        return {
          ...event,
          categories: eventCats
        }
      })
    )
    
    return NextResponse.json(eventsWithCategories)
  } catch (error) {

    return NextResponse.json({ error: 'Failed to fetch pending events' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { eventId, action } = await request.json()
    
    // Process event action
    
    if (action === 'approve') {
      // Get the pending event first
      const [pendingEvent] = await db.select().from(pendingEvents)
        .where(eq(pendingEvents.id, eventId))
      
      if (!pendingEvent) {
        return NextResponse.json({ error: 'Etkinlik bulunamadı' }, { status: 404 })
      }
      
      // Create new event in main events table
      const [newEvent] = await db.insert(events).values({
        title: pendingEvent.title,
        description: pendingEvent.description,
        startDate: pendingEvent.startDate,
        endDate: pendingEvent.endDate,
        startTime: pendingEvent.startTime,
        endTime: pendingEvent.endTime,
        location: pendingEvent.location,
        address: pendingEvent.address,
        latitude: pendingEvent.latitude,
        longitude: pendingEvent.longitude,
        organizerName: pendingEvent.organizerName,
        organizerContact: pendingEvent.organizerContact,
        categoryId: pendingEvent.categoryId,
        price: pendingEvent.price,
        capacity: pendingEvent.capacity,
        imageUrl: pendingEvent.imageUrl,
        imageUrl2: pendingEvent.imageUrl2,
        imageUrl3: pendingEvent.imageUrl3,
        websiteUrl: pendingEvent.websiteUrl,
        ticketUrl: pendingEvent.ticketUrl,
        tags: pendingEvent.tags,
        participantType: pendingEvent.participantType,
        isActive: true,
        isFeatured: false
      }).returning()
      
      // Copy category relationships
      const pendingCategories = await db.select().from(pendingEventCategories)
        .where(eq(pendingEventCategories.pendingEventId, eventId))
      
      if (pendingCategories.length > 0) {
        const categoryPromises = pendingCategories.map(cat =>
          db.insert(eventCategories).values({
            eventId: newEvent.id,
            categoryId: cat.categoryId
          })
        )
        await Promise.all(categoryPromises)
      }
      
      // Delete from pending tables
      await db.delete(pendingEventCategories)
        .where(eq(pendingEventCategories.pendingEventId, eventId))
      await db.delete(pendingEvents)
        .where(eq(pendingEvents.id, eventId))
      

      return NextResponse.json({ message: 'Etkinlik onaylandı ve yayınlandı', event: newEvent })
    } else if (action === 'reject') {
      // Delete from pending tables
      await db.delete(pendingEventCategories)
        .where(eq(pendingEventCategories.pendingEventId, eventId))
      const [deletedEvent] = await db.delete(pendingEvents)
        .where(eq(pendingEvents.id, eventId))
        .returning()
      

      return NextResponse.json({ message: 'Etkinlik reddedildi ve silindi', event: deletedEvent })
    } else {
      return NextResponse.json({ error: 'Geçersiz işlem' }, { status: 400 })
    }
  } catch (error) {

    return NextResponse.json({ error: 'İşlem başarısız' }, { status: 500 })
  }
}