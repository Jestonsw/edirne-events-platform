'use client'

// Using the same interfaces as defined in the main app
interface Event {
  id: number
  title: string
  description: string
  startDate: string
  endDate?: string
  startTime: string
  endTime?: string
  location: string
  address?: string
  organizerName?: string
  organizerContact?: string
  categoryId: number
  price: string
  capacity?: number
  imageUrl?: string
  websiteUrl?: string
  ticketUrl?: string
  tags?: string | string[]
  participantType: string
  isActive: boolean
  isFeatured: boolean
  createdAt: string
  updatedAt: string
  latitude?: number | null
  longitude?: number | null
}

interface Category {
  id: number
  name: string
  displayName: string
  color: string
  icon: string
  createdAt: string
}

interface Venue {
  id: number
  name: string
  description: string
  address: string
  city: string
  phone?: string
  email?: string
  website?: string
  capacity: number
  amenities: string[]
  imageUrl?: string
  latitude?: number
  longitude?: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

const CACHE_KEYS = {
  EVENTS: 'etkinlik_rehberi_events',
  CATEGORIES: 'etkinlik_rehberi_categories',
  VENUES: 'etkinlik_rehberi_venues',
  LAST_SYNC: 'etkinlik_rehberi_last_sync',
  OFFLINE_MODE: 'etkinlik_rehberi_offline_mode'
}

const CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 hours in milliseconds

export class OfflineManager {
  private static instance: OfflineManager
  private isOnline: boolean = true
  private onlineStatusListeners: ((status: boolean) => void)[] = []

  private constructor() {
    if (typeof window !== 'undefined') {
      this.isOnline = navigator.onLine
      this.setupOnlineStatusListeners()
    }
  }

  public static getInstance(): OfflineManager {
    if (!OfflineManager.instance) {
      OfflineManager.instance = new OfflineManager()
    }
    return OfflineManager.instance
  }

  private setupOnlineStatusListeners() {
    window.addEventListener('online', () => {
      this.isOnline = true
      this.notifyStatusChange(true)
    })

    window.addEventListener('offline', () => {
      this.isOnline = false
      this.notifyStatusChange(false)
    })
  }

  public addOnlineStatusListener(callback: (status: boolean) => void) {
    this.onlineStatusListeners.push(callback)
    return () => {
      this.onlineStatusListeners = this.onlineStatusListeners.filter(
        listener => listener !== callback
      )
    }
  }

  private notifyStatusChange(status: boolean) {
    this.onlineStatusListeners.forEach(listener => listener(status))
  }

  public getOnlineStatus(): boolean {
    return this.isOnline
  }

  // Cache events data
  public cacheEvents(events: Event[]): void {
    try {
      const dataToCache = {
        events,
        timestamp: Date.now()
      }
      localStorage.setItem(CACHE_KEYS.EVENTS, JSON.stringify(dataToCache))
    } catch (error) {
    }
  }

  // Cache categories data
  public cacheCategories(categories: Category[]): void {
    try {
      const dataToCache = {
        categories,
        timestamp: Date.now()
      }
      localStorage.setItem(CACHE_KEYS.CATEGORIES, JSON.stringify(dataToCache))
    } catch (error) {
    }
  }

  // Cache venues data
  public cacheVenues(venues: Venue[]): void {
    try {
      const dataToCache = {
        venues,
        timestamp: Date.now()
      }
      localStorage.setItem(CACHE_KEYS.VENUES, JSON.stringify(dataToCache))
    } catch (error) {
    }
  }

  // Get cached events
  public getCachedEvents(): Event[] | null {
    try {
      const cached = localStorage.getItem(CACHE_KEYS.EVENTS)
      if (!cached) return null

      const { events, timestamp } = JSON.parse(cached)
      
      // Check if cache is still valid
      if (Date.now() - timestamp > CACHE_DURATION) {
        localStorage.removeItem(CACHE_KEYS.EVENTS)
        return null
      }

      return events
    } catch (error) {
      return null
    }
  }

  // Get cached categories
  public getCachedCategories(): Category[] | null {
    try {
      const cached = localStorage.getItem(CACHE_KEYS.CATEGORIES)
      if (!cached) return null

      const { categories, timestamp } = JSON.parse(cached)
      
      // Check if cache is still valid
      if (Date.now() - timestamp > CACHE_DURATION) {
        localStorage.removeItem(CACHE_KEYS.CATEGORIES)
        return null
      }

      return categories
    } catch (error) {
      return null
    }
  }

  // Get cached venues
  public getCachedVenues(): Venue[] | null {
    try {
      const cached = localStorage.getItem(CACHE_KEYS.VENUES)
      if (!cached) return null

      const { venues, timestamp } = JSON.parse(cached)
      
      // Check if cache is still valid
      if (Date.now() - timestamp > CACHE_DURATION) {
        localStorage.removeItem(CACHE_KEYS.VENUES)
        return null
      }

      return venues
    } catch (error) {
      return null
    }
  }

  // Check if we have valid cached data
  public hasValidCache(): boolean {
    const events = this.getCachedEvents()
    const categories = this.getCachedCategories()
    return !!(events && categories && events.length > 0 && categories.length > 0)
  }

  // Set offline mode preference
  public setOfflineMode(enabled: boolean): void {
    localStorage.setItem(CACHE_KEYS.OFFLINE_MODE, JSON.stringify(enabled))
  }

  // Get offline mode preference
  public getOfflineMode(): boolean {
    try {
      const stored = localStorage.getItem(CACHE_KEYS.OFFLINE_MODE)
      return stored ? JSON.parse(stored) : false
    } catch {
      return false
    }
  }

  // Update last sync timestamp
  public updateLastSync(): void {
    localStorage.setItem(CACHE_KEYS.LAST_SYNC, Date.now().toString())
  }

  // Get last sync timestamp
  public getLastSync(): Date | null {
    try {
      const timestamp = localStorage.getItem(CACHE_KEYS.LAST_SYNC)
      return timestamp ? new Date(parseInt(timestamp)) : null
    } catch {
      return null
    }
  }

  // Clear all cached data
  public clearCache(): void {
    Object.values(CACHE_KEYS).forEach(key => {
      localStorage.removeItem(key)
    })
  }

  // Get cache size in MB
  public getCacheSize(): number {
    try {
      let totalSize = 0
      Object.values(CACHE_KEYS).forEach(key => {
        const item = localStorage.getItem(key)
        if (item) {
          totalSize += new Blob([item]).size
        }
      })
      return Math.round(totalSize / 1024 / 1024 * 100) / 100 // MB with 2 decimal places
    } catch {
      return 0
    }
  }

  // Check if data should be refreshed
  public shouldRefreshData(): boolean {
    if (!this.isOnline) return false
    
    const lastSync = this.getLastSync()
    if (!lastSync) return true
    
    const timeSinceSync = Date.now() - lastSync.getTime()
    return timeSinceSync > CACHE_DURATION / 2 // Refresh if more than 12 hours old
  }
}