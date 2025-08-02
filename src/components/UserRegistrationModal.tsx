'use client'

import { useState, useRef } from 'react'
import { X, User, Mail, Phone, Calendar, MapPin, Heart, Camera, Upload, Eye, EyeOff } from 'lucide-react'

interface UserRegistrationModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (user: {
    id: number
    firstName: string
    lastName: string
    email: string
    phone: string
    profileImage?: string
  }) => void
}

interface RegistrationForm {
  name: string
  email: string
  phone: string
  dateOfBirth: string
  gender: string
  city: string
  district: string
  interests: string[]
  profileImageUrl: string
  password: string
  confirmPassword: string
}

const availableInterests = [
  'Müzik', 'Tiyatro', 'Sinema', 'Spor', 'Sanat', 'Yemek', 'Tarih', 'Kültür',
  'Dans', 'Fotoğrafçılık', 'Edebiyat', 'Teknoloji', 'Doğa', 'Seyahat'
]

const edirneDistricts = [
  'Merkez', 'İpsala', 'Keşan', 'Uzunköprü', 'Havsa', 'Lalapaşa', 
  'Meriç', 'Süloğlu', 'Enez'
]

export default function UserRegistrationModal({ isOpen, onClose, onSuccess }: UserRegistrationModalProps) {
  const [formData, setFormData] = useState<RegistrationForm>({
    name: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    city: 'Edirne',
    district: '',
    interests: [],
    profileImageUrl: '',
    password: '',
    confirmPassword: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [error, setError] = useState('')
  const [showCameraModal, setShowCameraModal] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)

  if (!isOpen) return null



  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    
    // Special handling for phone input - same as ProfileMenu login
    if (name === 'phone') {
      const digits = value.replace(/\D/g, '')
      if (digits.length <= 11) {
        setFormData(prev => ({
          ...prev,
          [name]: digits
        }))
      }
      return
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleInterestToggle = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }))
  }

  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      throw new Error('Failed to upload image')
    }

    const data = await response.json()
    return data.imageUrl
  }

  const handleProfileImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setUploadingImage(true)
      const imageUrl = await uploadImage(file)
      setFormData(prev => ({ ...prev, profileImageUrl: imageUrl }))
    } catch (error) {
      setError('Profil resmi yüklenirken hata oluştu')
    } finally {
      setUploadingImage(false)
    }
  }

  const handleCameraCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setUploadingImage(true)
      const imageUrl = await uploadImage(file)
      setFormData(prev => ({ ...prev, profileImageUrl: imageUrl }))
    } catch (error) {
      setError('Kamera görüntüsü yüklenirken hata oluştu')
    } finally {
      setUploadingImage(false)
    }
  }

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 }
        }
      })
      setStream(mediaStream)
      setShowCameraModal(true)
      
      // Wait a bit for modal to render then set video source
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream
        }
      }, 100)
    } catch (error) {
      setError('Kamera erişimi reddedildi. Dosya seçme moduna geçiliyor...')
      // Fallback to file input if camera access fails
      openFileCamera()
    }
  }

  const openFileCamera = () => {
    const fileInput = document.createElement('input')
    fileInput.type = 'file'
    fileInput.accept = 'image/*'
    fileInput.capture = 'environment'
    fileInput.style.display = 'none'
    
    fileInput.onchange = async (e) => {
      const target = e.target as HTMLInputElement
      const file = target.files?.[0]
      if (file) {
        try {
          setUploadingImage(true)
          const imageUrl = await uploadImage(file)
          setFormData(prev => ({ ...prev, profileImageUrl: imageUrl }))
        } catch (error) {
          setError('Kamera görüntüsü yüklenirken hata oluştu')
        } finally {
          setUploadingImage(false)
        }
      }
      document.body.removeChild(fileInput)
    }
    
    document.body.appendChild(fileInput)
    fileInput.click()
  }

  const capturePhoto = async () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current
      const context = canvas.getContext('2d')
      
      // Ensure video is ready
      if (video.videoWidth === 0 || video.videoHeight === 0) {
        setError('Video henüz hazır değil, lütfen tekrar deneyin')
        return
      }
      
      // Set canvas dimensions
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      
      if (context) {
        try {
          setUploadingImage(true)
          
          // Draw the video frame to canvas
          context.drawImage(video, 0, 0, canvas.width, canvas.height)
          
          // Convert canvas to blob
          const blob = await new Promise<Blob | null>((resolve) => {
            canvas.toBlob(resolve, 'image/jpeg', 0.8)
          })
          
          if (blob) {
            const file = new File([blob], `camera-photo-${Date.now()}.jpg`, { type: 'image/jpeg' })
            const imageUrl = await uploadImage(file)
            setFormData(prev => {
              const updated = { ...prev, profileImageUrl: imageUrl }
              return updated
            })
            stopCamera()
          } else {
            throw new Error('Failed to create image blob')
          }
        } catch (error) {
          setError('Fotoğraf çekilirken hata oluştu: ' + (error as Error).message)
        } finally {
          setUploadingImage(false)
        }
      }
    } else {
      setError('Kamera veya canvas hazır değil')
    }
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
    setShowCameraModal(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    // Basic validation - all required fields
    if (!formData.name || !formData.email || !formData.phone || !formData.dateOfBirth || !formData.gender || !formData.password || !formData.confirmPassword) {
      setError('Kırmızı yıldız (*) ile işaretli tüm alanlar zorunludur')
      setIsSubmitting(false)
      return
    }

    // Password validation
    if (formData.password !== formData.confirmPassword) {
      setError('Şifreler eşleşmiyor')
      setIsSubmitting(false)
      return
    }

    if (formData.password.length < 6) {
      setError('Şifre en az 6 karakter olmalıdır')
      setIsSubmitting(false)
      return
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setError('Geçerli bir e-posta adresi girin')
      setIsSubmitting(false)
      return
    }

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        const newUser = await response.json()
        onSuccess(newUser)
        onClose()
        // Reset form
        setFormData({
          name: '',
          email: '',
          phone: '',
          dateOfBirth: '',
          gender: '',
          city: 'Edirne',
          district: '',
          interests: [],
          profileImageUrl: '',
          password: '',
          confirmPassword: ''
        })
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Kayıt işlemi başarısız')
      }
    } catch (error) {
      setError('Kayıt işlemi sırasında hata oluştu')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">Üye Ol</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <User className="w-5 h-5" />
              Kişisel Bilgiler
            </h3>

            {/* Profile Image Upload */}
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                {formData.profileImageUrl ? (
                  <div className="relative">
                    <img
                      src={formData.profileImageUrl}
                      alt="Profile"
                      className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, profileImageUrl: '' }))}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center border-4 border-white shadow-lg">
                    <User className="w-8 h-8 text-gray-400" />
                  </div>
                )}
              </div>

              <div className="flex gap-4">
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProfileImageUpload}
                    className="hidden"
                    disabled={uploadingImage}
                  />
                  <div className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50">
                    <Upload className="w-4 h-4" />
                    <span className="text-sm">
                      {uploadingImage ? 'Yükleniyor...' : 'Dosya Seç'}
                    </span>
                  </div>
                </label>

                <button
                  type="button"
                  onClick={startCamera}
                  disabled={uploadingImage}
                  className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                >
                  <Camera className="w-4 h-4" />
                  <span className="text-sm">Kamera</span>
                </button>
              </div>

              <p className="text-xs text-gray-500 text-center">
                JPG veya PNG formatında, maksimum 5MB
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ad Soyad <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Adınız ve soyadınız"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  E-posta <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="ornek@email.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Telefon <span className="text-red-500">*</span>
                </label>
                <input
                  type="search"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0XXX XXX XX XX"
                  autoComplete="new-password"
                  autoCapitalize="off"
                  spellCheck={false}
                  data-form-type="other"
                  data-lpignore="true"
                  autoCorrect="off"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Doğum Tarihi <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="dateOfBirth"
                  required
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cinsiyet <span className="text-red-500">*</span>
                </label>
                <select
                  name="gender"
                  required
                  value={formData.gender}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Seçiniz</option>
                  <option value="erkek">Erkek</option>
                  <option value="kadın">Kadın</option>
                  <option value="belirtmek_istemiyorum">Belirtmek İstemiyorum</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Oturum Açma Şifresi <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
                    placeholder="En az 6 karakter"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Şifre Tekrar <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
                    placeholder="Şifrenizi tekrar girin"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Interests */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Heart className="w-5 h-5" />
              İlgi Alanlarınız
            </h3>
            <p className="text-sm text-gray-600">
              Size uygun etkinlikleri önerebilmemiz için ilgi alanlarınızı seçin
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {availableInterests.map(interest => (
                <button
                  key={interest}
                  type="button"
                  onClick={() => handleInterestToggle(interest)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    formData.interests.includes(interest)
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {interest}
                </button>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors"
            >
              {isSubmitting ? 'Kaydediliyor...' : 'Üye Ol'}
            </button>
          </div>
        </form>
      </div>

      {/* Camera Modal */}
      {showCameraModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Fotoğraf Çek</h3>
              <button
                onClick={stopCamera}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="relative">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-64 bg-gray-200 rounded-lg object-cover"
                  onLoadedMetadata={() => {
                    if (videoRef.current) {
                      videoRef.current.play()
                    }
                  }}
                />
                <canvas ref={canvasRef} className="hidden" />
              </div>

              <div className="flex gap-4 justify-center">
                <button
                  onClick={capturePhoto}
                  disabled={uploadingImage}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
                >
                  <Camera className="w-5 h-5" />
                  <span>{uploadingImage ? 'Yükleniyor...' : 'Fotoğraf Çek'}</span>
                </button>
                <button
                  onClick={stopCamera}
                  className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  İptal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}