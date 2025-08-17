import type { Endpoint } from 'payload'

interface LocationUpdateRequest {
  // Browser geolocation data
  latitude?: number
  longitude?: number
  accuracy?: number

  // Fallback flag
  useFallback?: boolean
}

// Reverse geocoding to get city/country from coordinates
async function reverseGeocode(
  lat: number,
  lon: number,
): Promise<{
  city?: string
  region?: string
  country?: string
  countryCode?: string
} | null> {
  try {
    // Using Nominatim (OpenStreetMap) - free and no API key required
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'payload-cms/1.0',
          Accept: 'application/json',
        },
      },
    )

    if (!response.ok) {
      throw new Error(`Reverse geocoding failed: ${response.status}`)
    }

    const data = await response.json()

    return {
      city: data.address?.city || data.address?.town || data.address?.village || 'Unknown',
      region: data.address?.state || data.address?.region || 'Unknown',
      country: data.address?.country || 'Unknown',
      countryCode: data.address?.country_code?.toUpperCase() || 'XX',
    }
  } catch (error) {
    console.error('Reverse geocoding error:', error)
    return null
  }
}

// IP geolocation using ipapi.co (free, no API key required)
async function getIPGeolocation(ip: string): Promise<{
  city: string
  region: string
  country: string
  countryCode: string
  timezone: string
  lat: number
  lon: number
} | null> {
  try {
    // Skip for localhost IPs
    if (ip === '::1' || ip === '127.0.0.1' || ip === 'unknown') {
      return null
    }

    const response = await fetch(`https://ipapi.co/${ip}/json/`, {
      headers: {
        'User-Agent': 'payload-cms/1.0',
        Accept: 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`IP geolocation failed: ${response.status}`)
    }

    const data = await response.json()

    // Check if we got an error response
    if (data.error) {
      console.warn('IP geolocation error:', data.reason)
      return null
    }

    return {
      city: data.city || 'Unknown',
      region: data.region || 'Unknown',
      country: data.country_name || 'Unknown',
      countryCode: data.country_code || 'XX',
      timezone: data.timezone || 'UTC',
      lat: data.latitude,
      lon: data.longitude,
    }
  } catch (error) {
    console.error('IP geolocation error:', error)
    return null
  }
}

export const updateLocation: Endpoint = {
  path: '/update-location',
  method: 'post',
  handler: async (req) => {
    const { payload, user } = req

    if (!user) {
      return Response.json({ error: 'Authentication required' }, { status: 401 })
    }

    let body: LocationUpdateRequest
    try {
      body = (await req.json?.()) || req.body
    } catch (e) {
      return Response.json({ error: 'Invalid request body' }, { status: 400 })
    }

    const { latitude, longitude, accuracy, useFallback } = body

    try {
      // Get user's IP address from headers
      const forwardedFor = req.headers.get('x-forwarded-for')
      const realIP = req.headers.get('x-real-ip')
      const cfConnectingIP = req.headers.get('cf-connecting-ip') // Cloudflare
      const trueClientIP = req.headers.get('true-client-ip') // Cloudflare Enterprise

      // Priority: CF headers > X-Forwarded-For > X-Real-IP
      const ip =
        cfConnectingIP || trueClientIP || forwardedFor?.split(',')[0].trim() || realIP || 'unknown'

      let locationData: any = {
        lastUpdated: new Date().toISOString(),
        ipAddress: ip,
      }

      // Try browser geolocation first
      if (latitude !== undefined && longitude !== undefined && !useFallback) {
        locationData.coordinates = [longitude, latitude]
        locationData.accuracy = accuracy
        locationData.source = 'browser'
        locationData.permissionGranted = true

        // Get city/country from coordinates
        const geocoded = await reverseGeocode(latitude, longitude)
        if (geocoded) {
          locationData.city = geocoded.city
          locationData.region = geocoded.region
          locationData.country = geocoded.country
          locationData.countryCode = geocoded.countryCode
        }
      }
      // Fallback to IP geolocation
      else if (ip !== 'unknown') {
        const ipGeo = await getIPGeolocation(ip)
        if (ipGeo) {
          locationData.coordinates = [ipGeo.lon, ipGeo.lat]
          locationData.city = ipGeo.city
          locationData.region = ipGeo.region
          locationData.country = ipGeo.country
          locationData.countryCode = ipGeo.countryCode
          locationData.timezone = ipGeo.timezone
          locationData.source = 'ip'
          locationData.permissionGranted = false
        } else {
          // If IP geolocation fails, set default values
          locationData.source = 'ip'
          locationData.permissionGranted = false
          locationData.city = 'Unknown'
          locationData.country = 'Unknown'
        }
      }

      // Get current user data
      let currentUser: any
      try {
        currentUser = await payload.findByID({
          collection: 'users',
          id: user.id,
        })
      } catch (error) {
        console.error('Failed to fetch user data:', error)
        return Response.json({ error: 'User not found' }, { status: 404 })
      }

      // Prepare location history entry if we have coordinates
      let updatedHistory = currentUser?.locationHistory || []

      if (locationData.coordinates) {
        const historyEntry = {
          coordinates: locationData.coordinates,
          city: locationData.city || 'Unknown',
          country: locationData.country || 'Unknown',
          source: locationData.source,
          timestamp: new Date().toISOString(),
        }

        // Only add to history if it's significantly different from the last entry
        const lastEntry = updatedHistory[0]
        const shouldAddToHistory = !lastEntry || 
          !lastEntry.coordinates ||
          Math.abs(lastEntry.coordinates[0] - locationData.coordinates[0]) > 0.001 || // ~100m difference
          Math.abs(lastEntry.coordinates[1] - locationData.coordinates[1]) > 0.001

        if (shouldAddToHistory) {
          updatedHistory = [
            historyEntry,
            ...(currentUser?.locationHistory || []).slice(0, 9), // Keep last 10
          ]
        }
      }

      // Update user with new location
      const updatedUser = await payload.update({
        collection: 'users',
        id: user.id,
        data: {
          location: locationData,
          locationHistory: updatedHistory,
        },
      })

      return Response.json(
        {
          success: true,
          message: 'Location updated successfully',
          data: {
            location: locationData,
            source: locationData.source,
          },
        },
        { status: 200 },
      )
    } catch (error: unknown) {
      console.error('Location update error:', error)
      return Response.json(
        {
          error: 'Failed to update location',
        },
        { status: 500 },
      )
    }
  },
}
