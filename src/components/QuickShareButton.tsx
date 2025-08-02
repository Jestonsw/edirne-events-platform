'use client'

import { useState } from 'react'
import { Share2 } from 'lucide-react'
import SocialShareModal from './SocialShareModal'

interface EventData {
  id: number
  title: string
  description: string
  startDate: string
  location: string
  websiteUrl?: string
}

interface QuickShareButtonProps {
  event: EventData
  size?: 'sm' | 'md' | 'lg'
  variant?: 'icon' | 'button'
  className?: string
}

export default function QuickShareButton({ 
  event, 
  size = 'md', 
  variant = 'icon',
  className = '' 
}: QuickShareButtonProps) {
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  }

  const buttonClasses = {
    icon: `p-2 hover:bg-gray-100 rounded-lg transition-colors ${className}`,
    button: `flex items-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors ${className}`
  }

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsShareModalOpen(true)
  }

  return (
    <>
      <button
        onClick={handleShare}
        className={buttonClasses[variant]}
        title="Etkinliği Paylaş"
      >
        <Share2 className={sizeClasses[size]} />
        {variant === 'button' && <span>Paylaş</span>}
      </button>

      <SocialShareModal
        event={event}
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
      />
    </>
  )
}