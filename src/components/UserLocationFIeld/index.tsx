'use client'

import React from 'react'
import { useField } from '@payloadcms/ui'
import type { FieldClientComponent } from 'payload'
import { GoogleMapsEmbed } from '@next/third-parties/google'
import './index.scss'

/**
 * Normalizes coordinates from various formats into [longitude, latitude]
 */
const normalizeCoordinates = (coords: any): [number, number] | null => {
  if (!coords) return null

  // Handle GeoJSON Point format
  if (coords?.type === 'Point' && Array.isArray(coords.coordinates)) {
    const [lon, lat] = coords.coordinates
    return [Number(lon), Number(lat)]
  }

  // Handle direct array format
  if (Array.isArray(coords) && coords.length >= 2) {
    return [Number(coords[0]), Number(coords[1])]
  }

  return null
}

/**
 * Format date for display
 */
const formatDate = (dateValue: any): string => {
  if (!dateValue) return 'Never'
  try {
    return new Date(dateValue).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return 'Invalid date'
  }
}

/**
 * Get source display with icon
 */
const getSourceDisplay = (source: any) => {
  const sourceStr = String(source || '').toLowerCase()
  switch (sourceStr) {
    case 'browser':
      return { icon: '📱', label: 'GPS', color: 'green' }
    case 'ip':
      return { icon: '🌐', label: 'IP Location', color: 'blue' }
    default:
      return { icon: '📍', label: 'Unknown', color: 'gray' }
  }
}

/**
 * Get accuracy quality
 */
const getAccuracyQuality = (accuracy: number) => {
  if (accuracy < 50) return { label: 'High', color: 'green' }
  if (accuracy < 200) return { label: 'Medium', color: 'yellow' }
  return { label: 'Low', color: 'red' }
}

const UserLocationField: FieldClientComponent = () => {
  // Extract field values
  const { value: coordinates } = useField<any>({ path: 'location.coordinates' })
  const { value: accuracy } = useField<any>({ path: 'location.accuracy' })
  const { value: city } = useField<any>({ path: 'location.city' })
  const { value: country } = useField<any>({ path: 'location.country' })
  const { value: source } = useField<any>({ path: 'location.source' })
  const { value: lastUpdated } = useField<any>({ path: 'location.lastUpdated' })
  const { value: permissionGranted } = useField<any>({ path: 'location.permissionGranted' })

  const normalizedCoords = normalizeCoordinates(coordinates)
  const sourceInfo = getSourceDisplay(source)
  const hasLocationData = Boolean(normalizedCoords || city || country)

  if (!hasLocationData) {
    return (
      <div className="location-field">
        <div className="location-field__empty">
          <div className="location-field__empty-icon">📍</div>
          <p>No location data available</p>
        </div>
      </div>
    )
  }

  return (
    <div className="location-field">
      {/* Map Section */}
      {normalizedCoords && (
        <div className="location-field__map">
          <GoogleMapsEmbed
            apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || 'YOUR_MAPS_EMBED_API_KEY'}
            height={280}
            width="100%"
            mode="place"
            q={`${normalizedCoords[1]},${normalizedCoords[0]}`}
            maptype="roadmap"
            loading="lazy"
          />
        </div>
      )}

      {/* Details Section */}
      <div className="location-field__details">
        {/* Source Badge */}
        <div className={`location-field__source location-field__source--${sourceInfo.color}`}>
          <span className="icon">{sourceInfo.icon}</span>
          <span className="label">{sourceInfo.label}</span>
          {permissionGranted ? (
            <span className="permission granted">✓</span>
          ) : (
            <span className="permission denied">⚠</span>
          )}
        </div>

        {/* Location Info Grid */}
        <div className="location-field__info">
          {city && country && (
            <div className="info-item">
              <span className="label">Location</span>
              <span className="value">
                {city}, {country}
              </span>
            </div>
          )}
          {normalizedCoords && (
            <div className="info-item">
              <span className="label">Coordinates</span>
              <span className="value coords">
                {normalizedCoords[1].toFixed(4)}, {normalizedCoords[0].toFixed(4)}
              </span>
            </div>
          )}
          {typeof accuracy === 'number' && accuracy > 0 && (
            <div className="info-item">
              <span className="label">Accuracy</span>
              <span className={`value accuracy accuracy--${getAccuracyQuality(accuracy).color}`}>
                ±{accuracy.toFixed(0)}m ({getAccuracyQuality(accuracy).label})
              </span>
            </div>
          )}
          {lastUpdated && (
            <div className="info-item">
              <span className="label">Updated</span>
              <span className="value">{formatDate(lastUpdated)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default UserLocationField
