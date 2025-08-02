'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'

interface Announcement {
  id: number
  title: string
  message: string
  imageUrl?: string
  buttonText?: string
  buttonUrl?: string
  isActive: boolean
  showOnce: boolean
  startDate?: string
  endDate?: string
}

export default function AnnouncementPopup() {
  const [announcement, setAnnouncement] = useState<Announcement | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const fetchActiveAnnouncement = async () => {
      try {
        const response = await fetch('/api/announcements/active')
        
        if (response.ok) {
          const data = await response.json()
          
          if (data && data.id) {
            // Check if user has already seen this announcement (if showOnce is true)
            const seenKey = `announcement_seen_${data.id}`
            if (data.showOnce && localStorage.getItem(seenKey)) {
              return // Don't show if already seen
            }
            
            setAnnouncement(data)
            setIsVisible(true)
          }
        }
      } catch (error) {
      }
    }

    fetchActiveAnnouncement()
  }, [])

  const handleClose = () => {
    if (announcement) {
      // Mark as seen if showOnce is enabled
      if (announcement.showOnce) {
        localStorage.setItem(`announcement_seen_${announcement.id}`, 'true')
      }
    }
    setIsVisible(false)
  }

  const handleButtonClick = () => {
    if (announcement?.buttonUrl) {
      window.open(announcement.buttonUrl, '_blank')
    }
    handleClose()
  }

  if (!isVisible || !announcement) {
    return null
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-md w-full max-h-[80vh] overflow-hidden relative">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 bg-white rounded-full p-1 shadow-md hover:bg-gray-100 transition-colors"
          aria-label="Kapat"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>

        {/* Image */}
        {announcement.imageUrl && (
          <div className="w-full h-48 bg-gray-100 flex items-center justify-center overflow-hidden mt-8 mx-6 rounded-lg">
            <img
              src={announcement.imageUrl}
              alt={announcement.title}
              className="max-w-full max-h-full object-contain"
              onError={(e) => {
                console.error('Image failed to load:', announcement.imageUrl);
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
        )}

        {/* Content */}
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-3 pr-8">
            {announcement.title}
          </h2>
          <div 
            className="text-gray-700 mb-4 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: announcement.message }}
          />
          
          {/* Action Button */}
          {announcement.buttonText && (
            <button
              onClick={handleButtonClick}
              className="w-full bg-edirne-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-edirne-700 transition-colors"
            >
              {announcement.buttonText}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}