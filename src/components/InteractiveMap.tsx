'use client'

import { useEffect, useRef, useState } from 'react'

interface InteractiveMapProps {
  center?: [number, number]
  latitude?: number
  longitude?: number
  zoom?: number
  onLocationSelect: (lat: number, lng: number) => void
  height?: string
}

export default function InteractiveMap({ 
  center,
  latitude, 
  longitude, 
  onLocationSelect, 
  height = '300px' 
}: InteractiveMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markerRef = useRef<any>(null)
  const [isMapLoaded, setIsMapLoaded] = useState(false)

  // Hızlı konum butonları fonksiyonları
  const goToEdirneMerkez = () => {
    const edirneCoords = [41.6771, 26.5557]
    if (mapInstanceRef.current && markerRef.current) {
      markerRef.current.setLatLng(edirneCoords)
      mapInstanceRef.current.setView(edirneCoords, 15)
      onLocationSelect(edirneCoords[0], edirneCoords[1])
    }
  }

  const goToTrakya = () => {
    const trakyaCoords = [41.6858, 26.5623]
    if (mapInstanceRef.current && markerRef.current) {
      markerRef.current.setLatLng(trakyaCoords)
      mapInstanceRef.current.setView(trakyaCoords, 15)
      onLocationSelect(trakyaCoords[0], trakyaCoords[1])
    }
  }

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = [position.coords.latitude, position.coords.longitude]
          if (mapInstanceRef.current && markerRef.current) {
            markerRef.current.setLatLng(coords)
            mapInstanceRef.current.setView(coords, 15)
            onLocationSelect(coords[0], coords[1])
          }
        },
        (error) => {
          console.error('Konum alınamadı:', error)
        }
      )
    }
  }

  useEffect(() => {
    // Leaflet CSS'ini dinamik olarak yükle
    if (!document.querySelector('link[href*="leaflet.css"]')) {
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      document.head.appendChild(link)
    }
    
    // Leaflet'i dinamik olarak yükle
    import('leaflet').then((L) => {
      if (mapRef.current && !mapInstanceRef.current) {
        // Koordinatları belirle - center prop'u öncelikli, sonra latitude/longitude
        let initialLat = 41.6771 // Varsayılan Edirne merkezi
        let initialLng = 26.5557
        
        if (center && center.length === 2) {
          initialLat = center[0]
          initialLng = center[1]
        } else if (latitude && longitude) {
          initialLat = latitude
          initialLng = longitude
        }

        // Harita oluştur
        mapInstanceRef.current = L.map(mapRef.current).setView([initialLat, initialLng], 15)

        // Tile layer ekle - optimize edilmiş settings
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 19,
          minZoom: 8,
          tileSize: 256,
          detectRetina: true
        }).addTo(mapInstanceRef.current)

        // Özel kırmızı marker ikonu oluştur
        const redIcon = L.divIcon({
          className: 'custom-div-icon',
          html: '<div style="background-color: #ef4444; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
          iconSize: [20, 20],
          iconAnchor: [10, 10]
        })

        // Başlangıç marker'ı ekle
        markerRef.current = L.marker([initialLat, initialLng], {
          draggable: true,
          icon: redIcon
        }).addTo(mapInstanceRef.current)

        // Marker'a tooltip ekle
        markerRef.current.bindTooltip('Marker\'ı sürükleyebilir veya haritaya tıklayabilirsiniz', {
          permanent: false,
          direction: 'top',
          offset: [0, -10]
        })

        // Marker sürüklendiğinde callback çağır
        markerRef.current.on('dragend', (e: any) => {
          const { lat, lng } = e.target.getLatLng()
          onLocationSelect(lat, lng)
        })

        // Marker sürüklenirken görsel feedback
        markerRef.current.on('dragstart', () => {
          markerRef.current.setOpacity(0.7)
        })

        markerRef.current.on('dragend', (e: any) => {
          markerRef.current.setOpacity(1)
          const { lat, lng } = e.target.getLatLng()
          onLocationSelect(lat, lng)
        })

        // Haritaya tıklandığında marker'ı taşı
        mapInstanceRef.current.on('click', (e: any) => {
          const { lat, lng } = e.latlng
          markerRef.current.setLatLng([lat, lng])
          onLocationSelect(lat, lng)
          
          // Kısa animasyon efekti
          markerRef.current.setOpacity(0.5)
          setTimeout(() => {
            markerRef.current.setOpacity(1)
          }, 200)
        })

        // Zoom kontrolleri ekle
        mapInstanceRef.current.on('zoomend', () => {
          const currentZoom = mapInstanceRef.current.getZoom()
          if (currentZoom < 10) {
            mapInstanceRef.current.setZoom(10) // Minimum zoom seviyesi
          }
        })

        setIsMapLoaded(true)
        
        // Modal içinde açıldığında boyut problemini çözmek için
        setTimeout(() => {
          if (mapInstanceRef.current) {
            mapInstanceRef.current.invalidateSize()
          }
        }, 100)
        

      }
    }).catch((error) => {
      console.error('Leaflet yüklenirken hata:', error)
    })

    // Cleanup
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
        markerRef.current = null
      }
    }
  }, [])

  // Koordinat değiştiğinde marker'ı güncelle
  useEffect(() => {
    if (mapInstanceRef.current && markerRef.current && latitude && longitude) {
      const newLatLng = [latitude, longitude]
      markerRef.current.setLatLng(newLatLng)
      
      // Smooth pan to new location
      mapInstanceRef.current.panTo(newLatLng, {
        animate: true,
        duration: 0.5
      })
      
      // Kısa blink animasyonu
      markerRef.current.setOpacity(0.5)
      setTimeout(() => {
        markerRef.current.setOpacity(1)
      }, 300)
    }
  }, [latitude, longitude])

  return (
    <div style={{ height }} className="border rounded-lg overflow-hidden relative">
      <div 
        ref={mapRef} 
        style={{ 
          height: '100%', 
          width: '100%',
          minHeight: '300px',
          position: 'relative'
        }}
      >
        {!isMapLoaded && (
          <div className="h-full flex items-center justify-center bg-gray-100">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">Harita yükleniyor...</p>
            </div>
          </div>
        )}
      </div>
      
      {/* Koordinat Gösterim Paneli */}
      {isMapLoaded && latitude && longitude && (
        <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white px-3 py-1 rounded-lg text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="text-red-400">📍</span>
            <span>{parseFloat(latitude.toString()).toFixed(4)}, {parseFloat(longitude.toString()).toFixed(4)}</span>
          </div>
        </div>
      )}
      
      {/* Hızlı Konum Butonları */}
      {isMapLoaded && (
        <div className="absolute top-2 left-2 space-y-1">
          <button
            onClick={goToEdirneMerkez}
            className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs font-medium shadow-lg transition-colors block w-full"
            title="Edirne Merkezi"
          >
            🏛️ Merkez
          </button>
          <button
            onClick={goToTrakya}
            className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-xs font-medium shadow-lg transition-colors block w-full"
            title="Trakya Üniversitesi"
          >
            🎓 Trakya
          </button>
          <button
            onClick={getCurrentLocation}
            className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs font-medium shadow-lg transition-colors block w-full"
            title="Mevcut Konumum"
          >
            📱 Konum
          </button>
        </div>
      )}

      {/* Kontrol Paneli */}
      {isMapLoaded && (
        <div className="absolute top-2 right-2 bg-white bg-opacity-90 rounded-lg p-2 shadow-lg max-w-24">
          <div className="text-xs text-gray-600 mb-1 text-center">Kontrol</div>
          <div className="text-xs text-gray-500 space-y-1">
            <div>🖱️ Tıkla</div>
            <div>📌 Sürükle</div>
            <div>🔍 Zoom</div>
          </div>
        </div>
      )}
    </div>
  )
}