// useSeatSelector.ts - A custom hook for managing seat selection logic
'use client'

import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { useDocumentInfo, useField } from '@payloadcms/ui'
import type { BookedTicket, Trip, SeatStatus, Seat } from '../types'
import useSWR from 'swr'

/**
 * A generic authenticated fetcher using standard `fetch` API.
 * It's configured to send cookies with the request.
 * @param url - The URL to fetch data from.
 * @returns A Promise that resolves with the parsed JSON data.
 * @throws An error if the response is not OK.
 */
const fetcher = async (url: string): Promise<any> => {
  const response = await fetch(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  })

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`)
  }

  return response.json()
}

/**
 * Safely extracts a seat ID from various Payload data formats.
 * This handles nested objects and string IDs consistently.
 * @param seatData - The data item representing a seat.
 * @returns The extracted seat ID as a string, or null if not found.
 */
const extractSeatId = (seatData: any): string | null => {
  if (!seatData) return null
  if (typeof seatData === 'string') return seatData
  if (typeof seatData.seat === 'string') return seatData.seat
  if (typeof seatData.seat === 'object' && seatData.seat !== null) {
    return seatData.seat.id || seatData.seat._id || null
  }
  return seatData.id || seatData._id || seatData.seatId || null
}

/**
 * Defines the props for the useSeatSelector hook.
 */
interface UseSeatSelectorProps {
  /** The path to the array field in the Payload form. */
  path: string
  /** The ID of the selected trip. */
  tripId?: string
  /** The selected travel date. */
  travelDate?: string
}

/**
 * A custom hook to manage all state, data fetching, and business logic
 * for a seat selection UI component within Payload CMS.
 * It handles fetching trip data, existing bookings, and syncing
 * the user's selected seats with the form field value.
 *
 * @param {UseSeatSelectorProps} props - The hook's configuration.
 * @returns An object containing all necessary state and functions for the UI.
 */
export const useSeatSelector = ({ path, tripId, travelDate }: UseSeatSelectorProps) => {
  // --- 1. Core Hooks & Payload Form State ---
  // Get the ID of the document currently being edited.
  const { id: currentTicketId } = useDocumentInfo()
  // Use the useField hook for robust array field management.
  const { value: fieldValue, setValue: setFieldValue } = useField<any[]>({ path })

  // Ref to track if we're currently syncing to prevent infinite loops.
  const isSyncing = useRef(false)

  // --- 2. Local UI State ---
  const [localSelectedSeats, setLocalSelectedSeats] = useState<Set<string>>(new Set())

  // --- 3. Derived State from Form ---
  // Memoize the seat IDs from the form field to avoid recomputing on every render.
  const currentFormSeatIds = useMemo(() => {
    if (!fieldValue || !Array.isArray(fieldValue)) {
      return []
    }
    return fieldValue.map(extractSeatId).filter((id): id is string => id !== null)
  }, [fieldValue])

  // --- 4. Data Fetching with SWR ---
  // Fetch trip details. SWR key is null if tripId is not available.
  const tripSWR = useSWR(tripId ? `/api/trip-schedules/${tripId}?depth=2` : null, fetcher)

  // Memoize the date filter query for SWR.
  const dateFilterQuery = useMemo(() => {
    if (!travelDate) return null
    try {
      const startOfDay = new Date(travelDate)
      if (isNaN(startOfDay.getTime())) return null
      const endOfDay = new Date(travelDate)
      endOfDay.setDate(endOfDay.getDate() + 1)
      const startISO = startOfDay.toISOString()
      const endISO = endOfDay.toISOString()
      return `&where[date][greater_than_equal]=${startISO}&where[date][less_than]=${endISO}`
    } catch (e) {
      console.error('Failed to create date range query:', e)
      return null
    }
  }, [travelDate])

  // Fetch existing bookings for the selected trip and date.
  const bookingsSWR = useSWR(
    tripId && travelDate && dateFilterQuery
      ? `/api/tickets?where[trip][equals]=${tripId}${dateFilterQuery}&where[isCancelled][not_equals]=true&limit=1000&depth=2`
      : null,
    fetcher,
  )

  // --- 5. Synchronization Logic ---
  // Effect to initialize the local state when the form field value changes.
  useEffect(() => {
    // Only initialize if we are not currently syncing from local state to the form.
    if (!isSyncing.current) {
      console.log('Initializing local state from form:', currentFormSeatIds)
      setLocalSelectedSeats(new Set(currentFormSeatIds))
    }
  }, [currentFormSeatIds])

  // Effect to sync local state back to the form field with a debounce.
  useEffect(() => {
    const timeout = setTimeout(() => {
      const localSeatIds = Array.from(localSelectedSeats)
      const formSeatIds = currentFormSeatIds

      // Check if the local state and form field value are different.
      const isDifferent =
        localSeatIds.length !== formSeatIds.length ||
        !localSeatIds.every((id) => formSeatIds.includes(id))

      if (isDifferent && !isSyncing.current) {
        console.log('Syncing local state to form:', localSeatIds)
        isSyncing.current = true

        // Format the value as expected by the array field.
        const newValue = localSeatIds.map((seatId) => ({ seat: seatId }))

        // Update the form field via the useField hook.
        setFieldValue(newValue)

        // Reset sync state after a small delay.
        setTimeout(() => (isSyncing.current = false), 100)
      }
    }, 200) // Debounce for 200ms

    // Cleanup function to clear the timeout.
    return () => clearTimeout(timeout)
  }, [localSelectedSeats, currentFormSeatIds, setFieldValue])

  // --- 6. Reset State on Dependency Change ---
  // Reset selected seats when the trip or date changes.
  useEffect(() => {
    console.log('Trip or date changed, resetting local state')
    setLocalSelectedSeats(new Set())
  }, [tripId, travelDate])

  // --- 7. Memoized Data Processing ---
  // Create a map of booked seats for quick lookup.
  const allBookedSeatsMap = useMemo(() => {
    const map = new Map<string, BookedTicket>()
    if (!bookingsSWR.data?.docs || !Array.isArray(bookingsSWR.data.docs)) {
      return map
    }
    bookingsSWR.data.docs.forEach((ticket: BookedTicket) => {
      if (ticket.id === currentTicketId || ticket.isCancelled) {
        return
      }
      const bookedSeats = ticket.bookedSeats || []
      if (!Array.isArray(bookedSeats)) return
      bookedSeats.forEach((seatData) => {
        const seatId = extractSeatId(seatData)
        if (seatId) {
          map.set(seatId, ticket)
        }
      })
    })
    return map
  }, [bookingsSWR.data, currentTicketId])

  // Create a set of seats already part of the current ticket.
  const currentTicketSeatSet = useMemo(() => {
    const set = new Set<string>()
    const ticket = bookingsSWR.data?.docs?.find((t: BookedTicket) => t.id === currentTicketId)
    if (ticket?.bookedSeats) {
      ticket.bookedSeats.forEach((seatData: Seat) => {
        const seatId = extractSeatId(seatData)
        if (seatId) {
          set.add(seatId)
        }
      })
    }
    return set
  }, [bookingsSWR.data, currentTicketId])

  // --- 8. Business Logic & Callbacks ---
  const getSeatStatus = useCallback(
    (seatId: string): SeatStatus => {
      if (localSelectedSeats.has(seatId)) return 'selected'
      if (currentTicketSeatSet.has(seatId)) return 'current-ticket'
      const booking = allBookedSeatsMap.get(seatId)
      if (booking) {
        return booking.isPaid ? 'booked' : 'unpaid'
      }
      return 'available'
    },
    [localSelectedSeats, currentTicketSeatSet, allBookedSeatsMap],
  )

  const getBookingForSeat = useCallback(
    (seatId: string): BookedTicket | undefined => allBookedSeatsMap.get(seatId),
    [allBookedSeatsMap],
  )

  const toggleSeat = useCallback((seatId: string) => {
    setLocalSelectedSeats((prev) => {
      const newSet = new Set(prev)
      newSet.has(seatId) ? newSet.delete(seatId) : newSet.add(seatId)
      return newSet
    })
  }, [])

  const removeSeat = useCallback((seatId: string) => {
    setLocalSelectedSeats((prev) => {
      const newSet = new Set(prev)
      newSet.delete(seatId)
      return newSet
    })
  }, [])

  const clearAll = useCallback(() => setLocalSelectedSeats(new Set()), [])

  const gridDimensions = useMemo(() => {
    const seats = tripSWR.data?.bus?.type?.seats
    if (!seats || seats.length === 0) return { rows: 1, cols: 1 }

    try {
      // Calculate the maximum row index (row + rowSpan - 1)
      const maxRowIndex = Math.max(
        1,
        ...seats.map((s: Seat) => s.position.row + (s.size?.rowSpan || 1)),
      )
      // Calculate the maximum column index (col + colSpan - 1)
      const maxColIndex = Math.max(
        1,
        ...seats.map((s: Seat) => s.position.col + (s.size?.colSpan || 1)),
      )

      return {
        // The number of rows is the max grid line reached, minus 1.
        // E.g., if max line is 5, it means rows 1, 2, 3, 4 (4 rows).
        rows: maxRowIndex - 1, // Corrected line
        cols: maxColIndex - 1,
      }
    } catch (error) {
      console.error('Error calculating grid dimensions:', error)
      return { rows: 1, cols: 1 }
    }
  }, [tripSWR.data])

  const isLoading = tripSWR.isLoading || (bookingsSWR.isLoading && !!(tripId && travelDate))
  const error = tripSWR.error || bookingsSWR.error

  // --- 10. Return Value ---
  return {
    trip: tripSWR.data as Trip,
    loading: isLoading,
    error: error ? error.message || 'An unknown error occurred' : undefined,
    gridDimensions,
    selectedSeats: Array.from(localSelectedSeats),
    getSeatStatus,
    getBookingForSeat,
    toggleSeat,
    removeSeat,
    clearAll,
  }
}
