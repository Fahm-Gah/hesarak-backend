'use client'

import { useState, useEffect } from 'react'
import { MapPin, Loader2 } from 'lucide-react'
import { getClientSideURL } from '@/utils/getURL'

interface LocationPermissionPromptProps {
  onLocationGranted: () => void
  onLocationSkipped: () => void
}

export const LocationPermissionPrompt = ({
  onLocationGranted,
  onLocationSkipped,
}: LocationPermissionPromptProps) => {
  const [isRequestingLocation, setIsRequestingLocation] = useState(false)

  // Automatically request location permission when component mounts
  useEffect(() => {
    const requestLocationPermission = async () => {
      setIsRequestingLocation(true)

      try {
        // Check if geolocation is available
        if (!window.isSecureContext || !navigator.geolocation) {
          throw new Error('Geolocation not available')
        }

        // Request permission directly - this will trigger browser popup immediately
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error('Location request timed out'))
          }, 30000) // 30 seconds to give user time to respond to browser popup

          navigator.geolocation.getCurrentPosition(
            (pos) => {
              clearTimeout(timeout)
              resolve(pos)
            },
            (err) => {
              clearTimeout(timeout)
              // Handle different error cases
              if (err.code === err.PERMISSION_DENIED) {
                reject(new Error('Permission denied by user'))
              } else if (err.code === err.TIMEOUT) {
                reject(new Error('Location request timed out'))
              } else {
                reject(new Error('Location unavailable'))
              }
            },
            {
              enableHighAccuracy: false,
              timeout: 25000,
              maximumAge: 300000, // 5 minutes
            },
          )
        })

        // Send precise location to server
        await fetch(`${getClientSideURL()}/api/update-location`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          }),
        })

        onLocationGranted()
      } catch (error) {
        console.log('Precise location failed, using IP fallback:', error)

        // Fallback to IP geolocation
        try {
          await fetch(`${getClientSideURL()}/api/update-location`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
              useFallback: true,
            }),
          })
        } catch (fallbackError) {
          console.error('IP location fallback failed:', fallbackError)
        }

        onLocationGranted() // Still proceed even with fallback
      } finally {
        setIsRequestingLocation(false)
      }
    }

    requestLocationPermission()
  }, [onLocationGranted])

  const skipLocation = async () => {
    // Use IP geolocation as fallback when user skips
    try {
      await fetch(`${getClientSideURL()}/api/update-location`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          useFallback: true,
        }),
      })
    } catch (error) {
      console.error('IP location fallback failed:', error)
    }

    onLocationSkipped()
  }

  return (
    <div className="mb-8 p-6 bg-orange-50 border border-orange-200 rounded-lg text-center">
      <MapPin className="w-12 h-12 text-orange-600 mx-auto mb-4" />

      <h3 className="text-lg font-semibold text-gray-900 mb-2">مجوز دسترسی به موقعیت لازم است</h3>
      <p className="text-gray-600 mb-4">
        لطفاً دسترسی به موقعیت را در مرورگر خود فعال کنید تا بتوانیم مسیرهای مناسب را به شما نشان
        دهیم.
      </p>

      <div className="flex items-center justify-center text-sm text-gray-500 mb-4">
        <Loader2 className="w-4 h-4 animate-spin ml-2" />
        در انتظار مجوز مرورگر...
      </div>

      <button
        onClick={skipLocation}
        disabled={isRequestingLocation}
        className="text-sm text-gray-500 hover:text-gray-700 underline disabled:opacity-50 disabled:cursor-not-allowed"
      >
        بدون موقعیت ادامه دهید
      </button>

      <p className="text-xs text-gray-500 mt-4">
        ما از موقعیت تقریبی شما برای نمایش مسیرها و ترمینال‌های نزدیک استفاده خواهیم کرد.
      </p>
    </div>
  )
}
