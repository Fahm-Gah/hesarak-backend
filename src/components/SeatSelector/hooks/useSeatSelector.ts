'use client'

import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { useDocumentInfo, useField, useFormModified, useFormSubmitted } from '@payloadcms/ui'
import type { BookedTicket, Trip, SeatStatus, Seat, SeatFieldValue } from '../types'
import useSWR from 'swr'

/**
 * Generic authenticated fetcher for Payload API
 */
const fetcher = async (url: string): Promise<any> => {
  const response = await fetch(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(errorText || `HTTP ${response.status}: ${response.statusText}`)
  }

  return response.json()
}

/**
 * Safely extracts a seat ID from various Payload data formats
 */
const extractSeatId = (seatData: any): string | null => {
  if (!seatData) return null
  if (typeof seatData === 'string') return seatData

  if (typeof seatData === 'object') {
    if (seatData.seat) {
      if (typeof seatData.seat === 'string') return seatData.seat
      if (typeof seatData.seat === 'object') {
        return seatData.seat.id || seatData.seat._id || null
      }
    }
    return seatData.id || seatData._id || seatData.seatId || null
  }

  return null
}

type BookingStatus = 'available' | 'booked' | 'unpaid' | 'current-ticket'

interface UseSeatSelectorProps {
  path: unknown
  tripId?: string
  travelDate?: string
}

interface UseSeatSelectorReturn {
  trip: Trip | null
  loading: boolean
  error: string | undefined
  gridDimensions: { rows: number; cols: number }
  selectedSeats: string[]
  getSeatStatus: (seatId: string) => SeatStatus
  getBookingStatus: (seatId: string) => BookingStatus
  getIsSelected: (seatId: string) => boolean
  getJustUpdated: (seatId: string) => boolean
  getBookingForSeat: (seatId: string) => BookedTicket | undefined
  toggleSeat: (seatId: string) => void
  removeSeat: (seatId: string) => void
  clearAll: () => void
}

/**
 * Custom hook to manage seat selection state and business logic
 */
