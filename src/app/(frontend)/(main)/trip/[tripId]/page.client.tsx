'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Breadcrumbs } from '@/app/(frontend)/components/Breadcrumbs'
import { SeatLayout } from '../components/SeatLayout'
import { TripInfo } from '../components/TripInfo'
import { BookingSummary } from '../components/BookingSummary'
import { Phone } from 'lucide-react'
import toast from 'react-hot-toast'

interface BusLayoutElement {
  id: string
  type: 'seat' | 'wc' | 'driver' | 'door'
  seatNumber?: string
  position: {
    row: number
    col: number
  }
  size?: {
    rowSpan: number
    colSpan: number
  }
  isBooked?: boolean
  isBookedByCurrentUser?: boolean
  isPaid?: boolean
}

interface TripDetails {
  id: string
  name: string
  price: number
  departureTime: string
  arrivalTime: string | null
  duration: string | null
  searchDate: string
  originalDate: string
  from: {
    id: string
    name: string
    province: string
    address?: string
  }
  to: {
    id: string
    name: string
    province: string
    address?: string
  } | null
  bus: {
    id: string
    number: string
    images: Array<{
      id: string
      url: string
      filename: string
      alt: string
      width: number
      height: number
    }>
    type: {
      id: string
      name: string
      capacity: number
      amenities: { amenity: string }[]
    }
  }
  busLayout: BusLayoutElement[]
  seatAvailability: {
    totalSeats: number
    availableSeats: number
    bookedSeats: number
  }
  stops: Array<{
    terminal: {
      id: string
      name: string
      province: string
      address?: string
    }
    time: string
    isDestination: boolean
  }>
  userBookingInfo?: {
    canBookMoreSeats: boolean
    remainingSeatsAllowed: number
    totalBookedSeats: number
    maxSeatsPerUser: number
  } | null
  userJourney?: {
    boardingTerminal: {
      id: string
      name: string
      province: string
      address?: string
    }
    boardingTime: string
    destinationTerminal: {
      id: string
      name: string
      province: string
      address?: string
    } | null
    arrivalTime: string | null
    duration: string | null
  }
  originalTrip?: {
    from: {
      id: string
      name: string
      province: string
      address?: string
    }
    departureTime: string
    isUserBoardingAtMainTerminal: boolean
  }
}

interface User {
  id: string
  email?: string | null
  username?: string
  profile?: any
}

interface TripDetailsClientProps {
  tripDetails: TripDetails
  user: User | null
  isAuthenticated: boolean
  initialError?: string | null
  originalSearchParams?: {
    fromProvince?: string
    toProvince?: string
    date?: string
  }
}

