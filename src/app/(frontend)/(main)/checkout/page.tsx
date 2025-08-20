import { notFound, redirect } from 'next/navigation'
import { CheckoutClient } from './page.client'
import { getMeUser } from '@/utils/getMeUser'
import { getServerSideURL } from '@/utils/getURL'

export const dynamic = 'force-dynamic'

interface CheckoutPageProps {
  searchParams: Promise<{
    tripId?: string
    date?: string
    seats?: string
    from?: string // User's boarding terminal ID
    to?: string // User's destination terminal ID
    fromProvince?: string // User's original search province
    toProvince?: string // User's original search province
  }>
}

// Server-side data fetching function
async function fetchTripDetails(
  tripId: string,
  date: string,
  from?: string,
  to?: string,
  token?: string,
) {
  try {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }

    if (token) {
      headers.Authorization = `JWT ${token}`
    }

    // Build URL with optional from/to parameters
    let url = `${getServerSideURL()}/api/trips/${tripId}/date/${encodeURIComponent(date)}`
    const params = new URLSearchParams()
    if (from) params.append('from', from)
    if (to) params.append('to', to)
    if (params.toString()) {
      url += `?${params.toString()}`
    }

    const response = await fetch(url, {
      headers,
      cache: 'no-store', // Always fetch fresh data for checkout
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch trip details: ${response.status}`)
    }

    const result = await response.json()
    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch trip details')
    }

    return result.data
  } catch (error) {
    console.error('Error fetching trip details:', error)
    return null
  }
}

export default async function CheckoutPage({ searchParams }: CheckoutPageProps) {
  const { tripId, date, seats, from, to, fromProvince, toProvince } = await searchParams

  // Validate required parameters
  if (!tripId || !date || !seats) {
    notFound()
  }

  // Parse and validate seat IDs
  const seatIds = seats.split(',').filter(Boolean)
  if (seatIds.length === 0 || seatIds.length > 2) {
    notFound()
  }

  // Check authentication
  let user
  let token
  try {
    const authResult = await getMeUser()
    user = authResult.user
    token = authResult.token
  } catch (error) {
    // Build complete checkout URL with all parameters
    const checkoutParams = new URLSearchParams()
    checkoutParams.append('tripId', tripId)
    checkoutParams.append('date', date)
    checkoutParams.append('seats', seats)
    if (from) checkoutParams.append('from', from)
    if (to) checkoutParams.append('to', to)
    if (fromProvince) checkoutParams.append('fromProvince', fromProvince)
    if (toProvince) checkoutParams.append('toProvince', toProvince)

    const loginUrl = `/auth/login?redirect=${encodeURIComponent(`/checkout?${checkoutParams.toString()}`)}`
    redirect(loginUrl)
  }

  // Fetch trip details with authentication and user's specific from/to terminals
  const tripDetails = await fetchTripDetails(tripId, date, from, to, token)
  if (!tripDetails) {
    notFound()
  }

  // Validate booking limits for authenticated users
  if (tripDetails.userBookingInfo) {
    const { canBookMoreSeats, remainingSeatsAllowed } = tripDetails.userBookingInfo

    if (!canBookMoreSeats) {
      // User has exceeded booking limits, redirect back to trip page with error
      const tripParams = new URLSearchParams()
      tripParams.append('date', date)
      tripParams.append('error', 'booking_limit_exceeded')
      if (from) tripParams.append('from', from)
      if (to) tripParams.append('to', to)
      if (fromProvince) tripParams.append('fromProvince', fromProvince)
      if (toProvince) tripParams.append('toProvince', toProvince)

      const tripUrl = `/trip/${tripId}?${tripParams.toString()}`
      redirect(tripUrl)
    }

    if (seatIds.length > remainingSeatsAllowed) {
      // User is trying to book more seats than allowed
      const tripParams = new URLSearchParams()
      tripParams.append('date', date)
      tripParams.append('error', 'too_many_seats')
      if (from) tripParams.append('from', from)
      if (to) tripParams.append('to', to)
      if (fromProvince) tripParams.append('fromProvince', fromProvince)
      if (toProvince) tripParams.append('toProvince', toProvince)

      const tripUrl = `/trip/${tripId}?${tripParams.toString()}`
      redirect(tripUrl)
    }
  }

  // Validate that the seats exist in the trip layout
  const validSeatIds = seatIds.filter((seatId) =>
    tripDetails.busLayout?.some((element: any) => element.id === seatId && element.type === 'seat'),
  )

  if (validSeatIds.length !== seatIds.length) {
    notFound()
  }

  // Get selected seat details
  const selectedSeats = tripDetails.busLayout
    .filter((element: any) => element.type === 'seat' && validSeatIds.includes(element.id))
    .map((seat: any) => ({
      id: seat.id,
      seatNumber: seat.seatNumber,
      isBooked: seat.isBooked || false,
    }))

  // Check if any selected seats are already booked
  const hasBookedSeats = selectedSeats.some((seat: any) => seat.isBooked)
  if (hasBookedSeats) {
    // Redirect back to trip details with error
    const tripParams = new URLSearchParams()
    tripParams.append('date', date)
    tripParams.append('error', 'seats_unavailable')
    if (from) tripParams.append('from', from)
    if (to) tripParams.append('to', to)
    if (fromProvince) tripParams.append('fromProvince', fromProvince)
    if (toProvince) tripParams.append('toProvince', toProvince)

    redirect(`/trip/${tripId}?${tripParams.toString()}`)
  }

  return (
    <CheckoutClient
      user={user as any}
      tripDetails={tripDetails}
      selectedSeats={selectedSeats}
      originalSearchParams={{
        tripId,
        date,
        seats,
        fromProvince,
        toProvince,
      }}
    />
  )
}

// Generate metadata for the page
export async function generateMetadata({ searchParams }: CheckoutPageProps) {
  const { tripId, date, from, to } = await searchParams

  if (!tripId || !date) {
    return {
      title: 'Checkout - Hesaarak',
    }
  }

  const tripDetails = await fetchTripDetails(tripId, date, from, to)

  return {
    title: tripDetails
      ? `Checkout - ${tripDetails.from.name} to ${tripDetails.to?.name} | Hesaarak`
      : 'Checkout - Hesaarak',
    description: tripDetails
      ? `Complete your booking for ${tripDetails.from.name} to ${tripDetails.to?.name} on ${tripDetails.originalDate}`
      : 'Complete your bus ticket booking',
  }
}
