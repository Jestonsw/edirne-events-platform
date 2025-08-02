import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { eventReviews, events, users } from '@/lib/schema'
import { eq, and, desc } from 'drizzle-orm'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const eventId = searchParams.get('eventId')
    
    if (!eventId) {
      return NextResponse.json({ error: 'Event ID gerekli' }, { status: 400 })
    }

    // Get reviews for specific event
    const reviews = await db
      .select({
        id: eventReviews.id,
        rating: eventReviews.rating,
        comment: eventReviews.comment,
        isAnonymous: eventReviews.isAnonymous,
        createdAt: eventReviews.createdAt,
        userName: users.name
      })
      .from(eventReviews)
      .leftJoin(users, eq(eventReviews.userId, users.id))
      .where(and(
        eq(eventReviews.eventId, parseInt(eventId)),
        eq(eventReviews.isApproved, true)
      ))
      .orderBy(desc(eventReviews.createdAt))

    return NextResponse.json(reviews)
  } catch (error) {
    console.error('Reviews fetch error:', error)
    return NextResponse.json({ error: 'Reviews yüklenemedi' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { eventId, userId, rating, comment, isAnonymous } = body

    if (!eventId || !userId || !rating) {
      return NextResponse.json({ error: 'Event ID, User ID ve rating gerekli' }, { status: 400 })
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating 1-5 arasında olmalı' }, { status: 400 })
    }

    // Check if user already reviewed this event
    const existingReview = await db
      .select()
      .from(eventReviews)
      .where(and(
        eq(eventReviews.eventId, eventId),
        eq(eventReviews.userId, userId)
      ))
      .limit(1)

    if (existingReview.length > 0) {
      return NextResponse.json({ error: 'Bu etkinlik için zaten değerlendirme yaptınız' }, { status: 400 })
    }

    // Insert new review
    const newReview = await db
      .insert(eventReviews)
      .values({
        eventId,
        userId,
        rating,
        comment: comment || null,
        isAnonymous: isAnonymous || false,
        isApproved: true
      })
      .returning()

    // Update event's average rating and review count
    await updateEventRating(eventId)

    return NextResponse.json(newReview[0], { status: 201 })
  } catch (error) {
    console.error('Review creation error:', error)
    return NextResponse.json({ error: 'Değerlendirme kaydedilemedi' }, { status: 500 })
  }
}

async function updateEventRating(eventId: number) {
  try {
    // Calculate average rating and count
    const reviewStats = await db
      .select()
      .from(eventReviews)
      .where(and(
        eq(eventReviews.eventId, eventId),
        eq(eventReviews.isApproved, true)
      ))

    const totalReviews = reviewStats.length
    const averageRating = totalReviews > 0 
      ? reviewStats.reduce((sum, review) => sum + review.rating, 0) / totalReviews 
      : 0

    // Update event table
    await db
      .update(events)
      .set({
        rating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
        reviewCount: totalReviews,
        updatedAt: new Date()
      })
      .where(eq(events.id, eventId))

  } catch (error) {
    console.error('Error updating event rating:', error)
  }
}