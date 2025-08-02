'use client'

import React from 'react'
import { X, UserPlus, Calendar, MapPin } from 'lucide-react'

interface MembershipRequiredModalProps {
  isOpen: boolean
  onClose: () => void
  onJoinNow: () => void
  actionType: 'event' | 'venue'
}

export default function MembershipRequiredModal({ 
  isOpen, 
  onClose, 
  onJoinNow, 
  actionType 
}: MembershipRequiredModalProps) {
  if (!isOpen) return null

  const actionText = actionType === 'event' ? 'etkinlik eklemek' : 'mekan eklemek'
  const actionIcon = actionType === 'event' ? Calendar : MapPin

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
              <UserPlus className="w-4 h-4 text-red-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-800">
              Üyelik Gerekli
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="text-center mb-6">
          <div className="mb-4">
            {actionType === 'event' ? (
              <Calendar className="w-12 h-12 mx-auto text-gray-400 mb-2" />
            ) : (
              <MapPin className="w-12 h-12 mx-auto text-gray-400 mb-2" />
            )}
          </div>
          
          <h3 className="text-xl font-medium text-gray-800 mb-2">
            Profil Menüsünden Üye Olunuz
          </h3>
          
          <p className="text-gray-600 text-sm leading-relaxed">
            {actionText.charAt(0).toUpperCase() + actionText.slice(1)} için önce üye olmanız gerekiyor. 
            Lütfen sağ üstteki profil menüsünden "Üye Ol" seçeneğini kullanın.
          </p>
        </div>

        <div className="flex justify-center">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Tamam
          </button>
        </div>
      </div>
    </div>
  )
}