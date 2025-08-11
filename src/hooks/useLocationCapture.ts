'use client'

import { useState, useEffect, useCallback } from 'react'

interface LocationData {
  coordinates?: [number, number]
  accuracy?: number
  city?: string
  region?: string
  country?: string
  countryCode?: string
  timezone?: string
  source: 'browser' | 'ip'
  ipAddress?: string
  lastUpdated: string
  permissionGranted: boolean
  timestamp?: number
}

interface UseLocationCaptureOptions {
  autoCapture?: boolean
  cacheTimeout?: number // in milliseconds
  apiUrl?: string
}

export const useLocationCapture = (userId?: string, options: UseLocationCaptureOptions = {}) => {
  const {
    autoCapture = true,
    cacheTimeout = 300000, // 5 minutes default
  } = options

  const [location, setLocation] = useState<LocationData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [permissionStatus, setPermissionStatus] = useState<PermissionState>('prompt')

  const updateLocationOnServer = useCallback(
    async (locationData: {
      latitude?: number
      longitude?: number
      accuracy?: number
      useFallback?: boolean
    }) => {
      try {
        const response = await fetch(`/api/update-location`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(locationData),
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error || 'Failed to update location on server')
        }

        const result = await response.json()
        return result
      } catch (err) {
        console.error('Server location update failed:', err)
        throw err
      }
    },
    [],
  )

  const captureLocation = useCallback(
    async (forceRefresh = false): Promise<LocationData | null> => {
      // Skip if already loading or have recent location (unless forced)
      if (loading) {
        return location
      }

      if (
        !forceRefresh &&
        location &&
        location.timestamp &&
        location.timestamp > Date.now() - cacheTimeout
      ) {
        return location
      }

      setLoading(true)
      setError(null)

      try {
        // Check if HTTPS (required for geolocation)
        const isSecureContext = window.isSecureContext

        if (!isSecureContext) {
          console.warn('Geolocation requires HTTPS. Falling back to IP geolocation.')
          const result = await updateLocationOnServer({ useFallback: true })
          const locationData = {
            ...result.data.location,
            timestamp: Date.now(),
          }
          setLocation(locationData)
          return locationData
        }

        // Check for geolocation support
        if (!navigator.geolocation) {
          console.warn('Geolocation not supported. Falling back to IP geolocation.')
          const result = await updateLocationOnServer({ useFallback: true })
          const locationData = {
            ...result.data.location,
            timestamp: Date.now(),
          }
          setLocation(locationData)
          return locationData
        }

        // Try to get browser geolocation
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            const timeout = setTimeout(() => {
              reject(new Error('Geolocation timeout'))
            }, 10000) // 10 second timeout

            navigator.geolocation.getCurrentPosition(
              (pos) => {
                clearTimeout(timeout)
                resolve(pos)
              },
              (err) => {
                clearTimeout(timeout)
                // Set permission status based on error code
                if (err.code === GeolocationPositionError.PERMISSION_DENIED) {
                  setPermissionStatus('denied')
                } else if (err.code === GeolocationPositionError.TIMEOUT) {
                  console.warn('Geolocation timeout, falling back to IP')
                } else if (err.code === GeolocationPositionError.POSITION_UNAVAILABLE) {
                  console.warn('Position unavailable, falling back to IP')
                }
                reject(err)
              },
              {
                enableHighAccuracy: false, // Faster response
                timeout: 10000,
                maximumAge: cacheTimeout,
              },
            )
          })

          // Send browser location to server
          const locationData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          }

          const result = await updateLocationOnServer(locationData)

          const enrichedLocation: LocationData = {
            ...result.data.location,
            timestamp: Date.now(),
          }

          setLocation(enrichedLocation)
          setPermissionStatus('granted')

          return enrichedLocation
        } catch (geoError: any) {
          console.log(
            'Browser geolocation failed, falling back to IP geolocation:',
            geoError.message,
          )

          // IMPORTANT: Always fall back to IP geolocation when GPS fails
          const result = await updateLocationOnServer({ useFallback: true })
          const fallbackLocation: LocationData = {
            ...result.data.location,
            timestamp: Date.now(),
          }
          setLocation(fallbackLocation)
          return fallbackLocation
        }
      } catch (err: any) {
        console.error('Location capture completely failed:', err)
        const errorMessage = err.message || 'Unable to determine location'
        setError(errorMessage)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [loading, location, cacheTimeout, updateLocationOnServer],
  )

  // Check permission status on mount
  useEffect(() => {
    if (typeof window === 'undefined') return

    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions
        .query({ name: 'geolocation' as PermissionName })
        .then((result) => {
          setPermissionStatus(result.state)

          // Listen for permission changes
          const handleChange = () => {
            setPermissionStatus(result.state)
          }
          result.addEventListener('change', handleChange)

          return () => {
            result.removeEventListener('change', handleChange)
          }
        })
        .catch((err) => {
          console.warn('Permission query not supported:', err)
        })
    }
  }, [])

  // Auto-capture on mount if user is logged in and autoCapture is enabled
  useEffect(() => {
    if (userId && !location && autoCapture) {
      captureLocation().catch(console.error)
    }
  }, [userId, location, autoCapture, captureLocation])

  return {
    location,
    loading,
    error,
    permissionStatus,
    captureLocation,
    refresh: () => captureLocation(true),
  }
}
