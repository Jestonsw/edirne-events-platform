'use client'

import { Calendar, Search, MapPin, Clock, Users, Star, Filter, Heart, Home, User, Map, Plus, UserPlus } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

interface BottomNavigationProps {
  activeBottomTab: string
  setActiveBottomTab: (tab: string) => void
  requireAuth: (callback: () => void, type?: string) => void
  setShowEventSubmissionModal: (show: boolean) => void
  setShowVenueSubmissionModal: (show: boolean) => void
  setShowFavorites: (show: boolean) => void
  setShowMapView: (show: boolean) => void
  setShowInfo: (show: boolean) => void
  setShowProfileMenu: (show: boolean) => void
  loadVenueCategories: () => void
  venueCategories: any[]
}

export default function BottomNavigation({
  activeBottomTab,
  setActiveBottomTab,
  requireAuth,
  setShowEventSubmissionModal,
  setShowVenueSubmissionModal,
  setShowFavorites,
  setShowMapView,
  setShowInfo,
  setShowProfileMenu,
  loadVenueCategories,
  venueCategories
}: BottomNavigationProps) {
  const { t } = useLanguage()

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 py-1 z-30">
      <div className="flex justify-around items-center max-w-md mx-auto">
        <button
          onClick={() => {
            requireAuth(() => {
              console.log('📅 Bottom nav: Etkinlik Ekle clicked')
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
              console.log('🏢 Bottom nav: Mekan Ekle clicked')
              console.log('Current venueCategories state:', venueCategories.length)
              
              console.log('📱 Opening venue modal immediately')
              setActiveBottomTab('mekan-oner')
              setShowVenueSubmissionModal(true)
              setShowFavorites(false)
              setShowMapView(false)
              setShowInfo(false)
              setShowProfileMenu(false)
              
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
            setShowProfileMenu(false)
          }}
          className={`flex flex-col items-center p-2 transition-colors ${
            activeBottomTab === 'arkadas-bul'
              ? 'text-green-600' 
              : 'text-gray-500'
          }`}
        >
          <div className="relative">
            <UserPlus className="w-4 h-4 mb-1" />
          </div>
          <span className="text-xs font-medium">Arkadaş Bul</span>
        </button>
      </div>
    </div>
  )
}