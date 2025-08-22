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

type BookingStatus = 'available' | 'booked' | 'unpaid' | 'currentTicket'

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

  // Track component mount state to prevent memory leaks
  const isMountedRef = useRef(true)

  // Track previous trip/date to detect changes - but normalized
  const previousTripIdRef = useRef<string | undefined>(tripId)
  const previousNormalizedDateRef = useRef<string>('')

  // Flag to prevent clearing during save operations
  const saveInProgressRef = useRef(false)
  const clearTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Reset mounted state on each render
  useEffect(() => {
    isMountedRef.current = true
  })

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

  // Helper to normalize dates for comparison (ignore time/timezone differences)
  const normalizeDateForComparison = useCallback((date: string | undefined): string => {
    if (!date) return ''
    try {
      const d = new Date(date)
      if (isNaN(d.getTime())) return ''
      // Return just the date part: YYYY-MM-DD
      return d.toISOString().split('T')[0]
    } catch {
      return ''
    }
  }, [])

  // Track when save is in progress
  useEffect(() => {
    // When form is submitted and modified, save is starting
    if (isSubmitted && isModified) {
      saveInProgressRef.current = true
      console.log('Save in progress - preventing seat clearing')
    }

    // When form is submitted but not modified, save is complete
    if (isSubmitted && !isModified) {
      // Keep the flag true for a bit longer to handle async updates
      setTimeout(() => {
        saveInProgressRef.current = false
        console.log('Save complete - re-enabling seat clearing')
      }, 1000)
    }
  }, [isSubmitted, isModified])

  // CRITICAL FIX: Clear seats when trip or date ACTUALLY changes
  useEffect(() => {
    // Clear any pending timeout
    if (clearTimeoutRef.current) {
      clearTimeout(clearTimeoutRef.current)
    }

    // Normalize the current date for comparison
    const normalizedCurrentDate = normalizeDateForComparison(travelDate)

    // Check for actual changes
    const tripChanged =
      tripId !== previousTripIdRef.current && previousTripIdRef.current !== undefined
    const dateChanged =
      normalizedCurrentDate !== previousNormalizedDateRef.current &&
      previousNormalizedDateRef.current !== ''

    // Log for debugging
    if (tripChanged || dateChanged) {
      console.log('Detected trip/date change:', {
        tripChanged,
        dateChanged,
        oldTrip: previousTripIdRef.current,
        newTrip: tripId,
        oldNormalizedDate: previousNormalizedDateRef.current,
        newNormalizedDate: normalizedCurrentDate,
        saveInProgress: saveInProgressRef.current,
        isSubmitted,
        isModified,
        seatsCount: currentFormSeatIds.length,
      })
    }

    // Only clear if:
    // 1. There's an actual change in trip or date
    // 2. We have seats selected
    // 3. Save is not in progress
    // 4. This isn't an initial load
    if (
      (tripChanged || dateChanged) &&
      currentFormSeatIds.length > 0 &&
      !saveInProgressRef.current
    ) {
      // Debounce the clear action to avoid multiple triggers
      clearTimeoutRef.current = setTimeout(() => {
        // Double-check that save is still not in progress
        if (!saveInProgressRef.current && isMountedRef.current) {
          console.log('Clearing selected seats due to trip/date change')

          // Clear the selected seats
          setFieldValue([])

          // Clear any visual feedback
          setRecentlyUpdatedSeats(new Set())

          // Clear all pending timeouts
          updateTimeoutRef.current.forEach((timeout) => clearTimeout(timeout))
          updateTimeoutRef.current.clear()
        }
      }, 100) // Small delay to handle rapid updates
    }

    // Update refs for next comparison
    previousTripIdRef.current = tripId
    previousNormalizedDateRef.current = normalizedCurrentDate
  }, [tripId, travelDate, setFieldValue, currentFormSeatIds.length, normalizeDateForComparison])

  // Build date filter query for API
  const dateFilterQuery = useMemo(() => {
    if (!travelDate) return null

    try {
      const date = new Date(travelDate)
      if (isNaN(date.getTime())) return null

      // Normalize the input date to midnight UTC (matching your backend)
      const normalizedDate = new Date(date)
      normalizedDate.setUTCHours(0, 0, 0, 0)

      // Create the range for the entire day
      const startOfDay = new Date(normalizedDate)
      const endOfDay = new Date(normalizedDate)
      endOfDay.setUTCHours(23, 59, 59, 999)

      return `&where[date][greater_than_equal]=${startOfDay.toISOString()}&where[date][less_than_equal]=${endOfDay.toISOString()}`
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
    if (!isMountedRef.current) return

    setRecentlyUpdatedSeats((prev) => new Set(prev).add(seatId))

    const existingTimeout = updateTimeoutRef.current.get(seatId)
    if (existingTimeout) {
      clearTimeout(existingTimeout)
    }

    const newTimeout = setTimeout(() => {
      if (isMountedRef.current) {
        setRecentlyUpdatedSeats((prev) => {
          const newSet = new Set(prev)
          newSet.delete(seatId)
          return newSet
        })
      }
      updateTimeoutRef.current.delete(seatId)
    }, 600)

    updateTimeoutRef.current.set(seatId, newTimeout)
  }, [])

  // Extract saved seats from savedDocumentData
  const savedSeatIds = useMemo(() => {
    if (!savedDocumentData?.bookedSeats) return []

    const bookedSeats = savedDocumentData.bookedSeats
    if (!Array.isArray(bookedSeats)) return []

    return bookedSeats.map(extractSeatId).filter((id): id is string => id !== null)
  }, [savedDocumentData])

  // Safe async operation wrapper
  const safeAsyncOperation = useCallback((operation: () => Promise<void>, errorMessage: string) => {
    if (!isMountedRef.current) return

    operation().catch((err) => {
      if (isMountedRef.current) {
        console.error(errorMessage, err)
      }
    })
  }, [])

  // Detect when document has been saved and refresh bookings
  useEffect(() => {
    const hasDocumentChanged =
      (lastUpdateTime && lastUpdateTime !== lastSavedStateRef.current.lastUpdateTime) ||
      JSON.stringify(savedSeatIds) !== JSON.stringify(lastSavedStateRef.current.savedSeats) ||
      (isSubmitted && !lastSavedStateRef.current.isSubmitted && !isModified)

    if (hasDocumentChanged && isMountedRef.current) {
      console.log('Document save detected. Refreshing booking data...', {
        savedSeats: savedSeatIds,
        currentFormSeats: currentFormSeatIds,
      })

      lastSavedStateRef.current = {
        lastUpdateTime,
        savedSeats: savedSeatIds,
        isSubmitted,
      }

      // Restore seats if they were cleared incorrectly
      if (savedSeatIds.length > 0 && currentFormSeatIds.length === 0) {
        console.log('Restoring saved seats to form after save')
        const restoredValue = savedSeatIds.map((id) => ({ seat: id }))
        setFieldValue(restoredValue)
      }

      safeAsyncOperation(async () => {
        await mutateBookings()
        console.log('Booking data refreshed successfully.')
        if (isMountedRef.current) {
          const seatsToMark = currentFormSeatIds.length > 0 ? currentFormSeatIds : savedSeatIds
          seatsToMark.forEach((seatId) => markSeatAsUpdated(seatId))
        }
      }, 'Failed to refresh booking data after save:')
    }
  }, [
    lastUpdateTime,
    savedSeatIds,
    isSubmitted,
    isModified,
    mutateBookings,
    currentFormSeatIds,
    markSeatAsUpdated,
    safeAsyncOperation,
    setFieldValue,
  ])

  // Refresh when form transitions from modified to unmodified
  const wasModifiedRef = useRef(isModified)
  useEffect(() => {
    if (wasModifiedRef.current && !isModified && isMountedRef.current) {
      console.log('Form transitioned from modified to unmodified. Refreshing booking data...')

      safeAsyncOperation(async () => {
        await mutateBookings()
        if (isMountedRef.current) {
          currentFormSeatIds.forEach((seatId) => markSeatAsUpdated(seatId))
        }
      }, 'Failed to refresh booking data:')
    }
    wasModifiedRef.current = isModified
  }, [isModified, mutateBookings, currentFormSeatIds, markSeatAsUpdated, safeAsyncOperation])

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

      // Check if ticket is expired
      const isExpired = (() => {
        if (!ticket.paymentDeadline || ticket.isPaid || ticket.isCancelled) {
          return false
        }
        try {
          const deadline = new Date(ticket.paymentDeadline)
          const now = new Date()
          return !isNaN(deadline.getTime()) && deadline < now
        } catch {
          return false
        }
      })()

      bookedSeats.forEach((seatData) => {
        const seatId = extractSeatId(seatData)
        if (!seatId) return

        if (ticket.id === currentTicketId) {
          originalSeats.add(seatId)
        } else if (!ticket.isCancelled && !isExpired) {
          // Only block seats for non-cancelled and non-expired tickets
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

  // Booking status (for icons/punch holes)
  const getBookingStatus = useCallback(
    (seatId: string): BookingStatus => {
      const booking = allBookedSeatsMap.get(seatId)
      if (booking) {
        return booking.isPaid ? 'booked' : 'unpaid'
      }

      if (currentTicketId && currentTicketOriginalSeats.has(seatId)) {
        return 'currentTicket'
      }

      return 'available'
    },
    [allBookedSeatsMap, currentTicketOriginalSeats, currentTicketId],
  )

  // Selection status
  const getIsSelected = useCallback(
    (seatId: string): boolean => {
      return currentFormSeatIds.includes(seatId)
    },
    [currentFormSeatIds],
  )

  // Recently updated status
  const getJustUpdated = useCallback(
    (seatId: string): boolean => {
      return recentlyUpdatedSeats.has(seatId)
    },
    [recentlyUpdatedSeats],
  )

  // Combined status (for styling/colors)
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

      if (bookingStatus === 'currentTicket') {
        return 'currentTicket'
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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false

      if (clearTimeoutRef.current) {
        clearTimeout(clearTimeoutRef.current)
      }

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
