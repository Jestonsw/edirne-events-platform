'use client'

import { MapPin, Star, Clock, Phone, ExternalLink } from 'lucide-react'
import { memo, useState, useCallback } from 'react'

interface VenueCardProps {
  venue: {
    id: number
    name: string
    description: string | null
    address: string
    phone: string | null
    phone2: string | null
    rating: number | null
    openingHours: string | null
    imageUrl: string | null
    imageUrl2: string | null
    imageUrl3: string | null
    isFeatured: boolean | null
    amenities: string | null
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
  onClick: () => void
}

const VenueCard = memo(function VenueCard({ venue, onClick }: VenueCardProps) {
  const [imageError, setImageError] = useState(false)
  
  const handleImageError = useCallback(() => {
    setImageError(true)
  }, [])

  const handleImageLoad = useCallback(() => {
    setImageError(false)
  }, [])

  const categoryData = venue.venues || venue.venue_categories
  
  // Extract category information safely
  const categoryName = (categoryData as any)?.categoryDisplayName || 
                      (categoryData as any)?.displayName || 
                      (categoryData as any)?.categoryName || 
                      (categoryData as any)?.name || 'Mekan'
  
  const categoryColor = (categoryData as any)?.categoryColor || 
                       (categoryData as any)?.color || '#6B7280'

  return (
    <div 
      className="bg-white rounded-lg border border-gray-200 hover:shadow-md transition-all duration-200 cursor-pointer select-none" 
      onClick={onClick}
    >
      <div className="flex">
        <div className="relative w-28 sm:w-32 h-28 sm:h-28 flex-shrink-0 p-1.5">
          {/* Image Gallery - 3 photos */}
          {(venue.imageUrl || venue.imageUrl2 || venue.imageUrl3) && !imageError ? (
            <div className="w-full h-full grid grid-cols-1 gap-0.5 rounded-lg border-2 border-red-500 overflow-hidden">
              {/* Main image */}
              {venue.imageUrl && (
                <div className="w-full h-full">
                  <img
                    src={venue.imageUrl}
                    alt={venue.name}
                    className="w-full h-full object-cover"
                    onLoad={handleImageLoad}
                    onError={handleImageError}
                  />
                </div>
              )}
              
              {/* Additional images in overlay */}
              {(venue.imageUrl2 || venue.imageUrl3) && (
                <div className="absolute bottom-1 right-1 flex gap-0.5">
                  {venue.imageUrl2 && (
                    <div className="w-4 h-4 rounded border border-white overflow-hidden">
                      <img
                        src={venue.imageUrl2}
                        alt={`${venue.name} 2`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  {venue.imageUrl3 && (
                    <div className="w-4 h-4 rounded border border-white overflow-hidden">
                      <img
                        src={venue.imageUrl3}
                        alt={`${venue.name} 3`}
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
              style={{ backgroundColor: categoryColor }}
            >
              🏢
            </div>
          )}
          
          {venue.isFeatured && (
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
                {venue.name}
              </h3>
            </div>

            {/* Rating display */}
            {venue.rating && venue.rating > 0 && (
              <div className="flex items-center text-xs text-amber-600 mb-1">
                <Star className="w-3 h-3 mr-1 fill-amber-400 text-amber-400" />
                <span className="font-medium text-sm">{venue.rating.toFixed(1)}</span>
              </div>
            )}

            <div className="flex items-center text-xs text-gray-600 mb-1">
              <MapPin className="w-3 h-3 mr-1" />
              <span className="text-xs text-gray-600 line-clamp-1">
                {venue.address}
              </span>
            </div>

            {/* Opening Hours */}
            {venue.openingHours && (
              <div className="flex items-center text-xs text-gray-600 mb-1">
                <Clock className="w-3 h-3 mr-1" />
                <span className="text-xs">{venue.openingHours}</span>
              </div>
            )}

            {/* Phone */}
            {venue.phone && (
              <div className="flex items-center text-xs text-gray-600 mb-1">
                <Phone className="w-3 h-3 mr-1" />
                <span className="text-xs">{venue.phone}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
})

export default VenueCard