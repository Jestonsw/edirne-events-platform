'use client'

import { User } from 'lucide-react'


import { useLanguage } from '@/contexts/LanguageContext'

interface HeaderProps {
  activeTab: 'events' | 'venues'
  onTabChange: (tab: 'events' | 'venues') => void
  onProfileClick?: () => void
  user?: {
    id: number
    firstName: string
    lastName: string
    name: string
    profileImage?: string
    profileImageUrl?: string
  }
}

export default function Header({ activeTab, onTabChange, onProfileClick, user }: HeaderProps) {
  const { t } = useLanguage()

  return (
    <header className="bg-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <a 
              href="/"
              className="flex items-center"
              title="Edirne Etkinlik Rehberi - Ana Sayfa"
            >
              <img 
                src="/edirne-skyline-logo.png" 
                alt="Edirne Etkinlik Rehberi - Ana Sayfa" 
                className="h-12 w-auto"
              />
            </a>
            <div className="flex items-center gap-6">
              <nav className="flex gap-4">
                <a 
                  href="/events"
                  onClick={(e) => {
                    e.preventDefault()
                    onTabChange('events')
                  }}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    activeTab === 'events' 
                      ? 'bg-edirne-500 text-white' 
                      : 'bg-green-100 text-black hover:bg-green-200'
                  }`}
                  title="Edirne'deki güncel etkinlikler - konserler, tiyatro, spor ve daha fazlası"
                >
                  Etkinlikler
                </a>
                <a 
                  href="/venues"
                  onClick={(e) => {
                    e.preventDefault()
                    onTabChange('venues')
                  }}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    activeTab === 'venues' 
                      ? 'bg-red-500 text-white' 
                      : 'bg-green-100 text-black hover:bg-green-200'
                  }`}
                  title="Edirne'deki mekanlar - restoranlar, kafe, sanat merkezleri ve daha fazlası"
                >
                  Mekanlar
                </a>
              </nav>
            </div>
          </div>

          {/* Profile */}
          <div className="flex items-center gap-3">



            {/* Profile Button */}
            <button 
              onClick={onProfileClick}
              className="flex items-center gap-2 p-2 text-gray-700 hover:text-edirne-500 hover:bg-gray-100 rounded-lg transition-colors"
              title={user ? `Profil - ${user.name}` : "Profil"}
            >
              {user ? (
                <>
                  {user.profileImageUrl ? (
                    <img 
                      src={user.profileImageUrl} 
                      alt={user.name}
                      className="w-8 h-8 rounded-full object-cover shadow-lg border-2 border-white"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-edirne-500 to-edirne-600 flex items-center justify-center text-white text-sm font-bold shadow-lg">
                      {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                  )}
                  <span className="text-sm font-medium text-gray-700 hidden sm:block max-w-[80px] truncate">
                    {user.name}
                  </span>
                </>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              )}
            </button>

          </div>
        </div>
      </div>
    </header>
  )
}