'use client'

import { useMemo, useCallback, useEffect, useRef } from 'react'
import type { Trip, BookedTicket, SeatStatus } from '../types'
import { useBookingData } from './useBookingData'
import { useSeatFormState } from './useSeatFormState'
import { useSeatAnimations } from './useSeatAnimations'
import {
  calculateGridDimensions,
  processBookings,
  getSeatStatus as calcSeatStatus,
  getBookingStatus as calcBookingStatus,
} from '../lib/seatCalculations'

type BookingStatus = 'available' | 'booked' | 'unpaid' | 'currentTicket'

interface UseSeatSelectorProps {
  path: unknown
  tripId?: string
  travelDate?: string
  serverData?: {
    trip: Trip | null
    bookings: BookedTicket[]
    error: string | null
    tripId: string
    travelDate: string
    gridDimensions?: { rows: number; cols: number }
    hasExpiredTickets?: boolean
  }
  onSeatSelect?: (seatIds: string[]) => void
  initialSelectedSeats?: string[]
}

interface UseSeatSelectorReturn {
  trip: Trip | null
  loading: boolean
  error: string | undefined
  gridDimensions: { rows: number; cols: number }
  selectedSeats: string[]
  isFormProcessing: boolean
  getSeatStatus: (seatId: string) => SeatStatus
  getBookingStatus: (seatId: string) => BookingStatus
  getIsSelected: (seatId: string) => boolean
  getJustUpdated: (seatId: string) => boolean
  getBookingForSeat: (seatId: string) => BookedTicket | undefined
  toggleSeat: (seatId: string) => void
  removeSeat: (seatId: string) => void
  clearAll: () => void
  isTicketExpired: boolean
  revalidateBookings: () => Promise<void>
}

