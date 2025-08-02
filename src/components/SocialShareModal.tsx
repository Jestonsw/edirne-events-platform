'use client'

import { useState, useRef } from 'react'
import { X, Share2, Facebook, Twitter, Instagram, Copy, Download, Link as LinkIcon } from 'lucide-react'
import { Event } from '@/lib/schema'

// Convert database Event type to component-compatible type
type ComponentEvent = {
  id: number
  title: string
  description: string | null
  startDate: string
  endDate?: string | null
  startTime: string | null
  endTime?: string | null
  location: string
  address?: string | null
  organizerName?: string | null
  organizerContact?: string | null
  categoryId: number | null
  price: string | null
  capacity?: number | null
  imageUrl?: string | null
  websiteUrl?: string | null
  ticketUrl?: string | null
  tags?: string | null
  participantType?: string | null
  isActive?: boolean | null
  isFeatured?: boolean | null
}
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'

interface EventData {
  id: number
  title: string
  description: string
  startDate: string
  startTime?: string
  location: string
  price?: string
  websiteUrl?: string
  imageUrl?: string
}

interface SocialShareModalProps {
  event: EventData
  isOpen: boolean
  onClose: () => void
}

interface SharePreview {
  title: string
  description: string
  image: string | null
  hashtags: string[]
}

