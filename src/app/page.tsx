'use client'

import { useState, useEffect, useRef, useCallback, useMemo, lazy, Suspense } from 'react'
import { Calendar, Search, MapPin, Clock, Users, Star, Filter, Heart, Home, User, Map, Plus, UserPlus } from 'lucide-react'
import Header from '@/components/Header'
import EventCard from '@/components/EventCard'
import LoadingSpinner from '@/components/LoadingSpinner'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import OfflineIndicator from '@/components/OfflineIndicator'

// Lazy load heavy components
const EventModal = lazy(() => import('@/components/EventModal'))
const VenueCard = lazy(() => import('@/components/VenueCard'))
const VenueModal = lazy(() => import('@/components/VenueModal'))
const MapView = lazy(() => import('@/components/MapView'))
const ProfileMenu = lazy(() => import('@/components/ProfileMenu'))
const EventSubmissionModal = lazy(() => import('@/components/EventSubmissionModal'))
const VenueSubmissionModal = lazy(() => import('@/components/VenueSubmissionModal'))
const AnnouncementPopup = lazy(() => import('@/components/AnnouncementPopup'))
const MembershipRequiredModal = lazy(() => import('@/components/MembershipRequiredModal'))

import { OfflineManager } from '@/lib/offline'
import { useLanguage } from '@/contexts/LanguageContext'

interface Event {
  id: number
  title: string
  description: string
  startDate: string
  endDate?: string
  startTime: string
  endTime?: string
  location: string
  venue?: string
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
}

interface Category {
  id: number
  name: string
  displayName: string
  color: string
  icon: string
}

interface VenueCategory {
  id: number
  name: string
  displayName: string
  color: string
  icon: string
  description?: string
  isActive: boolean
  sortOrder?: number
}

interface Venue {
  id: number
  name: string
  description: string | null
  address: string
  phone: string | null
  phone2: string | null
  email: string | null
  website: string | null
  capacity: number | null
  amenities: string | null
  imageUrl: string | null
  imageUrl2: string | null
  imageUrl3: string | null
  latitude: number | null
  longitude: number | null
  openingHours: string | null
  rating: number | null
  reviewCount: number | null
  priceRange: string | null
  isActive: boolean | null
  isFeatured: boolean | null
  categoryId: number
  createdAt: string
  updatedAt: string
  venue_categories?: {
    id: number
    name: string
    displayName: string
    color: string
    icon: string
    description: string
    isActive: boolean
    createdAt: string
    updatedAt: string
  }
}

// Icon mapping for categories
const getIconEmoji = (iconName: string): string => {
  const iconMap: { [key: string]: string } = {
    calendar: '📅',
    music: '🎵',
    theater: '🎭',
    art: '🎨',
    sports: '⚽',
    food: '🍽️',
    kids: '👶',
    education: '📚',
    business: '💼',
    tech: '💻',
    conference: '🎤',
    cinema: '🎬',
    festival: '🎪',
    exhibition: '🖼️',
    workshop: '🔧',
    museum: '🏛️',
    museums: '🏛️',
    müzeler: '🏛️',
    frame: '🖼️',
    palette: '🎨',
    trophy: '🏆',
    presentation: '🎤',
    film: '🎬',
    baby: '👶',
    utensils: '🍽️',
    tools: '🔧',
    mask: '🎭',
    party: '🎪',
    landmark: '🏛️',
    wine: '🍷',
    coffee: '☕',
    'shopping-bag': '🛍️',
    trees: '🌳',
    building: '🏢',
    store: '🏬',
    'glass-water': '🍻',
    waves: '♨️',
    sparkles: '✨',
    heart: '💅',
    church: '🕌',
    default: '📅'
  }
  return iconMap[iconName] || iconMap.default
}

// Date formatter for different languages using date-fns
const formatDate = (date: Date, language: string) => {
  try {
    const day = date.getDate().toString().padStart(2, '0')
    const monthNames = {
      tr: ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'],
      en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      bg: ['Яну', 'Фев', 'Мар', 'Апр', 'Май', 'Юни', 'Юли', 'Авг', 'Сеп', 'Окт', 'Ное', 'Дек']
    }
    const months = monthNames[language as keyof typeof monthNames] || monthNames.tr
    const monthIndex = date.getMonth()
    return `${day} ${months[monthIndex]}`
  } catch (error) {
    return '-- ---'
  }
}