export const TripDetailsClient = ({
  tripDetails,
  user,
  isAuthenticated,
  initialError,
  originalSearchParams,
}: TripDetailsClientProps) => {
  const router = useRouter()
  const [selectedSeats, setSelectedSeats] = useState<string[]>([])
  const [isBookingLoading, setIsBookingLoading] = useState(false)


  // Handle initial error from URL parameters
  useEffect(() => {
    if (initialError) {
      switch (initialError) {
        case 'booking_limit_exceeded':
          toast.error(
            'You have already booked the maximum number of seats allowed for this trip. Please manage your existing bookings if you need to make changes.',
          )
          break
        case 'too_many_seats':
          toast.error('You are trying to book more seats than allowed for this trip.')
          break
        default:
          toast.error('An error occurred while processing your booking.')
      }
      setSelectedSeats([]) // Clear any selected seats
    }
  }, [initialError])

  // Only clear selected seats if user can't book more, but don't show error message automatically
  useEffect(() => {
    if (
      isAuthenticated &&
      tripDetails.userBookingInfo &&
      !tripDetails.userBookingInfo.canBookMoreSeats &&
      !initialError
    ) {
      setSelectedSeats([]) // Clear any selected seats silently
    }
  }, [isAuthenticated, tripDetails.userBookingInfo, initialError])

  // Calculate if user can select more seats
  // Default to 2 seats if userBookingInfo is not available (for unauthenticated users or when API doesn't return it)
  const maxAllowedSeats = tripDetails.userBookingInfo?.remainingSeatsAllowed ?? 2
  const canBookMoreSeats = tripDetails.userBookingInfo?.canBookMoreSeats ?? true
  // Allow seat selection for both authenticated and unauthenticated users
  const canSelectMoreSeats = canBookMoreSeats && selectedSeats.length < maxAllowedSeats

  const handleSeatSelect = useCallback(
    (seatId: string) => {
      setSelectedSeats((prev) => {
        const isCurrentlySelected = prev.includes(seatId)

        if (isCurrentlySelected) {
          // Deselect seat
          return prev.filter((id) => id !== seatId)
        } else {
          // Check if user can book more seats at all
          if (
            isAuthenticated &&
            tripDetails.userBookingInfo &&
            !tripDetails.userBookingInfo.canBookMoreSeats
          ) {
            toast.error(
              'You have already booked the maximum number of seats allowed for this trip.',
            )
            return prev
          }

          // Check if user can select more seats
          const maxSeats = tripDetails.userBookingInfo?.remainingSeatsAllowed ?? 2
          if (prev.length >= maxSeats) {
            toast.error(`You can only select up to ${maxSeats} seats`)
            return prev
          }

          // Select seat
          return [...prev, seatId]
        }
      })
    },
    [isAuthenticated, tripDetails.userBookingInfo?.remainingSeatsAllowed],
  )

  const handleClearSelection = useCallback(() => {
    setSelectedSeats([])
    toast.success('Selection cleared')
  }, [])

  const handleProceedToBooking = useCallback(async () => {
    if (selectedSeats.length === 0) {
      toast.error('Please select at least one seat')
      return
    }

    // Check if authenticated user can book the selected number of seats
    if (isAuthenticated && tripDetails.userBookingInfo) {
      const { canBookMoreSeats, remainingSeatsAllowed } = tripDetails.userBookingInfo

      if (!canBookMoreSeats) {
        toast.error('You have already booked the maximum number of seats allowed for this trip.')
        return
      }

      if (selectedSeats.length > remainingSeatsAllowed) {
        toast.error(
          `You can only book ${remainingSeatsAllowed} more seat${remainingSeatsAllowed === 1 ? '' : 's'} for this trip.`,
        )
        return
      }
    }

    setIsBookingLoading(true)

    try {
      if (!isAuthenticated) {
        // Create checkout URL with selected seats and trip details - use originalDate to maintain Persian format
        const checkoutParams = new URLSearchParams()
        checkoutParams.append('tripId', tripDetails.id)
        checkoutParams.append('date', tripDetails.originalDate)
        checkoutParams.append('seats', selectedSeats.join(','))
        // Include user's specific from/to terminals
        checkoutParams.append('from', tripDetails.from.id)
        if (tripDetails.to) {
          checkoutParams.append('to', tripDetails.to.id)
        }

        // Also include original search parameters for breadcrumb navigation
        if (originalSearchParams?.fromProvince) {
          checkoutParams.append('fromProvince', originalSearchParams.fromProvince)
        }
        if (originalSearchParams?.toProvince) {
          checkoutParams.append('toProvince', originalSearchParams.toProvince)
        }

        const checkoutUrl = `/checkout?${checkoutParams.toString()}`
        const loginUrl = '/auth/login?redirect=' + encodeURIComponent(checkoutUrl)
        router.push(loginUrl)
      } else {
        // Navigate directly to checkout for authenticated users - use originalDate to maintain Persian format
        const checkoutParams = new URLSearchParams()
        checkoutParams.append('tripId', tripDetails.id)
        checkoutParams.append('date', tripDetails.originalDate)
        checkoutParams.append('seats', selectedSeats.join(','))
        // Include user's specific from/to terminals
        checkoutParams.append('from', tripDetails.from.id)
        if (tripDetails.to) {
          checkoutParams.append('to', tripDetails.to.id)
        }

        // Also include original search parameters for breadcrumb navigation
        if (originalSearchParams?.fromProvince) {
          checkoutParams.append('fromProvince', originalSearchParams.fromProvince)
        }
        if (originalSearchParams?.toProvince) {
          checkoutParams.append('toProvince', originalSearchParams.toProvince)
        }

        const checkoutUrl = `/checkout?${checkoutParams.toString()}`
        router.push(checkoutUrl)
      }
    } catch (err) {
      console.error('Booking error:', err)
      toast.error('Failed to proceed with booking. Please try again.')
      setIsBookingLoading(false)
    }
  }, [
    isAuthenticated,
    selectedSeats,
    router,
    tripDetails.id,
    tripDetails.originalDate,
    tripDetails.userBookingInfo,
  ])

  // Build search URL with original search parameters to maintain search context
  // Use original search provinces if available, otherwise fall back to terminal provinces
  const searchFromProvince = originalSearchParams?.fromProvince || tripDetails.from.province
  const searchToProvince = originalSearchParams?.toProvince || tripDetails.to?.province || ''
  const searchDate = originalSearchParams?.date || tripDetails.originalDate

  const searchUrl = `/search?from=${encodeURIComponent(searchFromProvince)}&to=${encodeURIComponent(searchToProvince)}&date=${encodeURIComponent(searchDate)}`

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Search Results', href: searchUrl },
    { label: 'Trip Details' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Breadcrumbs */}
        <div className="mb-6">
          <Breadcrumbs items={breadcrumbItems} />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Left Column - Trip Info */}
          <div className="xl:col-span-2">
            <TripInfo tripDetails={tripDetails} />
          </div>

          {/* Right Column - Seat Selection and Booking Summary */}
          <div className="xl:col-span-1 space-y-6">
            {/* Seat Selection */}
            <SeatLayout
              busLayout={tripDetails.busLayout}
              selectedSeats={selectedSeats}
              onSeatSelect={handleSeatSelect}
              canSelectMoreSeats={canSelectMoreSeats}
              maxSeatsAllowed={Math.max(maxAllowedSeats, 1)}
              currentSelectedCount={selectedSeats.length}
              isAuthenticated={isAuthenticated}
              seatAvailability={tripDetails.seatAvailability}
            />

            {/* Booking Summary */}
            <div className="sticky top-6">
              <BookingSummary
                tripDetails={tripDetails}
                busLayout={tripDetails.busLayout}
                selectedSeats={selectedSeats}
                userBookingInfo={tripDetails.userBookingInfo || null}
                isAuthenticated={isAuthenticated}
                onProceedToBooking={handleProceedToBooking}
                onClearSelection={handleClearSelection}
                isLoading={isBookingLoading}
              />
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="mt-8 bg-gradient-to-br from-white via-orange-50/20 to-red-50/20 rounded-3xl shadow-xl border border-orange-200/50 p-8 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-2 h-8 bg-gradient-to-b from-orange-500 to-red-500 rounded-full"></div>
            <h3 className="text-xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              Important Information
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gradient-to-r from-orange-50/80 via-white/90 to-red-50/80 rounded-2xl p-6 border border-orange-200/30 backdrop-blur-sm">
              <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <div className="w-1.5 h-6 bg-gradient-to-b from-orange-500 to-red-500 rounded-full"></div>
                Booking Policy
              </h4>
              <div className="space-y-3 text-sm text-gray-700">
                <div className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 bg-orange-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span>
                    Maximum{' '}
                    <span className="font-semibold text-orange-700">
                      {tripDetails.userBookingInfo?.maxSeatsPerUser || 2}
                    </span>{' '}
                    seats per user
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 bg-orange-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span>
                    Payment required within{' '}
                    <span className="font-semibold text-orange-700">24 hours</span>
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 bg-orange-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span>
                    Cancellation allowed up to{' '}
                    <span className="font-semibold text-orange-700">24 hours</span> before departure
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 bg-orange-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span>
                    Refund processing takes{' '}
                    <span className="font-semibold text-orange-700">3-5 business days</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-orange-50/80 via-white/90 to-red-50/80 rounded-2xl p-6 border border-orange-200/30 backdrop-blur-sm">
              <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <div className="w-1.5 h-6 bg-gradient-to-b from-orange-500 to-red-500 rounded-full"></div>
                Travel Requirements
              </h4>
              <div className="space-y-3 text-sm text-gray-700">
                <div className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 bg-orange-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span>
                    <span className="font-semibold text-orange-700">Valid ID</span> required for
                    boarding
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 bg-orange-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span>
                    Arrive <span className="font-semibold text-orange-700">30 minutes</span> before
                    departure
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 bg-orange-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span>
                    <span className="font-semibold text-orange-700">No smoking or alcohol</span> on
                    board
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 bg-orange-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span>
                    Luggage weight limit:{' '}
                    <span className="font-semibold text-orange-700">20kg per passenger</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="mt-8 bg-gradient-to-r from-orange-100/80 via-orange-50/90 to-red-100/80 rounded-3xl border border-orange-200/50 p-8 backdrop-blur-sm shadow-xl">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
              <Phone className="w-6 h-6 text-white" />
            </div>
            <div>
              <h4 className="text-lg font-bold bg-gradient-to-r from-orange-700 to-red-700 bg-clip-text text-transparent mb-2">
                Need Help?
              </h4>
              <p className="text-orange-800 text-sm leading-relaxed">
                Contact our support team for assistance with your booking or travel questions. We're
                here to make your journey smooth and comfortable.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
