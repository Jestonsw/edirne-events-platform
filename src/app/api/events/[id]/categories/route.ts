import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { eventCategories, categories } from '@/lib/schema'
import { eq } from 'drizzle-orm'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const eventId = parseInt(params.id)
    
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

    return NextResponse.json(eventCats)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch event categories' }, { status: 500 })
  }
}