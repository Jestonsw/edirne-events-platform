'use client'

import { useState, useEffect, useCallback } from 'react'
import { X, Calendar, Upload, Image as ImageIcon, Camera as CameraIcon } from 'lucide-react'
import dynamic from 'next/dynamic'

const InteractiveMap = dynamic(() => import('@/components/InteractiveMap'), {
  ssr: false,
  loading: () => <div className="h-[300px] bg-gray-100 rounded flex items-center justify-center">Harita yükleniyor...</div>
})

interface EventSubmissionModalProps {
  onClose: () => void
  isAdminReview?: boolean
  existingEvent?: any
  onApprove?: () => void
}

export default function EventSubmissionModal({ onClose, isAdminReview = false, existingEvent, onApprove }: EventSubmissionModalProps) {
  // Phone number formatting function
  const formatPhoneDisplay = (digits: string) => {
    const paddedDigits = digits.padEnd(10, 'X')
    
    // Format: 0XXX XXX XX XX
    let display = '0'
    display += paddedDigits.slice(0, 3) // XXX or digits
    display += ' ' + paddedDigits.slice(3, 6) // XXX or digits
    display += ' ' + paddedDigits.slice(6, 8) // XX or digits
    display += ' ' + paddedDigits.slice(8, 10) // XX or digits
    
    return display
  }

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    venue: '',
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
    address: '',
    latitude: '',
    longitude: '',
    categoryIds: [] as number[],
    websiteUrl: '',
    ticketUrl: '',


    imageUrl: '',
    imageUrl2: '',
    imageUrl3: '',
    mediaFiles: [] as string[],
    isFeatured: false
  })



  const [categories, setCategories] = useState<any[]>([])
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [uploadingImage2, setUploadingImage2] = useState(false)
  const [uploadingImage3, setUploadingImage3] = useState(false)
  const [uploadingMedia, setUploadingMedia] = useState(false)
  const [selectedUploadType, setSelectedUploadType] = useState<'photo' | 'video'>('photo')
  const [showMediaModal, setShowMediaModal] = useState(false)
  const [mediaModalType, setMediaModalType] = useState<'photo' | 'video'>('photo')
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  const [touchStartPos, setTouchStartPos] = useState<{ x: number; y: number; index: number } | null>(null)
  const [touchCurrentPos, setTouchCurrentPos] = useState<{ x: number; y: number } | null>(null)
  const [touchDraggedIndex, setTouchDraggedIndex] = useState<number | null>(null)
  const [mediaRotations, setMediaRotations] = useState<Record<string, number>>({})
  const [isAutoSaving, setIsAutoSaving] = useState(false)

  // Auto-save function for edit mode
  const autoSaveEvent = useCallback(async (updatedData: any) => {
    if (!isAdminReview || !existingEvent?.id) return
    
    try {
      setIsAutoSaving(true)
      
      // Combine media files with rotation data
      const mediaFilesWithRotations = getAllMediaFiles().map(mediaUrl => ({
        url: mediaUrl,
        rotation: mediaRotations[mediaUrl] || 0
      }))
      
      const response = await fetch(`/api/events/${existingEvent.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...updatedData,
          mediaFiles: JSON.stringify(mediaFilesWithRotations)
        }),
      })
      
      if (response.ok) {
        console.log('✅ Auto-saved successfully')
      } else {
        console.error('❌ Auto-save failed')
      }
    } catch (error) {
      console.error('❌ Auto-save error:', error)
    } finally {
      setIsAutoSaving(false)
    }
  }, [isAdminReview, existingEvent?.id, mediaRotations])

  // Load categories
  useEffect(() => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => setCategories(data))
  }, [])

  // Track if form has been initialized to prevent resets
  const [isFormInitialized, setIsFormInitialized] = useState(false)

  // Load form data when existingEvent changes (only once per modal instance)
  useEffect(() => {
    console.log('🔄 EventSubmissionModal: existingEvent changed', {
      id: existingEvent?.id,
      title: existingEvent?.title,
      isAdminReview,
      isFormInitialized,
      timestamp: new Date().toISOString()
    })
    
    if (isAdminReview && existingEvent && !isFormInitialized) {
      setIsFormInitialized(true)
      // Format dates for input fields (YYYY-MM-DD)
      const formatDateForInput = (dateValue: any) => {
        if (!dateValue) return ''
        const date = new Date(dateValue)
        if (isNaN(date.getTime())) return ''
        return date.toISOString().split('T')[0]
      }

      // Parse media_files from database (stored as JSON string)
      let parsedMediaFiles: any[] = []
      
      // Check for mediaFiles field first (Drizzle ORM mapping)
      if (existingEvent.mediaFiles) {
        try {
          const parsed = typeof existingEvent.mediaFiles === 'string' 
            ? JSON.parse(existingEvent.mediaFiles) 
            : existingEvent.mediaFiles
          parsedMediaFiles = Array.isArray(parsed) ? parsed : []
        } catch (e) {
          console.warn('Failed to parse mediaFiles:', existingEvent.mediaFiles)
          parsedMediaFiles = []
        }
      }
      
      // Also check for media_files field (backup)
      if (!parsedMediaFiles.length && existingEvent.media_files) {
        try {
          const parsed = typeof existingEvent.media_files === 'string' 
            ? JSON.parse(existingEvent.media_files) 
            : existingEvent.media_files
          parsedMediaFiles = Array.isArray(parsed) ? parsed : []
        } catch (e) {
          console.warn('Failed to parse media_files:', existingEvent.media_files)
          parsedMediaFiles = []
        }
      }
      
      // Combine all media files from both imageUrl fields and media_files array
      const mediaFilesUrls = parsedMediaFiles.map((item: any) => 
        typeof item === 'string' ? item : (item && typeof item === 'object' ? item.url : null)
      ).filter(Boolean)
      
      const combinedMediaFiles = [
        existingEvent.imageUrl,
        existingEvent.imageUrl2, 
        existingEvent.imageUrl3,
        ...mediaFilesUrls
      ].filter(Boolean)
      
      console.log('🔍 Admin review media loading (FRESH):', {
        id: existingEvent.id,
        title: existingEvent.title,
        imageUrl: existingEvent.imageUrl,
        imageUrl2: existingEvent.imageUrl2,
        imageUrl3: existingEvent.imageUrl3,
        media_files_raw: existingEvent.media_files,
        mediaFiles_raw: existingEvent.mediaFiles,
        parsedMediaFiles,
        combinedMediaFiles,
        updatedAt: existingEvent.updatedAt
      })
      
      // Initialize rotation states for admin review media files
      const initialRotations: Record<string, number> = {}
      
      // Check if mediaFiles contains rotation data (new format)
      if (parsedMediaFiles.length > 0 && parsedMediaFiles[0]?.url) {
        // New format: mediaFiles = [{ url: "...", rotation: 90 }, ...]
        parsedMediaFiles.forEach((mediaObj: any) => {
          if (mediaObj && typeof mediaObj === 'object' && mediaObj.url) {
            initialRotations[mediaObj.url] = mediaObj.rotation || 0
          }
        })
      } else {
        // Old format: plain URL strings, set all to 0 degrees
        combinedMediaFiles.forEach(mediaUrl => {
          if (mediaUrl && typeof mediaUrl === 'string') {
            initialRotations[mediaUrl] = 0
          }
        })
      }
      
      setMediaRotations(initialRotations)
      
      // Load existing event data for admin review
      const newFormData = {
        title: existingEvent.title || '',
        description: existingEvent.description || '',
        venue: existingEvent.venue || '',
        startDate: formatDateForInput(existingEvent.startDate),
        endDate: formatDateForInput(existingEvent.endDate),
        startTime: existingEvent.startTime || '',
        endTime: existingEvent.endTime || '',
        address: existingEvent.location || '',
        latitude: existingEvent.latitude?.toString() || '',
        longitude: existingEvent.longitude?.toString() || '',
        categoryIds: existingEvent.categories?.map((c: any) => c.categoryId) || [],
        websiteUrl: existingEvent.websiteUrl || '',
        ticketUrl: existingEvent.ticketUrl || '',
        imageUrl: existingEvent.imageUrl || '',
        imageUrl2: existingEvent.imageUrl2 || '',
        imageUrl3: existingEvent.imageUrl3 || '',
        mediaFiles: parsedMediaFiles,
        isFeatured: existingEvent.isFeatured || false
      }
      
      console.log('📝 Setting fresh form data:', newFormData)
      setFormData(newFormData)
    } else if (!isAdminReview) {
      // Restore form data from localStorage for user submissions
      const savedFormData = localStorage.getItem('eventSubmissionFormData')
      
      if (savedFormData) {
        try {
          const parsedFormData = JSON.parse(savedFormData)
          // Ensure mediaFiles array exists
          if (!parsedFormData.mediaFiles) {
            parsedFormData.mediaFiles = []
          }
          setFormData(parsedFormData)
        } catch (error) {
        }
      }
    }

  }, [isAdminReview, existingEvent, isFormInitialized])

  // Auto-save when form data changes (for edit mode only)
  useEffect(() => {
    if (!isAdminReview || !existingEvent?.id) return
    
    const timeoutId = setTimeout(() => {
      autoSaveEvent(formData)
    }, 1000) // Debounce: save 1 second after last change
    
    return () => clearTimeout(timeoutId)
  }, [formData, autoSaveEvent, isAdminReview, existingEvent?.id])

  // Auto-save when rotations change
  useEffect(() => {
    if (!isAdminReview || !existingEvent?.id) return
    
    const timeoutId = setTimeout(() => {
      autoSaveEvent(formData)
    }, 500) // Faster save for rotations
    
    return () => clearTimeout(timeoutId)
  }, [mediaRotations, autoSaveEvent, isAdminReview, existingEvent?.id, formData])

  // Save form data to localStorage whenever it changes (only for user submissions)
  useEffect(() => {
    if (!isAdminReview) {
      localStorage.setItem('eventSubmissionFormData', JSON.stringify(formData))
    }
  }, [formData, isAdminReview])



  // Location select handler with useCallback to prevent closure issues
  const handleLocationSelect = useCallback((lat: number, lng: number) => {
    setFormData(prevState => ({
      ...prevState,
      latitude: lat.toFixed(6),
      longitude: lng.toFixed(6)
    }))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
    if (formData.categoryIds.length < 1 || formData.categoryIds.length > 3) {
      alert('En az 1, en fazla 3 kategori seçmelisiniz')
      return
    }

    // Location validation - either map coordinates or address required
    if ((!formData.latitude || !formData.longitude) && !formData.address.trim()) {
      alert('Lütfen adres bilgisi girin veya haritadan konum seçin')
      return
    }

    // Combine media files with their rotations for database storage
    const mediaFilesWithRotations = getAllMediaFiles().map(mediaUrl => ({
      url: mediaUrl,
      rotation: mediaRotations[mediaUrl] || 0
    }))

    const submissionData = {
      ...formData,
      location: formData.address, // Map address to location for API
      submitterName: 'Anonim Kullanıcı',
      submitterEmail: 'anonymous@edirne-events.com',
      submitterPhone: '',
      mediaFiles: mediaFilesWithRotations // Store media with rotation data
    }

    try {
      // If editing existing event (admin mode), use PUT request
      if (isAdminReview && existingEvent) {
        console.log('📝 Admin updating event:', existingEvent.id, submissionData)
        console.log('📝 Existing event status:', existingEvent.status || 'no status field')
        
        // Determine correct endpoint based on event source
        // If event has status field, it's from pending_events table
        // If no status field, it's from main events table
        const isPendingEvent = existingEvent.hasOwnProperty('status')
        const endpoint = isPendingEvent 
          ? `/api/admin/pending-events/${existingEvent.id}`
          : `/api/events/${existingEvent.id}`
        
        console.log('📝 Using endpoint:', endpoint, 'isPending:', isPendingEvent)
        
        const response = await fetch(endpoint, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(submissionData)
        })

        console.log('📝 Update response status:', response.status)
        
        if (response.ok) {
          console.log('✅ Event update successful')
          alert('Etkinlik başarıyla güncellendi!')
          resetForm()
          onClose()
          // Call onApprove to refresh the admin events list
          if (onApprove) {
            onApprove()
          }
        } else {
          const errorData = await response.json()
          console.error('❌ Update failed:', errorData)
          alert(`Etkinlik güncellenirken bir hata oluştu: ${errorData.error || 'Bilinmeyen hata'}`)
        }
      } else {
        // Regular submission or admin approval
        const response = await fetch('/api/events', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(submissionData)
        })

        if (response.ok) {
          alert('Etkinliğiniz başarıyla gönderildi! İncelendikten sonra yayınlanacaktır.')
          resetForm()
          onClose()
        } else {
          alert('Etkinlik gönderilirken bir hata oluştu.')
        }
      }
    } catch (error) {
      alert('Bir hata oluştu. Lütfen tekrar deneyin.')
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      venue: '',
      startDate: '',
      endDate: '',
      startTime: '',
      endTime: '',
      address: '',
      latitude: '',
      longitude: '',
      categoryIds: [],
      websiteUrl: '',
      ticketUrl: '',


      imageUrl: '',
      imageUrl2: '',
      imageUrl3: '',
      mediaFiles: [],
      isFeatured: false
    })

    
    localStorage.removeItem('eventSubmissionFormData')
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    
    setUploadingMedia(true)
    
    for (const file of Array.from(files)) {
      try {
        console.log('📤 Starting upload:', {
          name: file.name,
          size: file.size,
          type: file.type,
          sizeInMB: (file.size / (1024 * 1024)).toFixed(2) + ' MB'
        })
        
        // Check file size before upload
        const isVideo = file.type.startsWith('video/')
        const maxSize = isVideo ? 100 * 1024 * 1024 : 5 * 1024 * 1024
        
        if (file.size > maxSize) {
          alert(`${file.name} çok büyük! Maximum: ${isVideo ? '100MB (video)' : '5MB (resim)'}`)
          continue
        }
        
        // Check file type
        const allowedTypes = [
          'image/jpeg', 'image/jpg', 'image/png', 'image/webp',
          'video/mp4', 'video/mov', 'video/avi', 'video/quicktime'
        ]
        
        if (!allowedTypes.includes(file.type)) {
          alert(`${file.name} desteklenmeyen format! Desteklenen: JPG, PNG, WebP, MP4, MOV, AVI`)
          continue
        }
        
        const formDataUpload = new FormData()
        formDataUpload.append('file', file)

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formDataUpload,
        })

        if (response.ok) {
          const data = await response.json()
          console.log('📸 Upload successful:', data.imageUrl)
          
          // Add to mediaFiles array (unlimited upload)
          setFormData(prev => {
            const newMediaFiles = [...prev.mediaFiles, data.imageUrl]
            
            // Also update imageUrl fields for backward compatibility (only first 3)
            const updatedData = { ...prev, mediaFiles: newMediaFiles }
            
            if (!updatedData.imageUrl) {
              updatedData.imageUrl = data.imageUrl
            } else if (!updatedData.imageUrl2) {
              updatedData.imageUrl2 = data.imageUrl
            } else if (!updatedData.imageUrl3) {
              updatedData.imageUrl3 = data.imageUrl
            }
            
            return updatedData
          })
        } else {
          const errorData = await response.json().catch(() => ({ error: 'Bilinmeyen hata' }))
          console.error('❌ Upload failed:', {
            status: response.status,
            statusText: response.statusText,
            error: errorData
          })
          
          // More detailed error messages
          let errorMessage = `${file.name} yüklenemedi`
          if (response.status === 413) {
            errorMessage += ' - Dosya boyutu çok büyük (Max: Resim 5MB, Video 100MB)'
          } else if (response.status === 400) {
            errorMessage += ` - ${errorData.error || 'Geçersiz dosya formatı'}`
          } else if (response.status === 500) {
            errorMessage += ' - Sunucu hatası, lütfen tekrar deneyin'
          }
          
          alert(errorMessage)
        }
      } catch (error) {
        console.error('❌ Upload error for', file.name, ':', error)
        alert(`${file.name} yüklenirken hata oluştu: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`)
      }
    }
    
    setUploadingMedia(false)
    // Clear the input value to allow re-upload of same file
    e.target.value = ''
  }

  const removeMediaFile = (indexToRemove: number) => {
    setFormData(prev => {
      const newMediaFiles = prev.mediaFiles.filter((_, index) => index !== indexToRemove)
      return {
        ...prev,
        mediaFiles: newMediaFiles
      }
    })
  }

  // Get all media files for display (combined from all sources)
  const getAllMediaFiles = () => {
    // Handle both old format (string URLs) and new format (objects with rotation)
    const mediaFilesUrls = formData.mediaFiles.map((item: any) => 
      typeof item === 'string' ? item : item?.url
    ).filter(Boolean)
    
    const imageUrls = [formData.imageUrl, formData.imageUrl2, formData.imageUrl3].filter(Boolean)
    
    const allMedia = [...mediaFilesUrls, ...imageUrls]
    return allMedia.filter((url, index, arr) => arr.indexOf(url) === index) // Remove duplicates
  }

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    setDragOverIndex(index)
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDragLeave = () => {
    setDragOverIndex(null)
  }

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    
    if (draggedIndex === null) return
    
    const allMedia = getAllMediaFiles()
    const newMediaArray = [...allMedia]
    
    // Move the dragged item to the new position
    const draggedItem = newMediaArray[draggedIndex]
    newMediaArray.splice(draggedIndex, 1)
    newMediaArray.splice(dropIndex, 0, draggedItem)
    
    // Update formData with reordered media
    setFormData(prev => ({
      ...prev,
      mediaFiles: newMediaArray,
      // Update imageUrl fields for backward compatibility (first 3 items)
      imageUrl: newMediaArray[0] || '',
      imageUrl2: newMediaArray[1] || '',
      imageUrl3: newMediaArray[2] || ''
    }))
    
    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  // Touch/swipe handlers for mobile
  const handleTouchStart = (e: React.TouchEvent, index: number) => {
    const touch = e.touches[0]
    setTouchStartPos({
      x: touch.clientX,
      y: touch.clientY,
      index
    })
    setTouchDraggedIndex(index)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStartPos) return
    
    const touch = e.touches[0]
    setTouchCurrentPos({
      x: touch.clientX,
      y: touch.clientY
    })
    
    // Prevent scrolling while dragging
    e.preventDefault()
  }

  const handleTouchEnd = (e: React.TouchEvent, dropIndex: number) => {
    if (!touchStartPos || touchDraggedIndex === null) {
      setTouchStartPos(null)
      setTouchCurrentPos(null)
      setTouchDraggedIndex(null)
      return
    }

    const touch = e.changedTouches[0]
    const deltaX = Math.abs(touch.clientX - touchStartPos.x)
    const deltaY = Math.abs(touch.clientY - touchStartPos.y)
    
    // Only process as drag if significant movement
    if (deltaX > 20 || deltaY > 20) {
      // Find the element under the touch point
      const elementUnderTouch = document.elementFromPoint(touch.clientX, touch.clientY)
      const galleryContainer = elementUnderTouch?.closest('[data-gallery-item]')
      
      if (galleryContainer) {
        const targetIndexStr = galleryContainer.getAttribute('data-gallery-index')
        const targetIndex = targetIndexStr ? parseInt(targetIndexStr) : null
        
        if (targetIndex !== null && targetIndex !== touchDraggedIndex) {
          // Perform the reorder
          const allMedia = getAllMediaFiles()
          const newMediaArray = [...allMedia]
          const draggedItem = newMediaArray[touchDraggedIndex]
          
          newMediaArray.splice(touchDraggedIndex, 1)
          newMediaArray.splice(targetIndex, 0, draggedItem)
          
          setFormData(prev => ({
            ...prev,
            mediaFiles: newMediaArray,
            imageUrl: newMediaArray[0] || '',
            imageUrl2: newMediaArray[1] || '',
            imageUrl3: newMediaArray[2] || ''
          }))
        }
      }
    }
    
    setTouchStartPos(null)
    setTouchCurrentPos(null)
    setTouchDraggedIndex(null)
  }

  const handleMainImageDrop = (e: React.DragEvent) => {
    e.preventDefault()
    
    if (draggedIndex === null) return
    
    const allMedia = getAllMediaFiles()
    const draggedItem = allMedia[draggedIndex]
    const newMediaArray = [...allMedia]
    
    // Remove from current position
    newMediaArray.splice(draggedIndex, 1)
    // Add to beginning (main image position)
    newMediaArray.unshift(draggedItem)
    
    // Update formData
    setFormData(prev => ({
      ...prev,
      mediaFiles: newMediaArray,
      imageUrl: newMediaArray[0] || '',
      imageUrl2: newMediaArray[1] || '',
      imageUrl3: newMediaArray[2] || ''
    }))
    
    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <h3 className="text-lg font-semibold">{isAdminReview ? 'Etkinlik Güncelleme' : 'Etkinlik Ekle'}</h3>
            {isAutoSaving && (
              <div className="flex items-center space-x-1 text-green-600">
                <span className="text-sm animate-pulse">💾</span>
                <span className="text-xs">Kaydediliyor...</span>
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Fotoğraf ve Videolar Bölümü */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Fotoğraf ve Videolar *
            </label>
            
            {/* Tab Buttons - Küçük boyut */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              <button
                type="button"
                className={`flex items-center justify-center p-2 border rounded-lg text-xs font-medium transition-colors ${
                  selectedUploadType === 'photo' 
                    ? 'border-blue-500 bg-blue-50 text-blue-600' 
                    : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50 text-gray-600'
                }`}
                onClick={() => {
                  setSelectedUploadType('photo')
                  setMediaModalType('photo')
                  setShowMediaModal(true)
                }}
              >
                <ImageIcon className={`w-4 h-4 mr-1 ${
                  selectedUploadType === 'photo' ? 'text-blue-500' : 'text-gray-500'
                }`} />
                Resim Yükle
              </button>
              
              <button
                type="button"
                className={`flex items-center justify-center p-2 border rounded-lg text-xs font-medium transition-colors ${
                  selectedUploadType === 'video' 
                    ? 'border-red-500 bg-red-50 text-red-600' 
                    : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50 text-gray-600'
                }`}
                onClick={() => {
                  setSelectedUploadType('video')
                  setMediaModalType('video')
                  setShowMediaModal(true)
                }}
              >
                <svg className={`w-4 h-4 mr-1 ${
                  selectedUploadType === 'video' ? 'text-red-500' : 'text-gray-500'
                }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 002 2v8a2 2 0 002 2z" />
                </svg>
                Video Yükle
              </button>
            </div>

            {/* Hidden file inputs */}
            <input
              id="photo-upload"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={uploadingImage}
              className="hidden"
              multiple
            />
            
            <input
              id="video-upload"
              type="file"
              accept="video/*"
              onChange={handleImageUpload}
              disabled={uploadingImage}
              className="hidden"
            />
            
            {/* Camera capture input for mobile - photo */}
            <input
              id="camera-capture"
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleImageUpload}
              disabled={uploadingImage}
              className="hidden"
            />
            
            {/* Camera capture input for mobile - video */}
            <input
              id="video-camera-capture"
              type="file"
              accept="video/*"
              capture="environment"
              onChange={handleImageUpload}
              disabled={uploadingImage}
              className="hidden"
            />

            {/* Media Selection Modal */}
            {showMediaModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg p-6 max-w-sm w-full">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold">Medya Seç</h4>
                    <button
                      type="button"
                      onClick={() => setShowMediaModal(false)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    <button
                      type="button"
                      onClick={() => {
                        document.getElementById(mediaModalType === 'photo' ? 'photo-upload' : 'video-upload')?.click()
                        setShowMediaModal(false)
                      }}
                      className={`w-full flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 ${
                        mediaModalType === 'photo' ? 'border-blue-300' : 'border-red-300'
                      }`}
                    >
                      <ImageIcon className={`w-5 h-5 ${
                        mediaModalType === 'photo' ? 'text-blue-500' : 'text-red-500'
                      }`} />
                      <span>Galeri</span>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => {
                        if (mediaModalType === 'photo') {
                          document.getElementById('camera-capture')?.click()
                        } else {
                          document.getElementById('video-camera-capture')?.click()
                        }
                        setShowMediaModal(false)
                      }}
                      className={`w-full flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 ${
                        mediaModalType === 'photo' ? 'border-blue-300' : 'border-red-300'
                      }`}
                    >
                      <CameraIcon className={`w-5 h-5 ${
                        mediaModalType === 'photo' ? 'text-blue-500' : 'text-red-500'
                      }`} />
                      <span>Kamera</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Preview uploaded media - Unlimited with Drag & Drop */}
            {getAllMediaFiles().length > 0 && (
              <div className="mt-4">
                <label className="block text-xs font-medium text-gray-600 mb-3">
                  Yüklenen Medya Dosyaları ({getAllMediaFiles().length})
                </label>
                


                {/* Media Gallery Grid */}
                <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                  {getAllMediaFiles().map((mediaUrl, index) => (
                    <div 
                      key={`${mediaUrl}-${index}`} 
                      className={`relative cursor-move transition-transform select-none ${
                        draggedIndex === index || touchDraggedIndex === index ? 'scale-95 opacity-50' : ''
                      } ${
                        dragOverIndex === index ? 'scale-105 ring-2 ring-blue-400' : ''
                      } ${
                        index === 0 ? 'ring-4 ring-red-500' : ''
                      }`}
                      draggable
                      data-gallery-item="true"
                      data-gallery-index={index}
                      onDragStart={(e) => handleDragStart(e, index)}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, index)}
                      onTouchStart={(e) => handleTouchStart(e, index)}
                      onTouchMove={handleTouchMove}
                      onTouchEnd={(e) => handleTouchEnd(e, index)}
                    >
                      {/* Index Badge */}
                      <div className={`absolute -top-2 -left-2 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold z-10 ${
                        index === 0 ? 'bg-red-500' : 'bg-blue-500'
                      }`}>
                        {index + 1}
                      </div>
                      
                      {/* Media Content */}
                      {(mediaUrl.toLowerCase().includes('.mp4') || 
                        mediaUrl.toLowerCase().includes('.mov') || 
                        mediaUrl.toLowerCase().includes('.avi') || 
                        mediaUrl.toLowerCase().includes('video')) ? (
                        <div className="relative w-full h-20 bg-gray-900 rounded-lg border">
                          <video
                            src={mediaUrl}
                            className="w-full h-full object-cover rounded-lg"
                            style={{
                              transform: `rotate(${mediaRotations[mediaUrl] || 0}deg)`,
                              transition: 'transform 0.3s ease'
                            }}
                            controls={false}
                            muted
                            preload="metadata"
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 rounded-lg">
                            <div className="text-white text-xs font-medium">📹</div>
                          </div>
                        </div>
                      ) : (
                        <img
                          src={mediaUrl}
                          alt={`Galeri ${index + 1}`}
                          className="w-20 h-20 object-cover rounded-lg border"
                          style={{
                            transform: `rotate(${mediaRotations[mediaUrl] || 0}deg)`,
                            transition: 'transform 0.3s ease'
                          }}
                          draggable={false}
                        />
                      )}
                      
                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          const allMedia = getAllMediaFiles()
                          const newMediaFiles = allMedia.filter((_, i) => i !== index)
                          setFormData(prev => ({
                            ...prev,
                            mediaFiles: newMediaFiles,
                            imageUrl: newMediaFiles[0] || '',
                            imageUrl2: newMediaFiles[1] || '',
                            imageUrl3: newMediaFiles[2] || ''
                          }))
                        }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 z-10"
                      >
                        ×
                      </button>
                      
                      {/* Rotation Control */}
                      <div className="absolute bottom-2 left-2 flex gap-1">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            const currentRotation = mediaRotations[mediaUrl] || 0
                            const nextRotation = (currentRotation + 90) % 360
                            setMediaRotations(prev => ({
                              ...prev,
                              [mediaUrl]: nextRotation
                            }))
                          }}
                          className="bg-blue-500 bg-opacity-80 text-white rounded px-2 py-1 text-xs hover:bg-blue-600 transition-colors"
                          title={`Döndür (${mediaRotations[mediaUrl] || 0}°)`}
                        >
                          🔄
                        </button>
                        {mediaRotations[mediaUrl] > 0 && (
                          <span className="bg-gray-800 bg-opacity-75 text-white rounded px-1 py-1 text-xs">
                            {mediaRotations[mediaUrl]}°
                          </span>
                        )}
                        {isAutoSaving && (
                          <span className="bg-green-500 bg-opacity-80 text-white rounded px-1 py-1 text-xs animate-pulse">
                            💾
                          </span>
                        )}
                      </div>

                      {/* Drag Handle */}
                      <div className="absolute bottom-2 right-2 bg-gray-800 bg-opacity-75 text-white rounded px-2 py-1 text-xs">
                        ⋮⋮
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Instructions */}
                <div className="mt-3 text-xs text-gray-500 text-center">
                  💡 İpucu: Resimleri sürükleyerek veya parmakla kaydırarak sıralamayı değiştirebilirsiniz. İlk resim (kırmızı çerçeveli) ana resim olarak gösterilir.
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Etkinlik Adı *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-edirne-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Yer/Mekan Adı
              </label>
              <input
                type="text"
                value={formData.venue}
                onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-edirne-500"
                placeholder="Etkinliğin düzenlendiği yer/mekan adı"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kategoriler (En az 1, en fazla 3 kategori seçiniz) *
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowCategoryModal(true)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-left focus:outline-none focus:ring-2 focus:ring-edirne-500 flex items-center justify-between"
                >
                  <span className="flex flex-wrap gap-1">
                    {formData.categoryIds.length === 0 ? (
                      <span className="text-gray-500">Kategori seçiniz...</span>
                    ) : (
                      formData.categoryIds.map((categoryId) => {
                        const category = categories.find(c => c.id === categoryId)
                        return category ? (
                          <span key={categoryId} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {category.displayName}
                          </span>
                        ) : null
                      })
                    )}
                  </span>
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
              {(formData.categoryIds.length < 1 || formData.categoryIds.length > 3) && (
                <p className="text-red-500 text-xs mt-1">En az 1, en fazla 3 kategori seçmelisiniz</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Açıklama *
            </label>
            <textarea
              required
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-edirne-500"
            />
          </div>



          {/* Tarih ve Saat - Sadece başlangıç */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tarih *
              </label>
              <input
                type="date"
                required
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-edirne-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Saat *
              </label>
              <input
                type="time"
                required
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-edirne-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Adres *
              </label>
              <input
                type="text"
                required
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-edirne-500"
                placeholder="Tam adres bilgisi"
              />
            </div>
          </div>

          {/* Interactive Map for Location Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Yer/Mekan Seçimi
            </label>
            <div className="border border-gray-300 rounded-lg overflow-hidden">
              <InteractiveMap
                center={formData.latitude && formData.longitude ? 
                  [parseFloat(formData.latitude), parseFloat(formData.longitude)] : 
                  [41.6781, 26.5584]
                }
                zoom={13}
                onLocationSelect={handleLocationSelect}
                height="300px"
              />
            </div>
            
            {formData.latitude && formData.longitude && (
              <div className="mt-2 text-xs text-gray-500">
                Seçilen konum: {parseFloat(formData.latitude).toFixed(4)}, {parseFloat(formData.longitude).toFixed(4)}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Website
            </label>
            <input
              type="url"
              value={formData.websiteUrl}
              onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-edirne-500"
              placeholder="Website adresi"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bilet URL
            </label>
            <input
              type="url"
              value={formData.ticketUrl}
              onChange={(e) => setFormData({ ...formData, ticketUrl: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-edirne-500"
              placeholder="Bilet satış sayfası URL'si"
            />
          </div>

          {/* Admin Only Fields */}
          {isAdminReview && (
            <>
              <div className="border-t pt-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Admin Ayarları</h4>
                
                <div>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.isFeatured}
                      onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                      className="rounded border-gray-300 text-yellow-500 focus:ring-yellow-500"
                    />
                    <span className="text-sm font-medium text-gray-700">⭐ Öne Çıkar</span>
                  </label>
                  <p className="text-xs text-gray-500 mt-1">Etkinliği öne çıkan olarak işaretle</p>
                </div>
              </div>
            </>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              İptal
            </button>
            {isAdminReview ? (
              existingEvent ? (
                <button
                  type="submit"
                  disabled={formData.categoryIds.length < 1 || formData.categoryIds.length > 3}
                  className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  <span>✓ Güncelle</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onApprove}
                  className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center space-x-2"
                >
                  <span>✓ Onayla ve Yayınla</span>
                </button>
              )
            ) : (
              <button
                type="submit"
                disabled={formData.categoryIds.length < 1 || formData.categoryIds.length > 3}
                className="px-6 py-2 bg-edirne-500 text-white rounded-lg hover:bg-edirne-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Etkinlik Ekle
              </button>
            )}
          </div>
        </form>

        {/* Category Selection Modal */}
        {showCategoryModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-md w-full max-h-[80vh] overflow-y-auto">
              <div className="p-4 border-b">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold">Kategori Seçimi</h4>
                  <button
                    onClick={() => setShowCategoryModal(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  En az 1, en fazla 3 kategori seçiniz
                </p>
              </div>
              
              <div className="p-4">
                <div className="space-y-2">
                  {categories.map((category) => (
                    <label
                      key={category.id}
                      className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${
                        formData.categoryIds.includes(category.id)
                          ? 'bg-blue-50 border border-blue-200'
                          : 'bg-gray-50 hover:bg-gray-100 border border-transparent'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={formData.categoryIds.includes(category.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            if (formData.categoryIds.length < 3) {
                              setFormData({
                                ...formData,
                                categoryIds: [...formData.categoryIds, category.id]
                              })
                            }
                          } else {
                            setFormData({
                              ...formData,
                              categoryIds: formData.categoryIds.filter(id => id !== category.id)
                            })
                          }
                        }}
                        disabled={!formData.categoryIds.includes(category.id) && formData.categoryIds.length >= 3}
                        className="mr-3"
                      />
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">{category.icon}</span>
                        <span className="font-medium text-gray-700">{category.displayName}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
              <div className="p-4 border-t text-right">
                <button
                  onClick={() => setShowCategoryModal(false)}
                  className="px-4 py-2 bg-edirne-500 text-white rounded-lg hover:bg-edirne-600"
                >
                  Tamam
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}