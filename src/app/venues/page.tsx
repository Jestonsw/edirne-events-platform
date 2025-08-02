import { redirect } from 'next/navigation'

export const metadata = {
  title: 'Edirne Gezilecek Yerler | Selimiye Cami, Tarihi Mekanlar, Oteller, Restoranlar',
  description: 'Edirne gezilecek yerler rehberi! Selimiye Cami, Üç Şerefeli Cami, Eski Cami, Edirne Sarayı, Kapalı Çarşı. Edirne oteller, restoranlar, kafeler ve tarihi yerler.',
  keywords: 'edirne gezilecek yerler, selimiye cami, edirne tarihi yerler, edirne oteller, edirne yemek, edirne restoran, üç şerefeli cami, eski cami, edirne sarayı, kapalı çarşı, ali paşa çarşısı, meriç nehri',
  openGraph: {
    title: 'Edirne Gezilecek Yerler | Selimiye Cami, Tarihi Mekanlar',
    description: 'Edirne gezilecek yerler! Selimiye Cami, tarihi mekanlar, oteller, restoranlar rehberi.',
  },
  twitter: {
    title: 'Edirne Gezilecek Yerler | Selimiye Cami, Tarihi Mekanlar', 
    description: 'Edirne gezilecek yerler! Selimiye Cami, tarihi mekanlar, oteller, restoranlar rehberi.',
  }
}

export default function VenuesPage() {
  // Server-side redirect  
  redirect('/?tab=venues')
}