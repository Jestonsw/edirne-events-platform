'use client'

import { useState } from 'react'
import { Share2, Facebook, Twitter, MessageCircle, Copy, Check } from 'lucide-react'
import { trackSocialShare } from './GoogleAnalytics'

interface SocialShareButtonsProps {
  title: string
  description: string
  url?: string
  hashtags?: string[]
  compact?: boolean
}

export default function SocialShareButtons({
  title,
  description,
  url,
  hashtags = ['EdirneEvents', 'EdirneEtkinlik'],
  compact = false
}: SocialShareButtonsProps) {
  const [copied, setCopied] = useState(false)
  
  const currentUrl = url || (typeof window !== 'undefined' ? window.location.href : '')
  const encodedUrl = encodeURIComponent(currentUrl)
  const encodedTitle = encodeURIComponent(title)
  const encodedDescription = encodeURIComponent(description)
  const hashtagString = hashtags.join(',')

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedTitle}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}&hashtags=${hashtagString}`,
    whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
    telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
  }

  const handleShare = async (platform: string) => {
    trackSocialShare(platform, title)
    
    if (platform === 'native' && navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: description,
          url: currentUrl,
        })
      } catch (error) {
        console.log('Native share cancelled')
      }
    } else if (platform === 'copy') {
      try {
        await navigator.clipboard.writeText(currentUrl)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch (error) {
        console.log('Copy failed')
      }
    } else {
      window.open(shareLinks[platform as keyof typeof shareLinks], '_blank', 'width=600,height=400')
    }
  }

  // Check if native sharing is available
  const hasNativeShare = typeof navigator !== 'undefined' && navigator.share

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={() => handleShare(hasNativeShare ? 'native' : 'copy')}
          className="flex items-center gap-1 px-3 py-1 text-sm text-gray-600 hover:text-red-600 transition-colors"
        >
          {hasNativeShare ? (
            <>
              <Share2 className="w-4 h-4" />
              <span>Paylaş</span>
            </>
          ) : (
            <>
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Kopyalandı' : 'Linki Kopyala'}</span>
            </>
          )}
        </button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-gray-600 font-medium">Paylaş:</span>
      
      <div className="flex items-center gap-2">
        {/* Facebook */}
        <button
          onClick={() => handleShare('facebook')}
          className="p-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white transition-colors"
          title="Facebook'ta paylaş"
        >
          <Facebook className="w-4 h-4" />
        </button>

        {/* Twitter */}
        <button
          onClick={() => handleShare('twitter')}
          className="p-2 rounded-full bg-sky-500 hover:bg-sky-600 text-white transition-colors"
          title="Twitter'da paylaş"
        >
          <Twitter className="w-4 h-4" />
        </button>

        {/* WhatsApp */}
        <button
          onClick={() => handleShare('whatsapp')}
          className="p-2 rounded-full bg-green-500 hover:bg-green-600 text-white transition-colors"
          title="WhatsApp'ta paylaş"
        >
          <MessageCircle className="w-4 h-4" />
        </button>

        {/* Native Share or Copy Link */}
        <button
          onClick={() => handleShare(hasNativeShare ? 'native' : 'copy')}
          className="p-2 rounded-full bg-gray-500 hover:bg-gray-600 text-white transition-colors"
          title={hasNativeShare ? 'Paylaş' : 'Linki kopyala'}
        >
          {hasNativeShare ? (
            <Share2 className="w-4 h-4" />
          ) : (
            copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  )
}