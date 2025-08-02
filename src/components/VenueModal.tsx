'use client'

import { useState } from 'react'
import { X, MapPin, Star, Clock, Phone, ExternalLink, Globe, Users, Wifi, Car, Coffee, Utensils, ChevronLeft, ChevronRight } from 'lucide-react'
import Image from 'next/image'

interface VenueModalProps {
  venue: {
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
    rating: number | null
    openingHours: string | null
    imageUrl: string | null
    imageUrl2: string | null
    imageUrl3: string | null
    latitude: number | null
    longitude: number | null
    isFeatured: boolean | null
    venues?: {
      categoryName?: string | null
      categoryDisplayName?: string | null
      categoryColor?: string | null
    }
    venue_categories?: {
      name?: string | null
      displayName?: string | null
      color?: string | null
    }
  }
  onClose: () => void
}

export default function VenueModal({ venue, onClose }: VenueModalProps) {
  const [imageError, setImageError] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  
  // Touch/swipe state
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)

  const categoryData = venue.venues || venue.venue_categories
  
  // Extract category information safely
  const categoryName = (categoryData as any)?.categoryDisplayName || 
                      (categoryData as any)?.displayName || 
                      (categoryData as any)?.categoryName || 
                      (categoryData as any)?.name || 'Mekan'
  
  const categoryColor = (categoryData as any)?.categoryColor || 
                       (categoryData as any)?.color || '#6B7280'

  // Prepare images array for carousel
  const images = [venue.imageUrl, venue.imageUrl2, venue.imageUrl3].filter(Boolean) as string[]
  
  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length)
  }
  
  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  // Touch handlers for swipe gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
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

  const amenitiesList = (() => {
    if (!venue.amenities) return []
    
    // If it's already a string that doesn't start with [ or {, it's simple text
    if (typeof venue.amenities === 'string' && !venue.amenities.trim().startsWith('[') && !venue.amenities.trim().startsWith('{')) {
      return venue.amenities.split(',').map(item => item.trim()).filter(item => item.length > 0)
    }
    
    // Try to parse as JSON, fallback to simple text if it fails
    try {
      const parsed = JSON.parse(venue.amenities)
      return Array.isArray(parsed) ? parsed : [venue.amenities]
    } catch {
      return venue.amenities.split(',').map(item => item.trim()).filter(item => item.length > 0)
    }
  })()

  const renderStars = (rating: number) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 !== 0

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />)
    }

    if (hasHalfStar) {
      stars.push(
        <div key="half" className="relative w-4 h-4">
          <Star className="w-4 h-4 text-gray-300 absolute" />
          <div className="overflow-hidden w-2">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
          </div>
        </div>
      )
    }

    const remainingStars = 5 - Math.ceil(rating)
    for (let i = 0; i < remainingStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="w-4 h-4 text-gray-300" />)
    }

    return stars
  }

  const getAmenityIcon = (amenity: string) => {
    const amenityLower = amenity.toLowerCase()
    if (amenityLower.includes('wifi') || amenityLower.includes('internet')) {
      return <Wifi className="w-4 h-4 text-blue-500" />
    } else if (amenityLower.includes('park') || amenityLower.includes('araba')) {
      return <Car className="w-4 h-4 text-green-500" />
    } else if (amenityLower.includes('kahve') || amenityLower.includes('coffee')) {
      return <Coffee className="w-4 h-4 text-brown-500" />
    } else if (amenityLower.includes('yemek') || amenityLower.includes('restoran')) {
      return <Utensils className="w-4 h-4 text-orange-500" />
    }
    return <span className="w-4 h-4 bg-gray-300 rounded-full inline-block"></span>
  }

  const handleCallClick = () => {
    if (venue.phone) {
      window.open(`tel:${venue.phone}`, '_self')
    }
  }

  const handleWebsiteClick = () => {
    if (venue.website) {
      const url = venue.website.startsWith('http') ? venue.website : `https://${venue.website}`
      window.open(url, '_blank')
    }
  }

  const handleDirectionsClick = () => {
    if (venue.latitude && venue.longitude) {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${venue.latitude},${venue.longitude}`, '_blank')
    } else {
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(venue.address)}`, '_blank')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="relative">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full p-2 transition-all"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>

          {/* Featured Badge */}
          {venue.isFeatured && (
            <div className="absolute top-4 left-4 z-10">
              <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-sm font-bold px-3 py-1 rounded-full shadow-md">
                ⭐ Öne Çıkan
              </span>
            </div>
          )}

          {/* Image Carousel */}
          <div 
            className="relative h-64 overflow-hidden"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {images.length > 0 ? (
              <>
                <Image
                  src={images[currentImageIndex]}
                  alt={`${venue.name} - ${currentImageIndex + 1}`}
                  fill
                  unoptimized
                  className="object-cover transition-opacity duration-300"
                  sizes="(max-width: 768px) 100vw, 768px"
                  onError={() => setImageError(true)}
                />
                
                {/* Navigation arrows */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full p-2 transition-all"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full p-2 transition-all"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}
                
                {/* Image indicators */}
                {images.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                    {images.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-2 h-2 rounded-full transition-all ${
                          index === currentImageIndex 
                            ? 'bg-white' 
                            : 'bg-white bg-opacity-50'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                <MapPin className="w-16 h-16 text-gray-400" />
              </div>
            )}
            
            {/* Category Badge */}
            <div className="absolute top-4 right-16">
              <span 
                className="text-white text-sm font-medium px-3 py-1 rounded-full shadow-md"
                style={{ backgroundColor: categoryColor }}
              >
                {categoryName}
              </span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {/* Title and Rating */}
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-2xl font-bold text-gray-900 flex-1 mr-4">
              {venue.name}
            </h2>
            {venue.rating && venue.rating > 0 && (
              <div className="flex items-center gap-2 flex-shrink-0">
                <div className="flex items-center">
                  {renderStars(venue.rating)}
                </div>
                <span className="text-lg font-semibold text-gray-700">
                  {venue.rating.toFixed(1)}
                </span>
              </div>
            )}
          </div>

          {/* Description */}
          {venue.description && (
            <p className="text-gray-600 mb-6 leading-relaxed">
              {venue.description}
            </p>
          )}

          {/* Contact Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Address */}
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">Adres</p>
                <p className="text-gray-600 text-sm">{venue.address}</p>
              </div>
            </div>

            {/* Phone Numbers */}
            {(venue.phone || venue.phone2) && (
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">Telefon</p>
                  {venue.phone && (
                    <p className="text-blue-600 text-sm hover:underline cursor-pointer" onClick={handleCallClick}>
                      {venue.phone}
                    </p>
                  )}
                  {venue.phone2 && (
                    <p className="text-blue-600 text-sm hover:underline cursor-pointer">
                      {venue.phone2}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Opening Hours */}
            {venue.openingHours && (
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">Açılış Saatleri</p>
                  <p className="text-gray-600 text-sm">{venue.openingHours}</p>
                </div>
              </div>
            )}

            {/* Website */}
            {venue.website && (
              <div className="flex items-start gap-3">
                <Globe className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">Website</p>
                  <p className="text-blue-600 text-sm hover:underline cursor-pointer" onClick={handleWebsiteClick}>
                    {venue.website}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Additional Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Capacity */}
            {venue.capacity && (
              <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-3">
                <Users className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-xs text-gray-500">Kapasite</p>
                  <p className="font-medium">{venue.capacity} kişi</p>
                </div>
              </div>
            )}
          </div>



          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <button
              onClick={handleDirectionsClick}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              <MapPin className="w-4 h-4" />
              Yol Tarifi
            </button>
            {venue.phone && (
              <button
                onClick={handleCallClick}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                <Phone className="w-4 h-4" />
                Ara
              </button>
            )}
            {venue.website && (
              <button
                onClick={handleWebsiteClick}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                Website
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}