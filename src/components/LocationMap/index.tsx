// src/components/LocationMap/index.tsx
'use client'

import React, { useEffect, useRef, useCallback } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix for default markers in React environments
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

interface LocationMapProps {
  coordinates?: [number, number] // [longitude, latitude]
  city?: string
  country?: string
  accuracy?: number
  source?: 'browser' | 'ip' | string
  height?: string
}

export const LocationMap: React.FC<LocationMapProps> = ({
  coordinates,
  city,
  country,
  accuracy,
  source,
  height = '300px',
}) => {
  const mapRef = useRef<L.Map | null>(null)
  const mapContainerRef = useRef<HTMLDivElement>(null)

  // Cleanup function to remove map instance
  const cleanupMap = useCallback(() => {
    if (mapRef.current) {
      mapRef.current.remove()
      mapRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!mapContainerRef.current || !coordinates) {
      cleanupMap()
      return
    }

    // Validate coordinates
    const [longitude, latitude] = coordinates
    if (
      isNaN(longitude) ||
      isNaN(latitude) ||
      longitude < -180 ||
      longitude > 180 ||
      latitude < -90 ||
      latitude > 90
    ) {
      console.warn('LocationMap: Invalid coordinates provided', coordinates)
      cleanupMap()
      return
    }

    if (process.env.NODE_ENV === 'development') {
      console.debug('LocationMap rendering with coordinates:', coordinates)
    }

    // Clean up existing map before creating new one
    cleanupMap()

    try {
      // Initialize map with error handling
      const map = L.map(mapContainerRef.current, {
        zoomControl: true,
        scrollWheelZoom: true,
        doubleClickZoom: true,
        boxZoom: true,
        keyboard: true,
        dragging: true,
        touchZoom: true,
      }).setView([latitude, longitude], 13)

      // Add tile layer with error handling
      const tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution:
          '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
        minZoom: 1,
      })

      tileLayer.on('tileerror', (e) => {
        console.warn('LocationMap: Tile loading error', e)
      })

      tileLayer.addTo(map)

      // Create popup content with proper escaping
      const safeCity = (city || 'Unknown City').replace(/[<>&"']/g, (match) => {
        const escapeMap: Record<string, string> = {
          '<': '&lt;',
          '>': '&gt;',
          '&': '&amp;',
          '"': '&quot;',
          "'": '&#39;',
        }
        return escapeMap[match] || match
      })

      const safeCountry = (country || 'Unknown Country').replace(/[<>&"']/g, (match) => {
        const escapeMap: Record<string, string> = {
          '<': '&lt;',
          '>': '&gt;',
          '&': '&amp;',
          '"': '&quot;',
          "'": '&#39;',
        }
        return escapeMap[match] || match
      })

      const sourceDisplay = source === 'browser' ? '📍 GPS Location' : '🌐 IP Geolocation'

      const popupContent = `
        <div style="min-width: 180px; font-family: system-ui, -apple-system, sans-serif;">
          <div style="font-weight: 600; margin-bottom: 8px; color: #1f2937;">
            ${safeCity}, ${safeCountry}
          </div>
          <div style="font-size: 12px; color: #6b7280; line-height: 1.4;">
            <div><strong>Latitude:</strong> ${latitude.toFixed(6)}</div>
            <div><strong>Longitude:</strong> ${longitude.toFixed(6)}</div>
            ${
              typeof accuracy === 'number' && accuracy > 0
                ? `<div><strong>Accuracy:</strong> ±${accuracy.toFixed(0)}m</div>`
                : ''
            }
            <div style="margin-top: 4px;"><strong>Source:</strong> ${sourceDisplay}</div>
          </div>
        </div>
      `

      // Add marker with popup
      const marker = L.marker([latitude, longitude], {
        title: `${safeCity}, ${safeCountry}`,
        alt: 'Location marker',
      })
        .addTo(map)
        .bindPopup(popupContent, {
          maxWidth: 250,
          className: 'location-popup',
        })
        .openPopup()

      // Add accuracy circle for GPS locations
      if (typeof accuracy === 'number' && accuracy > 0 && source === 'browser') {
        const accuracyCircle = L.circle([latitude, longitude], {
          radius: accuracy,
          color: '#3b82f6',
          fillColor: '#3b82f6',
          fillOpacity: 0.15,
          weight: 2,
          opacity: 0.8,
        })

        accuracyCircle.addTo(map)

        // Adjust map view to include accuracy circle if it's large
        if (accuracy > 1000) {
          const bounds = accuracyCircle.getBounds()
          map.fitBounds(bounds, { padding: [20, 20] })
        }
      }

      // Store map reference
      mapRef.current = map

      // Handle map resize
      const resizeObserver = new ResizeObserver(() => {
        if (mapRef.current) {
          mapRef.current.invalidateSize()
        }
      })

      if (mapContainerRef.current) {
        resizeObserver.observe(mapContainerRef.current)
      }

      // Cleanup function
      return () => {
        resizeObserver.disconnect()
        cleanupMap()
      }
    } catch (error) {
      console.error('LocationMap: Error initializing map', error)
      cleanupMap()
    }
  }, [coordinates, city, country, accuracy, source, cleanupMap])

  // Cleanup on unmount
  useEffect(() => {
    return cleanupMap
  }, [cleanupMap])

  if (!coordinates) {
    return (
      <div
        style={{
          height,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--theme-elevation-100, #f3f4f6)',
          borderRadius: 'var(--border-radius, 8px)',
          color: 'var(--theme-text-dim, #6b7280)',
          border: '1px solid var(--theme-elevation-200, #e5e7eb)',
          fontStyle: 'italic',
        }}
      >
        No coordinates available for map display
      </div>
    )
  }

  return (
    <div
      ref={mapContainerRef}
      style={{
        height,
        width: '100%',
        borderRadius: 'var(--border-radius, 8px)',
        border: '1px solid var(--theme-elevation-200, #e5e7eb)',
        overflow: 'hidden',
        position: 'relative',
      }}
      role="img"
      aria-label={`Map showing location: ${city || 'Unknown'}, ${country || 'Unknown'}`}
    />
  )
}

export default LocationMap
