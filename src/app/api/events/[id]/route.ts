import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { events, eventCategories } from '@/lib/schema'
import { eq } from 'drizzle-orm'

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const eventId = parseInt(params.id)
    
    console.log('📤 Events API: Received update request for event:', eventId)
    console.log('📤 Events API: Image fields in request:', {
      imageUrl: body.imageUrl,
      imageUrl2: body.imageUrl2,
      imageUrl3: body.imageUrl3
    })
    
    const updatedEvent = await db.update(events)
      .set({
        title: body.title,
        description: body.description,
        startDate: new Date(body.startDate),
        endDate: body.endDate ? new Date(body.endDate) : null,
        startTime: body.startTime && body.startTime.trim() !== '' ? body.startTime : null,
        endTime: body.endTime && body.endTime.trim() !== '' ? body.endTime : null,
        location: body.location,
        address: body.address,
        organizerName: body.organizerName,
        organizerContact: body.organizerContact,
        categoryId: body.categoryId,
        price: body.price,
        capacity: body.capacity,
        imageUrl: body.imageUrl,
        imageUrl2: body.imageUrl2,
        imageUrl3: body.imageUrl3,
        websiteUrl: body.websiteUrl,
        ticketUrl: body.ticketUrl,
        tags: body.tags ? JSON.stringify(body.tags) : null,
        participantType: body.participantType,
        isActive: body.isActive,
        isFeatured: body.isFeatured,
        updatedAt: new Date()
      })
      .where(eq(events.id, eventId))
      .returning()

    if (updatedEvent.length === 0) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    return NextResponse.json(updatedEvent[0])
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update event' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const eventId = parseInt(params.id)
    
    // First delete related event categories
    await db.delete(eventCategories)
      .where(eq(eventCategories.eventId, eventId))
    
    // Then delete the event
    const deletedEvent = await db.delete(events)
      .where(eq(events.id, eventId))
      .returning()

    if (deletedEvent.length === 0) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Event deleted successfully' })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete event' }, { status: 500 })
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const eventId = parseInt(params.id)
    
    const event = await db.select().from(events).where(eq(events.id, eventId)).limit(1)

    if (event.length === 0) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    return NextResponse.json(event[0])
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch event' }, { status: 500 })
  }
}