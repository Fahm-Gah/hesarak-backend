import { redirect } from 'next/navigation'
import { BookingSuccessClient } from './page.client'
import { getMeUser } from '@/utils/getMeUser'
import { getServerSideURL } from '@/utils/getURL'
import type { BookingData } from './components/types'

export const dynamic = 'force-dynamic'

interface BookingSuccessPageProps {
  searchParams: Promise<{
    ticketId?: string
  }>
}

// Server-side data fetching function
async function fetchTicketDetails(ticketId: string, token?: string) {
  try {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }

    if (token) {
      headers.Authorization = `JWT ${token}`
    }

    const response = await fetch(`${getServerSideURL()}/api/ticket-details/${ticketId}`, {
      headers,
      cache: 'no-store', // Always fetch fresh data
    })

    if (!response.ok) {
      console.error(`Failed to fetch ticket details: ${response.status}`)
      return null
    }

    const result = await response.json()
    if (!result.success) {
      console.error('Ticket fetch error:', result.error)
      return null
    }

    return result.data as BookingData
  } catch (error) {
    console.error('Error fetching ticket details:', error)
    return null
  }
}

export default async function BookingSuccessPage({ searchParams }: BookingSuccessPageProps) {
  const { ticketId } = await searchParams

  // Check authentication
  let user
  let token
  try {
    const authResult = await getMeUser()
    user = authResult.user
    token = authResult.token
  } catch (error) {
    const redirectUrl = ticketId ? `/booking-success?ticketId=${ticketId}` : '/booking-success'
    const loginUrl = `/auth/login?redirect=${encodeURIComponent(redirectUrl)}`
    redirect(loginUrl)
  }

  // Fetch ticket details if ticketId is provided
  let serverBookingData: BookingData | null = null
  if (ticketId) {
    serverBookingData = await fetchTicketDetails(ticketId, token)

    if (!serverBookingData) {
      // Could be an invalid/expired ticket or access denied
      console.log('Failed to fetch server data for ticket:', ticketId)
    }
  }

  return (
    <BookingSuccessClient
      user={user as any}
      ticketId={ticketId}
      initialBookingData={serverBookingData}
    />
  )
}

// Generate metadata for the page
export async function generateMetadata({ searchParams }: BookingSuccessPageProps) {
  const { ticketId } = await searchParams

  if (!ticketId) {
    return {
      title: 'Booking Confirmed - Hesarakbus',
      description:
        'Your bus ticket has been successfully booked. View your ticket details and booking information.',
    }
  }

  // Try to get user info for metadata (but don't block if not available)
  let token
  try {
    const authResult = await getMeUser()
    token = authResult.token
  } catch {
    // User not authenticated, return basic metadata
    return {
      title: 'Booking Details - Hesarakbus',
      description: 'View your booking details and ticket information.',
    }
  }

  const ticketDetails = await fetchTicketDetails(ticketId, token)

  return {
    title: ticketDetails
      ? `Ticket ${ticketDetails.ticketNumber} - ${ticketDetails.trip.name} | Hesarakbus`
      : 'Booking Details - Hesarakbus',
    description: ticketDetails
      ? `Your booking for ${ticketDetails.trip.name} - Ticket #${ticketDetails.ticketNumber}`
      : 'View your booking details and ticket information.',
  }
}