export const useSeatSelector = ({
  path: rawPath,
  tripId,
  travelDate,
}: UseSeatSelectorProps): UseSeatSelectorReturn => {
  const path = String(rawPath)

  // Core Payload hooks
  const { id: currentTicketId, lastUpdateTime, savedDocumentData } = useDocumentInfo()
  const { value: fieldValue, setValue: setFieldValue } = useField<any>({ path })
  const isModified = useFormModified()
  const isSubmitted = useFormSubmitted()

  // Track recently updated seats for visual feedback
  const [recentlyUpdatedSeats, setRecentlyUpdatedSeats] = useState<Set<string>>(new Set())
  const updateTimeoutRef = useRef<Map<string, NodeJS.Timeout>>(new Map())

  // Track the last saved state to detect changes
  const lastSavedStateRef = useRef<{
    lastUpdateTime?: number
    savedSeats?: string[]
    isSubmitted?: boolean
  }>({})

  // Extract seat IDs from current form field value
  const currentFormSeatIds = useMemo(() => {
    const fieldValueTyped = fieldValue as SeatFieldValue
    if (!fieldValueTyped) return []

    let seatsArray: any[] = []

    if (Array.isArray(fieldValueTyped)) {
      seatsArray = fieldValueTyped
    } else if (fieldValueTyped?.seats && Array.isArray(fieldValueTyped.seats)) {
      seatsArray = fieldValueTyped.seats
    } else if (typeof fieldValueTyped === 'object') {
      const arrayProps = Object.values(fieldValueTyped).filter(Array.isArray)
      if (arrayProps.length > 0) {
        seatsArray = arrayProps[0] as any[]
      }
    }

    return seatsArray.map(extractSeatId).filter((id): id is string => id !== null)
  }, [fieldValue])

  // Build date filter query for API
  const dateFilterQuery = useMemo(() => {
    if (!travelDate) return null

    try {
      const date = new Date(travelDate)
      if (isNaN(date.getTime())) return null

      const startOfDay = new Date(date)
      startOfDay.setUTCHours(0, 0, 0, 0)

      const endOfDay = new Date(date)
      endOfDay.setUTCHours(23, 59, 59, 999)

      return `&where[date][greater_than_equal]=${startOfDay.toISOString()}&where[date][less_than]=${endOfDay.toISOString()}`
    } catch (e) {
      console.error('Failed to create date filter:', e)
      return null
    }
  }, [travelDate])

  // Data fetching
  const {
    data: tripData,
    error: tripError,
    isLoading: tripLoading,
  } = useSWR<Trip>(tripId ? `/api/trip-schedules/${tripId}?depth=2` : null, fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  })

  const {
    data: bookingsData,
    error: bookingsError,
    isLoading: bookingsLoading,
    mutate: mutateBookings,
  } = useSWR(
    tripId && travelDate && dateFilterQuery
      ? `/api/tickets?where[trip][equals]=${tripId}${dateFilterQuery}&where[isCancelled][not_equals]=true&limit=1000&depth=2`
      : null,
    fetcher,
    {
      revalidateOnFocus: true,
      refreshInterval: 30000,
    },
  )

  // Helper function to mark seat as recently updated
  const markSeatAsUpdated = useCallback((seatId: string) => {
    setRecentlyUpdatedSeats((prev) => new Set(prev).add(seatId))

    // Clear any existing timeout for this seat
    const existingTimeout = updateTimeoutRef.current.get(seatId)
    if (existingTimeout) {
      clearTimeout(existingTimeout)
    }

    // Set new timeout to remove the update indicator
    const newTimeout = setTimeout(() => {
      setRecentlyUpdatedSeats((prev) => {
        const newSet = new Set(prev)
        newSet.delete(seatId)
        return newSet
      })
      updateTimeoutRef.current.delete(seatId)
    }, 600) // Match animation duration

    updateTimeoutRef.current.set(seatId, newTimeout)
  }, [])

  // Extract saved seats from savedDocumentData
  const savedSeatIds = useMemo(() => {
    if (!savedDocumentData?.bookedSeats) return []

    const bookedSeats = savedDocumentData.bookedSeats
    if (!Array.isArray(bookedSeats)) return []

    return bookedSeats.map(extractSeatId).filter((id): id is string => id !== null)
  }, [savedDocumentData])

  // Detect when document has been saved and refresh bookings
  useEffect(() => {
    const hasDocumentChanged =
      // Check if lastUpdateTime has changed
      (lastUpdateTime && lastUpdateTime !== lastSavedStateRef.current.lastUpdateTime) ||
      // Check if saved seats have changed
      JSON.stringify(savedSeatIds) !== JSON.stringify(lastSavedStateRef.current.savedSeats) ||
      // Check if form was just submitted (saved)
      (isSubmitted && !lastSavedStateRef.current.isSubmitted && !isModified)

    if (hasDocumentChanged) {
      console.log('Document save detected. Refreshing booking data...')

      // Update our tracking ref
      lastSavedStateRef.current = {
        lastUpdateTime,
        savedSeats: savedSeatIds,
        isSubmitted,
      }

      // Force a re-fetch of the bookings data
      mutateBookings()
        .then(() => {
          console.log('Booking data refreshed successfully.')
          // Mark all currently selected seats for visual feedback
          currentFormSeatIds.forEach((seatId) => markSeatAsUpdated(seatId))
        })
        .catch((err) => {
          console.error('Failed to refresh booking data after save:', err)
        })
    }
  }, [
    lastUpdateTime,
    savedSeatIds,
    isSubmitted,
    isModified,
    mutateBookings,
    currentFormSeatIds,
    markSeatAsUpdated,
  ])

  // Also refresh when the form transitions from modified to unmodified (indicates a save)
  const wasModifiedRef = useRef(isModified)
  useEffect(() => {
    if (wasModifiedRef.current && !isModified) {
      console.log('Form transitioned from modified to unmodified. Refreshing booking data...')
      mutateBookings()
        .then(() => {
          currentFormSeatIds.forEach((seatId) => markSeatAsUpdated(seatId))
        })
        .catch((err) => {
          console.error('Failed to refresh booking data:', err)
        })
    }
    wasModifiedRef.current = isModified
  }, [isModified, mutateBookings, currentFormSeatIds, markSeatAsUpdated])

  // Process booked seats and identify current ticket seats
  const { allBookedSeatsMap, currentTicketOriginalSeats } = useMemo(() => {
    const map = new Map<string, BookedTicket>()
    const originalSeats = new Set<string>()

    if (!bookingsData?.docs || !Array.isArray(bookingsData.docs)) {
      return { allBookedSeatsMap: map, currentTicketOriginalSeats: originalSeats }
    }

    bookingsData.docs.forEach((ticket: BookedTicket) => {
      const bookedSeats = ticket.bookedSeats || []
      if (!Array.isArray(bookedSeats)) return

      bookedSeats.forEach((seatData) => {
        const seatId = extractSeatId(seatData)
        if (!seatId) return

        if (ticket.id === currentTicketId) {
          originalSeats.add(seatId)
        } else if (!ticket.isCancelled) {
          map.set(seatId, ticket)
        }
      })
    })

    return { allBookedSeatsMap: map, currentTicketOriginalSeats: originalSeats }
  }, [bookingsData, currentTicketId])

  // Calculate grid dimensions
  const gridDimensions = useMemo(() => {
    const seats = tripData?.bus?.type?.seats
    if (!seats || seats.length === 0) return { rows: 1, cols: 1 }

    try {
      const maxRow = Math.max(
        ...seats.map((s: Seat) => s.position.row + (s.size?.rowSpan || 1) - 1),
      )
      const maxCol = Math.max(
        ...seats.map((s: Seat) => s.position.col + (s.size?.colSpan || 1) - 1),
      )

      return { rows: maxRow, cols: maxCol }
    } catch (error) {
      console.error('Error calculating grid dimensions:', error)
      return { rows: 10, cols: 4 }
    }
  }, [tripData])

  // SEPARATED: Booking status (for icons/punch holes) - NEVER CHANGES
  const getBookingStatus = useCallback(
    (seatId: string): BookingStatus => {
      const booking = allBookedSeatsMap.get(seatId)
      if (booking) {
        return booking.isPaid ? 'booked' : 'unpaid'
      }

      if (currentTicketId && currentTicketOriginalSeats.has(seatId)) {
        return 'current-ticket'
      }

      return 'available'
    },
    [allBookedSeatsMap, currentTicketOriginalSeats, currentTicketId],
  )

  // SEPARATED: Selection status (for colors only)
  const getIsSelected = useCallback(
    (seatId: string): boolean => {
      return currentFormSeatIds.includes(seatId)
    },
    [currentFormSeatIds],
  )

  // SEPARATED: Recently updated status (for visual feedback)
  const getJustUpdated = useCallback(
    (seatId: string): boolean => {
      return recentlyUpdatedSeats.has(seatId)
    },
    [recentlyUpdatedSeats],
  )

  // SEPARATED: Combined status (for styling/colors)
  const getSeatStatus = useCallback(
    (seatId: string): SeatStatus => {
      const bookingStatus = getBookingStatus(seatId)
      const isSelected = getIsSelected(seatId)

      if (bookingStatus === 'booked' || bookingStatus === 'unpaid') {
        return bookingStatus
      }

      if (isSelected) {
        return 'selected'
      }

      if (bookingStatus === 'current-ticket') {
        return 'current-ticket'
      }

      return 'available'
    },
    [getBookingStatus, getIsSelected],
  )

  const getBookingForSeat = useCallback(
    (seatId: string): BookedTicket | undefined => {
      return allBookedSeatsMap.get(seatId)
    },
    [allBookedSeatsMap],
  )

  const toggleSeat = useCallback(
    (seatId: string) => {
      const newSelectedSeats = new Set(currentFormSeatIds)
      if (newSelectedSeats.has(seatId)) {
        newSelectedSeats.delete(seatId)
      } else {
        newSelectedSeats.add(seatId)
      }

      const newValue = Array.from(newSelectedSeats).map((id) => ({ seat: id }))
      setFieldValue(newValue)

      markSeatAsUpdated(seatId)
    },
    [currentFormSeatIds, setFieldValue, markSeatAsUpdated],
  )

  const removeSeat = useCallback(
    (seatId: string) => {
      const newSelectedSeats = new Set(currentFormSeatIds)
      newSelectedSeats.delete(seatId)

      const newValue = Array.from(newSelectedSeats).map((id) => ({ seat: id }))
      setFieldValue(newValue)

      markSeatAsUpdated(seatId)
    },
    [currentFormSeatIds, setFieldValue, markSeatAsUpdated],
  )

  const clearAll = useCallback(() => {
    currentFormSeatIds.forEach((seatId) => markSeatAsUpdated(seatId))
    setFieldValue([])
  }, [currentFormSeatIds, setFieldValue, markSeatAsUpdated])

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      updateTimeoutRef.current.forEach((timeout) => clearTimeout(timeout))
      updateTimeoutRef.current.clear()
    }
  }, [])

  // Determine loading and error states
  const isLoading = tripLoading || (bookingsLoading && !!(tripId && travelDate))
  const error = tripError?.message || bookingsError?.message

  return {
    trip: tripData || null,
    loading: isLoading,
    error,
    gridDimensions,
    selectedSeats: currentFormSeatIds,
    getSeatStatus,
    getBookingStatus,
    getIsSelected,
    getJustUpdated,
    getBookingForSeat,
    toggleSeat,
    removeSeat,
    clearAll,
  }
}
