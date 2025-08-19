'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { User as PayloadUser, Profile } from '@/payload-types'
import { convertGregorianToPersianDisplay } from '@/utils/dateUtils'
import {
  BookingHeader,
  TicketCard,
  TripDetails,
  PassengerInfo,
  PaymentInfo,
  ImportantInfo,
  ActionButtons,
  type BookingData,
} from './components'

interface User extends PayloadUser {
  profile?: Profile | null
}

interface BookingSuccessClientProps {
  user: User
  ticketId?: string
  initialBookingData?: BookingData | null
}

export const BookingSuccessClient = ({
  user,
  ticketId,
  initialBookingData,
}: BookingSuccessClientProps) => {
  const router = useRouter()
  const [bookingData, setBookingData] = useState<BookingData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Helper function to get properly formatted travel date
  const getTravelDate = (bookingData: BookingData): string => {
    // Try originalDate first
    if (bookingData.booking.originalDate) {
      // Check if it's already in proper Persian format (YYYY/MM/DD with 4-digit year)
      if (
        bookingData.booking.originalDate.includes('/') &&
        bookingData.booking.originalDate.length >= 8
      ) {
        const parts = bookingData.booking.originalDate.split('/')
        if (parts.length === 3 && parts[0].length === 4) {
          return bookingData.booking.originalDate
        }
      }

      // Convert Gregorian to Persian
      return convertGregorianToPersianDisplay(bookingData.booking.originalDate)
    }

    // Fallback to date field
    if (bookingData.booking.date) {
      return convertGregorianToPersianDisplay(bookingData.booking.date)
    }

    return 'Unknown Date'
  }

  // Helper function to format payment deadline
  const formatPaymentDeadline = (deadline: string): { date: string; time: string } => {
    try {
      const date = new Date(deadline)
      const persianDate = convertGregorianToPersianDisplay(deadline.split('T')[0])
      const time = date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      })
      return { date: persianDate, time }
    } catch (error) {
      console.error('Error formatting payment deadline:', error)
      return { date: deadline, time: '' }
    }
  }

  // Function to fetch ticket data from server as fallback
  const fetchTicketFromServer = async (ticketId: string) => {
    try {
      const response = await fetch(`/api/ticket-details/${ticketId}`, {
        credentials: 'include', // Ensure cookies are sent
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const result = await response.json()

      if (response.ok && result.success) {
        setBookingData(result.data)

        // Clear storage since we now have server data
        setTimeout(() => {
          sessionStorage.removeItem('bookingResult')
          localStorage.removeItem(`bookingResult_${ticketId}`)
        }, 100)
      } else {
        console.error('Server fetch failed - Status:', response.status, 'Error:', result.error)
        if (response.status === 401) {
          setError('Please log in to view your ticket details')
        } else if (response.status === 403) {
          setError('You do not have permission to view this ticket')
        } else if (response.status === 404) {
          setError('Ticket not found')
        } else {
          setError(result.error || 'Failed to load ticket information')
        }
      }
    } catch (err) {
      console.error('Error fetching from server:', err)
      setError('Network error: Failed to load ticket information')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    // Prevent double execution by tracking if we've already loaded data
    if (bookingData || !isLoading) return

    let mounted = true // Track if component is still mounted

    const loadBookingData = () => {
      try {
        // If we have server data, use it immediately
        if (initialBookingData && mounted) {
          setBookingData(initialBookingData)
          setIsLoading(false)

          // Clear any storage since server data is authoritative
          setTimeout(() => {
            sessionStorage.removeItem('bookingResult')
            if (ticketId) {
              localStorage.removeItem(`bookingResult_${ticketId}`)
            }
          }, 100)
          return
        }

        // If we have a ticketId but no server data, try client fetch
        if (ticketId && mounted) {
          // Check storage for immediate display while server loads
          const storedData =
            sessionStorage.getItem('bookingResult') ||
            localStorage.getItem(`bookingResult_${ticketId}`)

          if (storedData) {
            const data = JSON.parse(storedData) as BookingData
            setBookingData(data)
          }

          // Fetch from server as fallback
          fetchTicketFromServer(ticketId)
          return
        }

        // Fallback to storage if no ticketId
        let storedData = sessionStorage.getItem('bookingResult')

        if (storedData && mounted) {
          const data = JSON.parse(storedData) as BookingData
          setBookingData(data)
          setIsLoading(false)

          // Clear storage after use
          setTimeout(() => {
            sessionStorage.removeItem('bookingResult')
          }, 100)
        } else if (mounted) {
          setError('No booking data found. Please try booking again.')
          setIsLoading(false)
        }
      } catch (err) {
        console.error('Error reading booking data:', err)
        if (mounted) {
          setError('Failed to load booking information.')
          setIsLoading(false)
        }
      }
    }

    loadBookingData()

    // Cleanup function to prevent state updates if component unmounts
    return () => {
      mounted = false
    }
  }, [ticketId, initialBookingData]) // Include initialBookingData to react to server data

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your booking details...</p>
        </div>
      </div>
    )
  }

  if (error || !bookingData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center">
        <div className="max-w-lg mx-auto p-6 sm:p-8">
          <BookingHeader
            status="error"
            title="Booking Information Not Found"
            description={error || 'Unable to load booking details.'}
          />
          <ActionButtons status="error" />
        </div>
      </div>
    )
  }

  // Handle cancelled tickets
  if (bookingData.status.isCancelled) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <BookingHeader
            status="cancelled"
            title="Ticket Cancelled"
            description="This ticket has been cancelled by the administration. Your booking is no longer valid."
          />

          <TicketCard bookingData={bookingData} status="cancelled" getTravelDate={getTravelDate}>
            <TripDetails
              bookingData={bookingData}
              getTravelDate={getTravelDate}
              status="cancelled"
            />
            <PassengerInfo bookingData={bookingData} status="cancelled" />
          </TicketCard>

          <ImportantInfo bookingData={bookingData} status="cancelled" />

          <ActionButtons status="cancelled" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <BookingHeader
          status="success"
          title="Booking Confirmed!"
          description="Your ticket has been successfully booked. Here are your booking details:"
        />

        <TicketCard bookingData={bookingData} status="success" getTravelDate={getTravelDate}>
          <TripDetails bookingData={bookingData} getTravelDate={getTravelDate} status="success" />
          <PassengerInfo bookingData={bookingData} status="success" />
          <PaymentInfo
            bookingData={bookingData}
            formatPaymentDeadline={formatPaymentDeadline}
            status="success"
          />
        </TicketCard>

        <ImportantInfo bookingData={bookingData} status="success" />

        <ActionButtons status="success" />
      </div>
    </div>
  )
}
