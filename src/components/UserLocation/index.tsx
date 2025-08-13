'use client'

import React, { lazy, Suspense } from 'react'
import { useField } from '@payloadcms/ui'
import './index.scss'

type Maybe<T> = T | null | undefined

interface LocationMapProps {
  coordinates: [number, number]
  city?: Maybe<string>
  country?: Maybe<string>
  accuracy?: Maybe<number>
  source?: Maybe<string>
}

// Lazy load the map component to avoid SSR issues.
// Support both named export `LocationMap` and default export for flexibility.
const LocationMap = lazy(() =>
  import('./components/LocationMap').then((module) => ({
    default: (module as any).LocationMap ?? (module as any).default,
  })),
) as React.LazyExoticComponent<React.ComponentType<LocationMapProps>>

/**
 * Normalizes coordinates from various formats into a standard [longitude, latitude] array.
 * Handles GeoJSON Point format, direct arrays, and nested coordinate objects.
 */
const normalizeCoordinates = (coords: any): [number, number] | null => {
  if (!coords) return null

  // Handle GeoJSON Point format: { type: 'Point', coordinates: [lon, lat] }
  if (
    typeof coords === 'object' &&
    coords !== null &&
    coords.type === 'Point' &&
    Array.isArray(coords.coordinates) &&
    coords.coordinates.length >= 2
  ) {
    const [lon, lat] = coords.coordinates
    const longitude = Number(lon)
    const latitude = Number(lat)

    // Validate coordinate ranges
    if (
      isNaN(longitude) ||
      isNaN(latitude) ||
      longitude < -180 ||
      longitude > 180 ||
      latitude < -90 ||
      latitude > 90
    ) {
      return null
    }

    return [longitude, latitude]
  }

  // Handle direct array format: [lon, lat]
  if (Array.isArray(coords) && coords.length >= 2) {
    const longitude = Number(coords[0])
    const latitude = Number(coords[1])

    // Validate coordinate ranges
    if (
      isNaN(longitude) ||
      isNaN(latitude) ||
      longitude < -180 ||
      longitude > 180 ||
      latitude < -90 ||
      latitude > 90
    ) {
      return null
    }

    return [longitude, latitude]
  }

  // Handle nested coordinates object
  if (typeof coords === 'object' && coords !== null && coords.coordinates) {
    return normalizeCoordinates(coords.coordinates)
  }

  return null
}

/**
 * Safely formats a date string for display with proper locale formatting.
 */
const formatDate = (dateValue: any): string => {
  if (!dateValue) return 'Never'

  try {
    const date = new Date(String(dateValue))
    if (isNaN(date.getTime())) return 'Invalid date'

    // Use a more readable date format
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false, // Use 24-hour format
    })
  } catch {
    return 'Invalid date'
  }
}

/**
 * Gets a user-friendly display name for the location source.
 */
const getSourceDisplay = (source: any): string => {
  const sourceStr = String(source || '').toLowerCase()

  switch (sourceStr) {
    case 'browser':
      return '📱 Browser GPS'
    case 'ip':
      return '🌐 IP Geolocation'
    case 'manual':
      return '✏️ Manual Entry'
    default:
      return '❓ Unknown Source'
  }
}

