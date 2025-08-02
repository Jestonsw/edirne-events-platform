'use client'

import { useEffect } from 'react'
import { clearGoogleAuthCache } from '@/lib/clearAuth'

export default function ClientAuthCleaner() {
  useEffect(() => {
    // Clear any cached Google authentication data on app start
    clearGoogleAuthCache()
    
    // Also clear any global Google API objects if they exist
    if (typeof window !== 'undefined') {
      // @ts-ignore
      if (window.gapi) {
        try {
          // @ts-ignore
          window.gapi.auth2?.getAuthInstance()?.signOut()
        } catch (e) {
          // Ignore errors
        }
      }
      
      // @ts-ignore
      if (window.google) {
        try {
          // @ts-ignore
          window.google.accounts?.id?.disableAutoSelect()
        } catch (e) {
          // Ignore errors
        }
      }
    }
  }, [])

  return null
}