export default function HomePage() {
  const { t, language } = useLanguage()
  const [events, setEvents] = useState<Event[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [venueCategories, setVenueCategories] = useState<VenueCategory[]>([])

  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const [selectedDate, setSelectedDate] = useState<string>('')
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [favorites, setFavorites] = useState<Set<number>>(new Set())
  const [showFavorites, setShowFavorites] = useState(false)


  const [activeTab, setActiveTab] = useState<'events' | 'venues'>('events')
  const [activeBottomTab, setActiveBottomTab] = useState<'etkinlikle' | 'bugun' | 'islemler' | 'kesfet' | 'profil' | 'etkinlik-oner' | 'mekan-oner' | 'arkadas-bul' | 'grup-kur'>('etkinlikle')
  const [showEventSubmissionModal, setShowEventSubmissionModal] = useState(false)
  const [showVenueSubmissionModal, setShowVenueSubmissionModal] = useState(false)
  const [showMapView, setShowMapView] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [isOffline, setIsOffline] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const [usingCachedData, setUsingCachedData] = useState(false)
  const [venues, setVenues] = useState<Venue[]>([])

  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null)
  const [selectedVenueCategory, setSelectedVenueCategory] = useState<string>('all')
  const [user, setUser] = useState<any>(null)

  const [authMode, setAuthMode] = useState<'login' | 'register'>('login')
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null)
  const [showMembershipModal, setShowMembershipModal] = useState(false)
  const [membershipActionType, setMembershipActionType] = useState<'event' | 'venue'>('event')

  const categoryStripRef = useRef<HTMLDivElement>(null)
  const dateStripRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)
  const [dragDistance, setDragDistance] = useState(0)


  // Mark as client-side mounted
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Load user and initialize app
  useEffect(() => {
    const initializeApp = async () => {
      try {
        setIsLoading(true)
        
        // Load user from localStorage
        try {
          const userData = localStorage.getItem('user')
          if (userData) {
            const parsedUser = JSON.parse(userData)
            setUser(parsedUser)
          }
        } catch (error) {
          // Invalid user data, ignore
        }
        
        // Load favorites quickly from localStorage first
        try {
          const stored = localStorage.getItem('event-favorites')
          if (stored) {
            setFavorites(new Set(JSON.parse(stored)))
          }
        } catch (error) {
          // Invalid favorites data, ignore
        }
        
        // Load essential data only
        await loadData()
        
        // Load venue categories and venues when venues tab is accessed
        if (activeTab === 'venues') {
          try {
            const [categoriesResponse, venuesResponse] = await Promise.all([
              fetch('/api/venue-categories'),
              fetch('/api/venues')
            ])
            
            if (categoriesResponse.ok) {
              const categoriesData = await categoriesResponse.json()

              setVenueCategories(categoriesData.categories || [])
            }
            
            if (venuesResponse.ok) {
              const venuesData = await venuesResponse.json()
              setVenues(venuesData)
            }
          } catch (error) {
            console.error('Venues data yüklenirken hata:', error)
          }
        }

        
      } catch (error) {
        // App initialization failed, but don't crash
      } finally {
        setIsLoading(false)
      }
    }
    
    initializeApp()
    
    // Set up offline status monitoring
    const offlineManager = OfflineManager.getInstance()
    const unsubscribe = offlineManager.addOnlineStatusListener((status) => {
      setIsOffline(!status)
      
      // If coming back online and should refresh data, reload
      if (status && offlineManager.shouldRefreshData()) {
        loadData()
      }
    })
    
    return unsubscribe
  }, [])

  // Sync favorites from database after initial load (background task)
  useEffect(() => {
    const syncFavoritesFromDatabase = async () => {
      try {
        const userData = localStorage.getItem('user')
        if (userData) {
          const parsedUser = JSON.parse(userData)
          if (parsedUser && parsedUser.id) {
            const favoritesRes = await fetch(`/api/favorites?userId=${parsedUser.id}`)
            if (favoritesRes.ok) {
              const userFavorites = await favoritesRes.json()
              const favoriteIds = new Set<number>(userFavorites.map((event: any) => Number(event.id)))
              setFavorites(favoriteIds)
              localStorage.setItem('event-favorites', JSON.stringify(Array.from(favoriteIds)))
            }
          }
        }
      } catch (error) {
        // Background sync failed, keep localStorage version
      }
    }

    // Sync favorites from database after app loads
    if (user) {
      syncFavoritesFromDatabase()
    }
  }, [user])

  // Load venues when switching to venues tab (lazy loading)
  useEffect(() => {
    if (activeTab === 'venues' && venues.length === 0) {
      loadVenues()
    }
  }, [activeTab])

  // Load venue categories when switching to venues tab
  useEffect(() => {
    if (activeTab === 'venues') {
      // Force reload venue categories every time
      setVenueCategories([]) // Clear first
      setTimeout(() => {
        loadVenueCategories()
      }, 50)
    }
  }, [activeTab])

  // Authentication handlers
  const requireAuth = (action: () => void, actionType: 'event' | 'venue' = 'event') => {
    if (user) {
      action()
    } else {
      // Show membership required modal
      setPendingAction(() => action)
      setMembershipActionType(actionType)
      setShowMembershipModal(true)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('user')
    setUser(null)
    setShowProfileMenu(false)
  }

  const handleHorizontalScroll = (e: React.WheelEvent) => {
    e.preventDefault()
    e.currentTarget.scrollLeft += e.deltaY
  }

  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    // Don't start dragging if clicking on a button
    if ((e.target as HTMLElement).tagName === 'BUTTON') return
    
    setIsDragging(true)
    setDragDistance(0)
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const element = e.currentTarget as HTMLDivElement
    setStartX(clientX - element.offsetLeft)
    setScrollLeft(element.scrollLeft)
  }

  const handleDragMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging) return
    e.preventDefault()
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const element = e.currentTarget as HTMLDivElement
    const x = clientX - element.offsetLeft
    const distance = Math.abs(x - startX)
    setDragDistance(distance)
    const walk = (x - startX) * 2
    element.scrollLeft = scrollLeft - walk
  }

  const handleDragEnd = () => {
    setIsDragging(false)
    // Reset drag distance after a brief delay
    setTimeout(() => setDragDistance(0), 100)
  }

  const loadData = async (category?: string, date?: string) => {
    const offlineManager = OfflineManager.getInstance()
    
    try {
      // Check offline status
      const isOnlineStatus = offlineManager.getOnlineStatus()
      setIsOffline(!isOnlineStatus)
      
      // If offline, try to load from cache
      if (!isOnlineStatus) {
        const cachedCategories = offlineManager.getCachedCategories()
        const cachedEvents = offlineManager.getCachedEvents()
        
        if (cachedCategories && cachedEvents) {
          setCategories(cachedCategories)
          setEvents(cachedEvents)
          setUsingCachedData(true)
          return
        } else {
          throw new Error('No cached data available')
        }
      }
      
      // Build events API URL with filters
      const params = new URLSearchParams()
      if (category && category !== 'all') {
        params.append('category', category)
      }
      if (date) {
        params.append('date', date)
      }
      
      const eventsUrl = `/api/events${params.toString() ? '?' + params.toString() : ''}`
      
      // Online: fetch data in parallel
      const [categoriesRes, eventsRes] = await Promise.all([
        fetch('/api/categories?' + new Date().getTime()),
        fetch(eventsUrl)
      ])
      
      const [categoriesData, eventsData] = await Promise.all([
        categoriesRes.json(),
        eventsRes.json()
      ])
      
      // Cache the fresh data (only cache unfiltered data)
      if (!category && !date) {
        offlineManager.cacheCategories(categoriesData)
        offlineManager.cacheEvents(eventsData)
        offlineManager.updateLastSync()
      }
      
      setCategories(categoriesData)
      setEvents(eventsData)
      setUsingCachedData(false)
      
      return eventsData // Return loaded events for preloading
      
    } catch (error) {
      // Fallback to cached data if available
      const cachedCategories = offlineManager.getCachedCategories()
      const cachedEvents = offlineManager.getCachedEvents()
      
      if (cachedCategories && cachedEvents) {
        setCategories(cachedCategories)
        setEvents(cachedEvents)
        setUsingCachedData(true)
        return cachedEvents // Return cached events for preloading
      }
      return []
    }
  }



  const saveFavorites = async (newFavorites: Set<number>) => {
    // Update localStorage first for immediate UI feedback
    localStorage.setItem('event-favorites', JSON.stringify(Array.from(newFavorites)))
    setFavorites(newFavorites)

    // If user is logged in, sync with database
    try {
      const userData = localStorage.getItem('user')
      if (userData) {
        const parsedUser = JSON.parse(userData)
        if (parsedUser && parsedUser.id) {
          // Get current favorites from database
          const currentRes = await fetch(`/api/favorites?userId=${parsedUser.id}`)
          if (currentRes.ok) {
            const currentFavorites = await currentRes.json()
            const currentIds = new Set<number>(currentFavorites.map((event: any) => Number(event.id)))
            
            // Find additions and deletions
            const toAdd = Array.from(newFavorites).filter(id => !currentIds.has(id))
            const toRemove = Array.from(currentIds).filter((id: number) => !newFavorites.has(id))
            
            // Add new favorites
            for (const eventId of toAdd) {
              await fetch('/api/favorites', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: parsedUser.id, eventId })
              })
            }
            
            // Remove old favorites
            for (const eventId of toRemove) {
              await fetch(`/api/favorites?userId=${parsedUser.id}&eventId=${eventId}`, {
                method: 'DELETE'
              })
            }
          }
        }
      }
    } catch (error) {
      // Database sync failed, but localStorage is updated
    }
  }

  const loadVenueCategories = async () => {
    try {
      const response = await fetch('/api/venue-categories')
      
      if (response.ok) {
        const data = await response.json()
        const categories = data.categories || data || []
        
        setVenueCategories(categories)
        return categories
      } else {
        setVenueCategories([])
        return []
      }
    } catch (error) {
      setVenueCategories([])
      return []
    }
  }

  const loadVenues = async () => {
    try {
      console.log('🏢 Loading venues...')
      const categoryParam = selectedVenueCategory !== 'all' ? `?categoryId=${selectedVenueCategory}` : ''
      const response = await fetch(`/api/venues${categoryParam}`)
      console.log('🏢 Venues API response:', response.status)
      if (response.ok) {
        const data = await response.json()
        console.log('🏢 Venues data loaded:', data.length, 'venues')
        console.log('🏢 First venue:', data[0])
        // API already returns correctly formatted venue objects with venue_categories
        setVenues(data)
      }
    } catch (error) {
      console.error('🏢 Venues loading error:', error)
      setVenues([])
    }
  }

  // Effect to reload venues when venue category changes
  useEffect(() => {
    if (activeTab === 'venues') {
      loadVenues()
    }
  }, [selectedVenueCategory, activeTab])

  // No more preloading - using intelligent cache system instead

  // Smart sync system - only refresh when changes detected
  useEffect(() => {
    let lastEventCount = events.length
    let lastVenueCount = venues.length
    
    const interval = setInterval(async () => {
      try {
        if (activeTab === 'events') {
          // Quick check for event changes - check latest updated timestamp
          const response = await fetch(`/api/events?latest=true&category=${selectedCategory || ''}&date=${selectedDate || ''}&t=${Date.now()}`)
          if (response.ok) {
            const { latestUpdate } = await response.json()
            
            // Store the latest timestamp we know about
            if (!(window as any).lastKnownUpdate) {
              (window as any).lastKnownUpdate = latestUpdate
            }
            
            // Only reload if there's a newer update
            if (latestUpdate !== (window as any).lastKnownUpdate) {
              await loadData(selectedCategory, selectedDate)
              ;(window as any).lastKnownUpdate = latestUpdate
            }
          }
        }
        
        if (activeTab === 'venues') {
          // Quick check for venue changes  
          const response = await fetch(`/api/venues?count=true&t=${Date.now()}`)
          if (response.ok) {
            const { count } = await response.json()
            
            // Only reload if count changed
            if (count !== lastVenueCount) {
              await loadVenues()
              lastVenueCount = count
            }
          }
        }
      } catch (error) {
        // Silent error handling for smart sync
      }
    }, 3000) // Check every 3 seconds, but only reload when needed

    return () => clearInterval(interval)
  }, [activeTab, selectedCategory, selectedDate, events.length, venues.length])

  // Force immediate refresh when component mounts or admin adds events
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && activeTab === 'events') {
        loadData(selectedCategory, selectedDate)
      }
    }
    
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [activeTab, selectedCategory, selectedDate])

  // Optimize filtering with useMemo - API already handles category and date filtering
  const filteredEvents = useMemo(() => {
    // Ensure events is always an array
    if (!Array.isArray(events)) return []
    
    let filtered = events

    // Show only favorites if favorites view is active
    if (showFavorites) {
      filtered = filtered.filter(event => favorites.has(event.id))
    }

    // Sort by date and featured status
    const sorted = filtered.sort((a, b) => {
      if (a.isFeatured && !b.isFeatured) return -1
      if (!a.isFeatured && b.isFeatured) return 1
      return new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    })
    
    return sorted
  }, [events, showFavorites, favorites])

  // Optimize venue filtering with useMemo
  const filteredVenues = useMemo(() => {
    return venues
  }, [venues])

  const handleCategoryChange = useCallback(async (category: string) => {
    if (selectedCategory !== category) {
      setSelectedCategory(category)
      // Reload data with new category filter
      await loadData(category, selectedDate)
    }
  }, [selectedCategory, selectedDate])

  const toggleFavorite = useCallback((eventId: number) => {
    const newFavorites = new Set(favorites)
    if (newFavorites.has(eventId)) {
      newFavorites.delete(eventId)
    } else {
      newFavorites.add(eventId)
    }
    saveFavorites(newFavorites)
  }, [favorites, saveFavorites])

  const clearFilters = () => {
    setSelectedCategory('all')
    setSelectedDate('')
    setShowFavorites(false)
  }

  const toggleFavoritesView = () => {
    setShowFavorites(!showFavorites)
    setShowInfo(false)
    if (!showFavorites) {
      setSelectedCategory('all')
      setSelectedDate('')
    }
  }

  const toggleInfoView = () => {
    setShowInfo(!showInfo)
    setShowFavorites(false)
  }











  // Show loading spinner after splash screen is done
  if (isLoading) {

    return (
      <div className="min-h-screen">
        <Header 
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onProfileClick={() => {
            setShowProfileMenu(true)
            setActiveBottomTab('etkinlikle')
          }}
          user={user}
        />
        <LoadingSpinner />
      </div>
    )
  }



  // Main application
  return (
    <div className="h-screen flex flex-col">
          {/* Fixed Header Section */}
      <div className="flex-shrink-0">
        <div className="relative">
          <Header 
            activeTab={activeTab}
            onTabChange={setActiveTab}
            onProfileClick={() => {
              setShowProfileMenu(true)
              setActiveBottomTab('etkinlikle')
            }}
            user={user}
          />
          {/* Offline Indicator */}
          <div className="absolute top-2 right-2 z-10">
            <OfflineIndicator />
          </div>
        </div>

        {/* Fixed Filters Section - Only show for events tab */}
        {activeTab === 'events' && (
          <section className="bg-white shadow-md border-b border-gray-200">
            <div className="container mx-auto px-4 py-3">
              <div className="flex flex-col gap-2">
            
            
            {/* Category Strip */}
            <div className="flex gap-2 mb-2">
              <button
                onClick={async () => {
                  setSelectedDate('')
                  await handleCategoryChange('all')
                }}
                className={`flex-shrink-0 px-3 py-2 rounded-lg text-sm font-medium transition-colors min-w-[80px] h-[42px] flex items-center justify-center ${
                  selectedCategory === 'all'
                    ? 'bg-blue-100 text-blue-700 border border-blue-300'
                    : 'bg-blue-100 text-blue-700 hover:bg-blue-200 border border-blue-300'
                }`}
              >
                <div className="flex items-center gap-1">
                  <span className="text-sm">🌟</span>
                  <span>{t('categories.all')}</span>
                </div>
              </button>
              <div 
                ref={categoryStripRef} 
                className="overflow-x-auto scrollbar-hide flex-1 cursor-grab active:cursor-grabbing"
                onWheel={handleHorizontalScroll}
                onMouseDown={handleDragStart}
                onMouseMove={handleDragMove}
                onMouseUp={handleDragEnd}
                onMouseLeave={handleDragEnd}
                onTouchStart={handleDragStart}
                onTouchMove={handleDragMove}
                onTouchEnd={handleDragEnd}
                style={{ touchAction: 'pan-x' }}
              >
                <div className="flex gap-2 min-w-max pb-2">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => handleCategoryChange(category.name)}
                      className={`flex-shrink-0 px-3 py-2 rounded-lg text-sm font-medium transition-colors min-w-[80px] h-[42px] flex items-center justify-center ${
                        selectedCategory === category.name
                          ? 'bg-green-400 text-white'
                          : 'bg-red-50 text-gray-700 hover:bg-red-100'
                      }`}
                    >
                      <div className="flex items-center gap-1">
                        <span className="text-sm">{getIconEmoji(category.icon)}</span>
                        <span>{category.displayName}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex gap-2">
              {/* Today's Date - Fixed */}
              {(() => {
                const today = new Date()
                const todayStr = today.toISOString().split('T')[0]
                const isSelected = selectedDate === todayStr
                const isWeekend = today.getDay() === 0 || today.getDay() === 6 // 0 = Sunday, 6 = Saturday
                
                return (
                  <button
                    onClick={() => setSelectedDate(todayStr)}
                    className={`flex-shrink-0 px-3 py-2 rounded-lg text-sm transition-colors min-w-[80px] h-[42px] flex items-center justify-center ${
                      isSelected 
                        ? 'bg-green-400 text-white font-medium' 
                        : isWeekend
                        ? 'bg-blue-100 text-red-600 font-bold border border-blue-300'
                        : 'bg-blue-100 text-blue-700 font-medium border border-blue-300'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-xs font-bold">BUGÜN</div>
                      <div className="text-xs">
                        {isClient ? `${today.getDate().toString().padStart(2, '0')} ${['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'][today.getMonth()]}` : '-- ---'}
                      </div>
                    </div>
                  </button>
                )
              })()}
              
              {/* Future Dates - Scrollable */}
              <div 
                ref={dateStripRef} 
                className="overflow-x-auto scrollbar-hide flex-1 cursor-grab active:cursor-grabbing"
                onWheel={handleHorizontalScroll}
                onMouseDown={handleDragStart}
                onMouseMove={handleDragMove}
                onMouseUp={handleDragEnd}
                onMouseLeave={handleDragEnd}
                onTouchStart={handleDragStart}
                onTouchMove={handleDragMove}
                onTouchEnd={handleDragEnd}
                style={{ touchAction: 'pan-x' }}
              >
                <div className="flex gap-2 min-w-max pb-2">
                  {Array.from({ length: 30 }, (_, index) => {
                    const date = new Date()
                    date.setDate(date.getDate() + 1 + index) // Start from tomorrow
                    const dateStr = date.toISOString().split('T')[0]
                    const isSelected = selectedDate === dateStr
                    const isWeekend = date.getDay() === 0 || date.getDay() === 6 // 0 = Sunday, 6 = Saturday
                    
                    return (
                      <button
                        key={dateStr}
                        onClick={async () => {
                          console.log('Date changed to:', dateStr, 'for category:', selectedCategory)
                          setSelectedDate(dateStr)
                          await loadData(selectedCategory, dateStr)
                        }}
                        className={`flex-shrink-0 px-3 py-2 rounded-lg text-sm transition-colors min-w-[80px] h-[42px] flex items-center justify-center border ${
                          isSelected 
                            ? 'bg-green-400 text-white font-medium border-green-400' 
                            : isWeekend
                            ? 'bg-red-50 text-red-600 font-bold hover:bg-red-100 border-black'
                            : 'bg-red-50 text-gray-700 font-medium hover:bg-red-100 border-black'
                        }`}
                      >
                        {isClient ? formatDate(date, language) : '--'}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
              </div>
            </div>
          </section>
        )}

        {/* Fixed Venue Category Filters Section - Only show for venues tab */}
        {activeTab === 'venues' && (
          <section className="bg-white shadow-md border-b border-gray-200">
            <div className="container mx-auto px-4 py-3">
              <div className="flex items-center gap-3">
                {/* All Categories Button */}
                <button
                  onClick={() => setSelectedVenueCategory('all')}
                  className={`flex-shrink-0 px-3 py-2 rounded-lg text-sm font-medium transition-colors min-w-[80px] h-[48px] flex items-center justify-center ${
                    selectedVenueCategory === 'all'
                      ? 'bg-green-400 text-white'
                      : 'bg-blue-100 text-blue-700 hover:bg-blue-200 border border-blue-300'
                  }`}
                >
                  <div className="flex items-center gap-1">
                    <div className="text-sm">🏢</div>
                    <div>Tümü</div>
                  </div>
                </button>
                
                {/* Scrollable Categories */}
                <div 
                  className="flex-1 overflow-x-auto scrollbar-hide cursor-grab active:cursor-grabbing"
                  onWheel={handleHorizontalScroll}
                  onMouseDown={handleDragStart}
                  onMouseMove={handleDragMove}
                  onMouseUp={handleDragEnd}
                  onMouseLeave={handleDragEnd}
                  onTouchStart={handleDragStart}
                  onTouchMove={handleDragMove}
                  onTouchEnd={handleDragEnd}
                  style={{ touchAction: 'pan-x' }}
                >
                  <div className="flex gap-2 min-w-max pb-1">

                    {venueCategories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => setSelectedVenueCategory(category.id.toString())}
                        className={`flex-shrink-0 px-3 py-2 rounded-lg text-xs font-medium transition-colors h-[48px] flex flex-col items-center justify-center min-w-[70px] max-w-[90px] ${
                          selectedVenueCategory === category.id.toString()
                            ? 'bg-green-400 text-white'
                            : 'bg-red-50 text-gray-700 hover:bg-red-100'
                        }`}
                        style={{ 
                          backgroundColor: selectedVenueCategory === category.id.toString() 
                            ? '#4ade80' 
                            : category.color + '20'
                        }}
                      >
                        <div className="text-xs mb-1">{getIconEmoji(category.icon)}</div>
                        <div className="text-xs leading-tight text-center">
                          {category.displayName.split(' ').map((word, index) => (
                            <div key={index} className="whitespace-nowrap">
                              {word}
                            </div>
                          ))}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}
      </div>

      {/* Scrollable Content Section - Events or Venues based on active tab */}
      <div className="flex-1 overflow-y-auto">
        {/* Hidden SEO Content - Only for search engines */}
        <div className="sr-only">
          <h1>
            {activeTab === 'events' ? 
              'Edirne Etkinlikleri | Konser, Festival, Kültür ve Sanat' : 
              'Edirne Gezilecek Yerler | Tarihi Mekanlar, Oteller, Restoranlar'
            }
          </h1>
          <p>
            {activeTab === 'events' ? 
              'Edirne\'deki tüm etkinlikleri keşfedin! Selimiye Cami çevresinde düzenlenen konserler, Kırkpınar festivali, Sarayiçi\'ndeki kültür etkinlikleri ve Meriç Nehri kenarındaki açık hava programları. Edirne\'de ne yapılır sorusunun cevabı burada - tiyatro, müzik, sanat ve sosyal aktiviteler için kapsamlı rehber.' :
              'Edirne gezilecek yerler ve tarihi mekanlar rehberi! Selimiye Cami, Üç Şerefeli Cami, Eski Cami gibi tarihi yapılar, Edirne oteller, Edirne yemek mekanları, kafeler ve restoranlar. Edirne Sarayı, Kapalı Çarşı, Ali Paşa Çarşısı ve daha fazlası.'
            }
          </p>
        </div>
        
        <section className="py-4">
          <div className="container mx-auto px-4">
            {activeTab === 'events' ? (
            !isClient ? (
              <div className="text-center py-16">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-1/4 mx-auto mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
                </div>
              </div>
            ) : filteredEvents.length === 0 ? (
              <div className="text-center py-16">
                <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  {t('events.noEvents')}
                </h3>
                <p className="text-gray-500 mb-4">
                  Seçtiğiniz kriterlere uygun etkinlik bulunmuyor.
                </p>
                <button
                  onClick={clearFilters}
                  className="btn-primary"
                >
                  Filtreleri Temizle
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredEvents.map((event) => (
                  <EventCard
                    key={`stable-${event.id}`}
                    event={event}
                    category={categories.find(cat => cat.id === event.categoryId)}
                    isFavorite={favorites.has(event.id)}
                    onFavoriteToggle={() => toggleFavorite(event.id)}
                    onEventClick={() => setSelectedEvent(event)}
                  />
                ))}
              </div>
            )
          ) : (
            // Venues display
            filteredVenues.length === 0 ? (
              <div className="text-center py-16">
                <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  Mekan Bulunamadı
                </h3>
                <p className="text-gray-500 mb-4">
                  Aradığınız kriterlere uygun mekan bulunmuyor.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredVenues.map((venue) => (
                  <VenueCard
                    key={venue.id}
                    venue={venue}
                    onClick={() => setSelectedVenue(venue)}
                  />
                ))}
              </div>
            )
          )}
          </div>
        </section>
      </div>

      {/* Event Modal */}
      {selectedEvent && (
        <Suspense fallback={<LoadingSpinner />}>
          <EventModal
            event={selectedEvent}
            category={categories.find(c => c.id === selectedEvent.categoryId)}
            isFavorite={favorites.has(selectedEvent.id)}
            onClose={() => setSelectedEvent(null)}
            onFavoriteToggle={() => toggleFavorite(selectedEvent.id)}
          />
        </Suspense>
      )}

      {/* Venue Modal */}
      {selectedVenue && (
        <Suspense fallback={<LoadingSpinner />}>
          <VenueModal
            venue={selectedVenue}
            onClose={() => setSelectedVenue(null)}
          />
        </Suspense>
      )}

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="grid grid-cols-6 gap-1 py-2">

          <button
            onClick={() => {
              setActiveBottomTab('bugun')
              setShowMapView(true)
              setShowFavorites(false)
              setShowInfo(false)
              setShowEventSubmissionModal(false); setShowVenueSubmissionModal(false)
            }}
            className={`flex flex-col items-center p-2 transition-colors ${
              activeBottomTab === 'bugun' 
                ? 'text-blue-600' 
                : 'text-gray-500'
            }`}
          >
            <Map className="w-4 h-4 mb-1" />
            <span className="text-xs font-medium">Harita</span>
          </button>

          <button
            onClick={() => {
              setActiveBottomTab('islemler')
              setShowFavorites(true)
              setShowMapView(false)
              setShowInfo(false)
              setShowEventSubmissionModal(false); setShowVenueSubmissionModal(false)
            }}
            className={`flex flex-col items-center p-2 transition-colors ${
              activeBottomTab === 'islemler'
                ? 'text-blue-600' 
                : 'text-gray-500'
            }`}
          >
            <Heart className={`w-4 h-4 mb-1 ${activeBottomTab === 'islemler' ? 'fill-current' : ''}`} />
            <span className="text-xs font-medium">Favoriler</span>
          </button>

          <button
            onClick={() => {
              requireAuth(() => {
                setActiveBottomTab('etkinlik-oner')
                setShowEventSubmissionModal(true)
                setShowFavorites(false)
                setShowMapView(false)
                setShowInfo(false)
                setShowProfileMenu(false)
              }, 'event')
            }}
            className={`flex flex-col items-center p-2 transition-colors ${
              activeBottomTab === 'etkinlik-oner'
                ? 'text-green-600' 
                : 'text-gray-500'
            }`}
          >
            <div className="relative">
              <Calendar className="w-4 h-4 mb-1" />
              <Plus className="w-2 h-2 absolute -top-1 -right-1 text-green-500" />
            </div>
            <span className="text-xs font-medium">Etkinlik Ekle</span>
          </button>

          <button
            onClick={() => {
              requireAuth(() => {
                // Simple synchronous approach - load if needed, then open
                console.log('🏢 Bottom nav: Mekan Ekle clicked')
                console.log('Current venueCategories state:', venueCategories.length)
                
                // Always show modal immediately and let loading state handle it
                console.log('📱 Opening venue modal immediately')
                setActiveBottomTab('mekan-oner')
                setShowVenueSubmissionModal(true)
                setShowFavorites(false)
                setShowMapView(false)
                setShowInfo(false)
                setShowProfileMenu(false)
                
                // Load categories if needed
                if (venueCategories.length === 0) {
                  console.log('📡 Loading venue categories in background...')
                  loadVenueCategories()
                }
              }, 'venue')
            }}
            className={`flex flex-col items-center p-2 transition-colors ${
              activeBottomTab === 'mekan-oner'
                ? 'text-green-600' 
                : 'text-gray-500'
            }`}
          >
            <div className="relative">
              <MapPin className="w-4 h-4 mb-1" />
              <Plus className="w-2 h-2 absolute -top-1 -right-1 text-green-500" />
            </div>
            <span className="text-xs font-medium">Mekan Ekle</span>
          </button>

          <button
            onClick={() => {
              setActiveBottomTab('arkadas-bul')
              setShowFavorites(false)
              setShowMapView(false)
              setShowInfo(false)
              setShowEventSubmissionModal(false)
              setShowVenueSubmissionModal(false)
              setShowProfileMenu(false)
              alert('Etkinlik Arkadaşı Bul özelliği yakında aktif olacak!')
            }}
            className="flex flex-col items-center p-2 transition-colors text-red-600"
          >
            <Users className="w-4 h-4 mb-1" />
            <span className="text-xs font-medium">Etkinlik Arkadaşı Bul</span>
          </button>

          <button
            onClick={() => {
              setActiveBottomTab('grup-kur')
              setShowFavorites(false)
              setShowMapView(false)
              setShowInfo(false)
              setShowEventSubmissionModal(false)
              setShowVenueSubmissionModal(false)
              setShowProfileMenu(false)
              alert('Etkinlik Grubu Bul özelliği yakında aktif olacak!')
            }}
            className="flex flex-col items-center p-2 transition-colors text-blue-600"
          >
            <UserPlus className="w-4 h-4 mb-1" />
            <span className="text-xs font-medium">Etkinlik Grubu Bul</span>
          </button>
        </div>
      </div>





      {/* Map View Modal */}
      {showMapView && (
        <Suspense fallback={<LoadingSpinner />}>
          <MapView
            events={events}
            categories={categories}
            venues={venues as any}
            onEventClick={setSelectedEvent}
            onVenueClick={(venue: any) => setSelectedVenue(venue)}
            onClose={() => {
              setShowMapView(false)
              setActiveBottomTab('etkinlikle')
            }}
            selectedDate={selectedDate}
            activeTab={activeTab}
          />
        </Suspense>
      )}

      {/* Profile Menu Modal */}
      {showProfileMenu && (
        <Suspense fallback={<LoadingSpinner />}>
          <ProfileMenu
            onClose={() => {
              setShowProfileMenu(false)
              setActiveBottomTab('etkinlikle')
            }}
            user={user}
            onLogout={handleLogout}
            onLogin={() => {
              // Reload user data after successful login
              const storedUser = localStorage.getItem('user')
              if (storedUser) {
                try {
                  const userData = JSON.parse(storedUser)
                  setUser(userData)
                } catch (error) {
                  setUser(null)
                }
              }
            }}
          />
        </Suspense>
      )}

      {/* Event Submission Modal */}
      {showEventSubmissionModal && (
        <Suspense fallback={<LoadingSpinner />}>
          <EventSubmissionModal
            onClose={() => {
              setShowEventSubmissionModal(false)
              setActiveBottomTab('etkinlikle')
            }}
          />
        </Suspense>
      )}

      {/* Venue Submission Modal */}
      {showVenueSubmissionModal && (
        <Suspense fallback={<LoadingSpinner />}>
          <VenueSubmissionModal
            onClose={() => {
              setShowVenueSubmissionModal(false)
              setActiveBottomTab('etkinlikle')
            }}
            venueCategories={venueCategories || []}
          />
        </Suspense>
      )}

      {/* Membership Required Modal */}
      {showMembershipModal && (
        <Suspense fallback={<LoadingSpinner />}>
          <MembershipRequiredModal
            isOpen={showMembershipModal}
            onClose={() => setShowMembershipModal(false)}
            onJoinNow={() => setShowMembershipModal(false)}
            actionType={membershipActionType}
          />
        </Suspense>
      )}



      {/* Announcement Popup */}
      <Suspense fallback={null}>
        <AnnouncementPopup />
      </Suspense>

      {/* Hidden SEO Footer Content - Only for search engines */}
      <div className="sr-only">
        <div>
          <h3>Edirne Etkinlikleri</h3>
          <p>Edirne konser, festival, tiyatro ve kültürel etkinlikler. Selimiye Cami, Kırkpınar festivali, Sarayiçi programları ve Meriç Nehri etkinlikleri.</p>
        </div>
        <div>
          <h3>Edirne Gezilecek Yerler</h3>
          <p>Edirne tarihi yerler: Selimiye Cami, Üç Şerefeli Cami, Eski Cami, Edirne Sarayı, Kapalı Çarşı. Edirne oteller ve yemek mekanları rehberi.</p>
        </div>
        <div>
          <h3>Edirne Turizm</h3>
          <p>Edirne'de ne yapılır? Tarihi mekanlar, müzeler, restoranlar, kafeler. Trakya bölgesinin kültür başkenti Edirne'de gezilecek yerler.</p>
        </div>
      </div>

      {/* Add bottom padding to prevent overlap with bottom nav */}
      <div className="h-24"></div>
    </div>
  )
}