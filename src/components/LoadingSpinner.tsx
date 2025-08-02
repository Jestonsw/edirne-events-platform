'use client'

export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="relative">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-edirne-500 rounded-full animate-spin"></div>
        <div className="mt-4 text-center">
          <p className="text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    </div>
  )
}