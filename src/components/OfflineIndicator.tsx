'use client'

import { useState, useEffect } from 'react'
import { WifiOff, Wifi, Download, Clock } from 'lucide-react'
import { OfflineManager } from '@/lib/offline'

interface OfflineIndicatorProps {
  className?: string
}

export default function OfflineIndicator({ className = '' }: OfflineIndicatorProps) {
  const [isOnline, setIsOnline] = useState(true)
  const [hasCache, setHasCache] = useState(false)
  const [lastSync, setLastSync] = useState<Date | null>(null)
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    const offlineManager = OfflineManager.getInstance()
    
    setIsOnline(offlineManager.getOnlineStatus())
    setHasCache(offlineManager.hasValidCache())
    setLastSync(offlineManager.getLastSync())

    const unsubscribe = offlineManager.addOnlineStatusListener((status) => {
      setIsOnline(status)
    })

    return unsubscribe
  }, [])

  const formatLastSync = (date: Date | null) => {
    if (!date) return 'Hiç'
    
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return 'Az önce'
    if (diffMins < 60) return `${diffMins} dakika önce`
    if (diffHours < 24) return `${diffHours} saat önce`
    return `${diffDays} gün önce`
  }

  if (isOnline && !showDetails) {
    return null // Don't show when online unless user wants to see details
  }

  return (
    <div className={`${className}`}>
      {/* Main indicator */}
      <div 
        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium cursor-pointer transition-colors ${
          isOnline 
            ? 'bg-green-100 text-green-800 hover:bg-green-200' 
            : 'bg-orange-100 text-orange-800 hover:bg-orange-200'
        }`}
        onClick={() => setShowDetails(!showDetails)}
      >
        {isOnline ? (
          <Wifi className="w-4 h-4" />
        ) : (
          <WifiOff className="w-4 h-4" />
        )}
        <span>
          {isOnline ? 'Çevrimiçi' : hasCache ? 'Çevrimdışı - Önbellek Kullanılıyor' : 'Çevrimdışı'}
        </span>
      </div>

      {/* Details panel */}
      {showDetails && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-medium">Bağlantı Durumu</span>
              <div className="flex items-center gap-1">
                {isOnline ? (
                  <>
                    <Wifi className="w-4 h-4 text-green-600" />
                    <span className="text-green-600">Bağlı</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-4 h-4 text-orange-600" />
                    <span className="text-orange-600">Bağlı Değil</span>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="font-medium">Önbellek Durumu</span>
              <div className="flex items-center gap-1">
                <Download className="w-4 h-4 text-blue-600" />
                <span className="text-blue-600">
                  {hasCache ? 'Mevcut' : 'Boş'}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="font-medium">Son Güncelleme</span>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4 text-gray-600" />
                <span className="text-gray-600">
                  {formatLastSync(lastSync)}
                </span>
              </div>
            </div>

            {!isOnline && (
              <div className="bg-orange-50 p-3 rounded-lg">
                <p className="text-orange-800 text-sm">
                  {hasCache 
                    ? 'İnternet bağlantınız bulunmuyor. Önceden kaydedilmiş etkinlik verilerini görüntülüyorsunuz.'
                    : 'İnternet bağlantınız bulunmuyor ve önbelleğe alınmış veri yok. Lütfen bağlantınızı kontrol edin.'
                  }
                </p>
              </div>
            )}

            {isOnline && (
              <div className="bg-green-50 p-3 rounded-lg">
                <p className="text-green-800 text-sm">
                  İnternet bağlantınız aktif. En güncel etkinlik bilgilerini görüntülüyorsunuz.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}