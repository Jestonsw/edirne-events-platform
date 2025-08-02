import { MetadataRoute } from 'next'
import { db } from '@/lib/db'
import { events, venues } from '@/lib/schema'
import { eq } from 'drizzle-orm'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.edirne-events.com'
  
  // Static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/events`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/venues`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/submit-event`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/submit-venue`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
  ]

  try {
    // Get active events
    const activeEvents = await db
      .select()
      .from(events)
      .where(eq(events.isActive, true))
      .limit(1000)

    // Get active venues
    const activeVenues = await db
      .select()
      .from(venues)
      .where(eq(venues.isActive, true))
      .limit(1000)

    // Create event pages
    const eventPages = activeEvents.map((event) => ({
      url: `${baseUrl}/events/${event.id}`,
      lastModified: event.updatedAt ? new Date(event.updatedAt) : new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))

    // Create venue pages
    const venuePages = activeVenues.map((venue) => ({
      url: `${baseUrl}/venues/${venue.id}`,
      lastModified: venue.updatedAt ? new Date(venue.updatedAt) : new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }))

    return [...staticPages, ...eventPages, ...venuePages]
  } catch (error) {
    console.error('Error generating sitemap:', error)
    return staticPages
  }
}