import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { userFavorites, events, categories, eventCategories } from '@/lib/schema'
import { eq, and } from 'drizzle-orm'

// GET - Kullanıcının favori etkinliklerini getir
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Kullanıcının favori etkinliklerini getir
    const favorites = await db
      .select({
        id: events.id,
        title: events.title,
        description: events.description,
        startDate: events.startDate,
        endDate: events.endDate,
        startTime: events.startTime,
        endTime: events.endTime,
        location: events.location,
        address: events.address,
        organizerName: events.organizerName,
        organizerContact: events.organizerContact,
        categoryId: events.categoryId,
        price: events.price,
        capacity: events.capacity,
        imageUrl: events.imageUrl,
        imageUrl2: events.imageUrl2,
        imageUrl3: events.imageUrl3,
        websiteUrl: events.websiteUrl,
        ticketUrl: events.ticketUrl,
        tags: events.tags,
        participantType: events.participantType,
        isActive: events.isActive,
        isFeatured: events.isFeatured,
        createdAt: events.createdAt,
        updatedAt: events.updatedAt,
      })
      .from(userFavorites)
      .innerJoin(events, eq(userFavorites.eventId, events.id))
      .where(and(
        eq(userFavorites.userId, parseInt(userId)),
        eq(events.isActive, true)
      ))

    // Her etkinlik için kategorilerini getir
    const eventsWithCategories = await Promise.all(
      favorites.map(async (event) => {
        const eventCats = await db
          .select({
            categoryId: categories.id,
            categoryName: categories.name,
            categoryDisplayName: categories.displayName,
            categoryColor: categories.color,
            categoryIcon: categories.icon,
          })
          .from(eventCategories)
          .innerJoin(categories, eq(eventCategories.categoryId, categories.id))
          .where(eq(eventCategories.eventId, event.id))

        return {
          ...event,
          categories: eventCats,
        }
      })
    )

    return NextResponse.json(eventsWithCategories)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch favorites' }, { status: 500 })
  }
}

// POST - Etkinliği favorilere ekle
export async function POST(request: NextRequest) {
  try {
    const { userId, eventId } = await request.json()

    if (!userId || !eventId) {
      return NextResponse.json({ error: 'User ID and Event ID are required' }, { status: 400 })
    }

    // Zaten favori olup olmadığını kontrol et
    const existing = await db
      .select()
      .from(userFavorites)
      .where(and(
        eq(userFavorites.userId, userId),
        eq(userFavorites.eventId, eventId)
      ))
      .limit(1)

    if (existing.length > 0) {
      return NextResponse.json({ message: 'Already in favorites' }, { status: 200 })
    }

    // Favorilere ekle
    await db.insert(userFavorites).values({
      userId,
      eventId,
    })

    return NextResponse.json({ message: 'Added to favorites' }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add to favorites' }, { status: 500 })
  }
}

// DELETE - Etkinliği favorilerden çıkar
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const eventId = searchParams.get('eventId')

    if (!userId || !eventId) {
      return NextResponse.json({ error: 'User ID and Event ID are required' }, { status: 400 })
    }

    await db
      .delete(userFavorites)
      .where(and(
        eq(userFavorites.userId, parseInt(userId)),
        eq(userFavorites.eventId, parseInt(eventId))
      ))

    return NextResponse.json({ message: 'Removed from favorites' }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to remove from favorites' }, { status: 500 })
  }
}