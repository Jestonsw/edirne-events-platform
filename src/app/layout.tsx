import './globals.css'
import { Inter } from 'next/font/google'
import { LanguageProvider } from '@/contexts/LanguageContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Edirne | Etkinlikler, Gezilecek Yerler, Konser, Festival | Selimiye Cami, Kırkpınar',
  description: 'Edirne etkinlikleri, gezilecek yerler, tarihi mekanlar ve konserler! Selimiye Cami, Kırkpınar, Sarayiçi, Meriç Nehri. Edirne\'de ne yapılır, nerede yenir, hangi otellerde kalınır - kapsamlı rehber.',
  keywords: 'edirne, edirne etkinlikleri, edirne gezilecek yerler, edirne tarihi yerler, edirne oteller, edirne yemek, edirne konser, kırkpınar, selimiye cami, edirne etkinlik, edirne festival, edirne tiyatro, edirne ne yapılır, selimiye camii etkinlik, sarayiçi etkinlik, meriç nehri, trakya etkinlik, edirne kültür merkezi, edirne gece hayatı, edirne sosyal aktivite, edirne mekanları, edirne turizm, edirne merkez etkinlik, edirne weekend, edirne restoran, edirne cafe, edirne müze, eski cami edirne, üç şerefeli cami, edirne üniversitesi, edirne sarayı, edirne kapalı çarşı, edirne sabunhane, edirne ali paşa çarşısı',
  authors: [{ name: 'Edirne Events' }],
  metadataBase: new URL('https://www.edirne-events.com'),
  alternates: {
    canonical: 'https://www.edirne-events.com',
  },
  openGraph: {
    title: 'Edirne | Etkinlikler, Gezilecek Yerler, Konser | Selimiye Cami, Kırkpınar',
    description: 'Edirne etkinlikleri, gezilecek yerler, tarihi mekanlar! Selimiye Cami, Kırkpınar, Sarayiçi, Meriç Nehri, oteller, restoranlar ve daha fazlası.',
    url: 'https://www.edirne-events.com',
    siteName: 'Edirne Events',
    locale: 'tr_TR',
    type: 'website',
    images: [
      {
        url: '/edirne-skyline-logo.png',
        width: 1200,
        height: 630,
        alt: 'Edirne Events - Edirne\'nin En Kapsamlı Etkinlik Rehberi',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Edirne | Etkinlikler, Gezilecek Yerler, Konser | Selimiye Cami, Kırkpınar',
    description: 'Edirne gezilecek yerler, etkinlikler, tarihi mekanlar! Selimiye Cami, Kırkpınar, oteller, yemek mekanları rehberi.',
    images: ['/edirne-skyline-logo.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'bvJ4guUP-CbOiVmyQA5RI6eMai9BDQBoWN9IpG8zvfU',
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  minimumScale: 0.5,
  maximumScale: 3,
  userScalable: true,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="tr">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="canonical" href="https://www.edirne-events.com" />

        <meta name="theme-color" content="#8B5A3C" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Edirne Events" />

        <meta name="cache-bust" content="1751736500" />
        <meta name="google-site-verification" content="bvJ4guUP-CbOiVmyQA5RI6eMai9BDQBoWN9IpG8zvfU" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "LocalBusiness",
              "name": "Edirne Events - Etkinlik Rehberi",
              "url": "https://www.edirne-events.com",
              "description": "Edirne'nin en kapsamlı etkinlik rehberi. Konser, tiyatro, festival ve kültürel etkinlikleri keşfedin.",
              "inLanguage": "tr",
              "areaServed": {
                "@type": "Place",
                "name": "Edirne"
              },
              "address": {
                "@type": "PostalAddress",
                "addressLocality": "Edirne",
                "addressRegion": "Edirne",
                "addressCountry": "TR"
              },
              "geo": {
                "@type": "GeoCoordinates",
                "latitude": "41.6771",
                "longitude": "26.5557"
              },
              "sameAs": [
                "https://www.facebook.com/edirneevents",
                "https://www.instagram.com/edirneevents",
                "https://twitter.com/edirneevents"
              ],
              "keywords": "edirne, edirne etkinlikleri, edirne gezilecek yerler, edirne tarihi yerler, edirne oteller, edirne yemek, edirne konser, kırkpınar, selimiye cami, edirne etkinlik, edirne festival, edirne tiyatro, edirne kültür, trakya etkinlik, edirne turizm, edirne restoran",
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://www.edirne-events.com/search?q={search_term_string}",
                "query-input": "required name=search_term_string"
              }
            })
          }}
          suppressHydrationWarning
        />
      </head>
      <body className={inter.className}>
        <script
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: `
              try {
                // Clear Google auth related data
                if (typeof localStorage !== 'undefined') {
                  Object.keys(localStorage).forEach(key => {
                    if (key.includes('google') || key.includes('gapi') || key.includes('oauth')) {
                      localStorage.removeItem(key);
                    }
                  });
                }
                if (typeof sessionStorage !== 'undefined') {
                  Object.keys(sessionStorage).forEach(key => {
                    if (key.includes('google') || key.includes('gapi') || key.includes('oauth')) {
                      sessionStorage.removeItem(key);
                    }
                  });
                }
                // Disable Google auto-select if available
                if (window.google && window.google.accounts && window.google.accounts.id) {
                  window.google.accounts.id.disableAutoSelect();
                }
              } catch(e) {
              }
            `,
          }}
        />
        <LanguageProvider>
          <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
            {children}
          </div>
        </LanguageProvider>
      </body>
    </html>
  )
}