export default function SocialShareModal({ event, isOpen, onClose }: SocialShareModalProps) {
  const [sharePreview, setSharePreview] = useState<SharePreview>(() => {
    // Handle both string and Date types for startDate
    const eventDate = typeof event.startDate === 'string' ? new Date(event.startDate) : event.startDate
    const formattedDate = format(eventDate, 'dd MMMM yyyy', { locale: tr })
    
    return {
      title: event.title,
      description: `${formattedDate} tarihinde ${event.location}'da gerçekleşecek olan ${event.title}. ${event.description || ''}`,
      image: event.imageUrl || null,
      hashtags: ['EdirneEtkinlik', 'Edirne', event.title.replace(/\s+/g, '').substring(0, 20)]
    }
  })
  
  const [customMessage, setCustomMessage] = useState('')
  const canvasRef = useRef<HTMLCanvasElement>(null)

  if (!isOpen) return null

  const generateEventUrl = () => {
    const baseUrl = window.location.origin
    return `${baseUrl}?event=${encodeURIComponent(event.title)}&id=${event.id}`
  }

  const eventUrl = generateEventUrl()

  const shareToFacebook = () => {
    const text = customMessage || `${sharePreview.title}\n\n${sharePreview.description}`
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(eventUrl)}&quote=${encodeURIComponent(text)}`
    window.open(url, '_blank', 'width=600,height=400')
  }

  const shareToTwitter = () => {
    const text = customMessage || sharePreview.title
    const hashtags = sharePreview.hashtags.join(',')
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(eventUrl)}&hashtags=${hashtags}`
    window.open(url, '_blank', 'width=600,height=400')
  }

  const shareToWhatsApp = () => {
    const text = customMessage || `${sharePreview.title}\n\n${sharePreview.description}\n\n${eventUrl}`
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`
    window.open(url, '_blank')
  }

  const shareToTelegram = () => {
    const text = customMessage || `${sharePreview.title}\n\n${sharePreview.description}`
    const url = `https://t.me/share/url?url=${encodeURIComponent(eventUrl)}&text=${encodeURIComponent(text)}`
    window.open(url, '_blank')
  }

  const copyToClipboard = async () => {
    const text = customMessage || `${sharePreview.title}\n\n${sharePreview.description}\n\n${eventUrl}`
    try {
      await navigator.clipboard.writeText(text)
      alert('Metin panoya kopyalandı!')
    } catch (err) {
    }
  }

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(eventUrl)
      alert('Link panoya kopyalandı!')
    } catch (err) {
    }
  }

  const generateShareImage = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size for social media (1200x630 for Facebook/Twitter)
    canvas.width = 1200
    canvas.height = 630

    // Create gradient background
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
    gradient.addColorStop(0, '#1e40af')
    gradient.addColorStop(1, '#3b82f6')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Add semi-transparent overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Event title
    ctx.fillStyle = 'white'
    ctx.font = 'bold 48px Arial, sans-serif'
    ctx.textAlign = 'center'
    const titleLines = wrapText(ctx, event.title, canvas.width - 100)
    titleLines.forEach((line, index) => {
      ctx.fillText(line, canvas.width / 2, 200 + (index * 60))
    })

    // Event date and location
    ctx.font = '32px Arial, sans-serif'
    const eventDateFormatted = typeof event.startDate === 'string' ? 
    format(new Date(event.startDate), 'dd MMMM yyyy, EEEE', { locale: tr }) : 
    format(event.startDate, 'dd MMMM yyyy, EEEE', { locale: tr })
    ctx.fillText(`📅 ${eventDateFormatted}`, canvas.width / 2, 350)
    ctx.fillText(`📍 ${event.location}`, canvas.width / 2, 400)

    // Edirne Events branding
    ctx.font = '24px Arial, sans-serif'
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
    ctx.fillText('Edirne Events', canvas.width / 2, 550)

    // Download the image
    const link = document.createElement('a')
    link.download = `${event.title.replace(/[^a-zA-Z0-9]/g, '_')}_share.png`
    link.href = canvas.toDataURL()
    link.click()
  }

  const wrapText = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number) => {
    const words = text.split(' ')
    const lines: string[] = []
    let currentLine = words[0]

    for (let i = 1; i < words.length; i++) {
      const word = words[i]
      const width = ctx.measureText(currentLine + ' ' + word).width
      if (width < maxWidth) {
        currentLine += ' ' + word
      } else {
        lines.push(currentLine)
        currentLine = word
      }
    }
    lines.push(currentLine)
    return lines.slice(0, 3) // Limit to 3 lines
  }

  const eventDate = typeof event.startDate === 'string' ? new Date(event.startDate) : event.startDate
  const formattedDate = format(eventDate, 'dd MMMM yyyy, EEEE', { locale: tr })

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Etkinliği Paylaş</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Preview Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Paylaşım Önizlemesi</h3>
              
              {/* Preview Card */}
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                {sharePreview.image && (
                  <img
                    src={sharePreview.image}
                    alt={sharePreview.title}
                    className="w-full h-32 object-cover rounded-lg mb-3"
                  />
                )}
                <h4 className="font-bold text-gray-900 mb-2">{sharePreview.title}</h4>
                <p className="text-gray-700 text-sm mb-2 line-clamp-3">{sharePreview.description}</p>
                <div className="flex flex-wrap gap-1 mb-2">
                  {sharePreview.hashtags.map((tag, index) => (
                    <span key={index} className="text-blue-600 text-xs">#{tag}</span>
                  ))}
                </div>
                <p className="text-gray-500 text-xs">{eventUrl}</p>
              </div>

              {/* Custom Message */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Özel Mesaj (İsteğe Bağlı)
                </label>
                <textarea
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  placeholder="Etkinlik hakkında kendi yorumunuzu ekleyin..."
                  className="w-full p-3 border border-gray-300 rounded-lg resize-none"
                  rows={3}
                />
              </div>
            </div>

            {/* Sharing Options */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Paylaşım Seçenekleri</h3>
              
              {/* Social Media Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={shareToFacebook}
                  className="flex items-center justify-center gap-2 p-3 bg-[#1877f2] text-white rounded-lg hover:bg-[#166fe5] transition-colors"
                >
                  <Facebook className="w-5 h-5" />
                  Facebook
                </button>
                
                <button
                  onClick={shareToTwitter}
                  className="flex items-center justify-center gap-2 p-3 bg-[#1da1f2] text-white rounded-lg hover:bg-[#1a8cd8] transition-colors"
                >
                  <Twitter className="w-5 h-5" />
                  Twitter
                </button>
                
                <button
                  onClick={shareToWhatsApp}
                  className="flex items-center justify-center gap-2 p-3 bg-[#25d366] text-white rounded-lg hover:bg-[#22c55e] transition-colors"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                  </svg>
                  WhatsApp
                </button>
                
                <button
                  onClick={shareToTelegram}
                  className="flex items-center justify-center gap-2 p-3 bg-[#0088cc] text-white rounded-lg hover:bg-[#0077b3] transition-colors"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                  </svg>
                  Telegram
                </button>
              </div>

              {/* Utility Buttons */}
              <div className="space-y-2">
                <button
                  onClick={copyToClipboard}
                  className="w-full flex items-center justify-center gap-2 p-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Copy className="w-5 h-5" />
                  Metni Kopyala
                </button>
                
                <button
                  onClick={copyLink}
                  className="w-full flex items-center justify-center gap-2 p-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <LinkIcon className="w-5 h-5" />
                  Linki Kopyala
                </button>
                
                <button
                  onClick={generateShareImage}
                  className="w-full flex items-center justify-center gap-2 p-3 bg-edirne-500 text-white rounded-lg hover:bg-edirne-600 transition-colors"
                >
                  <Download className="w-5 h-5" />
                  Paylaşım Görseli İndir
                </button>
              </div>

              {/* Event Details Summary */}
              <div className="bg-gray-50 rounded-lg p-4 mt-4">
                <h4 className="font-semibold mb-2">Etkinlik Özeti</h4>
                <div className="space-y-1 text-sm text-gray-600">
                  <p><strong>Tarih:</strong> {formattedDate}</p>
                  {event.startTime && <p><strong>Saat:</strong> {event.startTime}</p>}
                  <p><strong>Konum:</strong> {event.location}</p>
                  <p><strong>Fiyat:</strong> {event.price === '0.00' || event.price === 'Ücretsiz' ? 'Ücretsiz' : event.price}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hidden canvas for image generation */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  )
}