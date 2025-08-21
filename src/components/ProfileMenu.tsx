'use client'

import { useState, useEffect } from 'react'
import { User, Settings, Shield, Mail, MessageCircle, ChevronRight, X, LogIn, UserPlus, Eye, EyeOff, Plus, Calendar, MapPin, Upload, Image, Camera, Lock, LogOut, Trash2 } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import { OfflineManager } from '@/lib/offline'
import dynamic from 'next/dynamic'
import UserRegistrationModal from '@/components/UserRegistrationModal'

const InteractiveMap = dynamic(() => import('@/components/InteractiveMap'), {
  ssr: false,
  loading: () => <div className="h-[300px] bg-gray-100 rounded flex items-center justify-center">Harita yükleniyor...</div>
})

interface ProfileMenuProps {
  onClose: () => void
  initialModal?: string
  user?: any
  onLogout?: () => void
  onLogin?: () => void
}

export default function ProfileMenu({ onClose, initialModal, user, onLogout, onLogin }: ProfileMenuProps) {
  const { t } = useLanguage()
  const [activeModal, setActiveModal] = useState<string | null>(initialModal || null)
  const [showPassword, setShowPassword] = useState(false)
  const [showRegistrationModal, setShowRegistrationModal] = useState(false)
  
  const [loginData, setLoginData] = useState({
    phone: '',
    password: ''
  })

  // State for forcing form re-render
  const [formKey, setFormKey] = useState(Date.now())

  // Reset loginData when modal opens
  useEffect(() => {
    if (activeModal === 'login') {
      // Clear all possible localStorage entries
      const keysToRemove = ['loginFormData', 'userLoginData', 'formData', 'phoneNumber', 'loginPhone', 'user_phone']
      keysToRemove.forEach(key => localStorage.removeItem(key))
      
      // Force immediate reset and form re-render
      setLoginData({
        phone: '',
        password: ''
      })
      setFormKey(Date.now())
    }
  }, [activeModal])

  const [feedbackForm, setFeedbackForm] = useState({
    type: '',
    email: '',
    message: ''
  })
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false)

  const [eventSubmission, setEventSubmission] = useState({
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
    websiteUrl: '',
    ticketUrl: '',
    submitterName: '',
    submitterEmail: '',
    submitterPhone: '',
    imageUrl: '',
    imageUrl2: '',
    imageUrl3: ''
  })

  const [venueSubmission, setVenueSubmission] = useState({
    name: '',
    description: '',
    categoryId: 1,
    address: '',
    phone: '',
    email: '',
    website: '',
    capacity: '',
    openingHours: '',
    latitude: '',
    longitude: '',
    submitterName: '',
    submitterEmail: '',
    submitterPhone: '',
    imageUrl: '',
    imageUrl2: '',
    imageUrl3: ''
  })

  const [eventImages, setEventImages] = useState<File[]>([])
  const [venueImages, setVenueImages] = useState<File[]>([])

  const [categories, setCategories] = useState([])
  const [venueCategories, setVenueCategories] = useState([])
  const [showCategoryModal, setShowCategoryModal] = useState(false)

  // Handle login form submission
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: '0' + loginData.phone.replace(/\s/g, ''),
          password: loginData.password
        })
      })

      const data = await response.json()

      if (response.ok) {
        // Store user data in localStorage
        localStorage.setItem('user', JSON.stringify(data.user))
        
        // Close modal first
        setActiveModal(null)
        onClose()
        
        // Call onLogin callback after modal is closed to update app state
        if (onLogin) {
          setTimeout(() => {
            onLogin()
          }, 100)
        }
      } else {
        alert(data.error || 'Giriş başarısız')
      }
    } catch (error) {
      alert('Bir hata oluştu. Lütfen tekrar deneyin.')
    }
  }

  // Load categories when submission modals are opened
  const loadCategories = async () => {
    try {
      const [eventCatsRes, venueCatsRes] = await Promise.all([
        fetch('/api/categories'),
        fetch('/api/venue-categories')
      ])
      const eventCats = await eventCatsRes.json()
      const venueCats = await venueCatsRes.json()
      setCategories(eventCats)
      setVenueCategories(venueCats)
    } catch (error) {
    }
  }

  // Image upload helper function
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



  // Handle event image uploads (up to 3 images)
  const handleEventImageChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0]
    if (file) {
      const newImages = [...eventImages]
      newImages[index] = file
      setEventImages(newImages)
      
      // Create preview URL
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        if (index === 0) {
          setEventSubmission(prev => ({...prev, imageUrl: result}))
        } else if (index === 1) {
          setEventSubmission(prev => ({...prev, imageUrl2: result}))
        } else if (index === 2) {
          setEventSubmission(prev => ({...prev, imageUrl3: result}))
        }
      }
      reader.readAsDataURL(file)
    }
  }

  // Handle venue image uploads (up to 3 images)
  const handleVenueImageChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0]
    if (file) {
      const newImages = [...venueImages]
      newImages[index] = file
      setVenueImages(newImages)
      
      // Create preview URL
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        if (index === 0) {
          setVenueSubmission(prev => ({...prev, imageUrl: result}))
        } else if (index === 1) {
          setVenueSubmission(prev => ({...prev, imageUrl2: result}))
        } else if (index === 2) {
          setVenueSubmission(prev => ({...prev, imageUrl3: result}))
        }
      }
      reader.readAsDataURL(file)
    }
  }

  // Submit event handler
  const handleEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!eventSubmission.title || !eventSubmission.startDate || !eventSubmission.location || 
        !eventSubmission.submitterName || !eventSubmission.submitterEmail) {
      alert('Lütfen zorunlu alanları doldurun.')
      return
    }

    if (eventSubmission.categoryIds.length < 1 || eventSubmission.categoryIds.length > 3) {
      alert('En az 1, en fazla 3 kategori seçmelisiniz.')
      return
    }

    try {
      // Upload images if they exist
      let imageUrls = ['', '', '']
      for (let i = 0; i < eventImages.length; i++) {
        if (eventImages[i]) {
          try {
            imageUrls[i] = await uploadImage(eventImages[i])
          } catch (error) {
          }
        }
      }

      const submissionData = {
        ...eventSubmission,
        imageUrl: imageUrls[0],
        imageUrl2: imageUrls[1], 
        imageUrl3: imageUrls[2]
      }

      const response = await fetch('/api/submit-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionData)
      })

      if (response.ok) {
        alert('Etkinlik öneriniz başarıyla gönderildi! Admin onayından sonra yayınlanacaktır.')
        setEventSubmission({
          title: '', description: '', startDate: '', endDate: '', startTime: '', endTime: '',
          location: '', address: '', latitude: '', longitude: '', organizerName: '', organizerContact: '', categoryIds: [],
          capacity: '', websiteUrl: '', ticketUrl: '', submitterName: '',
          submitterEmail: '', submitterPhone: '', imageUrl: '', imageUrl2: '', imageUrl3: ''
        })
        setEventImages([])
        setActiveModal(null)
      } else {
        const error = await response.json()
        alert('Hata: ' + (error.error || 'Gönderim başarısız'))
      }
    } catch (error) {
      alert('Gönderim sırasında hata oluştu')
    }
  }

  // Submit venue handler
  const handleVenueSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!venueSubmission.name || !venueSubmission.address || 
        !venueSubmission.submitterName || !venueSubmission.submitterEmail) {
      alert('Lütfen zorunlu alanları doldurun.')
      return
    }

    try {
      // Upload images if they exist
      let imageUrls = ['', '', '']
      for (let i = 0; i < venueImages.length; i++) {
        if (venueImages[i]) {
          try {
            imageUrls[i] = await uploadImage(venueImages[i])
          } catch (error) {
          }
        }
      }

      const submissionData = {
        ...venueSubmission,
        imageUrl: imageUrls[0],
        imageUrl_2: imageUrls[1],
        imageUrl_3: imageUrls[2]
      }

      const response = await fetch('/api/submit-venue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionData)
      })

      if (response.ok) {
        alert('Mekan öneriniz başarıyla gönderildi! Admin onayından sonra yayınlanacaktır.')
        setVenueSubmission({
          name: '', description: '', categoryId: 1, address: '', phone: '', email: '',
          website: '', capacity: '', openingHours: '', latitude: '', longitude: '', submitterName: '',
          submitterEmail: '', submitterPhone: '', imageUrl: '', imageUrl2: '', imageUrl3: ''
        })
        setVenueImages([])
        setActiveModal(null)
      } else {
        const error = await response.json()
        alert('Hata: ' + (error.error || 'Gönderim başarısız'))
      }
    } catch (error) {
      alert('Gönderim sırasında hata oluştu')
    }
  }

  const handleRegistrationSuccess = (user: any) => {
    alert(`Hoş geldin ${user.name}! Kayıt işleminiz başarıyla tamamlandı.`)
  }

  // Handle logout function
  const handleLogout = () => {
    // Clear user data from localStorage
    localStorage.removeItem('currentUser')
    localStorage.removeItem('userSession')
    
    // Call parent logout handler if provided
    if (onLogout) {
      onLogout()
    }
    
    // Show confirmation message
    alert('Oturumunuz başarıyla sonlandırıldı.')
    
    // Close menu
    onClose()
    
    // Refresh page to update UI
    window.location.reload()
  }

  // Handle account deletion
  const handleDeleteAccount = async () => {
    const storedUser = localStorage.getItem('user')
    if (!storedUser) {
      alert('Kullanıcı bilgisi bulunamadı.')
      return
    }

    const userData = JSON.parse(storedUser)
    
    const confirmMessage = `Hesabınızı kalıcı olarak silmek istediğinizden emin misiniz?

Bu işlem:
• Tüm kişisel bilgilerinizi siler
• Gönderdiğiniz etkinlik ve mekanları siler
• Favori listelerinizi siler
• Geri alınamaz

"${userData.name}" hesabını silmek için telefon numaranızı yazın:`

    const confirmation = prompt(confirmMessage)
    
    if (confirmation === userData.phone) {
      try {
        const response = await fetch('/api/user/delete-account', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId: userData.id })
        })

        const result = await response.json()

        if (response.ok) {
          // Clear all local data
          localStorage.removeItem('user')
          localStorage.removeItem('currentUser')
          localStorage.removeItem('userSession')
          localStorage.removeItem('favorites')
          
          alert(result.message)
          
          // Close menu and refresh page
          onClose()
          window.location.reload()
        } else {
          alert(result.error || 'Hesap silinirken hata oluştu')
        }
      } catch (error) {
        alert('Hesap silinirken hata oluştu')
      }
    } else if (confirmation !== null) {
      alert('Hesap silme işlemi iptal edildi. Telefon numaranızı doğru yazmadınız.')
    }
  }

  // Feedback submission handler
  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!feedbackForm.type || !feedbackForm.message) {
      alert('Lütfen konu türü ve mesajınızı girin.')
      return
    }

    setIsSubmittingFeedback(true)
    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(feedbackForm)
      })

      if (response.ok) {
        const result = await response.json()
        alert(result.message)
        setFeedbackForm({ type: '', email: '', message: '' })
        setActiveModal(null)
      } else {
        const error = await response.json()
        alert(error.error || 'Geri bildirim gönderilirken hata oluştu')
      }
    } catch (error) {
      alert('Geri bildirim gönderilirken hata oluştu')
    } finally {
      setIsSubmittingFeedback(false)
    }
  }

  // Phone number formatting function
  const formatPhoneDisplay = (digits: string) => {
    // If no digits, show placeholder
    if (!digits || digits.length === 0) {
      return '0XXX XXX XX XX'
    }
    
    const paddedDigits = digits.padEnd(10, 'X')
    
    // Format: 0XXX XXX XX XX
    let display = '0'
    display += paddedDigits.slice(0, 3) // XXX or digits
    display += ' ' + paddedDigits.slice(3, 6) // XXX or digits
    display += ' ' + paddedDigits.slice(6, 8) // XX or digits
    display += ' ' + paddedDigits.slice(8, 10) // XX or digits
    
    return display
  }

  // Check if user is logged in
  const isLoggedIn = typeof window !== 'undefined' && (localStorage.getItem('user') || localStorage.getItem('currentUser'))

  const menuItems = [
    // Show registration/login options only if user is not logged in
    ...(!isLoggedIn ? [
      {
        id: 'register',
        icon: UserPlus,
        title: 'Üye Ol',
        description: 'Yeni hesap oluşturun ve kişisel öneriler alın',
        action: () => setShowRegistrationModal(true)
      },
      {
        id: 'login',
        icon: LogIn,
        title: 'Oturum Aç',
        description: 'Mevcut hesabınızla giriş yapın',
        action: () => setActiveModal('login')
      }
    ] : []),
    // Show logout option only if user is logged in
    ...(isLoggedIn ? [
      {
        id: 'logout',
        icon: LogOut,
        title: 'Çıkış Yap',
        description: 'Oturumu sonlandır ve güvenli çıkış yap',
        action: handleLogout
      },
      {
        id: 'delete-account',
        icon: Trash2,
        title: 'Hesabımı Sil',
        description: 'Hesabı kalıcı olarak sil (geri alınamaz)',
        action: handleDeleteAccount
      }
    ] : []),
    {
      id: 'admin',
      icon: Lock,
      title: 'Yönetici Paneli',
      description: 'Etkinlik ve mekan yönetimi',
      action: () => window.open('/admin', '_blank')
    },
    {
      id: 'settings',
      icon: Settings,
      title: 'Uygulama Ayarları',
      description: 'Bildirimler, dil ve tercihlerinizi yönetin',
      action: () => setActiveModal('settings')
    },
    {
      id: 'kvkk',
      icon: Shield,
      title: 'KVKK',
      description: 'Kişisel Verilerin Korunması Kanunu bilgileri',
      action: () => setActiveModal('kvkk')
    },
    {
      id: 'contact',
      icon: Mail,
      title: 'İletişim',
      description: 'Bizimle iletişime geçin',
      action: () => setActiveModal('contact')
    },
    {
      id: 'feedback',
      icon: MessageCircle,
      title: 'Öneri ve Şikayet',
      description: 'Görüşlerinizi bizimle paylaşın',
      action: () => setActiveModal('feedback')
    },
    {
      id: 'info',
      icon: User,
      title: 'İnfo',
      description: 'Uygulama bilgileri ve sürüm detayları',
      action: () => setActiveModal('info')
    }
  ]

  const handleGoogleLogin = () => {
    // Future: Implement Google OAuth integration
    setActiveModal(null)
  }

  const handleFacebookLogin = () => {
    // Future: Implement Facebook OAuth integration
    setActiveModal(null)
  }

  const handleInstagramLogin = () => {
    // Future: Implement Instagram OAuth integration
    setActiveModal(null)
  }

  const handleAnonymousLogin = () => {
    // Handle anonymous browsing - no authentication required
    setActiveModal(null)
  }

  const handleSignUp = () => {
    setActiveModal('signup')
  }





  const renderLoginModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">Oturum Aç</h3>
          <button onClick={() => setActiveModal(null)} className="p-2 hover:bg-gray-100 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form key={formKey} onSubmit={handleLoginSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cep Telefonu Numarası
            </label>
            <div className="relative">
              <input
                type="search"
                required
                name={`loginPhone_${formKey}`}
                key={`phone_${formKey}`}
                value={loginData.phone}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '')
                  if (value.length <= 11) {
                    setLoginData({...loginData, phone: value})
                  }
                }}
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
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Oturum Açma Şifresi
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                name={`loginPassword_${formKey}`}
                key={`password_${formKey}`}
                value={loginData.password}
                onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
                placeholder="Şifreniz"
                autoComplete="new-password"
                autoCapitalize="off"
                spellCheck={false}
                data-form-type="other"
                data-lpignore="true"
                autoCorrect="off"
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

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Oturum Aç
          </button>
        </form>
      </div>
    </div>
  )


  const renderSettingsModal = () => {
    const offlineManager = OfflineManager.getInstance()
    const cacheSize = offlineManager.getCacheSize()
    const lastSync = offlineManager.getLastSync()
    const hasCache = offlineManager.hasValidCache()
    const isOnline = offlineManager.getOnlineStatus()

    const handleClearCache = () => {
      if (confirm('Önbelleğe alınmış tüm veriler silinecek. Devam etmek istiyor musunuz?')) {
        offlineManager.clearCache()
        alert('Önbellek temizlendi!')
      }
    }

    const formatLastSync = (date: Date | null) => {
      if (!date) return 'Hiç'
      return date.toLocaleString('tr-TR')
    }

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="text-lg font-semibold">Uygulama Ayarları</h3>
            <button onClick={() => setActiveModal(null)} className="p-2 hover:bg-gray-100 rounded">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-4 space-y-4">
            <div className="space-y-4">
              {/* Offline Mode Section */}
              <div className="border-b border-gray-200 pb-4">
                <h4 className="font-medium text-gray-900 mb-3">Çevrimdışı Modu</h4>
                
                <div className="bg-blue-50 p-3 rounded-lg mb-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-blue-900">Bağlantı Durumu</span>
                    <span className={`text-sm font-medium ${isOnline ? 'text-green-600' : 'text-orange-600'}`}>
                      {isOnline ? 'Çevrimiçi' : 'Çevrimdışı'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-blue-900">Önbellek Durumu</span>
                    <span className="text-sm text-blue-800">
                      {hasCache ? `${cacheSize} MB` : 'Boş'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-blue-900">Son Güncelleme</span>
                    <span className="text-sm text-blue-800">
                      {formatLastSync(lastSync)}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={handleClearCache}
                    disabled={!hasCache}
                    className={`w-full py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                      hasCache 
                        ? 'bg-red-600 text-white hover:bg-red-700' 
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    Önbelleği Temizle
                  </button>
                  
                  <p className="text-xs text-gray-600">
                    Önbelleğe alınan veriler internet bağlantısı olmadığında etkinlikleri görüntülemenizi sağlar.
                  </p>
                </div>
              </div>

              {/* Notifications */}
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium">Push Bildirimleri</p>
                  <p className="text-sm text-gray-600">Yeni etkinlikler için bildirim al</p>
                </div>
                <div className="relative">
                  <input type="checkbox" className="sr-only" id="notifications" />
                  <label htmlFor="notifications" className="block w-12 h-6 bg-gray-300 rounded-full cursor-pointer">
                    <span className="block w-5 h-5 bg-white rounded-full shadow transform translate-x-1 translate-y-0.5 transition-transform"></span>
                  </label>
                </div>
              </div>
              
              {/* Location Services */}
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium">Konum Servisleri</p>
                  <p className="text-sm text-gray-600">Yakındaki etkinlikleri göster</p>
                </div>
                <div className="relative">
                  <input type="checkbox" className="sr-only" id="location" />
                  <label htmlFor="location" className="block w-12 h-6 bg-gray-300 rounded-full cursor-pointer">
                    <span className="block w-5 h-5 bg-white rounded-full shadow transform translate-x-1 translate-y-0.5 transition-transform"></span>
                  </label>
                </div>
              </div>
              
              {/* Language Selection */}
              <div className="py-2">
                <p className="font-medium mb-2">Dil Seçimi</p>
                <select className="w-full p-2 border border-gray-300 rounded-lg">
                  <option value="tr">Türkçe</option>
                  <option value="en">English</option>
                </select>
              </div>
              
              {/* Theme Selection */}
              <div className="py-2">
                <p className="font-medium mb-2">Tema</p>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input type="radio" name="theme" value="light" className="mr-2" defaultChecked />
                    Açık Tema
                  </label>
                  <label className="flex items-center">
                    <input type="radio" name="theme" value="dark" className="mr-2" />
                    Koyu Tema
                  </label>
                  <label className="flex items-center">
                    <input type="radio" name="theme" value="auto" className="mr-2" />
                    Sistem Ayarı
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderKVKKModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">KVKK</h3>
          <button onClick={() => setActiveModal(null)} className="p-2 hover:bg-gray-100 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4 space-y-4 text-sm">
          <div>
            <h4 className="font-semibold mb-2">Kişisel Verilerin Korunması</h4>
            <p className="text-gray-700 leading-relaxed">
              6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında, kişisel verileriniz güvenliğiniz ve gizliliğiniz için korunmaktadır.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-2">Toplanan Veriler</h4>
            <ul className="text-gray-700 space-y-1">
              <li>• Ad, soyad bilgileri</li>
              <li>• E-posta adresi</li>
              <li>• Telefon numarası</li>
              <li>• Konum bilgileri (izin dahilinde)</li>
              <li>• Uygulama kullanım verileri</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-2">Kullanım Amaçları</h4>
            <ul className="text-gray-700 space-y-1">
              <li>• Etkinlik önerileri sunmak</li>
              <li>• Bildirimler göndermek</li>
              <li>• Müşteri destek hizmeti</li>
              <li>• Uygulama iyileştirmeleri</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-2">Haklarınız</h4>
            <p className="text-gray-700 leading-relaxed">
              Kişisel verilerinizle ilgili bilgi alma, düzeltme, silme ve işlenmesine itiraz etme haklarınız bulunmaktadır.
            </p>
          </div>
          
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-blue-800 text-sm">
              Detaylı bilgi için: <button className="underline font-medium">edirne-events.com</button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )

  const renderContactModal = () => (
    <div key={Date.now()} className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">İletişim</h3>
          <button onClick={() => setActiveModal(null)} className="p-2 hover:bg-gray-100 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4 space-y-4">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <Mail className="w-8 h-8 text-green-600" />
            </div>
            <h4 className="text-lg font-medium">Bizimle İletişime Geçin</h4>
            <p className="text-gray-600 text-sm">Sorularınız için buradayız</p>
          </div>
          
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h5 className="font-medium mb-2">E-posta</h5>
              <p className="text-gray-700">edirne.events@gmail.com</p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h5 className="font-medium mb-2">Telefon</h5>
              <p className="text-gray-700">+90 284 XXX XX XX</p>
              <p className="text-sm text-gray-600">Pazartesi - Cuma: 09:00 - 18:00</p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h5 className="font-medium mb-2">Adres</h5>
              <p className="text-gray-700">
                Edirne Merkez<br />
                Edirne / Türkiye
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderFeedbackModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">Öneri ve Şikayet</h3>
          <button onClick={() => setActiveModal(null)} className="p-2 hover:bg-gray-100 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4 space-y-4">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
              <MessageCircle className="w-8 h-8 text-orange-600" />
            </div>
            <h4 className="text-lg font-medium">Görüşleriniz Bizim İçin Değerli</h4>
            <p className="text-gray-600 text-sm">Önerilerinizi ve şikayetlerinizi bizimle paylaşın</p>
          </div>
          
          <form onSubmit={handleFeedbackSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Konu Türü
              </label>
              <select 
                value={feedbackForm.type}
                onChange={(e) => setFeedbackForm({...feedbackForm, type: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg"
                required
              >
                <option value="">Seçiniz</option>
                <option value="suggestion">Öneri</option>
                <option value="complaint">Şikayet</option>
                <option value="bug">Hata Bildirimi</option>
                <option value="other">Diğer</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                E-posta (İsteğe bağlı)
              </label>
              <input 
                type="email" 
                value={feedbackForm.email}
                onChange={(e) => setFeedbackForm({...feedbackForm, email: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg"
                placeholder="ornek@email.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mesajınız
              </label>
              <textarea 
                value={feedbackForm.message}
                onChange={(e) => setFeedbackForm({...feedbackForm, message: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg h-32 resize-none"
                placeholder="Lütfen görüşlerinizi detaylı olarak yazın..."
                required
              ></textarea>
            </div>
            
            <button 
              type="submit"
              disabled={isSubmittingFeedback}
              className={`w-full py-3 rounded-lg font-medium transition-colors ${
                isSubmittingFeedback 
                  ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                  : 'bg-orange-600 text-white hover:bg-orange-700'
              }`}
            >
              {isSubmittingFeedback ? 'Gönderiliyor...' : 'Gönder'}
            </button>
          </form>
          
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-blue-800 text-sm">
              💡 <strong>İpucu:</strong> Hata bildirimi için lütfen hangi sayfada ve nasıl oluştuğunu detaylı olarak belirtin.
            </p>
          </div>
        </div>
      </div>
    </div>
  )

  const renderInfoModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">İnfo</h3>
          <button onClick={() => setActiveModal(null)} className="p-2 hover:bg-gray-100 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4 space-y-4">
          <div className="text-center space-y-2">
            <h4 className="text-xl font-bold text-gray-900">Edirne Events</h4>
            <p className="text-sm text-gray-600">Edirne Etkinlik Rehberi</p>
            <p className="text-xs text-gray-500">Sürüm 1.0.0</p>
          </div>
          
          <div className="space-y-3">
            <div>
              <h5 className="font-medium text-gray-900 mb-2">Uygulama Hakkında</h5>
              <p className="text-sm text-gray-700">
                Edirne Events, şehrimizin kültürel ve sosyal yaşamını zenginleştiren 
                etkinlikleri keşfetmenizi sağlayan modern bir platformdur.
              </p>
            </div>
            
            <div>
              <h5 className="font-medium text-gray-900 mb-2">Özellikler</h5>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Güncel etkinlik listesi</li>
                <li>• İnteraktif harita görünümü</li>
                <li>• Kategori bazında filtreleme</li>
                <li>• Favori etkinlikler</li>
                <li>• Çevrimdışı erişim</li>
                <li>• Çoklu dil desteği</li>
              </ul>
            </div>
            
            <div>
              <h5 className="font-medium text-gray-900 mb-2">Geliştirici</h5>
              <p className="text-sm text-gray-700">
                Edirne Events Ekibi tarafından geliştirilmiştir.
              </p>
            </div>
            
            <div>
              <h5 className="font-medium text-gray-900 mb-2">Son Güncelleme</h5>
              <p className="text-sm text-gray-700">18 Haziran 2025</p>
            </div>
          </div>
          
          <div className="pt-4 border-t">
            <button
              onClick={() => setActiveModal(null)}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Tamam
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  const renderEventSubmissionModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">Etkinlik Öner</h3>
          <button onClick={() => setActiveModal(null)} className="p-2 hover:bg-gray-100 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4">
          <div className="text-center space-y-2 mb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
              <Calendar className="w-8 h-8 text-blue-600" />
            </div>
            <h4 className="text-lg font-medium">Yeni Etkinlik Önerisi</h4>
            <p className="text-gray-600 text-sm">Öneriniz admin onayından sonra yayınlanacaktır</p>
          </div>
          
          <form onSubmit={handleEventSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Etkinlik Başlığı *
                </label>
                <input 
                  type="text" 
                  value={eventSubmission.title}
                  onChange={(e) => setEventSubmission(prev => ({...prev, title: e.target.value}))}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  placeholder="Etkinlik adını giriniz"
                  required
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Açıklama
                </label>
                <textarea 
                  value={eventSubmission.description}
                  onChange={(e) => setEventSubmission(prev => ({...prev, description: e.target.value}))}
                  className="w-full p-3 border border-gray-300 rounded-lg h-24 resize-none"
                  placeholder="Etkinlik hakkında detayları yazınız"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Başlangıç Tarihi *
                </label>
                <input 
                  type="date" 
                  value={eventSubmission.startDate}
                  onChange={(e) => setEventSubmission(prev => ({...prev, startDate: e.target.value}))}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bitiş Tarihi (İsteğe bağlı)
                </label>
                <input 
                  type="date" 
                  value={eventSubmission.endDate}
                  onChange={(e) => setEventSubmission(prev => ({...prev, endDate: e.target.value}))}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Başlangıç Saati
                </label>
                <input 
                  type="time" 
                  value={eventSubmission.startTime}
                  onChange={(e) => setEventSubmission(prev => ({...prev, startTime: e.target.value}))}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bitiş Saati
                </label>
                <input 
                  type="time" 
                  value={eventSubmission.endTime}
                  onChange={(e) => setEventSubmission(prev => ({...prev, endTime: e.target.value}))}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mekan *
                </label>
                <input 
                  type="text" 
                  value={eventSubmission.location}
                  onChange={(e) => setEventSubmission(prev => ({...prev, location: e.target.value}))}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  placeholder="Etkinlik mekanu"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Adres
                </label>
                <input 
                  type="text" 
                  value={eventSubmission.address}
                  onChange={(e) => setEventSubmission(prev => ({...prev, address: e.target.value}))}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  placeholder="Detaylı adres"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Konum Seçimi
                </label>
                <div className="flex gap-2 mb-3">
                  <button
                    type="button"
                    onClick={() => {
                      setEventSubmission(prev => ({ 
                        ...prev, 
                        latitude: '41.6771', 
                        longitude: '26.5557' 
                      }))
                    }}
                    className="text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-2 rounded-lg border transition-colors"
                  >
                    📍 Edirne Merkezi
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (navigator.geolocation) {
                        navigator.geolocation.getCurrentPosition(
                          (position) => {
                            setEventSubmission(prev => ({
                              ...prev,
                              latitude: position.coords.latitude.toFixed(6),
                              longitude: position.coords.longitude.toFixed(6)
                            }))
                          },
                          (error) => {
                            alert('Konum alınamadı: ' + error.message)
                          }
                        )
                      } else {
                        alert('Bu tarayıcı konum servisini desteklemiyor')
                      }
                    }}
                    className="text-sm bg-green-100 hover:bg-green-200 text-green-700 px-3 py-2 rounded-lg border transition-colors"
                  >
                    📱 Mevcut Konum
                  </button>
                </div>
                <p className="text-xs text-gray-500 mb-3">
                  Harita üzerinde bir noktaya tıklayın veya kırmızı işareti sürükleyin
                </p>
                
                {/* Interactive Map for Location Selection */}
                <div>
                  <InteractiveMap
                    latitude={eventSubmission.latitude ? parseFloat(eventSubmission.latitude) : 41.6771}
                    longitude={eventSubmission.longitude ? parseFloat(eventSubmission.longitude) : 26.5557}
                    onLocationSelect={(lat: number, lng: number) => {
                      setEventSubmission(prev => ({
                        ...prev,
                        latitude: lat.toFixed(6),
                        longitude: lng.toFixed(6)
                      }))
                    }}
                    height="300px"
                  />
                </div>
                
                {eventSubmission.latitude && eventSubmission.longitude && (
                  <div className="mt-2 text-xs text-gray-500">
                    Seçilen konum: {parseFloat(eventSubmission.latitude).toFixed(4)}, {parseFloat(eventSubmission.longitude).toFixed(4)}
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Organizatör Adı
                </label>
                <input 
                  type="text" 
                  value={eventSubmission.organizerName}
                  onChange={(e) => setEventSubmission(prev => ({...prev, organizerName: e.target.value}))}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  placeholder="Organizatör/kurum adı"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  İletişim Bilgisi
                </label>
                <input 
                  type="text" 
                  value={eventSubmission.organizerContact}
                  onChange={(e) => setEventSubmission(prev => ({...prev, organizerContact: e.target.value}))}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  placeholder="Telefon veya e-posta"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kategoriler (En az 1, en fazla 3 kategori seçiniz) *
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      loadCategories()
                      setShowCategoryModal(true)
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-left focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-between"
                  >
                    <span className="flex flex-wrap gap-1">
                      {eventSubmission.categoryIds.length === 0 ? (
                        <span className="text-gray-500">Kategori seçiniz...</span>
                      ) : (
                        eventSubmission.categoryIds.map((categoryId) => {
                          const category = categories.find((c: any) => c.id === categoryId) as any
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
                {(eventSubmission.categoryIds.length < 1 || eventSubmission.categoryIds.length > 3) && (
                  <p className="text-red-500 text-xs mt-1">En az 1, en fazla 3 kategori seçmelisiniz</p>
                )}
              </div>
              

              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kapasite
                </label>
                <input 
                  type="number" 
                  value={eventSubmission.capacity}
                  onChange={(e) => setEventSubmission(prev => ({...prev, capacity: e.target.value}))}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  placeholder="Katılımcı sayısı"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Website
                </label>
                <input 
                  type="url" 
                  value={eventSubmission.websiteUrl}
                  onChange={(e) => setEventSubmission(prev => ({...prev, websiteUrl: e.target.value}))}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  placeholder="https://example.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bilet Linki
                </label>
                <input 
                  type="url" 
                  value={eventSubmission.ticketUrl}
                  onChange={(e) => setEventSubmission(prev => ({...prev, ticketUrl: e.target.value}))}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  placeholder="https://bilet.com"
                />
              </div>
            </div>
            
            <div className="border-t pt-4 mt-6">
              <h5 className="font-medium mb-3">Etkinlik Görselleri (En fazla 3 adet)</h5>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[0, 1, 2].map((index) => (
                  <div key={index} className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Görsel {index + 1} {index === 0 ? '(Ana görsel)' : '(İsteğe bağlı)'}
                    </label>
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleEventImageChange(e, index)}
                        className="hidden"
                        id={`event-image-${index}`}
                      />
                      <label
                        htmlFor={`event-image-${index}`}
                        className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                      >
                        {(index === 0 && eventSubmission.imageUrl) || 
                         (index === 1 && eventSubmission.imageUrl2) || 
                         (index === 2 && eventSubmission.imageUrl3) ? (
                          <div className="relative w-full h-full">
                            <img
                              src={index === 0 ? eventSubmission.imageUrl : 
                                   index === 1 ? eventSubmission.imageUrl2 : eventSubmission.imageUrl3}
                              alt={`Etkinlik görseli ${index + 1}`}
                              className="w-full h-full object-cover rounded-lg"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity rounded-lg">
                              <Upload className="w-6 h-6 text-white" />
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center">
                            <Image className="w-8 h-8 text-gray-400 mb-2" />
                            <p className="text-sm text-gray-500 text-center">
                              Görsel {index + 1}<br />Yükle
                            </p>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Desteklenen formatlar: JPG, PNG, WEBP. Maksimum dosya boyutu: 5MB
              </p>
            </div>
            
            <div className="border-t pt-4 mt-6">
              <h5 className="font-medium mb-3">İletişim Bilgileriniz</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Adınız *
                  </label>
                  <input 
                    type="text" 
                    value={eventSubmission.submitterName}
                    onChange={(e) => setEventSubmission(prev => ({...prev, submitterName: e.target.value}))}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                    placeholder="Ad Soyad"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    E-posta *
                  </label>
                  <input 
                    type="email" 
                    value={eventSubmission.submitterEmail}
                    onChange={(e) => setEventSubmission(prev => ({...prev, submitterEmail: e.target.value}))}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                    placeholder="ornek@email.com"
                    required
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Telefon *
                  </label>
                  <div className="relative">
                    <input 
                      type="tel" 
                      value={formatPhoneDisplay(eventSubmission.submitterPhone.replace(/[^0-9]/g, ''))}
                      onChange={() => {}} // Dummy onChange for React
                      onKeyDown={(e) => {
                        if (e.key >= '0' && e.key <= '9') {
                          e.preventDefault()
                          const currentDigits = eventSubmission.submitterPhone.replace(/[^0-9]/g, '')
                          if (currentDigits.length < 10) {
                            setEventSubmission(prev => ({...prev, submitterPhone: currentDigits + e.key}))
                          }
                        } else if (e.key === 'Backspace') {
                          e.preventDefault()
                          const currentDigits = eventSubmission.submitterPhone.replace(/[^0-9]/g, '')
                          if (currentDigits.length > 0) {
                            setEventSubmission(prev => ({...prev, submitterPhone: currentDigits.slice(0, -1)}))
                          }
                        }
                      }}
                      onFocus={(e) => {
                        setTimeout(() => {
                          const phoneLength = eventSubmission.submitterPhone.replace(/[^0-9]/g, '').length
                          let cursorPos = 1
                          if (phoneLength >= 1) cursorPos = 4
                          if (phoneLength >= 4) cursorPos = 8
                          if (phoneLength >= 7) cursorPos = 11
                          if (phoneLength >= 9) cursorPos = 13
                          e.target.setSelectionRange(cursorPos, cursorPos)
                        }, 0)
                      }}
                      className="w-full p-3 border border-gray-300 rounded-lg font-mono"
                      placeholder="0XXX XXX XX XX"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-yellow-50 p-3 rounded-lg">
              <p className="text-yellow-800 text-sm">
                ⚠️ <strong>Önemli:</strong> Gönderdiğiniz etkinlik admin tarafından incelendikten sonra yayınlanacaktır.
              </p>
            </div>
            
            <div className="flex gap-3">
              <button 
                type="button"
                onClick={() => setActiveModal(null)}
                className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-400 transition-colors"
              >
                İptal
              </button>
              <button 
                type="submit"
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Gönder
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )

  const renderVenueSubmissionModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">Mekan Öner</h3>
          <button onClick={() => setActiveModal(null)} className="p-2 hover:bg-gray-100 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4">
          <div className="text-center space-y-2 mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <MapPin className="w-8 h-8 text-green-600" />
            </div>
            <h4 className="text-lg font-medium">Yeni Mekan Önerisi</h4>
            <p className="text-gray-600 text-sm">Öneriniz admin onayından sonra yayınlanacaktır</p>
          </div>
          
          <form onSubmit={handleVenueSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mekan Adı *
                </label>
                <input 
                  type="text" 
                  value={venueSubmission.name}
                  onChange={(e) => setVenueSubmission(prev => ({...prev, name: e.target.value}))}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  placeholder="Mekan adını giriniz"
                  required
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Açıklama
                </label>
                <textarea 
                  value={venueSubmission.description}
                  onChange={(e) => setVenueSubmission(prev => ({...prev, description: e.target.value}))}
                  className="w-full p-3 border border-gray-300 rounded-lg h-24 resize-none"
                  placeholder="Mekan hakkında detayları yazınız"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Adres *
                </label>
                <input 
                  type="text" 
                  value={venueSubmission.address}
                  onChange={(e) => setVenueSubmission(prev => ({...prev, address: e.target.value}))}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  placeholder="Mekan adresi"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kategori
                </label>
                <select 
                  value={venueSubmission.categoryId}
                  onChange={(e) => setVenueSubmission(prev => ({...prev, categoryId: Number(e.target.value)}))}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  onFocus={loadCategories}
                >
                  {venueCategories.map((cat: any) => (
                    <option key={cat.id} value={cat.id}>{cat.displayName}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefon
                </label>
                <div className="relative">
                  <input 
                    type="tel" 
                    value={formatPhoneDisplay(venueSubmission.phone.replace(/[^0-9]/g, ''))}
                    onChange={() => {}} // Dummy onChange for React
                    onKeyDown={(e) => {
                      if (e.key >= '0' && e.key <= '9') {
                        e.preventDefault()
                        const currentDigits = venueSubmission.phone.replace(/[^0-9]/g, '')
                        if (currentDigits.length < 10) {
                          setVenueSubmission(prev => ({...prev, phone: currentDigits + e.key}))
                        }
                      } else if (e.key === 'Backspace') {
                        e.preventDefault()
                        const currentDigits = venueSubmission.phone.replace(/[^0-9]/g, '')
                        if (currentDigits.length > 0) {
                          setVenueSubmission(prev => ({...prev, phone: currentDigits.slice(0, -1)}))
                        }
                      }
                    }}
                    onFocus={(e) => {
                      // Position cursor after last digit when focused
                      setTimeout(() => {
                        const phoneLength = venueSubmission.phone.replace(/[^0-9]/g, '').length
                        let cursorPos = 1
                        if (phoneLength >= 1) cursorPos = 4
                        if (phoneLength >= 4) cursorPos = 8
                        if (phoneLength >= 7) cursorPos = 11
                        if (phoneLength >= 9) cursorPos = 13
                        e.target.setSelectionRange(cursorPos, cursorPos)
                      }, 0)
                    }}
                    className="w-full p-3 border border-gray-300 rounded-lg font-mono"
                    placeholder="0XXX XXX XX XX"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  E-posta
                </label>
                <input 
                  type="email" 
                  value={venueSubmission.email}
                  onChange={(e) => setVenueSubmission(prev => ({...prev, email: e.target.value}))}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  placeholder="info@mekan.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Website
                </label>
                <input 
                  type="url" 
                  value={venueSubmission.website}
                  onChange={(e) => setVenueSubmission(prev => ({...prev, website: e.target.value}))}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  placeholder="https://example.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kapasite
                </label>
                <input 
                  type="number" 
                  value={venueSubmission.capacity}
                  onChange={(e) => setVenueSubmission({...venueSubmission, capacity: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  placeholder="Kişi kapasitesi"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Konum Seçimi
                </label>
                <div className="flex gap-2 mb-3">
                  <button
                    type="button"
                    onClick={() => {
                      setVenueSubmission({ 
                        ...venueSubmission, 
                        latitude: '41.6771', 
                        longitude: '26.5557' 
                      })
                    }}
                    className="text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-2 rounded-lg border transition-colors"
                  >
                    📍 Edirne Merkezi
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (navigator.geolocation) {
                        navigator.geolocation.getCurrentPosition(
                          (position) => {
                            setVenueSubmission({
                              ...venueSubmission,
                              latitude: position.coords.latitude.toFixed(6),
                              longitude: position.coords.longitude.toFixed(6)
                            })
                          },
                          (error) => {
                            alert('Konum alınamadı: ' + error.message)
                          }
                        )
                      } else {
                        alert('Bu tarayıcı konum servisini desteklemiyor')
                      }
                    }}
                    className="text-sm bg-green-100 hover:bg-green-200 text-green-700 px-3 py-2 rounded-lg border transition-colors"
                  >
                    📱 Mevcut Konum
                  </button>
                </div>
                <p className="text-xs text-gray-500 mb-3">
                  Harita üzerinde bir noktaya tıklayın veya kırmızı işareti sürükleyin
                </p>
                
                {/* Interactive Map for Location Selection */}
                <div>
                  <InteractiveMap
                    latitude={parseFloat(venueSubmission.latitude || '41.6771')}
                    longitude={parseFloat(venueSubmission.longitude || '26.5557')}
                    onLocationSelect={(lat, lng) => {
                      setVenueSubmission({
                        ...venueSubmission,
                        latitude: lat.toFixed(6),
                        longitude: lng.toFixed(6)
                      })
                    }}
                    height="250px"
                  />
                </div>
                
                {/* Hidden coordinate values for form submission */}
                <input type="hidden" name="latitude" value={venueSubmission.latitude} />
                <input type="hidden" name="longitude" value={venueSubmission.longitude} />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Çalışma Saatleri
                </label>
                <input 
                  type="text" 
                  value={venueSubmission.openingHours}
                  onChange={(e) => setVenueSubmission(prev => ({...prev, openingHours: e.target.value}))}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  placeholder="09:00-22:00 (Her gün)"
                />
              </div>
            </div>
            
            <div className="border-t pt-4 mt-6">
              <h5 className="font-medium mb-3">Mekan Görselleri (En fazla 3 adet)</h5>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[0, 1, 2].map((index) => (
                  <div key={index} className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Görsel {index + 1} {index === 0 ? '(Ana görsel)' : '(İsteğe bağlı)'}
                    </label>
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleVenueImageChange(e, index)}
                        className="hidden"
                        id={`venue-image-${index}`}
                      />
                      <label
                        htmlFor={`venue-image-${index}`}
                        className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                      >
                        {(index === 0 && venueSubmission.imageUrl) || 
                         (index === 1 && venueSubmission.imageUrl2) || 
                         (index === 2 && venueSubmission.imageUrl3) ? (
                          <div className="relative w-full h-full">
                            <img
                              src={index === 0 ? venueSubmission.imageUrl : 
                                   index === 1 ? venueSubmission.imageUrl2 : venueSubmission.imageUrl3}
                              alt={`Mekan görseli ${index + 1}`}
                              className="w-full h-full object-cover rounded-lg"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity rounded-lg">
                              <Upload className="w-6 h-6 text-white" />
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center">
                            <Image className="w-8 h-8 text-gray-400 mb-2" />
                            <p className="text-sm text-gray-500 text-center">
                              Görsel {index + 1}<br />Yükle
                            </p>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Desteklenen formatlar: JPG, PNG, WEBP. Maksimum dosya boyutu: 5MB
              </p>
            </div>
            
            <div className="border-t pt-4 mt-6">
              <h5 className="font-medium mb-3">İletişim Bilgileriniz</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Adınız *
                  </label>
                  <input 
                    type="text" 
                    value={venueSubmission.submitterName}
                    onChange={(e) => setVenueSubmission(prev => ({...prev, submitterName: e.target.value}))}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                    placeholder="Ad Soyad"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    E-posta *
                  </label>
                  <input 
                    type="email" 
                    value={venueSubmission.submitterEmail}
                    onChange={(e) => setVenueSubmission(prev => ({...prev, submitterEmail: e.target.value}))}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                    placeholder="ornek@email.com"
                    required
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Telefon
                  </label>
                  <div className="relative">
                    <input 
                      type="tel" 
                      value={formatPhoneDisplay(venueSubmission.submitterPhone.replace(/[^0-9]/g, ''))}
                      onKeyDown={(e) => {
                        if (e.key >= '0' && e.key <= '9') {
                          e.preventDefault()
                          const currentDigits = venueSubmission.submitterPhone.replace(/[^0-9]/g, '')
                          if (currentDigits.length < 10) {
                            setVenueSubmission(prev => ({...prev, submitterPhone: currentDigits + e.key}))
                          }
                        } else if (e.key === 'Backspace') {
                          e.preventDefault()
                          const currentDigits = venueSubmission.submitterPhone.replace(/[^0-9]/g, '')
                          if (currentDigits.length > 0) {
                            setVenueSubmission(prev => ({...prev, submitterPhone: currentDigits.slice(0, -1)}))
                          }
                        }
                      }}
                      className="w-full p-3 border border-gray-300 rounded-lg"
                      placeholder="0XXX XXX XX XX"
                      style={{
                        fontFamily: 'monospace'
                      }}
                      readOnly
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-yellow-50 p-3 rounded-lg">
              <p className="text-yellow-800 text-sm">
                ⚠️ <strong>Önemli:</strong> Gönderdiğiniz mekan admin tarafından incelendikten sonra yayınlanacaktır.
              </p>
            </div>
            
            <div className="flex gap-3">
              <button 
                type="button"
                onClick={() => setActiveModal(null)}
                className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-400 transition-colors"
              >
                İptal
              </button>
              <button 
                type="submit"
                className="flex-1 bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
              >
                Gönder
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Profil</h2>
          <p className="text-sm text-gray-600">Hesap ve uygulama ayarları</p>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="w-6 h-6 text-gray-600" />
        </button>
      </div>

      {/* Menu Items */}
      <div className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const IconComponent = item.icon
          return (
            <button
              key={item.id}
              onClick={item.action}
              className="w-full bg-white border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors text-left"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <IconComponent className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{item.title}</h3>
                    <p className="text-sm text-gray-600">{item.description}</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            </button>
          )
        })}
      </div>

      {/* Modals */}
      {activeModal === 'login' && renderLoginModal()}

      {activeModal === 'submit-event' && renderEventSubmissionModal()}
      {activeModal === 'submit-venue' && renderVenueSubmissionModal()}
      {activeModal === 'settings' && renderSettingsModal()}
      {activeModal === 'kvkk' && renderKVKKModal()}
      {activeModal === 'contact' && renderContactModal()}
      {activeModal === 'feedback' && renderFeedbackModal()}
      {activeModal === 'info' && renderInfoModal()}
      
      {/* Category Selection Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-96 overflow-hidden">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="text-lg font-semibold">Kategori Seçimi</h3>
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
                      checked={eventSubmission.categoryIds.includes(cat.id)}
                      onChange={(e) => {
                        if (e.target.checked && eventSubmission.categoryIds.length < 3) {
                          setEventSubmission({
                            ...eventSubmission, 
                            categoryIds: [...eventSubmission.categoryIds, cat.id]
                          })
                        } else if (!e.target.checked) {
                          setEventSubmission({
                            ...eventSubmission, 
                            categoryIds: eventSubmission.categoryIds.filter(id => id !== cat.id)
                          })
                        }
                      }}
                      disabled={!eventSubmission.categoryIds.includes(cat.id) && eventSubmission.categoryIds.length >= 3}
                      className="text-blue-600 focus:ring-blue-500 rounded"
                    />
                    <span className="flex-1">{cat.displayName}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="p-4 border-t bg-gray-50">
              <p className="text-sm text-gray-600 mb-3">
                Seçili: {eventSubmission.categoryIds.length}/3 kategori
              </p>
              <button
                onClick={() => setShowCategoryModal(false)}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Tamam
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Registration Modal */}
      <UserRegistrationModal
        isOpen={showRegistrationModal}
        onClose={() => setShowRegistrationModal(false)}
        onSuccess={handleRegistrationSuccess}
      />
    </div>
  )
}