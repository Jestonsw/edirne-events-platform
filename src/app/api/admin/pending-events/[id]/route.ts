import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { pendingEvents, pendingEventCategories } from '@/lib/schema'
import { eq } from 'drizzle-orm'

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const eventId = parseInt(params.id)
    const data = await request.json()

    console.log('🔄 PUT request received for pending event ID:', eventId)
    console.log('🔄 Event ID type:', typeof eventId, 'Is valid number:', !isNaN(eventId))

    // Prepare dates properly
    const startDate = data.startDate ? new Date(data.startDate) : null
    const endDate = data.endDate ? new Date(data.endDate) : null

    // First check if pending event exists
    const existingEvent = await db.select().from(pendingEvents).where(eq(pendingEvents.id, eventId))
    console.log('🔍 Existing pending event check:', existingEvent.length > 0 ? 'Found' : 'Not found')
    
    if (existingEvent.length === 0) {
      console.log('❌ Pending event not found in database for ID:', eventId)
      return NextResponse.json({ error: 'Pending event not found' }, { status: 404 })
    }

    // Update the pending event
    const updatedEvent = await db.update(pendingEvents)
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
        mediaFiles: JSON.stringify(data.mediaFiles || []), // Store mediaFiles as JSON string
        websiteUrl: data.websiteUrl || null,
        ticketUrl: data.ticketUrl || null,
        participantType: data.participantType || 'Herkes',
        updatedAt: new Date()
      })
      .where(eq(pendingEvents.id, eventId))
      .returning()

    console.log('📝 Pending event update result:', updatedEvent.length > 0 ? 'Success' : 'Failed')

    // Update categories - First delete existing, then insert new ones
    if (data.categoryIds && Array.isArray(data.categoryIds)) {
      // Delete existing categories
      await db.delete(pendingEventCategories)
        .where(eq(pendingEventCategories.pendingEventId, eventId))

      // Insert new categories
      if (data.categoryIds.length > 0) {
        const categoryInserts = data.categoryIds.map((categoryId: number) => ({
          pendingEventId: eventId,
          categoryId: categoryId
        }))
        
        await db.insert(pendingEventCategories).values(categoryInserts)
      }
    }

    console.log('✅ Pending event updated successfully:', eventId)

    return NextResponse.json({ 
      message: 'Pending event updated successfully',
      event: updatedEvent[0]
    })
  } catch (error) {
    console.error('❌ Pending event update error:', error)
    return NextResponse.json({ 
      error: 'Failed to update pending event' 
    }, { status: 500 })
  }
}