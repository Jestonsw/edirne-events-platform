'use client'

import { useEffect, useState } from 'react'
import { MapPin, Calendar, Clock, X } from 'lucide-react'
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
}

interface Venue {
  id: number
  name: string
  description: string
  category: string
  address: string
  phone?: string
  website?: string
  imageUrl?: string
  openingHours?: string
  features?: string[]
  rating?: number
}

interface MapViewProps {
  events: Event[]
  categories: Category[]
  venues?: Venue[]
  onEventClick: (event: Event) => void
  onVenueClick?: (venue: Venue) => void
  onClose: () => void
  selectedDate?: string
  activeTab?: 'events' | 'venues'
}

export default function MapView({ events, categories, venues = [], onEventClick, onVenueClick, onClose, selectedDate, activeTab = 'events' }: MapViewProps) {
  const { t } = useLanguage()
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)

  // Filter events for the selected date (default to today if no date selected)
  const targetDate = selectedDate || new Date().toISOString().split('T')[0]
  const dateEvents = events.filter(event => {
    const eventDate = event.startDate.split('T')[0]
    const eventEndDate = event.endDate ? event.endDate.split('T')[0] : null
    
    // Include events that start on target date or are ongoing multi-day events
    return eventDate === targetDate || (eventEndDate && eventDate <= targetDate && eventEndDate >= targetDate)
  })

  // Format the selected date for display
  const formatDateForDisplay = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const isToday = dateString === today.toISOString().split('T')[0]
    
    if (isToday) {
      return 'Bugün'
    }
    
    return date.toLocaleDateString('tr-TR', { 
      day: 'numeric', 
      month: 'long' 
    })
  }

  // Get content to display based on active tab
  const displayContent = activeTab === 'venues' ? venues : dateEvents
  const displayTitle = activeTab === 'venues' ? 'Mekanlar' : `${formatDateForDisplay(targetDate)} Etkinlikleri`
  const noContentMessage = activeTab === 'venues' 
    ? 'Mekan bulunmamaktadır.' 
    : 'Seçilen tarih için etkinlik bulunmamaktadır.'

  // Generate Google Maps URL with markers for selected date events
  const generateMapUrl = () => {
    const edirneCenter = '41.6773,26.5557' // Edirne center coordinates
    let mapUrl = `https://www.google.com/maps/embed/v1/view?key=YOUR_GOOGLE_MAPS_API_KEY&center=${edirneCenter}&zoom=13`
    
    // For now, we'll use a simple embedded map pointing to Edirne
    // In a production environment, you'd use the Google Maps JavaScript API for markers
    return `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d48168.84614992937!2d26.535768068359375!3d41.67734955000001!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14b415c6b8a62d1b%3A0x6c2c2a72ccce0b06!2sEdirne%2C%20T%C3%BCrkiye!5e0!3m2!1sen!2s!4v1700000000000!5m2!1sen!2s`
  }

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">{activeTab === 'venues' ? 'Mekanlar' : formatDateForDisplay(targetDate)} - Harita</h2>
          <p className="text-sm text-gray-600">{displayContent.length} {activeTab === 'venues' ? 'mekan' : 'etkinlik'} bulundu</p>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="w-6 h-6 text-gray-600" />
        </button>
      </div>

      {/* Map Container */}
      <div className="flex-1 relative">
        <iframe
          src={generateMapUrl()}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="Edirne Events Map"
        />
        
        {/* Content overlay */}
        <div className="absolute top-4 left-4 right-4 z-10">
          <div className="bg-white rounded-lg shadow-lg p-3 max-h-40 overflow-y-auto">
            <h3 className="font-medium text-gray-900 mb-2">{displayTitle}</h3>
            {displayContent.length === 0 ? (
              <p className="text-sm text-gray-500">{noContentMessage}</p>
            ) : (
              <div className="space-y-2">
                {displayContent.slice(0, 3).map((item: any) => {
                  if (activeTab === 'venues') {
                    const venue = item as Venue
                    return (
                      <button
                        key={venue.id}
                        onClick={() => {
                          if (onVenueClick) onVenueClick(venue)
                        }}
                        className="w-full text-left p-2 hover:bg-gray-50 rounded border text-xs"
                      >
                        <div className="flex items-start gap-2">
                          <div 
                            className="w-3 h-3 rounded-full flex-shrink-0 mt-0.5 bg-blue-500"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-gray-900 truncate">{venue.name}</p>
                            <div className="flex items-center gap-1 text-gray-500">
                              <span className="text-xs">{venue.category}</span>
                            </div>
                            <div className="flex items-center gap-1 text-gray-500">
                              <MapPin className="w-3 h-3" />
                              <span className="truncate">{venue.address}</span>
                            </div>
                          </div>
                        </div>
                      </button>
                    )
                  } else {
                    const event = item as Event
                    const category = categories.find(c => c.id === event.categoryId)
                    return (
                      <button
                        key={event.id}
                        onClick={() => {
                          setSelectedEvent(event)
                          onEventClick(event)
                        }}
                        className="w-full text-left p-2 hover:bg-gray-50 rounded border text-xs"
                      >
                        <div className="flex items-start gap-2">
                          <div 
                            className="w-3 h-3 rounded-full flex-shrink-0 mt-0.5"
                            style={{ backgroundColor: category?.color || '#C41E3A' }}
                          />
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-gray-900 truncate">{event.title}</p>
                            <div className="flex items-center gap-1 text-gray-500">
                              <Clock className="w-3 h-3" />
                              <span>{event.startTime}</span>
                            </div>
                            <div className="flex items-center gap-1 text-gray-500">
                              <MapPin className="w-3 h-3" />
                              <span className="truncate">{event.location}</span>
                            </div>
                          </div>
                        </div>
                      </button>
                    )
                  }
                })}
                {displayContent.length > 3 && (
                  <p className="text-xs text-gray-500 text-center pt-1">
                    +{displayContent.length - 3} {activeTab === 'venues' ? 'mekan' : 'etkinlik'} daha
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom section with content details */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="grid grid-cols-2 gap-3">
          {displayContent.slice(0, 4).map((item: any) => {
            if (activeTab === 'venues') {
              const venue = item as Venue
              return (
                <button
                  key={venue.id}
                  onClick={() => {
                    // Open Google Maps with venue location
                    const encodedAddress = encodeURIComponent(`${venue.address}, Edirne`)
                    window.open(`https://maps.google.com/maps?q=${encodedAddress}`, '_blank')
                  }}
                  className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-left"
                >
                  <div className="flex items-start gap-2">
                    <div className="w-3 h-3 rounded-full flex-shrink-0 mt-1 bg-blue-500" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 line-clamp-1">{venue.name}</p>
                      <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                        <span>{venue.category}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <MapPin className="w-3 h-3" />
                        <span className="line-clamp-1">{venue.address}</span>
                      </div>
                    </div>
                  </div>
                </button>
              )
            } else {
              const event = item as Event
              const category = categories.find(c => c.id === event.categoryId)
              return (
                <button
                  key={event.id}
                  onClick={() => {
                    // Open Google Maps with event location
                    const address = event.address || event.location
                    const encodedAddress = encodeURIComponent(`${address}, Edirne`)
                    window.open(`https://maps.google.com/maps?q=${encodedAddress}`, '_blank')
                  }}
                  className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-left"
                >
                  <div className="flex items-start gap-2">
                    <div 
                      className="w-3 h-3 rounded-full flex-shrink-0 mt-1"
                      style={{ backgroundColor: category?.color || '#C41E3A' }}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 line-clamp-1">{event.title}</p>
                      <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                        <Clock className="w-3 h-3" />
                        <span>{event.startTime}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <MapPin className="w-3 h-3" />
                        <span className="line-clamp-1">{event.location}</span>
                      </div>
                    </div>
                  </div>
                </button>
              )
            }
          })}
        </div>
        
        {displayContent.length > 4 && (
          <div className="mt-3 text-center">
            <p className="text-sm text-gray-500">
              Toplam {displayContent.length} {activeTab === 'venues' ? 'mekan' : 'etkinlik'} - Haritada konumları görüntüleyin
            </p>
          </div>
        )}
      </div>
    </div>
  )
}