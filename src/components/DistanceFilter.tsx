'use client'

import { useState } from 'react'
import { MapPin, Sliders } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

interface DistanceFilterProps {
  maxDistance: number | null
  onDistanceChange: (distance: number | null) => void
  isLocationEnabled: boolean
  className?: string
}

const DISTANCE_OPTIONS = [
  { value: null, label: 'Tüm mesafeler' },
  { value: 1, label: '1 km' },
  { value: 2, label: '2 km' },
  { value: 5, label: '5 km' },
  { value: 10, label: '10 km' },
  { value: 25, label: '25 km' },
  { value: 50, label: '50 km' }
]

export default function DistanceFilter({ 
  maxDistance, 
  onDistanceChange, 
  isLocationEnabled, 
  className = '' 
}: DistanceFilterProps) {
  const { t } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)

  if (!isLocationEnabled) {
    return null
  }

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
      >
        <MapPin className="w-4 h-4 text-blue-500" />
        <span className="text-sm font-medium">
          {maxDistance ? `${maxDistance} km` : 'Mesafe'}
        </span>
        <Sliders className="w-4 h-4 text-gray-400" />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute right-0 top-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[150px]">
            <div className="p-2">
              <div className="text-xs text-gray-500 mb-2 px-2">Maksimum mesafe</div>
              {DISTANCE_OPTIONS.map((option) => (
                <button
                  key={option.value || 'all'}
                  onClick={() => {
                    onDistanceChange(option.value)
                    setIsOpen(false)
                  }}
                  className={`w-full text-left px-3 py-2 text-sm rounded hover:bg-gray-100 transition-colors ${
                    maxDistance === option.value 
                      ? 'bg-blue-50 text-blue-600 font-medium' 
                      : 'text-gray-700'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}