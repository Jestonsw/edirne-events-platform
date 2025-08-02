'use client'

import Link from 'next/link'
import { Home, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  const handleGoBack = () => {
    if (typeof window !== 'undefined') {
      window.history.back()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <h1 className="text-6xl font-bold text-edirne-500 mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">
            Sayfa Bulunamadı
          </h2>
          <p className="text-gray-600">
            Aradığınız sayfa mevcut değil veya taşınmış olabilir.
          </p>
        </div>
        
        <div className="space-y-4">
          <Link 
            href="/"
            className="inline-flex items-center px-6 py-3 bg-edirne-500 text-white rounded-lg hover:bg-edirne-600 transition-colors"
          >
            <Home className="w-5 h-5 mr-2" />
            Ana Sayfaya Dön
          </Link>
          
          <button
            onClick={handleGoBack}
            className="block w-full px-6 py-3 border border-edirne-500 text-edirne-500 rounded-lg hover:bg-edirne-50 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2 inline" />
            Geri Git
          </button>
        </div>
      </div>
    </div>
  )
}