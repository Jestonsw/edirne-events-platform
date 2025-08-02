'use client'

import { X, Calendar, MapPin, Clock, Users, Heart, ExternalLink, Share2, Phone, Mail, Globe, ChevronLeft, ChevronRight } from 'lucide-react'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'
import { useEffect, useState } from 'react'
import SocialShareModal from './SocialShareModal'
import EventReviews from './EventReviews'
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
  capacity?: number
  imageUrl?: string
  imageUrl_2?: string
  imageUrl_3?: string
  websiteUrl?: string
  ticketUrl?: string
  tags?: string | string[]
  participantType: string
  rating?: number
  reviewCount?: number
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

interface EventModalProps {
  event: Event
  category?: Category
  isFavorite: boolean
  onClose: () => void
  onFavoriteToggle: () => void
}

export default function EventModal({ event, category, isFavorite, onClose, onFavoriteToggle }: EventModalProps) {
  const { t, translateText } = useLanguage()
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isImageHovered, setIsImageHovered] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  
  // Touch/swipe state
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)

  // Get current user from localStorage
  useEffect(() => {
    const userData = localStorage.getItem('userData')
    if (userData) {
      try {
        setCurrentUser(JSON.parse(userData))
      } catch (error) {
        console.error('Error parsing user data:', error)
      }
    }
  }, [])
  
  // Create images array from event data with proper API endpoint
  const images = [event.imageUrl, event.imageUrl2, event.imageUrl3]
    .filter((url): url is string => Boolean(url))
    .map((url) => {
      // Convert upload paths to API endpoint
      if (url.startsWith('/uploads/')) {
        const filename = url.split('/').pop()
        return `/api/serve-image/${filename}`
      }
      return url
    })
  
  const eventDate = new Date(event.startDate)
  const endDate = event.endDate ? new Date(event.endDate) : null
  const formattedDate = format(eventDate, 'dd MMMM yyyy, EEEE', { locale: tr })
  const formattedEndDate = endDate ? format(endDate, 'dd MMMM yyyy, EEEE', { locale: tr }) : null
  let tags = []
  if (event.tags) {
    if (Array.isArray(event.tags)) {
      tags = event.tags
    } else if (typeof event.tags === 'string') {
      try {
        tags = JSON.parse(event.tags)
      } catch (error) {
        tags = []
      }
    }
  }

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [])

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const handleShare = () => {
    setIsShareModalOpen(true)
  }

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  // Touch handlers for swipe gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null) // Reset touchEnd when starting a new touch
    setTouchStart(e.targetTouches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > 50
    const isRightSwipe = distance < -50

    if (images.length > 1) {
      if (isLeftSwipe) {
        nextImage()
      } else if (isRightSwipe) {
        prevImage()
      }
    }
  }

  const openMaps = () => {
    const address = event.address || event.location
    const query = encodeURIComponent(`${address}, Edirne`)
    
    // Check if on mobile and prefer native maps app
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    
    if (isMobile) {
      // Try to open native maps app first
      window.location.href = `geo:0,0?q=${query}`
      // Fallback to Google Maps after a short delay
      setTimeout(() => {
        window.open(`https://maps.google.com/maps?q=${query}`, '_blank')
      }, 1000)
    } else {
      window.open(`https://maps.google.com/maps?q=${query}`, '_blank')
    }
  }

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-start justify-center pt-16 p-4 pb-20 overflow-y-auto"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[calc(100vh-8rem)] overflow-hidden relative flex flex-col my-4">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 pr-4">{translateText(event.title, true)}</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={onFavoriteToggle}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Heart className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
            </button>
            <button
              onClick={handleShare}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Share2 className="w-5 h-5 text-gray-600" />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          {/* Image Gallery */}
          {images.length > 0 && (
            <div className="mb-6 relative">
              <div 
                className="relative overflow-hidden rounded-lg cursor-pointer group"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                <img
                  src={images[currentImageIndex]}
                  alt={`${event.title} - Resim ${currentImageIndex + 1}`}
                  className="w-full h-80 object-contain bg-gray-50 transition-all duration-300 group-hover:scale-110"
                  style={{ objectPosition: 'center center' }}
                  onMouseEnter={() => setIsImageHovered(true)}
                  onMouseLeave={() => setIsImageHovered(false)}
                />
                
                {/* Hover Overlay */}
                <div className={`absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center transition-opacity duration-300 ${
                  isImageHovered ? 'opacity-100' : 'opacity-0'
                }`}>
                  <div className="text-white text-sm bg-black bg-opacity-50 px-3 py-1 rounded-full">
                    Büyütmek için tıklayın
                  </div>
                </div>
                
                {/* Navigation Arrows */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 rounded-full transition-all"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 rounded-full transition-all"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}
                
                {/* Image Counter */}
                {images.length > 1 && (
                  <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded-full text-sm">
                    {currentImageIndex + 1} / {images.length}
                  </div>
                )}
              </div>
              
              {/* Image Dots Indicator */}
              {images.length > 1 && (
                <div className="flex justify-center mt-3 space-x-2">
                  {images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        index === currentImageIndex 
                          ? 'bg-blue-600 scale-125' 
                          : 'bg-gray-300 hover:bg-gray-400'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Category and Featured Badge */}
              <div className="flex items-center gap-2 mb-4 flex-wrap">
                {/* Display all categories */}
                {event.categories && event.categories.length > 0 ? (
                  event.categories.map((cat) => (
                    <div 
                      key={cat.categoryId}
                      className="category-chip text-sm"
                      style={{ backgroundColor: cat.categoryColor }}
                    >
                      {cat.categoryDisplayName}
                    </div>
                  ))
                ) : category && (
                  <div 
                    className="category-chip text-sm"
                    style={{ backgroundColor: category.color }}
                  >
                    {t(`categories.${category.name}`) || category.displayName}
                  </div>
                )}
                {event.isFeatured && (
                  <div className="bg-edirne-gold text-black px-3 py-1 rounded-full flex items-center gap-1 text-sm font-bold">
                    ⭐ {t('events.featured')}
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">{t('events.description')}</h3>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {translateText(event.description)}
                </p>
              </div>



              {/* Organizer Info */}
              {event.organizerName && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">{t('events.organizer')}</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-blue-600 text-sm font-medium">
                          {event.organizerName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{event.organizerName}</p>
                        {event.organizerContact && (
                          <div className="mt-2">
                            <p className="text-sm text-gray-600">İletişim:</p>
                            <p className="text-blue-600 text-sm font-medium">{event.organizerContact}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-gray-50 rounded-lg p-6 sticky top-6">
                <h3 className="text-lg font-semibold mb-4">{t('events.details')}</h3>
                
                {/* Date */}
                <div className="flex items-start gap-3 mb-4">
                  <Calendar className="w-5 h-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">{formattedDate}</p>
                    {formattedEndDate && formattedEndDate !== formattedDate && (
                      <p className="text-sm text-gray-600">{t('events.endDate')}: {formattedEndDate}</p>
                    )}
                  </div>
                </div>

                {/* Time */}
                <div className="flex items-center gap-3 mb-4">
                  <Clock className="w-5 h-5 text-gray-500" />
                  <div>
                    <span className="font-medium text-gray-900">{event.startTime}</span>
                    {event.endTime && <span className="text-gray-600"> - {event.endTime}</span>}
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-start gap-3 mb-4">
                  <MapPin className="w-5 h-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">{event.location}</p>
                    {event.address && (
                      <p className="text-sm text-gray-600 mt-1">{event.address}</p>
                    )}
                    <button
                      onClick={openMaps}
                      className="text-edirne-500 hover:text-edirne-600 text-sm mt-1 flex items-center gap-1"
                    >
                      <ExternalLink className="w-3 h-3" />
{t('events.showOnMap')}
                    </button>
                  </div>
                </div>

                {/* Capacity */}
                {event.capacity && (
                  <div className="flex items-center gap-3 mb-4">
                    <Users className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="font-medium text-gray-900">Kapasite</p>
                      <p className="text-sm text-gray-600">{event.capacity} kişi</p>
                    </div>
                  </div>
                )}

                {/* Participant Type */}
                {event.participantType && (
                  <div className="flex items-center gap-3 mb-4">
                    <Users className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="font-medium text-gray-900">Kimlere Yönelik</p>
                      <p className="text-sm text-gray-600">{event.participantType}</p>
                    </div>
                  </div>
                )}







                {/* Action Buttons */}
                <div className="space-y-3">
                  {event.ticketUrl && (
                    <a
                      href={event.ticketUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full btn-primary flex items-center justify-center gap-2"
                    >
                      <ExternalLink className="w-4 h-4" />
{t('events.buyTickets')}
                    </a>
                  )}
                  
                  {event.websiteUrl && (
                    <a
                      href={event.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full btn-secondary flex items-center justify-center gap-2"
                    >
                      <Globe className="w-4 h-4" />
{t('events.website')}
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Event Reviews Section */}
          <EventReviews
            eventId={event.id}
            currentUserId={currentUser?.name}
            eventTitle={event.title}
          />
        </div>
        </div>
      </div>

      {/* Social Share Modal */}
      <SocialShareModal
        event={event}
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
      />
    </div>
  )
}