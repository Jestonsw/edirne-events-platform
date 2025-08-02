'use client'

import { useState, useEffect, useCallback } from 'react'
import { X, Calendar, Upload, Image as ImageIcon } from 'lucide-react'
import dynamic from 'next/dynamic'

const InteractiveMap = dynamic(() => import('@/components/InteractiveMap'), {
  ssr: false,
  loading: () => <div className="h-[300px] bg-gray-100 rounded flex items-center justify-center">Harita yükleniyor...</div>
})

interface EventSubmissionModalProps {
  onClose: () => void
}

export default function EventSubmissionModal({ onClose }: EventSubmissionModalProps) {
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
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
    location: '',
    address: '',
    latitude: '',
    longitude: '',
    organizerName: '',
    organizerContact: '',
    categoryIds: [] as number[],
    capacity: '',
    participantType: 'Herkes',
    websiteUrl: '',
    ticketUrl: '',
    imageUrl: '',
    imageUrl2: '',
    imageUrl3: ''
  })

  const [submitterInfo, setSubmitterInfo] = useState({
    submitterName: '',
    submitterEmail: '',
    submitterPhone: ''
  })

  const [categories, setCategories] = useState<any[]>([])
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [uploadingImage2, setUploadingImage2] = useState(false)
  const [uploadingImage3, setUploadingImage3] = useState(false)

  // Load categories and restore form data from localStorage
  useEffect(() => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => setCategories(data))

    // Restore form data from localStorage
    const savedFormData = localStorage.getItem('eventSubmissionFormData')
    const savedSubmitterInfo = localStorage.getItem('eventSubmissionSubmitterInfo')
    
    if (savedFormData) {
      try {
        const parsedFormData = JSON.parse(savedFormData)
        setFormData(parsedFormData)
      } catch (error) {
      }
    }
    
    if (savedSubmitterInfo) {
      try {
        const parsedSubmitterInfo = JSON.parse(savedSubmitterInfo)
        setSubmitterInfo(parsedSubmitterInfo)
      } catch (error) {
      }
    }
  }, [])

  // Save form data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('eventSubmissionFormData', JSON.stringify(formData))
  }, [formData])

  useEffect(() => {
    localStorage.setItem('eventSubmissionSubmitterInfo', JSON.stringify(submitterInfo))
  }, [submitterInfo])

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
    
    try {
      const response = await fetch('/api/submit-event', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          ...submitterInfo,
          latitude: formData.latitude ? parseFloat(formData.latitude) : null,
          longitude: formData.longitude ? parseFloat(formData.longitude) : null,
        }),
      })

      if (response.ok) {
        const result = await response.json()
        alert(result.message || 'Etkinlik öneriniz başarıyla gönderildi! Admin onayından sonra yayınlanacaktır.')
        
        // Clear localStorage data
        localStorage.removeItem('eventSubmissionFormData')
        localStorage.removeItem('eventSubmissionSubmitterInfo')
        
        resetForm()
        onClose()
      } else {
        const error = await response.json()
        alert('Hata: ' + (error.error || 'Gönderim başarısız'))
      }
    } catch (error) {
      alert('Gönderim sırasında hata oluştu')
    }
  }

  const resetForm = () => {
    setFormData({
      title: '', description: '', startDate: '', endDate: '', startTime: '', endTime: '',
      location: '', address: '', latitude: '', longitude: '', organizerName: '', organizerContact: '', 
      categoryIds: [], capacity: '', participantType: 'Herkes', websiteUrl: '', ticketUrl: '',
      imageUrl: '', imageUrl2: '', imageUrl3: ''
    })
    setSubmitterInfo({
      submitterName: '', submitterEmail: '', submitterPhone: ''
    })
    onClose()
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingImage(true)
    try {
      const formDataUpload = new FormData()
      formDataUpload.append('image', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formDataUpload,
      })

      if (response.ok) {
        const data = await response.json()
        setFormData(prev => ({ ...prev, imageUrl: data.imageUrl }))
      } else {
        alert('Görsel yüklenemedi')
      }
    } catch (error) {
      alert('Görsel yüklenirken hata oluştu')
    } finally {
      setUploadingImage(false)
    }
  }

  const handleImageUpload2 = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingImage2(true)
    try {
      const formDataUpload = new FormData()
      formDataUpload.append('image', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formDataUpload,
      })

      if (response.ok) {
        const data = await response.json()
        setFormData(prev => ({ ...prev, imageUrl2: data.imageUrl }))
      } else {
        alert('İkinci görsel yüklenemedi')
      }
    } catch (error) {
      alert('İkinci görsel yüklenirken hata oluştu')
    } finally {
      setUploadingImage2(false)
    }
  }

  const handleImageUpload3 = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingImage3(true)
    try {
      const formDataUpload = new FormData()
      formDataUpload.append('image', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formDataUpload,
      })

      if (response.ok) {
        const data = await response.json()
        setFormData(prev => ({ ...prev, imageUrl3: data.imageUrl }))
      } else {
        alert('Üçüncü görsel yüklenemedi')
      }
    } catch (error) {
      alert('Üçüncü görsel yüklenirken hata oluştu')
    } finally {
      setUploadingImage3(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b flex items-center justify-between">
          <h3 className="text-lg font-semibold">Etkinlik Öner</h3>
          <button
            onClick={resetForm}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Başlangıç Tarihi *
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
                Bitiş Tarihi
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-edirne-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Başlangıç Saati *
              </label>
              <input
                type="time"
                required
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-edirne-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bitiş Saati
              </label>
              <input
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-edirne-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Yer/Mekan *
              </label>
              <input
                type="text"
                required
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-edirne-500"
                placeholder="Etkinlik mekanı adı"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Adres
              </label>
              <input
                type="text"
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



          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kimlere Yönelik
              </label>
              <input
                type="text"
                value={formData.participantType}
                onChange={(e) => setFormData({ ...formData, participantType: e.target.value })}
                placeholder="Örn: Herkes, Çocuklar, Aileler, Öğrenciler..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-edirne-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kapasite
              </label>
              <input
                type="number"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-edirne-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Organizatör
              </label>
              <input
                type="text"
                value={formData.organizerName}
                onChange={(e) => setFormData({ ...formData, organizerName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-edirne-500"
                placeholder="Organizatör veya kurum adı"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Organizatör İletişim
              </label>
              <input
                type="text"
                value={formData.organizerContact}
                onChange={(e) => setFormData({ ...formData, organizerContact: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-edirne-500"
                placeholder="Telefon numarası veya e-posta adresi"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Etkinlik Görseli
            </label>
            <div className="space-y-3">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploadingImage}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-edirne-500"
              />
              {uploadingImage && (
                <p className="text-sm text-blue-600">Yükleniyor...</p>
              )}
              {formData.imageUrl && (
                <div className="relative">
                  <img
                    src={formData.imageUrl}
                    alt="Önizleme"
                    className="w-32 h-20 object-cover rounded border"
                  />
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, imageUrl: '' })}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              İkinci Etkinlik Görseli
            </label>
            <div className="space-y-3">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload2}
                disabled={uploadingImage2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-edirne-500"
              />
              {uploadingImage2 && (
                <p className="text-sm text-blue-600">Yükleniyor...</p>
              )}
              {formData.imageUrl2 && (
                <div className="relative">
                  <img
                    src={formData.imageUrl2}
                    alt="İkinci Görsel Önizleme"
                    className="w-32 h-20 object-cover rounded border"
                  />
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, imageUrl2: '' })}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Üçüncü Etkinlik Görseli
            </label>
            <div className="space-y-3">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload3}
                disabled={uploadingImage3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-edirne-500"
              />
              {uploadingImage3 && (
                <p className="text-sm text-blue-600">Yükleniyor...</p>
              )}
              {formData.imageUrl3 && (
                <div className="relative">
                  <img
                    src={formData.imageUrl3}
                    alt="Üçüncü Görsel Önizleme"
                    className="w-32 h-20 object-cover rounded border"
                  />
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, imageUrl3: '' })}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Website URL
              </label>
              <input
                type="url"
                value={formData.websiteUrl}
                onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-edirne-500"
                placeholder="https://"
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
                placeholder="https://"
              />
            </div>
          </div>

          {/* Submitter Information Section */}
          <div className="border-t pt-6 mt-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">İletişim Bilgileriniz</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Adınız *
                </label>
                <input
                  type="text"
                  required
                  value={submitterInfo.submitterName}
                  onChange={(e) => setSubmitterInfo({...submitterInfo, submitterName: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-edirne-500"
                  placeholder="Ad Soyad"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  E-posta *
                </label>
                <input
                  type="email"
                  required
                  value={submitterInfo.submitterEmail}
                  onChange={(e) => setSubmitterInfo({...submitterInfo, submitterEmail: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-edirne-500"
                  placeholder="ornek@email.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Telefon *
              </label>
              <input
                type="search"
                required
                value={submitterInfo.submitterPhone}
                onChange={(e) => {
                  const digits = e.target.value.replace(/\D/g, '')
                  if (digits.length <= 11) {
                    setSubmitterInfo({...submitterInfo, submitterPhone: digits})
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-edirne-500"
                placeholder="0XXX XXX XX XX"
                autoComplete="new-password"
                autoCapitalize="off"
                spellCheck={false}
                data-form-type="other"
                data-lpignore="true"
                autoCorrect="off"
              />
            </div>
            
            <div className="bg-yellow-50 p-3 rounded-lg mt-4">
              <p className="text-yellow-800 text-sm">
                ⚠️ <strong>Önemli:</strong> Gönderdiğiniz etkinlik admin tarafından incelendikten sonra yayınlanacaktır.
              </p>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              İptal
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-edirne-500 text-white rounded-lg hover:bg-edirne-600"
            >
              Gönder
            </button>
          </div>
        </form>

        {/* Category Selection Modal */}
        {showCategoryModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-60 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-md w-full">
              <div className="p-4 border-b flex items-center justify-between">
                <h4 className="text-lg font-semibold">Kategori Seçimi</h4>
                <button
                  onClick={() => setShowCategoryModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="p-4 max-h-64 overflow-y-auto">
                <div className="space-y-2">
                  {categories.map((cat: any) => (
                    <label key={cat.id} className="flex items-center text-sm space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.categoryIds.includes(cat.id)}
                        onChange={(e) => {
                          if (e.target.checked && formData.categoryIds.length < 3) {
                            setFormData({
                              ...formData, 
                              categoryIds: [...formData.categoryIds, cat.id]
                            })
                          } else if (!e.target.checked) {
                            setFormData({
                              ...formData, 
                              categoryIds: formData.categoryIds.filter(id => id !== cat.id)
                            })
                          }
                        }}
                        disabled={!formData.categoryIds.includes(cat.id) && formData.categoryIds.length >= 3}
                        className="text-edirne-600 focus:ring-edirne-500 rounded"
                      />
                      <span className="flex-1">{cat.displayName}</span>
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: cat.color }}
                      ></div>
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