const UserLocation: React.FC = () => {
  // Extract field values with type safety
  const { value: coordinates } = useField<any>({
    path: 'location.coordinates',
  })
  const { value: accuracy } = useField<any>({ path: 'location.accuracy' })
  const { value: city } = useField<any>({ path: 'location.city' })
  const { value: region } = useField<any>({ path: 'location.region' })
  const { value: country } = useField<any>({ path: 'location.country' })
  const { value: countryCode } = useField<any>({
    path: 'location.countryCode',
  })
  const { value: timezone } = useField<any>({ path: 'location.timezone' })
  const { value: source } = useField<any>({ path: 'location.source' })
  const { value: ipAddress } = useField<any>({ path: 'location.ipAddress' })
  const { value: lastUpdated } = useField<any>({
    path: 'location.lastUpdated',
  })
  const { value: permissionGranted } = useField<any>({
    path: 'location.permissionGranted',
  })

  // Log for debugging (only in development)
  if (process.env.NODE_ENV === 'development') {
    console.debug('User Location Field values:', {
      coordinates,
      accuracy,
      city,
      region,
      country,
      countryCode,
      timezone,
      source,
      ipAddress,
      lastUpdated,
      permissionGranted,
    })
  }

  // Check if we have any meaningful location data
  const hasLocationData = Boolean(coordinates || city || country || source)

  if (!hasLocationData) {
    return (
      <div className="location-field">
        <div className="location-field__empty">
          <div className="location-field__empty-text">No location data available for this user</div>
          {process.env.NODE_ENV === 'development' && (
            <details className="location-field__debug">
              <summary>Debug Info</summary>
              <pre className="location-field__debug-content">
                {JSON.stringify(
                  {
                    hasCoordinates: !!coordinates,
                    hasCity: !!city,
                    hasCountry: !!country,
                    hasSource: !!source,
                    values: { coordinates, city, country, source },
                  },
                  null,
                  2,
                )}
              </pre>
            </details>
          )}
        </div>
      </div>
    )
  }

  const normalizedCoords = normalizeCoordinates(coordinates)

  return (
    <div className="location-field">
      {/* Map Section - Now shown first */}
      {normalizedCoords ? (
        <div className="location-field__map-container">
          <Suspense fallback={<div className="location-field__map-loading">Loading map...</div>}>
            <LocationMap
              coordinates={normalizedCoords}
              city={typeof city === 'string' ? city : undefined}
              country={typeof country === 'string' ? country : undefined}
              accuracy={typeof accuracy === 'number' ? accuracy : undefined}
              source={typeof source === 'string' ? source : undefined}
            />
          </Suspense>
        </div>
      ) : (
        <div className="location-field__warning">
          <div className="location-field__warning-text">
            Location data exists but coordinates are invalid or missing.
          </div>
          {process.env.NODE_ENV === 'development' && (
            <details className="location-field__debug">
              <summary>Available Data</summary>
              <div className="location-field__debug-list">
                <div>City: {String(city ?? 'N/A')}</div>
                <div>Country: {String(country ?? 'N/A')}</div>
                <div>Source: {String(source ?? 'N/A')}</div>
                <div>
                  Coordinates: {coordinates ? 'Present but invalid format/range' : 'Not available'}
                </div>
              </div>
            </details>
          )}
        </div>
      )}

      {/* Location Summary Card - Now shown second */}
      <div className="location-field__card">
        <div className="location-field__grid">
          <div className="location-field__item">
            <span className="location-field__label">City:</span>
            <span className="location-field__value">{String(city ?? 'Unknown')}</span>
          </div>

          <div className="location-field__item">
            <span className="location-field__label">Country:</span>
            <span className="location-field__value">{String(country ?? 'Unknown')}</span>
          </div>

          <div className="location-field__item">
            <span className="location-field__label">Source:</span>
            <span className="location-field__value">{getSourceDisplay(source)}</span>
          </div>

          <div className="location-field__item">
            <span className="location-field__label">Permission:</span>
            <span className="location-field__value">
              {permissionGranted ? '✅ Granted' : '❌ Denied/Unavailable'}
            </span>
          </div>

          {typeof accuracy === 'number' && accuracy > 0 && (
            <div className="location-field__item">
              <span className="location-field__label">Accuracy:</span>
              <span className="location-field__value">~{accuracy.toFixed(0)}m</span>
            </div>
          )}

          {region && typeof region === 'string' && (
            <div className="location-field__item">
              <span className="location-field__label">Region:</span>
              <span className="location-field__value">{region}</span>
            </div>
          )}

          {countryCode && typeof countryCode === 'string' && (
            <div className="location-field__item">
              <span className="location-field__label">Country Code:</span>
              <span className="location-field__value">{countryCode.toUpperCase()}</span>
            </div>
          )}

          {timezone && typeof timezone === 'string' && (
            <div className="location-field__item">
              <span className="location-field__label">Timezone:</span>
              <span className="location-field__value">{timezone}</span>
            </div>
          )}

          {ipAddress && typeof ipAddress === 'string' && (
            <div className="location-field__item location-field__item--full">
              <span className="location-field__label">IP Address:</span>
              <span className="location-field__value">{ipAddress}</span>
            </div>
          )}

          <div className="location-field__item location-field__item--full">
            <span className="location-field__label">Last Updated:</span>
            <span className="location-field__value">{formatDate(lastUpdated)}</span>
          </div>
        </div>

        {/* Debug info for development */}
        {process.env.NODE_ENV === 'development' && (
          <details className="location-field__debug">
            <summary>Coordinates Debug</summary>
            <pre className="location-field__debug-content">
              {JSON.stringify(
                {
                  original: coordinates,
                  normalized: normalizedCoords,
                  type: typeof coordinates,
                  isArray: Array.isArray(coordinates),
                  isValid: normalizedCoords !== null,
                },
                null,
                2,
              )}
            </pre>
          </details>
        )}
      </div>
    </div>
  )
}

export default UserLocation
