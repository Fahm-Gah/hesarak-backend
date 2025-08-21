'use client'

import { useState } from 'react'
import { MapPin, Loader2, X } from 'lucide-react'
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
  const [showBrowserPromptHelp, setShowBrowserPromptHelp] = useState(false)

  const requestLocationPermission = async () => {
    setIsRequestingLocation(true)

    try {
      // Check if geolocation is available
      if (!window.isSecureContext || !navigator.geolocation) {
        throw new Error('Geolocation not available')
      }

      // Show helper text about browser permission
      setShowBrowserPromptHelp(true)

      // Request permission directly - this will trigger browser popup
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Location request timed out'))
        }, 30000) // 30 seconds to give user time to respond to browser popup

        navigator.geolocation.getCurrentPosition(
          (pos) => {
            clearTimeout(timeout)
            setShowBrowserPromptHelp(false)
            resolve(pos)
          },
          (err) => {
            clearTimeout(timeout)
            setShowBrowserPromptHelp(false)
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
      setShowBrowserPromptHelp(false)

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

      {showBrowserPromptHelp ? (
        <>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Please allow location access</h3>
          <p className="text-gray-600 mb-4">
            Your browser is asking for location permission. Please click "Allow" in the browser popup to continue.
          </p>
          <div className="flex items-center justify-center text-sm text-gray-500 mb-4">
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
            Waiting for browser permission...
          </div>
          <button
            onClick={() => {
              setShowBrowserPromptHelp(false)
              setIsRequestingLocation(false)
              skipLocation()
            }}
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            Cancel and continue without location
          </button>
        </>
      ) : (
        <>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Enable location services</h3>
          <p className="text-gray-600 mb-6">
            Help us show you the most relevant routes and improve your experience.
          </p>

          <div className="flex gap-3 justify-center">
            <button
              onClick={requestLocationPermission}
              disabled={isRequestingLocation}
              className="px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg font-medium hover:from-orange-700 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isRequestingLocation ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin inline-block mr-2" />
                  Setting up...
                </>
              ) : (
                'Enable Location'
              )}
            </button>

            <button
              onClick={skipLocation}
              disabled={isRequestingLocation}
              className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Skip for now
            </button>
          </div>

          <p className="text-xs text-gray-500 mt-4">
            We'll use your approximate location to show nearby routes and terminals.
          </p>
        </>
      )}
    </div>
  )
}
