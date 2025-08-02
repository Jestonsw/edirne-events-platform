import { redirect } from 'next/navigation'

export const metadata = {
  title: 'Edirne Etkinlikleri | Konser, Festival, Tiyatro, Kırkpınar - Edirne Events',
  description: 'Edirne konser, festival, tiyatro etkinlikleri! Kırkpınar yağlı güreş festivali, Selimiye Cami etkinlikleri, Sarayiçi kültür programları, Meriç Nehri açık hava etkinlikleri.',
  keywords: 'edirne etkinlikleri, edirne konser, kırkpınar, selimiye cami etkinlik, edirne festival, edirne tiyatro, sarayiçi etkinlik, meriç nehri etkinlik, edirne ne yapılır, edirne kültür, edirne sanat',
  openGraph: {
    title: 'Edirne Etkinlikleri | Konser, Festival, Kırkpınar',
    description: 'Edirne konser, festival, tiyatro etkinlikleri! Kırkpınar, Selimiye Cami, Sarayiçi programları.',
  },
  twitter: {
    title: 'Edirne Etkinlikleri | Konser, Festival, Kırkpınar',
    description: 'Edirne konser, festival, tiyatro etkinlikleri! Kırkpınar, Selimiye Cami, Sarayiçi programları.',
  }
}

export default function EventsPage() {
  // Server-side redirect
  redirect('/?tab=events')
}