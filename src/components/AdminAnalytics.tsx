'use client'

import { useState, useEffect } from 'react'
import { BarChart3, Users, Calendar, MapPin, TrendingUp, Eye, Heart, Star } from 'lucide-react'

interface AnalyticsData {
  totalEvents: number
  activeEvents: number
  totalVenues: number
  totalUsers: number
  totalReviews: number
  averageRating: number
  eventsByCategory: { category: string; count: number; displayName: string }[]
  eventsByMonth: { month: string; count: number }[]
  topRatedEvents: { id: number; title: string; rating: number; reviewCount: number }[]
  popularVenues: { id: number; name: string; eventCount: number }[]
  userEngagement: {
    totalFavorites: number
    totalViews: number
    reviewsThisMonth: number
  }
}

export default function AdminAnalytics() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState('30') // days

  useEffect(() => {
    loadAnalytics()
  }, [selectedPeriod])

  const loadAnalytics = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/analytics?period=${selectedPeriod}`)
      if (response.ok) {
        const data = await response.json()
        // Convert string values to numbers
        const processedData = {
          ...data,
          totalEvents: parseInt(data.totalEvents) || 0,
          activeEvents: parseInt(data.activeEvents) || 0,
          totalVenues: parseInt(data.totalVenues) || 0,
          totalUsers: parseInt(data.totalUsers) || 0,
          totalReviews: parseInt(data.totalReviews) || 0,
          averageRating: parseFloat(data.averageRating) || 0,
          eventsByCategory: data.eventsByCategory?.map((item: any) => ({
            ...item,
            count: parseInt(item.count) || 0
          })) || [],
          eventsByMonth: data.eventsByMonth?.map((item: any) => ({
            ...item,
            count: parseInt(item.count) || 0
          })) || [],
          userEngagement: {
            ...data.userEngagement,
            totalFavorites: parseInt(data.userEngagement?.totalFavorites) || 0,
            totalViews: parseInt(data.userEngagement?.totalViews) || 0,
            reviewsThisMonth: parseInt(data.userEngagement?.reviewsThisMonth) || 0
          }
        }
        setAnalytics(processedData)
      }
    } catch (error) {
      console.error('Analytics loading error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Analytics verisi yüklenemedi</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <BarChart3 className="w-6 h-6" />
          Platform Analytics
        </h2>
        <select
          value={selectedPeriod}
          onChange={(e) => setSelectedPeriod(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2"
        >
          <option value="7">Son 7 Gün</option>
          <option value="30">Son 30 Gün</option>
          <option value="90">Son 3 Ay</option>
          <option value="365">Son 1 Yıl</option>
        </select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Toplam Etkinlik</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.totalEvents}</p>
              <p className="text-sm text-green-600">{analytics.activeEvents} aktif</p>
            </div>
            <Calendar className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Toplam Mekan</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.totalVenues}</p>
            </div>
            <MapPin className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Kayıtlı Kullanıcı</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.totalUsers}</p>
            </div>
            <Users className="w-8 h-8 text-purple-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Ortalama Puan</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.averageRating.toFixed(1)}</p>
              <p className="text-sm text-gray-500">{analytics.totalReviews} değerlendirme</p>
            </div>
            <Star className="w-8 h-8 text-yellow-500" />
          </div>
        </div>
      </div>

      {/* User Engagement */}
      <div className="bg-white p-6 rounded-lg border shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Kullanıcı Etkileşimi
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3">
            <Heart className="w-6 h-6 text-red-500" />
            <div>
              <p className="text-sm text-gray-600">Toplam Favori</p>
              <p className="text-xl font-bold">{analytics.userEngagement.totalFavorites}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Eye className="w-6 h-6 text-blue-500" />
            <div>
              <p className="text-sm text-gray-600">Toplam Görüntüleme</p>
              <p className="text-xl font-bold">{analytics.userEngagement.totalViews}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Star className="w-6 h-6 text-yellow-500" />
            <div>
              <p className="text-sm text-gray-600">Bu Ay Değerlendirme</p>
              <p className="text-xl font-bold">{analytics.userEngagement.reviewsThisMonth}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Events by Category */}
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Kategoriye Göre Etkinlikler</h3>
          <div className="space-y-3">
            {analytics.eventsByCategory.map((category, index) => {
              const maxCount = Math.max(...analytics.eventsByCategory.map(c => c.count))
              const percentage = (category.count / maxCount) * 100
              return (
                <div key={category.category} className="flex items-center gap-3">
                  <div className="w-24 text-sm text-gray-600 truncate">
                    {category.displayName}
                  </div>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-amber-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <div className="text-sm font-medium text-gray-900 w-8 text-right">
                    {category.count}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Top Rated Events */}
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">En Çok Beğenilen Etkinlikler</h3>
          <div className="space-y-3">
            {analytics.topRatedEvents.map((event, index) => (
              <div key={event.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                <div className="w-6 h-6 bg-amber-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{event.title}</p>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span>{event.rating.toFixed(1)}</span>
                    </div>
                    <span>•</span>
                    <span>{event.reviewCount} değerlendirme</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Popular Venues */}
      <div className="bg-white p-6 rounded-lg border shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">En Popüler Mekanlar</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {analytics.popularVenues.map((venue, index) => (
            <div key={venue.id} className="flex items-center gap-3 p-4 rounded-lg bg-gray-50">
              <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                {index + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">{venue.name}</p>
                <p className="text-sm text-gray-600">{venue.eventCount} etkinlik</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Monthly Trends */}
      <div className="bg-white p-6 rounded-lg border shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Aylık Etkinlik Trendi</h3>
        <div className="flex items-end gap-2 h-48">
          {analytics.eventsByMonth.map((month, index) => {
            const maxCount = Math.max(...analytics.eventsByMonth.map(m => m.count))
            const height = maxCount > 0 ? (month.count / maxCount) * 160 : 0
            return (
              <div key={month.month} className="flex-1 flex flex-col items-center gap-2">
                <div
                  className="bg-amber-600 rounded-t transition-all duration-500 min-h-[4px] w-full"
                  style={{ height: `${height}px` }}
                ></div>
                <div className="text-xs text-gray-600 text-center">
                  {month.month}
                </div>
                <div className="text-xs font-medium text-gray-900">
                  {month.count}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}