export const useSeatSelector = ({
  path: rawPath,
  tripId,
  travelDate,
  serverData,
  onSeatSelect,
  initialSelectedSeats,
}: UseSeatSelectorProps): UseSeatSelectorReturn => {
  const path = String(rawPath)

  // Data fetching
  const { trip, bookings, isLoading, error, mutateBookings } = useBookingData({
    tripId,
    travelDate,
    serverData: serverData
      ? {
          trip: serverData.trip,
          bookings: serverData.bookings,
        }
      : undefined,
  })

  // Animation state
  const { getJustUpdated, markSeatAsUpdated } = useSeatAnimations()

  // Use a ref to store the form submission callback
  const formSubmissionCallbackRef = useRef<(() => Promise<void>) | null>(null)

  // Form state management
  const {
    currentTicketId,
    selectedSeats,
    isProcessing: formIsProcessing,
    toggleSeat: formToggleSeat,
    removeSeat: formRemoveSeat,
    clearAll: formClearAll,
  } = useSeatFormState({
    path,
    tripId,
    travelDate,
    onSeatSelect,
    initialSelectedSeats,
    onFormSubmitted: () => {
      if (formSubmissionCallbackRef.current) {
        formSubmissionCallbackRef.current()
      }
    },
  })

  // Enhanced form submission callback to revalidate booking data
  const handleFormSubmitted = useCallback(async () => {
    try {
      console.log('Form submission detected, revalidating booking data...', {
        formIsProcessing,
        selectedSeatsCount: selectedSeats.length,
      })

      // Trigger SWR revalidation to get fresh booking data
      await mutateBookings()

      // Visual updates will happen automatically when the booking data changes
      // through the booking change detection mechanism
    } catch (err) {
      console.error('Failed to revalidate booking data after form submission:', err)
    }
  }, [mutateBookings, formIsProcessing, selectedSeats.length])

  // Update the ref when the callback changes
  useEffect(() => {
    formSubmissionCallbackRef.current = handleFormSubmitted
  }, [handleFormSubmitted])

  // Calculate grid dimensions (use server pre-computed if available)
  const gridDimensions = useMemo(
    () => serverData?.gridDimensions || calculateGridDimensions(trip),
    [serverData?.gridDimensions, trip],
  )

  // Process booking data (use server pre-computed if available)
  const { allBookedSeatsMap, currentTicketOriginalSeats, hasExpiredTickets } = useMemo(() => {
    // Debug logging for server data usage
    if (process.env.NODE_ENV === 'development') {
      if (serverData?.bookings && serverData.bookings.length > 0) {
        console.log('Processing server bookings data immediately:', serverData.bookings.length)
      }
      if (bookings && bookings.length > 0) {
        console.log('Processing bookings data:', bookings.length)
      }
    }

    const processed = processBookings(bookings || [], String(currentTicketId))
    return {
      ...processed,
      hasExpiredTickets: serverData?.hasExpiredTickets ?? processed.hasExpiredTickets,
    }
  }, [bookings, currentTicketId, serverData?.hasExpiredTickets])

  // Seat status calculations
  const getSeatStatus = useCallback(
    (seatId: string): SeatStatus =>
      calcSeatStatus(
        seatId,
        allBookedSeatsMap,
        currentTicketOriginalSeats,
        selectedSeats,
        String(currentTicketId),
      ),
    [allBookedSeatsMap, currentTicketOriginalSeats, selectedSeats, currentTicketId],
  )

  const getBookingStatus = useCallback(
    (seatId: string): BookingStatus =>
      calcBookingStatus(
        seatId,
        allBookedSeatsMap,
        currentTicketOriginalSeats,
        String(currentTicketId),
      ),
    [allBookedSeatsMap, currentTicketOriginalSeats, currentTicketId],
  )

  const getIsSelected = useCallback(
    (seatId: string): boolean => selectedSeats.includes(seatId),
    [selectedSeats],
  )

  const getBookingForSeat = useCallback(
    (seatId: string): BookedTicket | undefined => allBookedSeatsMap.get(seatId),
    [allBookedSeatsMap],
  )

  // Enhanced actions with animations
  const toggleSeat = useCallback(
    (seatId: string) => {
      formToggleSeat(seatId)
      markSeatAsUpdated(seatId)
    },
    [formToggleSeat, markSeatAsUpdated],
  )

  const removeSeat = useCallback(
    (seatId: string) => {
      formRemoveSeat(seatId)
      markSeatAsUpdated(seatId)
    },
    [formRemoveSeat, markSeatAsUpdated],
  )

  const clearAll = useCallback(() => {
    const seatsToAnimate = [...selectedSeats] // Copy current selection
    formClearAll()
    seatsToAnimate.forEach((seatId) => markSeatAsUpdated(seatId))
  }, [selectedSeats, markSeatAsUpdated, formClearAll])

  // Track previous booking count to detect changes
  const prevBookingCountRef = useRef(bookings?.length || 0)

  // Enhanced revalidation method
  const revalidateBookings = useCallback(async () => {
    try {
      console.log('Revalidating booking data...')
      await mutateBookings()

      // Don't force animations here - let the booking data change detection handle it naturally
      // The visual updates will happen automatically when the data actually changes
    } catch (err) {
      console.error('Failed to refresh booking data:', err)
    }
  }, [mutateBookings])

  // Track previous booking data to detect specific seat changes
  const prevBookingsRef = useRef<BookedTicket[]>([])

  // Monitor booking data changes to detect when specific seats change status
  useEffect(() => {
    const currentBookingCount = bookings?.length || 0
    const prevBookingCount = prevBookingCountRef.current

    // If booking count changed and we're not loading, something was saved
    if (currentBookingCount !== prevBookingCount && !isLoading && prevBookingCount > 0) {
      console.log('Booking count changed:', prevBookingCount, '->', currentBookingCount)

      // Only animate seats that were previously selected and are now booked
      // Get the newly booked seats (difference between current and previous bookings)
      const prevBookedSeatIds = new Set<string>()
      prevBookingsRef.current?.forEach((booking) => {
        booking.bookedSeats?.forEach((seatData: any) => {
          const seatId =
            seatData?.seat?.id ||
            seatData?.seat?._id ||
            seatData?.seat ||
            seatData?.id ||
            seatData?._id
          if (seatId) prevBookedSeatIds.add(seatId)
        })
      })

      const currentBookedSeatIds = new Set<string>()
      bookings?.forEach((booking: any) => {
        booking.bookedSeats?.forEach((seatData: any) => {
          const seatId =
            seatData?.seat?.id ||
            seatData?.seat?._id ||
            seatData?.seat ||
            seatData?.id ||
            seatData?._id
          if (seatId) currentBookedSeatIds.add(seatId)
        })
      })

      // Only animate seats that are newly booked (not in previous set but in current set)
      currentBookedSeatIds.forEach((seatId) => {
        if (!prevBookedSeatIds.has(seatId)) {
          markSeatAsUpdated(seatId)
        }
      })
    }

    // Update refs
    prevBookingCountRef.current = currentBookingCount
    prevBookingsRef.current = [...(bookings || [])] // Create a copy
  }, [bookings, isLoading, markSeatAsUpdated])

  return {
    trip,
    loading: isLoading,
    error: serverData?.error || error,
    gridDimensions,
    selectedSeats,
    isFormProcessing: formIsProcessing,
    getSeatStatus,
    getBookingStatus,
    getIsSelected,
    getJustUpdated,
    getBookingForSeat,
    toggleSeat,
    removeSeat,
    clearAll,
    isTicketExpired: hasExpiredTickets,
    revalidateBookings,
  }
}
