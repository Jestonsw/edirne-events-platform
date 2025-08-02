'use client'

import { useState, useEffect } from 'react'
import { Star, MessageCircle, Send } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'

interface Review {
  id: number
  rating: number
  comment?: string
  isAnonymous: boolean
  createdAt: string
  userName?: string
}

interface EventReviewsProps {
  eventId: number
  currentUserId?: string
  eventTitle: string
}

export default function EventReviews({ eventId, currentUserId, eventTitle }: EventReviewsProps) {
  const { t } = useLanguage()
  const [reviews, setReviews] = useState<Review[]>([])
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [newRating, setNewRating] = useState(5)
  const [newComment, setNewComment] = useState('')
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasUserReviewed, setHasUserReviewed] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchReviews()
  }, [eventId])

  const fetchReviews = async () => {
    try {
      const response = await fetch(`/api/reviews?eventId=${eventId}`)
      if (response.ok) {
        const data = await response.json()
        setReviews(data)
        
        // Check if current user has already reviewed
        if (currentUserId) {
          const userReview = data.find((review: Review) => review.userName === currentUserId)
          setHasUserReviewed(!!userReview)
        }
      }
    } catch (error) {
      console.error('Reviews fetch error:', error)
    } finally {
      setLoading(false)
    }
  }

  const submitReview = async () => {
    if (!currentUserId) {
      alert('Değerlendirme yapabilmek için giriş yapmanız gerekiyor.')
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventId,
          userId: currentUserId,
          rating: newRating,
          comment: newComment.trim() || null,
          isAnonymous
        })
      })

      if (response.ok) {
        setNewComment('')
        setNewRating(5)
        setIsAnonymous(false)
        setShowReviewForm(false)
        setHasUserReviewed(true)
        fetchReviews()
        alert('Değerlendirmeniz kaydedildi!')
      } else {
        const errorData = await response.json()
        alert(errorData.error || 'Değerlendirme kaydedilemedi')
      }
    } catch (error) {
      console.error('Review submission error:', error)
      alert('Bir hata oluştu')
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderStars = (rating: number, interactive = false, onStarClick?: (rating: number) => void) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating 
                ? 'text-amber-400 fill-amber-400' 
                : 'text-gray-300'
            } ${interactive ? 'cursor-pointer hover:text-amber-400' : ''}`}
            onClick={() => interactive && onStarClick && onStarClick(star)}
          />
        ))}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="p-4 border-t">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-32 mb-4"></div>
          <div className="space-y-3">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="border-t pt-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center">
          <MessageCircle className="w-5 h-5 mr-2" />
          Değerlendirmeler ({reviews.length})
        </h3>
        
        {currentUserId && !hasUserReviewed && (
          <button
            onClick={() => setShowReviewForm(!showReviewForm)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors"
          >
            Değerlendir
          </button>
        )}
      </div>

      {/* Review Form */}
      {showReviewForm && (
        <div className="bg-gray-50 p-4 rounded-lg mb-4">
          <h4 className="font-medium mb-3">"{eventTitle}" etkinliğini değerlendirin</h4>
          
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Puanınız:</label>
            {renderStars(newRating, true, setNewRating)}
          </div>

          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Yorumunuz:</label>
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Etkinlik hakkındaki düşüncelerinizi paylaşın..."
              className="w-full p-2 border rounded-lg resize-none"
              rows={3}
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center text-sm">
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="mr-2"
              />
              Anonim olarak gönder
            </label>

            <div className="flex gap-2">
              <button
                onClick={() => setShowReviewForm(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                İptal
              </button>
              <button
                onClick={submitReview}
                disabled={isSubmitting}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
              >
                <Send className="w-4 h-4 mr-1" />
                {isSubmitting ? 'Gönderiliyor...' : 'Gönder'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MessageCircle className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p>Henüz değerlendirme yapılmamış.</p>
            <p className="text-sm">İlk değerlendirmeyi siz yapın!</p>
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="border-b pb-4 last:border-b-0">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium mr-3">
                    {review.isAnonymous ? '?' : (review.userName?.charAt(0)?.toUpperCase() || 'U')}
                  </div>
                  <div>
                    <div className="font-medium text-sm">
                      {review.isAnonymous ? 'Anonim Kullanıcı' : (review.userName || 'Kullanıcı')}
                    </div>
                    <div className="flex items-center">
                      {renderStars(review.rating)}
                      <span className="ml-2 text-xs text-gray-500">
                        {format(new Date(review.createdAt), 'dd MMM yyyy', { locale: tr })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              {review.comment && (
                <p className="text-gray-700 text-sm ml-11">{review.comment}</p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}