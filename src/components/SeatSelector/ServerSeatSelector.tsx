import { Suspense } from 'react'
import { headers, cookies } from 'next/headers'
import { SeatSelectorClient } from './index'
import type { Trip, BookedTicket } from './types'
import { calculateGridDimensions, processBookings } from './lib/seatCalculations'

interface ServerSeatSelectorProps {
  tripId: string
  travelDate: string
  onSeatSelect?: (seatIds: string[]) => void
  selectedSeats?: string[]
  readOnly?: boolean
}

async function fetchSeatData(tripId: string, travelDate: string) {
  try {
    const cookieStore = await cookies()
    const headersList = await headers()

    // Get the base URL from headers
    const host = headersList.get('host')
    const protocol = headersList.get('x-forwarded-proto') || 'http'
    const baseUrl = `${protocol}://${host}`

    // Create cookie header for authentication
    const cookieHeader = cookieStore.toString()

    // Create date filter for bookings
    const date = new Date(travelDate)
    const startOfDay = new Date(date)
    startOfDay.setUTCHours(0, 0, 0, 0)
    const endOfDay = new Date(date)
    endOfDay.setUTCHours(23, 59, 59, 999)

    // Parallel data fetching on the server
    const [tripResponse, bookingsResponse] = await Promise.allSettled([
      fetch(`${baseUrl}/api/trip-schedules/${tripId}?depth=2`, {
        headers: {
          Cookie: cookieHeader,
          'Content-Type': 'application/json',
        },
        cache: 'no-store', // Always fetch fresh data for seat availability
      }),
      fetch(
        `${baseUrl}/api/tickets?where[trip][equals]=${tripId}&where[date][greater_than_equal]=${startOfDay.toISOString()}&where[date][less_than_equal]=${endOfDay.toISOString()}&where[isCancelled][not_equals]=true&limit=1000&depth=2`,
        {
          headers: {
            Cookie: cookieHeader,
            'Content-Type': 'application/json',
          },
          cache: 'no-store', // Always fetch fresh seat booking data
        },
      ),
    ])

    let trip: Trip | null = null
    let bookings: BookedTicket[] = []

    // Process trip data
    if (tripResponse.status === 'fulfilled' && tripResponse.value.ok) {
      trip = await tripResponse.value.json()
    } else if (tripResponse.status === 'fulfilled') {
      console.warn(
        'Failed to fetch trip:',
        tripResponse.value.status,
        tripResponse.value.statusText,
      )
    }

    // Process bookings data
    if (bookingsResponse.status === 'fulfilled' && bookingsResponse.value.ok) {
      const bookingsData = await bookingsResponse.value.json()
      bookings = bookingsData.docs || []

      // Debug logging for server-side bookings
      if (process.env.NODE_ENV === 'development') {
        console.log('Server fetched bookings:', bookings.length)
        if (bookings.length > 0) {
          console.log('Sample booking:', {
            id: bookings[0].id,
            isPaid: bookings[0].isPaid,
            isCancelled: bookings[0].isCancelled,
            seats: bookings[0].bookedSeats?.length || 0,
          })
        }
      }
    } else if (bookingsResponse.status === 'fulfilled') {
      console.warn(
        'Failed to fetch bookings:',
        bookingsResponse.value.status,
        bookingsResponse.value.statusText,
      )
    }

    return { trip, bookings, error: null }
  } catch (err) {
    console.error('Server-side seat data fetch error:', err)
    // Don't throw - gracefully degrade to client-side fetching
    return {
      trip: null,
      bookings: [],
      error: err instanceof Error ? err.message : 'Failed to fetch seat data',
    }
  }
}

export async function ServerSeatSelector({
  tripId,
  travelDate,
  onSeatSelect,
  selectedSeats = [],
  readOnly = false,
}: ServerSeatSelectorProps) {
  const { trip, bookings, error } = await fetchSeatData(tripId, travelDate)

  // Pre-compute server-side calculations for better performance
  const gridDimensions = calculateGridDimensions(trip)
  const { hasExpiredTickets } = processBookings(bookings)

  return (
    <Suspense
      fallback={
        <div className="seat-selector-wrapper">
          <div className="seat-selector__container">
            <div className="seat-selector__grid-wrapper">
              <div className="seat-selector-loading">
                <div className="seat-selector__loading-skeleton" />
                Loading seat map...
              </div>
            </div>
          </div>
        </div>
      }
    >
      <SeatSelectorClient
        path="seats"
        readOnly={readOnly}
        serverData={{
          trip,
          bookings,
          error,
          tripId,
          travelDate,
          gridDimensions,
          hasExpiredTickets,
        }}
        onSeatSelect={onSeatSelect}
        initialSelectedSeats={selectedSeats}
      />
    </Suspense>
  )
}

export default ServerSeatSelector
