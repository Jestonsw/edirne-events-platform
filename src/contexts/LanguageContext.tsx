'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

// Translation data
const translations = {
  tr: {
    navigation: {
      home: "Ana Sayfa",
      events: "Etkinlikler",
      favorites: "Favoriler",
      info: "Bilgi",
      admin: "Yönetici",
      search: "Ara"
    },
    categories: {
      all: "Tümü",
      music: "Konser/Festival",
      theater: "Tiyatro/Sinema",
      art: "Sergi/Gösteri",
      sports: "Spor",
      conference: "Seminer/Konferans",
      kids: "Çocuk/Etkinlikleri",
      education: "Eğitim/Kurs",
      religious: "Dini/Etkinlikler",
      travel: "Gezi/Tur",
      shopping: "Alışveriş",
      promotion: "Tanıtım",
      wedding: "Nişan/Düğün",
      museums: "Müzeler",
      konser: "Konser/Festival",
      tiyatro_sinema: "Tiyatro/Sinema",
      sergi_gosteri: "Sergi/Gösteri",
      spor: "Spor",
      seminer_konferans: "Seminer/Konferans",
      cocuk: "Çocuk/Etkinlikleri",
      egitim_kurs: "Eğitim/Kurs",
      dini_etkinlikler: "Dini/Etkinlikler",
      gezi_tur: "Gezi/Tur",
      alisveris: "Alışveriş",
      tanitim: "Tanıtım",
      nisan_dugun: "Nişan/Düğün",
      muzeler: "Müzeler",
      university: "Trakya Üni Etkinlikleri"
    },
    dates: {
      today: "Bugün",
      tomorrow: "Yarın"
    },
    events: {
      title: "Etkinlik Adı",
      description: "Açıklama",
      location: "Konum",
      address: "Adres",
      date: "Tarih",
      endDate: "Bitiş",
      time: "Saat",
      price: "Ücret",
      free: "Ücretsiz",
      capacity: "Kapasite",
      organizer: "Organizatör",
      contact: "İletişim",
      website: "Website",
      tickets: "Bilet",
      tags: "Etiketler",
      featured: "Öne Çıkan",
      participants: "Kimlere Yönelik",
      share: "Paylaş",
      favorite: "Favorile",
      directions: "GPS ile yönlendir",
      showOnMap: "Haritada Göster",
      buyTickets: "Bilet Al",
      noEvents: "Henüz etkinlik bulunmuyor",
      searchPlaceholder: "Etkinlik ara...",
      details: "Etkinlik Detayları",
      startTime: "Başlangıç Saati",
      endTime: "Bitiş Saati",
      duration: "Süre",
      venue: "Mekan",
      category: "Kategori",
      organizedBy: "Organizatör",
      contactInfo: "İletişim Bilgileri",
      ticketPrice: "Bilet Fiyatı",
      availableCapacity: "Mevcut Kapasite",
      eventWebsite: "Etkinlik Web Sitesi",
      eventTags: "Etkinlik Etiketleri"
    },
    participantTypes: {
      everyone: "Herkes",
      children: "Çocuklar",
      youth: "Gençler",
      adults: "Yetişkinler",
      elderly: "Yaşlılar",
      students: "Öğrenciler",
      retirees: "Emekliler",
      families: "Aileler",
      women: "Kadınlar",
      men: "Erkekler",
      professionals: "Profesyoneller",
      artists: "Sanatçılar"
    },
    admin: {
      title: "Yönetici Paneli",
      login: "Giriş Yap",
      logout: "Çıkış",
      password: "Şifre",
      newEvent: "Yeni Etkinlik",
      editEvent: "Etkinlik Düzenle",
      deleteEvent: "Etkinlik Sil",
      save: "Kaydet",
      cancel: "İptal",
      update: "Güncelle",
      delete: "Sil",
      confirmDelete: "Bu etkinliği silmek istediğinizden emin misiniz?",
      active: "Aktif",
      inactive: "Pasif"
    },
    info: {
      title: "Edirne Events Hakkında",
      description: "Edirne'deki kültürel ve sanatsal etkinlikleri keşfetmek için tasarlanmış bir platform.",
      features: "Özellikler:",
      version: "Edirne Events v1.0 - 2025"
    },
    common: {
      loading: "Yükleniyor...",
      error: "Hata oluştu",
      success: "Başarılı",
      close: "Kapat",
      open: "Aç",
      back: "Geri",
      next: "İleri",
      yes: "Evet",
      no: "Hayır"
    }
  },
  en: {
    navigation: {
      home: "Home",
      events: "Events",
      favorites: "Favorites",
      info: "Info",
      admin: "Admin",
      search: "Search"
    },
    categories: {
      all: "All",
      music: "Concert/Festival",
      theater: "Theater/Cinema",
      art: "Exhibition/Show",
      sports: "Sports",
      conference: "Seminar/Conference",
      kids: "Kids/Activities",
      education: "Education/Course",
      religious: "Religious/Events",
      travel: "Travel/Tour",
      shopping: "Shopping",
      promotion: "Promotion",
      wedding: "Engagement/Wedding",
      museums: "Museums",
      konser: "Concert/Festival",
      tiyatro_sinema: "Theater/Cinema",
      sergi_gosteri: "Exhibition/Show",
      spor: "Sports",
      seminer_konferans: "Seminar/Conference",
      cocuk: "Kids/Activities",
      egitim_kurs: "Education/Course",
      dini_etkinlikler: "Religious/Events",
      gezi_tur: "Travel/Tour",
      alisveris: "Shopping",
      tanitim: "Promotion",
      nisan_dugun: "Engagement/Wedding",
      muzeler: "Museums",
      university: "Trakya Uni Events"
    },
    dates: {
      today: "Today",
      tomorrow: "Tomorrow"
    },
    events: {
      title: "Event Name",
      description: "Description",
      location: "Location",
      address: "Address",
      date: "Date",
      endDate: "End",
      time: "Time",
      price: "Price",
      free: "Free",
      capacity: "Capacity",
      organizer: "Organizer",
      contact: "Contact",
      website: "Website",
      tickets: "Tickets",
      tags: "Tags",
      featured: "Featured",
      participants: "Target Audience",
      share: "Share",
      favorite: "Favorite",
      directions: "Get Directions",
      showOnMap: "Show on Map",
      buyTickets: "Buy Tickets",
      noEvents: "No events found yet",
      searchPlaceholder: "Search events...",
      details: "Event Details",
      startTime: "Start Time",
      endTime: "End Time",
      duration: "Duration",
      venue: "Venue",
      category: "Category",
      organizedBy: "Organized By",
      contactInfo: "Contact Information",
      ticketPrice: "Ticket Price",
      availableCapacity: "Available Capacity",
      eventWebsite: "Event Website",
      eventTags: "Event Tags"
    },
    participantTypes: {
      everyone: "Everyone",
      children: "Children",
      youth: "Youth",
      adults: "Adults",
      elderly: "Elderly",
      students: "Students",
      retirees: "Retirees",
      families: "Families",
      women: "Women",
      men: "Men",
      professionals: "Professionals",
      artists: "Artists"
    },
    admin: {
      title: "Admin Panel",
      login: "Login",
      logout: "Logout",
      password: "Password",
      newEvent: "New Event",
      editEvent: "Edit Event",
      deleteEvent: "Delete Event",
      save: "Save",
      cancel: "Cancel",
      update: "Update",
      delete: "Delete",
      confirmDelete: "Are you sure you want to delete this event?",
      active: "Active",
      inactive: "Inactive"
    },
    info: {
      title: "About Edirne Events",
      description: "A platform designed to discover cultural and artistic events in Edirne.",
      features: "Features:",
      contact: "To add events: Contact admin@edirne-events.com and send event images to this address.",
      version: "Edirne Events v1.0 - 2025"
    },
    common: {
      loading: "Loading...",
      error: "An error occurred",
      success: "Success",
      close: "Close",
      open: "Open",
      back: "Back",
      next: "Next",
      yes: "Yes",
      no: "No"
    }
  },
  bg: {
    navigation: {
      home: "Начало",
      events: "Събития",
      favorites: "Любими",
      info: "Информация",
      admin: "Администратор",
      search: "Търси"
    },
    categories: {
      all: "Всички",
      music: "Концерт/Фестивал",
      theater: "Театър/Кино",
      art: "Изложба/Шоу",
      sports: "Спорт",
      conference: "Семинар/Конференция",
      kids: "Детски/Дейности",
      education: "Образование/Курс",
      religious: "Религиозни/събития",
      travel: "Пътуване/Тур",
      shopping: "Пазаруване",
      promotion: "Промоция",
      wedding: "Годеж/Сватба",
      museums: "Музеи",
      konser: "Концерт/Фестивал",
      tiyatro_sinema: "Театър/Кино",
      sergi_gosteri: "Изложба/Шоу",
      spor: "Спорт",
      seminer_konferans: "Семинар/Конференция",
      cocuk: "Детски/Дейности",
      egitim_kurs: "Образование/Курс",
      dini_etkinlikler: "Религиозни/събития",
      gezi_tur: "Пътуване/Тур",
      alisveris: "Пазаруване",
      tanitim: "Промоция",
      nisan_dugun: "Годеж/Сватба",
      muzeler: "Музеи",
      university: "Тракийски Ун Събития"
    },
    dates: {
      today: "Днес",
      tomorrow: "Утре"
    },
    events: {
      title: "Име на събитието",
      description: "Описание",
      location: "Местоположение",
      address: "Адрес",
      date: "Дата",
      endDate: "Край",
      time: "Час",
      price: "Цена",
      free: "Безплатно",
      capacity: "Капацитет",
      organizer: "Организатор",
      contact: "Контакт",
      website: "Уебсайт",
      tickets: "Билети",
      tags: "Етикети",
      featured: "Препоръчано",
      participants: "Целева аудитория",
      share: "Споделяне",
      favorite: "Любимо",
      directions: "Навигация",
      showOnMap: "Покажи на картата",
      buyTickets: "Купи билети",
      noEvents: "Все още няма събития",
      searchPlaceholder: "Търси събития...",
      details: "Детайли за събитието",
      startTime: "Начален час",
      endTime: "Краен час",
      duration: "Продължителност",
      venue: "Място",
      category: "Категория",
      organizedBy: "Организирано от",
      contactInfo: "Контактна информация",
      ticketPrice: "Цена на билета",
      availableCapacity: "Наличен капацитет",
      eventWebsite: "Уебсайт на събитието",
      eventTags: "Етикети на събитието"
    },
    participantTypes: {
      everyone: "Всички",
      children: "Деца",
      youth: "Младежи",
      adults: "Възрастни",
      elderly: "Възрастни хора",
      students: "Студенти",
      retirees: "Пенсионери",
      families: "Семейства",
      women: "Жени",
      men: "Мъже",
      professionals: "Професионалисти",
      artists: "Художници"
    },
    admin: {
      title: "Администраторски панел",
      login: "Вход",
      logout: "Изход",
      password: "Парола",
      newEvent: "Ново събитие",
      editEvent: "Редактирай събитие",
      deleteEvent: "Изтрий събитие",
      save: "Запази",
      cancel: "Отказ",
      update: "Актуализирай",
      delete: "Изтрий",
      confirmDelete: "Сигурни ли сте, че искате да изтриете това събитие?",
      active: "Активно",
      inactive: "Неактивно"
    },
    info: {
      title: "За Edirne Events",
      description: "Платформа, предназначена за откриване на културни и художествени събития в Одрин.",
      features: "Функции:",
      contact: "За добавяне на събития: Свържете се с admin@edirne-events.com и изпратете изображения на събития на този адрес.",
      version: "Edirne Events v1.0 - 2025"
    },
    common: {
      loading: "Зарежда се...",
      error: "Възникна грешка",
      success: "Успех",
      close: "Затвори",
      open: "Отвори",
      back: "Назад",
      next: "Напред",
      yes: "Да",
      no: "Не"
    }
  }
}

type Language = 'tr' | 'en' | 'bg'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
  translateText: (text: string, isTitle?: boolean) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

interface LanguageProviderProps {
  children: ReactNode
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguage] = useState<Language>('tr')

  // Language is fixed to Turkish only

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang)
    localStorage.setItem('language', lang)
  }

  // Simple fallback to original text if not Turkish
  const translateText = (text: string, isTitle: boolean = false): string => {
    return text
  }

  const t = (key: string): string => {
    const keys = key.split('.')
    let value: any = translations['tr']
    
    for (const k of keys) {
      value = value?.[k]
    }
    
    return value || ''
  }

  const value = {
    language,
    setLanguage: handleSetLanguage,
    t,
    translateText
  }

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}