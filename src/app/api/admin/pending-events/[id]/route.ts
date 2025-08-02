import { NextRequest, NextResponse } from 'next/server'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { pendingEvents } from '@/lib/schema'
import { eq } from 'drizzle-orm'

const client = postgres(process.env.DATABASE_URL!)
const db = drizzle(client)

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const eventId = parseInt(params.id)
    const body = await request.json()

    // Update the pending event with admin changes
    const [updatedEvent] = await db
      .update(pendingEvents)
      .set({
        title: body.title,
        description: body.description,
        startDate: body.startDate ? new Date(body.startDate) : null,
        endDate: body.endDate ? new Date(body.endDate) : null,
        startTime: body.startTime,
        endTime: body.endTime,
        location: body.location,
        address: body.address,
        latitude: body.latitude ? parseFloat(body.latitude) : null,
        longitude: body.longitude ? parseFloat(body.longitude) : null,
        organizerName: body.organizerName,
        organizerContact: body.organizerContact,
        price: body.price,
        capacity: body.capacity ? parseInt(body.capacity) : null,
        websiteUrl: body.websiteUrl,
        ticketUrl: body.ticketUrl,
        imageUrl: body.imageUrl,
        imageUrl2: body.imageUrl2,
        imageUrl3: body.imageUrl3
      })
      .where(eq(pendingEvents.id, eventId))
      .returning()

    return NextResponse.json({ 
      success: true, 
      event: updatedEvent 
    })
  } catch (error) {
    console.error('Pending event update error:', error)
    return NextResponse.json(
      { error: 'Failed to update pending event', details: error.message },
      { status: 500 }
    )
  }
}