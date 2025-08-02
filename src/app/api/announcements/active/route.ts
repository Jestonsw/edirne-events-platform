import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { announcements } from '@/lib/schema'
import { eq, and, lte, gte, or, isNull } from 'drizzle-orm'

export async function GET() {
  try {
    const now = new Date()
    
    // Get active announcement that is within date range (if specified)
    const activeAnnouncements = await db.select()
      .from(announcements)
      .where(
        and(
          eq(announcements.isActive, true),
          or(
            isNull(announcements.startDate),
            lte(announcements.startDate, now)
          ),
          or(
            isNull(announcements.endDate),
            gte(announcements.endDate, now)
          )
        )
      )
      .orderBy(announcements.createdAt)
      .limit(1)

    if (activeAnnouncements.length === 0) {
      return NextResponse.json(null)
    }

    return NextResponse.json(activeAnnouncements[0])
  } catch (error) {
    return NextResponse.json(null)
  }
}