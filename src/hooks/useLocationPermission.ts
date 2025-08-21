'use client'

import { useState, useEffect } from 'react'

interface UseLocationPermissionReturn {
  shouldShowLocationPrompt: boolean
  isCheckingPermission: boolean
  permissionState: 'unknown' | 'granted' | 'denied' | 'prompt'
}

export const useLocationPermission = (): UseLocationPermissionReturn => {
  const [shouldShowLocationPrompt, setShouldShowLocationPrompt] = useState(false)
  const [isCheckingPermission, setIsCheckingPermission] = useState(true)
  const [permissionState, setPermissionState] = useState<
    'unknown' | 'granted' | 'denied' | 'prompt'
  >('unknown')

  useEffect(() => {
    const checkLocationPermission = async () => {
      try {
        // Check if geolocation is supported and secure context
        if (!navigator.geolocation || !window.isSecureContext) {
          setPermissionState('denied')
          setShouldShowLocationPrompt(false)
          setIsCheckingPermission(false)
          return
        }

        // Check current permission state using Permissions API
        if ('permissions' in navigator) {
          try {
            const permission = await navigator.permissions.query({ name: 'geolocation' })
            setPermissionState(permission.state)

            // Only show prompt if permission is in 'prompt' state (never asked before)
            if (permission.state === 'prompt') {
              setShouldShowLocationPrompt(true)
            } else {
              setShouldShowLocationPrompt(false)
            }

            // Listen for permission changes
            permission.addEventListener('change', () => {
              setPermissionState(permission.state)
              if (permission.state !== 'prompt') {
                setShouldShowLocationPrompt(false)
              }
            })
          } catch (permissionError) {
            // Permissions API might not support geolocation query in some browsers
            console.log('Permissions API not available for geolocation:', permissionError)

            // Fallback: Try to detect if permission was previously denied by attempting a quick check
            navigator.geolocation.getCurrentPosition(
              () => {
                // Permission granted
                setPermissionState('granted')
                setShouldShowLocationPrompt(false)
              },
              (error) => {
                if (error.code === error.PERMISSION_DENIED) {
                  setPermissionState('denied')
                  setShouldShowLocationPrompt(false)
                } else {
                  // Likely in prompt state or other error
                  setPermissionState('prompt')
                  setShouldShowLocationPrompt(true)
                }
              },
              { timeout: 1000, maximumAge: Infinity },
            )
          }
        } else {
          // Very old browser - assume we should ask
          setPermissionState('prompt')
          setShouldShowLocationPrompt(true)
        }
      } catch (error) {
        console.log('Error checking location permission:', error)
        setPermissionState('unknown')
        setShouldShowLocationPrompt(false)
      } finally {
        setIsCheckingPermission(false)
      }
    }

    checkLocationPermission()
  }, [])

  return {
    shouldShowLocationPrompt,
    isCheckingPermission,
    permissionState,
  }
}
