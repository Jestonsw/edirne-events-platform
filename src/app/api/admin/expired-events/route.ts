import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { events } from '@/lib/schema'
import { eq, and, or, isNull, sql } from 'drizzle-orm'

export async function POST() {
  try {
    // SQL query to deactivate expired events with proper date/time handling
    const result = await db.execute(sql`
      UPDATE events 
      SET is_active = false, updated_at = NOW() 
      WHERE is_active = true 
      AND (
        (end_date IS NOT NULL AND (
          CASE 
            WHEN end_time IS NOT NULL THEN 
              (end_date::timestamp + end_time::time) < NOW()
            ELSE 
              end_date < CURRENT_DATE
          END
        )) 
        OR 
        (end_date IS NULL AND start_date < CURRENT_DATE)
      )
    `)

    const deactivatedCount = (result as any).rowCount || (result as any).affectedRows || 0

    return NextResponse.json({ 
      success: true, 
      deactivatedCount,
      message: `${deactivatedCount} expired events deactivated`
    })
  } catch (error) {

    return NextResponse.json({ 
      error: 'Failed to deactivate expired events' 
    }, { status: 500 })
  }
}

export async function GET() {
  try {
    // Get list of expired events that are still active
    const expiredEvents = await db.execute(sql`
      SELECT id, title, start_date, end_date, start_time, end_time
      FROM events 
      WHERE is_active = true 
      AND (
        (end_date IS NOT NULL AND (
          CASE 
            WHEN end_time IS NOT NULL THEN 
              (end_date::timestamp + end_time::time) < NOW()
            ELSE 
              end_date < CURRENT_DATE
          END
        )) 
        OR 
        (end_date IS NULL AND start_date < CURRENT_DATE)
      )
      ORDER BY start_date DESC
    `)

    return NextResponse.json({ 
      success: true,
      expiredEvents: (expiredEvents as any).rows || expiredEvents,
      count: ((expiredEvents as any).rows || expiredEvents).length || 0
    })
  } catch (error) {

    return NextResponse.json({ 
      error: 'Failed to fetch expired events' 
    }, { status: 500 })
  }
}