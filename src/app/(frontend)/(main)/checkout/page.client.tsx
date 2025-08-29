'use client'

import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import { Breadcrumbs } from '@/app/(frontend)/components/Breadcrumbs'
import { CheckoutSummary } from './components/CheckoutSummary'
import { PaymentMethod } from './components/PaymentMethod'
import { getMeUser } from '@/utils/getMeUser.client'
import toast from 'react-hot-toast'
import { convertToPersianDigits } from '@/utils/persianDigits'
import type { User as PayloadUser, Profile } from '@/payload-types'

// Client-side data fetching function
async function fetchTripDetails(
  tripId: string,
  date: string,
  from?: string,
  to?: string,
): Promise<TripDetails | null> {
  try {
    // Build URL with optional from/to parameters
    let url = `/api/trips/${tripId}/date/${encodeURIComponent(date)}`
    const params = new URLSearchParams()
    if (from) params.append('from', from)
    if (to) params.append('to', to)
    if (params.toString()) {
      url += `?${params.toString()}`
    }

    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store', // Always fetch fresh data for checkout
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch trip details: ${response.status}`)
    }

    const result = await response.json()
    return result.success ? result.data : null
  } catch (error) {
    console.error('Error fetching trip details:', error)
    return null
  }
}

interface User extends PayloadUser {
  profile?: Profile | string | null
}

interface TripDetails {
  id: string
  tripName: string
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
  }
  to: {
    id: string
    name: string
    province: string
  } | null
  bus?: {
    id: string
    number: string
    images?: Array<{
      id: string
      url: string
      filename: string
      alt: string
      width: number
      height: number
    }>
    type?: {
      id: string
      name: string
      capacity: number
      amenities?: Array<{
        amenity: string
        id: string
      }>
    }
  }
  busLayout?: Array<{
    id: string
    type: 'seat' | 'wc' | 'driver' | 'door'
    seatNumber?: string
    isBooked?: boolean
  }>
  userBookingInfo?: {
    canBookMoreSeats: boolean
    remainingSeatsAllowed: number
    totalBookedSeats: number
    maxSeatsPerUser: number
  } | null
}

interface SelectedSeat {
  id: string
  seatNumber: string
  isBooked: boolean
}

interface BookingResult {
  success: boolean
  data?: {
    ticketId: string
    ticketNumber: string
    trip: {
      id: string
      tripName: string
      departureTime: string
      arrivalTime: string | null
      from: { name: string; province: string }
      to: { name: string; province: string } | null
    }
    booking: {
      date: string
      originalDate: string
      seats: Array<{
        id: string
        seatNumber: string
      }>
      totalPrice: number
      pricePerSeat: number
    }
    status: {
      isPaid: boolean
      paymentMethod?: string
      paymentDeadline?: string
    }
  }
  error?: string
}

export const CheckoutPageClient = () => {
  const router = useRouter()
  const searchParams = useSearchParams()

  // State
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [tripDetails, setTripDetails] = useState<TripDetails | null>(null)
  const [selectedSeats, setSelectedSeats] = useState<SelectedSeat[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isBookingLoading, setIsBookingLoading] = useState(false)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'cash' | 'card' | 'mobile'>(
    'cash',
  )

  // Refs for height syncing
  const leftColumnRef = useRef<HTMLDivElement>(null)
  const rightColumnRef = useRef<HTMLDivElement>(null)
  const [columnHeights, setColumnHeights] = useState({ left: 0, right: 0 })
  const [isLargeScreen, setIsLargeScreen] = useState(false)

  // Get URL parameters
  const tripId = searchParams.get('tripId')
  const date = searchParams.get('date')
  const seats = searchParams.get('seats')
  const from = searchParams.get('from')
  const to = searchParams.get('to')
  const fromProvince = searchParams.get('fromProvince')
  const toProvince = searchParams.get('toProvince')

  const originalSearchParams = {
    tripId,
    date,
    seats,
    fromProvince,
    toProvince,
  }

  // Validate required parameters and redirect if missing
  useEffect(() => {
    if (!tripId || !date || !seats) {
      router.push('/search')
      return
    }

    // Parse and validate seat IDs
    const seatIds = seats.split(',').filter(Boolean)
    if (seatIds.length === 0 || seatIds.length > 2) {
      router.push('/search')
      return
    }
  }, [tripId, date, seats, router])

  // Load user authentication status
  useEffect(() => {
    let isMounted = true

    const checkAuth = async () => {
      try {
        const result = await getMeUser()
        if (isMounted) {
          setUser(result.user as User)
          setIsAuthenticated(!!result.user)
        }
      } catch (error) {
        if (isMounted) {
          // Redirect to login with current checkout URL
          const checkoutParams = new URLSearchParams()
          if (tripId) checkoutParams.append('tripId', tripId)
          if (date) checkoutParams.append('date', date)
          if (seats) checkoutParams.append('seats', seats)
          if (from) checkoutParams.append('from', from)
          if (to) checkoutParams.append('to', to)
          if (fromProvince) checkoutParams.append('fromProvince', fromProvince)
          if (toProvince) checkoutParams.append('toProvince', toProvince)

          const loginUrl = `/auth/login?redirect=${encodeURIComponent(`/checkout?${checkoutParams.toString()}`)}`
          router.push(loginUrl)
        }
      }
    }

    checkAuth()

    return () => {
      isMounted = false
    }
  }, [tripId, date, seats, from, to, fromProvince, toProvince, router])

  // Load trip details after authentication
  useEffect(() => {
    let isMounted = true

    const loadTripDetails = async () => {
      if (!tripId || !date || !isAuthenticated) return

      setLoading(true)
      try {
        const details = await fetchTripDetails(tripId, date, from || undefined, to || undefined)
        if (isMounted) {
          if (!details) {
            setError('Trip details not found')
          } else {
            setTripDetails(details)

            // Validate and set selected seats
            const seatIds = seats?.split(',').filter(Boolean) || []
            const validSeatIds = seatIds.filter((seatId) =>
              details.busLayout?.some(
                (element) => element.id === seatId && element.type === 'seat',
              ),
            )

            if (validSeatIds.length !== seatIds.length) {
              setError('Some selected seats are invalid')
              return
            }

            const seatDetails =
              details.busLayout
                ?.filter((element) => element.type === 'seat' && validSeatIds.includes(element.id))
                .map((seat) => ({
                  id: seat.id,
                  seatNumber: seat.seatNumber || '',
                  isBooked: seat.isBooked === true,
                })) || []

            // Check if any selected seats are already booked
            const hasBookedSeats = seatDetails.some((seat) => seat.isBooked)
            if (hasBookedSeats) {
              // Redirect back to trip details with error
              const tripParams = new URLSearchParams()
              tripParams.append('date', date)
              tripParams.append('error', 'seats_unavailable')
              if (from) tripParams.append('from', from)
              if (to) tripParams.append('to', to)
              if (fromProvince) tripParams.append('fromProvince', fromProvince)
              if (toProvince) tripParams.append('toProvince', toProvince)

              router.push(`/trip/${tripId}?${tripParams.toString()}`)
              return
            }

            // Validate booking limits for authenticated users
            if (details.userBookingInfo) {
              const { canBookMoreSeats, remainingSeatsAllowed } = details.userBookingInfo

              if (!canBookMoreSeats) {
                // User has exceeded booking limits, redirect back to trip page with error
                const tripParams = new URLSearchParams()
                tripParams.append('date', date)
                tripParams.append('error', 'booking_limit_exceeded')
                if (from) tripParams.append('from', from)
                if (to) tripParams.append('to', to)
                if (fromProvince) tripParams.append('fromProvince', fromProvince)
                if (toProvince) tripParams.append('toProvince', toProvince)

                router.push(`/trip/${tripId}?${tripParams.toString()}`)
                return
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

                router.push(`/trip/${tripId}?${tripParams.toString()}`)
                return
              }
            }

            setSelectedSeats(seatDetails)
          }
          setLoading(false)
        }
      } catch (error) {
        console.error('Error loading trip details:', error)
        if (isMounted) {
          setError('Failed to load trip details')
          setLoading(false)
        }
      }
    }

    loadTripDetails()

    return () => {
      isMounted = false
    }
  }, [tripId, date, seats, from, to, fromProvince, toProvince, isAuthenticated, router])

  // Effect to track screen size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsLargeScreen(window.innerWidth >= 1024)
    }

    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)

    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

  // Effect to sync column heights
  useEffect(() => {
    if (!isLargeScreen) return

    const updateHeights = () => {
      if (leftColumnRef.current && rightColumnRef.current) {
        const leftHeight = leftColumnRef.current.offsetHeight
        const rightHeight = rightColumnRef.current.offsetHeight
        setColumnHeights({ left: leftHeight, right: rightHeight })
      }
    }

    updateHeights()

    const observer = new ResizeObserver(updateHeights)
    if (leftColumnRef.current) observer.observe(leftColumnRef.current)
    if (rightColumnRef.current) observer.observe(rightColumnRef.current)

    return () => observer.disconnect()
  }, [isLargeScreen, tripDetails, selectedSeats])

  // Calculate booking details
  const bookingDetails = useMemo(() => {
    if (!tripDetails || !selectedSeats.length) return null

    const pricePerSeat = tripDetails.price
    const totalPrice = pricePerSeat * selectedSeats.length

    return {
      pricePerSeat,
      totalPrice,
      seatCount: selectedSeats.length,
      seatNumbers: selectedSeats.map((seat) => seat.seatNumber).join(', '),
    }
  }, [tripDetails, selectedSeats])

  // Handle booking submission
  const handleBooking = useCallback(async () => {
    if (!tripDetails || !selectedSeats.length || !bookingDetails) {
      toast.error('اطلاعات رزرو کامل نیست')
      return
    }

    setIsBookingLoading(true)

    try {
      const bookingData = {
        tripId: tripDetails.id,
        date: tripDetails.originalDate,
        seatIds: selectedSeats.map((seat) => seat.id),
        paymentMethod: selectedPaymentMethod,
        totalPrice: bookingDetails.totalPrice,
        from: tripDetails.from.id,
        to: tripDetails.to?.id,
      }

      const response = await fetch('/api/book-ticket', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
      })

      const result: BookingResult = await response.json()

      if (result.success && result.data) {
        // Store booking result for the success page
        sessionStorage.setItem('bookingResult', JSON.stringify(result.data))
        localStorage.setItem(`bookingResult_${result.data.ticketId}`, JSON.stringify(result.data))

        toast.success('تکت شما با موفقیت قید شد!')
        router.push(`/booking-success?ticketId=${result.data.ticketId}`)
      } else {
        toast.error(result.error || 'خطایی در قید تکت رخ داد')
      }
    } catch (error) {
      console.error('Booking error:', error)
      toast.error('خطایی در ارتباط با سرور رخ داد')
    } finally {
      setIsBookingLoading(false)
    }
  }, [tripDetails, selectedSeats, bookingDetails, selectedPaymentMethod, router])

  // Build breadcrumbs
  const searchFromProvince = originalSearchParams?.fromProvince || tripDetails?.from?.province
  const searchToProvince = originalSearchParams?.toProvince || tripDetails?.to?.province || ''
  const searchDate = originalSearchParams?.date || tripDetails?.originalDate

  const searchUrl = `/search?from=${encodeURIComponent(searchFromProvince || '')}&to=${encodeURIComponent(searchToProvince)}&date=${encodeURIComponent(searchDate || '')}`
  const tripUrl = `/trip/${tripId}?date=${encodeURIComponent(date || '')}`

  const breadcrumbItems = [
    { label: 'صفحه اصلی', href: '/' },
    { label: 'نتایج جستجو', href: searchUrl },
    { label: 'جزئیات سفر', href: tripUrl },
    { label: 'پرداخت' },
  ]

  // Show loading state
  if (loading || !tripDetails || !selectedSeats.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50" dir="rtl">
        <div className="max-w-6xl mx-auto px-4 py-6">
          {/* Breadcrumb skeleton */}
          <div className="mb-6">
            <div className="h-4 bg-gray-200 rounded animate-pulse w-32"></div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Checkout Form skeleton */}
            <div className="lg:col-span-2 space-y-6">
              {/* Payment method skeleton */}
              <div className="bg-white rounded-xl shadow-lg p-6 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-40 mb-4"></div>
                <div className="space-y-4">
                  <div className="h-12 bg-gray-100 rounded-lg"></div>
                  <div className="h-12 bg-gray-100 rounded-lg"></div>
                </div>
              </div>
            </div>

            {/* Right Column - Summary skeleton */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-lg p-6 animate-pulse sticky top-4">
                <div className="h-6 bg-gray-200 rounded w-24 mb-4"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-100 rounded w-full"></div>
                  <div className="h-4 bg-gray-100 rounded w-2/3"></div>
                  <div className="pt-3 mt-4">
                    <div className="h-6 bg-gray-200 rounded w-20 mb-3"></div>
                    <div className="h-12 bg-gray-100 rounded-lg"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div
        className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center"
        dir="rtl"
      >
        <div className="text-center bg-white rounded-xl shadow-lg p-8 max-w-md">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">خطا در بارگذاری</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => router.push('/search')}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            بازگشت به جستجو
          </button>
        </div>
      </div>
    )
  }

  // Calculate minimum height for columns
  const minHeight = Math.max(columnHeights.left, columnHeights.right)

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50" dir="rtl">
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Breadcrumbs */}
        <div className="mb-6">
          <Breadcrumbs items={breadcrumbItems} />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div
            ref={leftColumnRef}
            className="lg:col-span-2 space-y-6"
            style={isLargeScreen ? { minHeight: `${minHeight}px` } : {}}
          >
            {/* Payment Method */}
            <PaymentMethod
              totalPrice={bookingDetails?.totalPrice || 0}
              isLoading={isBookingLoading}
              selectedPaymentMethod={selectedPaymentMethod}
              onPaymentMethodChange={setSelectedPaymentMethod}
              onConfirm={handleBooking}
              onBack={() => router.back()}
            />
          </div>

          {/* Right Column */}
          <div
            ref={rightColumnRef}
            className="lg:col-span-1"
            style={isLargeScreen ? { minHeight: `${minHeight}px` } : {}}
          >
            <CheckoutSummary
              tripDetails={tripDetails}
              selectedSeats={selectedSeats}
              totalPrice={bookingDetails?.totalPrice || 0}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
