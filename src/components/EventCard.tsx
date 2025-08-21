'use client'

import { Calendar, MapPin, Heart, ExternalLink, Star } from 'lucide-react'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'
import { useLanguage } from '@/contexts/LanguageContext'
import { memo, useState, useCallback, useMemo } from 'react'
import Image from 'next/image'

interface Event {
  id: number
  title: string
  description: string
  startDate: string
  endDate?: string
  startTime: string
  endTime?: string
  venue: string
  address?: string
  organizerName?: string
  organizerContact?: string
  categoryId: number
  capacity?: number
  imageUrl?: string
  imageUrl2?: string
  imageUrl3?: string
  mediaFiles?: string
  websiteUrl?: string
  ticketUrl?: string
  tags?: string | string[]
  participantType?: string

  isActive: boolean
  isFeatured: boolean
  createdAt: string
  updatedAt: string
  categories?: Array<{
    categoryId: number
    categoryName: string
    categoryDisplayName: string
    categoryColor: string
    categoryIcon: string
  }>
}

interface Category {
  id: number
  name: string
  displayName: string
  color: string
  icon: string
}

interface EventCardProps {
  event: Event
  category?: Category
  isFavorite: boolean
  onFavoriteToggle: () => void
  onEventClick: () => void
}

const EventCard = memo(function EventCard({ event, category, isFavorite, onFavoriteToggle, onEventClick }: EventCardProps) {
  const { t, translateText } = useLanguage()
  const [imageError, setImageError] = useState(false)

  // Handle card click
  const handleCardClick = useCallback(() => {
    onEventClick()
  }, [onEventClick])
  
  const handleImageError = useCallback(() => {
    setImageError(true)
  }, [])

  const handleImageLoad = useCallback(() => {
    setImageError(false)
  }, [])

  // Parse mediaFiles to get first image with rotation
  const firstMedia = useMemo(() => {
    try {
      if (event.mediaFiles) {
        const mediaArray = JSON.parse(event.mediaFiles)
        if (Array.isArray(mediaArray) && mediaArray.length > 0) {
          const firstMedia = mediaArray[0]
          // Support both old string format and new {url, rotation} format
          if (typeof firstMedia === 'string') {
            return { url: firstMedia, rotation: 0 }
          } else if (firstMedia && typeof firstMedia === 'object') {
            return { 
              url: firstMedia.url || firstMedia, 
              rotation: firstMedia.rotation || 0 
            }
          }
        }
      }
      // Fallback to old imageUrl fields
      return { url: event.imageUrl, rotation: 0 }
    } catch (error) {
      return { url: event.imageUrl, rotation: 0 }
    }
  }, [event.mediaFiles, event.imageUrl])

  // Safe date parsing with fallbacks
  let startDate: Date
  let endDate: Date | null = null
  let formattedDate = ''
  
  try {
    startDate = new Date(event.startDate)
    if (isNaN(startDate.getTime())) {
      startDate = new Date()
    }
    
    if (event.endDate) {
      endDate = new Date(event.endDate)
      if (isNaN(endDate.getTime())) {
        endDate = null
      }
    }
    
    // Format date range safely
    if (endDate && startDate.getTime() !== endDate.getTime()) {
      if (startDate.getMonth() === endDate.getMonth()) {
        formattedDate = `${format(startDate, 'd', { locale: tr })} - ${format(endDate, 'd MMM', { locale: tr })}`
      } else {
        formattedDate = `${format(startDate, 'd MMM', { locale: tr })} - ${format(endDate, 'd MMM', { locale: tr })}`
      }
    } else {
      formattedDate = format(startDate, 'd MMM', { locale: tr })
    }
  } catch (error) {
    formattedDate = 'Tarih belirtilmemiş'
  }

  return (
    <div 
      className="bg-white rounded-lg border border-gray-200 hover:shadow-md transition-all duration-200 cursor-pointer select-none" 
      onClick={handleCardClick}
    >
      <div className="flex">
        <div className="relative w-28 sm:w-32 h-28 sm:h-28 flex-shrink-0 p-1.5">
          {/* Image Gallery with rotation support */}
          {(firstMedia.url || event.imageUrl2 || event.imageUrl3) && !imageError ? (
            <div className="w-full h-full grid grid-cols-1 gap-0.5 rounded-lg border-2 border-red-500 overflow-hidden">
              {/* Main image with rotation */}
              {firstMedia.url && (
                <div className="w-full h-full">
                  <img
                    src={firstMedia.url}
                    alt={event.title}
                    className="w-full h-full object-cover"
                    style={{
                      transform: `rotate(${firstMedia.rotation}deg)`,
                      transition: 'transform 0.3s ease'
                    }}
                    onLoad={handleImageLoad}
                    onError={handleImageError}
                  />
                </div>
              )}
              
              {/* Fallback to old imageUrl if no mediaFiles */}
              {!firstMedia.url && event.imageUrl && (
                <div className="w-full h-full">
                  <img
                    src={event.imageUrl}
                    alt={event.title}
                    className="w-full h-full object-cover"
                    onLoad={handleImageLoad}
                    onError={handleImageError}
                  />
                </div>
              )}
              
              {/* Additional images in overlay */}
              {(event.imageUrl2 || event.imageUrl3) && (
                <div className="absolute bottom-1 right-1 flex gap-0.5">
                  {event.imageUrl2 && (
                    <div className="w-4 h-4 rounded border border-white overflow-hidden">
                      <img
                        src={event.imageUrl2}
                        alt={`${event.title} 2`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  {event.imageUrl3 && (
                    <div className="w-4 h-4 rounded border border-white overflow-hidden">
                      <img
                        src={event.imageUrl3}
                        alt={`${event.title} 3`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div 
              className="w-full h-full flex items-center justify-center text-white text-xl rounded-lg border-2 border-red-500"
              style={{ backgroundColor: category?.color || '#C41E3A' }}
            >
              🎭
            </div>
          )}
          
          {event.isFeatured && (
            <div className="absolute top-3 left-3 z-10">
              <div className="bg-yellow-400 text-black px-1 py-0.5 rounded text-xs font-bold">
                ⭐
              </div>
            </div>
          )}
        </div>

        <div className="flex-1 p-3 flex flex-col justify-between min-h-[112px] sm:min-h-[96px]">
          <div>
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-tight">
                {translateText(event.title, true)}
              </h3>
              <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onFavoriteToggle()
                  }}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                  title={t('events.favorite')}
                >
                  <Heart 
                    size={16} 
                    className={isFavorite ? 'fill-red-500 text-red-500' : ''}
                  />
                </button>
                {event.websiteUrl && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      window.open(event.websiteUrl, '_blank')
                    }}
                    className="text-gray-400 hover:text-blue-500 transition-colors"
                    title={t('events.website')}
                  >
                    <ExternalLink size={16} />
                  </button>
                )}
              </div>
            </div>
            
            <div className="space-y-1 text-xs text-gray-600">
              <div className="flex items-center gap-1">
                <Calendar size={12} className="text-red-500 flex-shrink-0" />
                <span className="truncate">
                  {formattedDate} • {event.startTime}
                </span>
              </div>
              
              <div className="flex items-center gap-1">
                <MapPin size={12} className="text-red-500 flex-shrink-0" />
                <span className="truncate">
                  {translateText(event.venue, true)}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-1">
              {category && (
                <span 
                  className="px-2 py-1 text-xs font-medium text-white rounded-full"
                  style={{ backgroundColor: category.color }}
                >
                  {translateText(category.displayName, true)}
                </span>
              )}
            </div>
            


          </div>
        </div>
      </div>
    </div>
  )
})

export default EventCard