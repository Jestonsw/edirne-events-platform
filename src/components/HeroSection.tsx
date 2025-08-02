'use client'

import { useState, useEffect } from 'react'
import { Calendar, MapPin, Users, Star, TrendingUp, Clock } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

interface HeroSectionProps {
  totalEvents: number
  totalVenues: number
  onQuickFilter: (filter: string) => void
}

export default function HeroSection({ totalEvents, totalVenues, onQuickFilter }: HeroSectionProps) {
  const { t } = useLanguage()
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const quickFilters = [
    { key: 'tonight', label: 'Bu Akşam', icon: Clock, color: 'from-purple-500 to-pink-500' },
    { key: 'free', label: 'Ücretsiz', icon: Star, color: 'from-green-500 to-emerald-500' },
    { key: 'popular', label: 'Popüler', icon: TrendingUp, color: 'from-orange-500 to-red-500' },
    { key: 'nearby', label: 'Yakınımda', icon: MapPin, color: 'from-blue-500 to-cyan-500' }
  ]

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('tr-TR', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('tr-TR', { 
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-32 right-20 w-24 h-24 bg-yellow-300/20 rounded-full blur-lg animate-bounce delay-1000"></div>
        <div className="absolute bottom-20 left-1/3 w-40 h-40 bg-blue-300/10 rounded-full blur-2xl animate-pulse delay-500"></div>
        <div className="absolute bottom-10 right-10 w-28 h-28 bg-green-300/15 rounded-full blur-xl animate-bounce delay-2000"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-12">
        <div className="text-center text-white">
          {/* Main Title */}
          <div className="mb-6">
            <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-white to-yellow-200 bg-clip-text text-transparent animate-fade-in">
              Edirne Events
            </h1>
            <p className="text-xl md:text-2xl font-light text-white/90 animate-fade-in-delay">
              Şehrin Nabzı, Etkinliklerin Kalbi
            </p>
          </div>

          {/* Live Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 transform hover:scale-105 transition-all duration-300">
              <Calendar className="w-8 h-8 mx-auto mb-2 text-yellow-300" />
              <div className="text-2xl font-bold">{totalEvents}</div>
              <div className="text-sm text-white/80">Aktif Etkinlik</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 transform hover:scale-105 transition-all duration-300">
              <MapPin className="w-8 h-8 mx-auto mb-2 text-green-300" />
              <div className="text-2xl font-bold">{totalVenues}</div>
              <div className="text-sm text-white/80">Kayıtlı Mekan</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 transform hover:scale-105 transition-all duration-300">
              <Users className="w-8 h-8 mx-auto mb-2 text-blue-300" />
              <div className="text-2xl font-bold">12K+</div>
              <div className="text-sm text-white/80">Aktif Kullanıcı</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 transform hover:scale-105 transition-all duration-300">
              <Clock className="w-8 h-8 mx-auto mb-2 text-pink-300" />
              <div className="text-lg font-bold">{formatTime(currentTime)}</div>
              <div className="text-xs text-white/80">Anlık Saat</div>
            </div>
          </div>

          {/* Quick Filters */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4 text-white/90">Hızlı Keşfet</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {quickFilters.map((filter) => (
                <button
                  key={filter.key}
                  onClick={() => onQuickFilter(filter.key)}
                  className={`bg-gradient-to-r ${filter.color} p-4 rounded-xl text-white font-medium
                    transform hover:scale-105 transition-all duration-300 hover:shadow-lg
                    active:scale-95 flex items-center justify-center gap-2`}
                >
                  <filter.icon className="w-5 h-5" />
                  <span className="text-sm">{filter.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Current Date */}
          <div className="text-center">
            <div className="inline-block bg-white/20 backdrop-blur-sm rounded-xl px-6 py-3">
              <div className="text-lg font-medium text-white/90">
                {formatDate(currentTime)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}