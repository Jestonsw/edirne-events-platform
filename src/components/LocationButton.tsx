'use client'

import { useState } from 'react'
import { MapPin, Loader2, Navigation } from 'lucide-react'
import { getCurrentLocation, Coordinates } from '@/lib/geolocation'
import { useLanguage } from '@/contexts/LanguageContext'

interface LocationButtonProps {
  onLocationUpdate: (coordinates: Coordinates | null) => void
  currentLocation?: Coordinates | null
  className?: string
}

export default function LocationButton({ onLocationUpdate, currentLocation, className = '' }: LocationButtonProps) {
  const { t } = useLanguage()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGetLocation = async () => {
    setLoading(true)
    setError(null)

    try {
      const coordinates = await getCurrentLocation()
      onLocationUpdate(coordinates)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Konum alınamadı'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleClearLocation = () => {
    onLocationUpdate(null)
    setError(null)
  }

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <div className="flex gap-2">
        <button
          onClick={handleGetLocation}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Navigation className="w-4 h-4" />
          )}
          {loading ? 'Konum alınıyor...' : 'Konumumu Kullan'}
        </button>

        {currentLocation && (
          <button
            onClick={handleClearLocation}
            className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            <MapPin className="w-4 h-4" />
            Konumu Temizle
          </button>
        )}
      </div>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 p-2 rounded border">
          {error}
        </div>
      )}

      {currentLocation && (
        <div className="text-sm text-green-600 bg-green-50 p-2 rounded border">
          <div className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            <span>Konum aktif - yakındaki etkinlikler gösteriliyor</span>
          </div>
        </div>
      )}
    </div>
  )
}