import { NextRequest, NextResponse } from 'next/server'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { venueCategories } from '@/lib/schema'
import { eq } from 'drizzle-orm'

const client = postgres(process.env.DATABASE_URL!)
const db = drizzle(client)

export async function POST(request: NextRequest) {
  try {
    const { categoryOrders }: { categoryOrders: { id: number; sortOrder: number }[] } = await request.json()

    // Update all venue category orders in a transaction
    for (const category of categoryOrders) {
      await db
        .update(venueCategories)
        .set({ sortOrder: category.sortOrder })
        .where(eq(venueCategories.id, category.id))
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update venue category order' }, { status: 500 })
  }
}