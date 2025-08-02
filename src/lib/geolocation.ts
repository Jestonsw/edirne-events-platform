// Geolocation utilities for event discovery
export interface Coordinates {
  latitude: number
  longitude: number
}

export interface LocationInfo {
  coordinates: Coordinates
  address?: string
  city?: string
  country?: string
}

// Calculate distance between two coordinates using Haversine formula
export function calculateDistance(
  coord1: Coordinates,
  coord2: Coordinates
): number {
  const R = 6371 // Earth's radius in kilometers
  const dLat = toRadians(coord2.latitude - coord1.latitude)
  const dLon = toRadians(coord2.longitude - coord1.longitude)
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(coord1.latitude)) * Math.cos(toRadians(coord2.latitude)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c // Distance in kilometers
}

function toRadians(degree: number): number {
  return degree * (Math.PI / 180)
}

// Get user's current location
export function getCurrentLocation(): Promise<Coordinates> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser'))
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        })
      },
      (error) => {
        let errorMessage = 'Unknown error occurred'
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied by user'
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable'
            break
          case error.TIMEOUT:
            errorMessage = 'Location request timed out'
            break
        }
        reject(new Error(errorMessage))
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 600000 // 10 minutes
      }
    )
  })
}

// Geocode an address to coordinates (using free OpenStreetMap Nominatim API)
export async function geocodeAddress(address: string): Promise<Coordinates | null> {
  try {
    const encodedAddress = encodeURIComponent(`${address}, Edirne, Turkey`)
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1&addressdetails=1`
    )
    
    if (!response.ok) {
      throw new Error('Geocoding request failed')
    }
    
    const data = await response.json()
    
    if (data && data.length > 0) {
      return {
        latitude: parseFloat(data[0].lat),
        longitude: parseFloat(data[0].lon)
      }
    }
    
    return null
  } catch (error) {
    return null
  }
}

// Reverse geocode coordinates to address
export async function reverseGeocode(coordinates: Coordinates): Promise<string | null> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coordinates.latitude}&lon=${coordinates.longitude}&addressdetails=1`
    )
    
    if (!response.ok) {
      throw new Error('Reverse geocoding request failed')
    }
    
    const data = await response.json()
    
    if (data && data.display_name) {
      return data.display_name
    }
    
    return null
  } catch (error) {
    return null
  }
}

// Format distance for display
export function formatDistance(distance: number): string {
  if (distance < 1) {
    return `${Math.round(distance * 1000)}m`
  } else if (distance < 10) {
    return `${distance.toFixed(1)}km`
  } else {
    return `${Math.round(distance)}km`
  }
}

// Check if coordinates are valid
export function isValidCoordinates(coordinates: Coordinates | null | undefined): coordinates is Coordinates {
  return coordinates !== null && 
         coordinates !== undefined && 
         typeof coordinates.latitude === 'number' && 
         typeof coordinates.longitude === 'number' &&
         coordinates.latitude >= -90 && 
         coordinates.latitude <= 90 &&
         coordinates.longitude >= -180 && 
         coordinates.longitude <= 180
}

// Edirne city bounds for validation
export const EDIRNE_BOUNDS = {
  north: 41.7,
  south: 41.6,
  east: 26.6,
  west: 26.5
}

// Check if coordinates are within Edirne bounds (rough estimation)
export function isWithinEdirne(coordinates: Coordinates): boolean {
  return coordinates.latitude >= EDIRNE_BOUNDS.south &&
         coordinates.latitude <= EDIRNE_BOUNDS.north &&
         coordinates.longitude >= EDIRNE_BOUNDS.west &&
         coordinates.longitude <= EDIRNE_BOUNDS.east
}

// Default Edirne center coordinates
export const EDIRNE_CENTER: Coordinates = {
  latitude: 41.6773,
  longitude: 26.5557
}