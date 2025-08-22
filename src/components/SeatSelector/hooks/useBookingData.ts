'use client'

import { useMemo } from 'react'
import useSWR from 'swr'
import type { Trip, BookedTicket } from '../types'
import { PERFORMANCE_CONFIG } from '../constants'

const fetchCache = new Map<string, { data: any; timestamp: number; promise?: Promise<any> }>()

const fetcher = async (url: string): Promise<any> => {
  const now = Date.now()
  const cached = fetchCache.get(url)

  if (cached && now - cached.timestamp < PERFORMANCE_CONFIG.FETCH_CACHE_TTL) {
    return cached.data
  }

  if (cached?.promise) {
    return cached.promise
  }

  const fetchPromise = (async () => {
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(errorText || `HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      fetchCache.set(url, { data, timestamp: now })
      return data
    } catch (error) {
      fetchCache.delete(url)
      throw error
    }
  })()

  fetchCache.set(url, { data: null, timestamp: now, promise: fetchPromise })
  return fetchPromise
}

interface UseBookingDataProps {
  tripId?: string
  travelDate?: string
  serverData?: {
    trip: Trip | null
    bookings: BookedTicket[]
  }
}

export const useBookingData = ({ tripId, travelDate, serverData }: UseBookingDataProps) => {
  const dateFilterQuery = useMemo(() => {
    if (!travelDate) return null

    try {
      const date = new Date(travelDate)
      if (isNaN(date.getTime())) return null

      const normalizedDate = new Date(date)
      normalizedDate.setUTCHours(0, 0, 0, 0)

      const startOfDay = new Date(normalizedDate)
      const endOfDay = new Date(normalizedDate)
      endOfDay.setUTCHours(23, 59, 59, 999)

      return `&where[date][greater_than_equal]=${startOfDay.toISOString()}&where[date][less_than_equal]=${endOfDay.toISOString()}`
    } catch (e) {
      console.error('Failed to create date filter:', e)
      return null
    }
  }, [travelDate])

  const {
    data: tripData,
    error: tripError,
    isLoading: tripLoading,
  } = useSWR<Trip>(
    // Don't make request if we have server data
    tripId && !serverData?.trip ? `/api/trip-schedules/${tripId}?depth=2` : null,
    fetcher,
    {
      fallbackData: serverData?.trip || undefined,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      revalidateIfStale: false, // Don't revalidate if we have server data
      dedupingInterval: serverData?.trip ? 60000 : 5000,
    },
  )

  // Create the SWR key even when we have server data, so mutate works
  const bookingsKey = useMemo(() => {
    if (!tripId || !travelDate || !dateFilterQuery) return null
    return `/api/tickets?where[trip][equals]=${tripId}${dateFilterQuery}&where[isCancelled][not_equals]=true&limit=1000&depth=2`
  }, [tripId, travelDate, dateFilterQuery])

  const {
    data: bookingsData,
    error: bookingsError,
    isLoading: bookingsLoading,
    mutate: mutateBookings,
  } = useSWR(bookingsKey, fetcher, {
    fallbackData: serverData?.bookings ? { docs: serverData.bookings } : undefined,
    revalidateOnMount: !serverData?.bookings, // Don't fetch on mount if we have server data
    revalidateOnFocus: !serverData?.bookings,
    refreshInterval: serverData?.bookings ? 30000 : 10000,
    revalidateIfStale: !serverData?.bookings, // Allow revalidation for mutations even with server data
    dedupingInterval: serverData?.bookings ? 5000 : 2000, // Shorter deduping to allow manual revalidation
  })

  const isLoading = tripLoading || (bookingsLoading && !!(tripId && travelDate))
  const error = tripError?.message || bookingsError?.message

  // Debug logging to ensure server data is being used
  if (process.env.NODE_ENV === 'development') {
    if (serverData?.bookings && serverData.bookings.length > 0 && bookingsData?.docs) {
      console.log('Server data bookings:', serverData.bookings.length)
      console.log('SWR bookings data:', bookingsData.docs.length)
    }
  }

  // Prioritize server data over SWR data to ensure immediate blocked seat visibility
  const finalTrip = useMemo(() => {
    return serverData?.trip || tripData || null
  }, [serverData?.trip, tripData])

  const finalBookings = useMemo(() => {
    // Always prefer server data if available
    if (serverData?.bookings && serverData.bookings.length >= 0) {
      return serverData.bookings
    }

    // Fall back to SWR data
    return bookingsData?.docs || []
  }, [bookingsData?.docs, serverData?.bookings])

  const finalIsLoading = useMemo(() => {
    // If we have server data, don't show loading
    if (serverData?.trip && serverData?.bookings) {
      return false
    }

    // Otherwise use SWR loading states
    return tripLoading || (bookingsLoading && !!(tripId && travelDate))
  }, [serverData?.trip, serverData?.bookings, tripLoading, bookingsLoading, tripId, travelDate])

  return {
    trip: finalTrip,
    bookings: finalBookings,
    isLoading: finalIsLoading,
    error,
    mutateBookings,
  }
}
