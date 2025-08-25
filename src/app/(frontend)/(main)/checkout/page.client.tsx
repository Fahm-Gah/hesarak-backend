'use client'

import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Breadcrumbs } from '@/app/(frontend)/components/Breadcrumbs'
import { CheckoutSummary } from './components/CheckoutSummary'
import { PaymentMethod } from './components/PaymentMethod'
import toast from 'react-hot-toast'
import { convertToPersianDigits } from '@/utils/persianDigits'

import type { User as PayloadUser, Profile } from '@/payload-types'

interface User extends PayloadUser {
  profile?: Profile | null
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
  busLayout: Array<{
    id: string
    type: 'seat' | 'wc' | 'driver' | 'door'
    seatNumber?: string
  }>
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
}

interface SelectedSeat {
  id: string
  seatNumber: string
  isBooked: boolean
}

interface CheckoutClientProps {
  user: User
  tripDetails: TripDetails
  selectedSeats: SelectedSeat[]
  originalSearchParams: {
    tripId: string
    date: string
    seats: string
    fromProvince?: string
    toProvince?: string
  }
}

type CheckoutStep = 'payment'

interface BookingResult {
  success: boolean
  data?: {
    ticketId: string
    ticketNumber: string
    passenger: {
      id: string
      fullName: string
      fatherName?: string
      phoneNumber?: string
      gender?: string
    }
    trip: {
      id: string
      name: string
      price: number
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

export const CheckoutClient = ({
  user,
  tripDetails,
  selectedSeats,
  originalSearchParams,
}: CheckoutClientProps) => {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'cash' | 'card' | 'mobile'>(
    'cash',
  )

  // Refs for height syncing
  const leftColumnRef = useRef<HTMLDivElement>(null)
  const rightColumnRef = useRef<HTMLDivElement>(null)
  const [columnHeights, setColumnHeights] = useState({ left: 0, right: 0 })
  const [isLargeScreen, setIsLargeScreen] = useState(false)

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
    const updateHeights = () => {
      if (leftColumnRef.current && rightColumnRef.current && isLargeScreen) {
        const leftHeight = leftColumnRef.current.scrollHeight
        const rightHeight = rightColumnRef.current.scrollHeight

        setColumnHeights({ left: leftHeight, right: rightHeight })
      }
    }

    // Update heights initially and on window resize
    updateHeights()

    // Use ResizeObserver to detect content changes
    const resizeObserver = new ResizeObserver(updateHeights)
    if (leftColumnRef.current) resizeObserver.observe(leftColumnRef.current)
    if (rightColumnRef.current) resizeObserver.observe(rightColumnRef.current)

    return () => {
      resizeObserver.disconnect()
    }
  }, [isLoading, selectedPaymentMethod, isLargeScreen]) // Re-run when these dependencies change

  // Calculate totals
  const { totalPrice, seatNumbers } = useMemo(() => {
    const total = selectedSeats.length * tripDetails.price
    const numbers = selectedSeats
      .map((seat) => seat.seatNumber)
      .sort((a, b) => {
        const aNum = parseInt(a.replace(/\D/g, '') || '0')
        const bNum = parseInt(b.replace(/\D/g, '') || '0')
        return aNum - bNum
      })

    return {
      totalPrice: total,
      seatNumbers: numbers,
    }
  }, [selectedSeats, tripDetails.price])

  // Build breadcrumb items
  const breadcrumbItems = useMemo(() => {
    // Use original search provinces if available, otherwise fall back to terminal provinces
    const searchFromProvince = originalSearchParams.fromProvince || tripDetails.from.province
    const searchToProvince = originalSearchParams.toProvince || tripDetails.to?.province || ''

    // Use originalDate which is already in Persian format
    const searchUrl = `/search?from=${encodeURIComponent(searchFromProvince)}&to=${encodeURIComponent(searchToProvince)}&date=${encodeURIComponent(tripDetails.originalDate)}`

    // Build trip URL with all relevant parameters
    const tripParams = new URLSearchParams()
    tripParams.append('date', tripDetails.originalDate)
    if (tripDetails.from?.id) tripParams.append('from', tripDetails.from.id)
    if (tripDetails.to?.id) tripParams.append('to', tripDetails.to.id)
    if (originalSearchParams.fromProvince)
      tripParams.append('fromProvince', originalSearchParams.fromProvince)
    if (originalSearchParams.toProvince)
      tripParams.append('toProvince', originalSearchParams.toProvince)

    const tripUrl = `/trip/${tripDetails.id}?${tripParams.toString()}`

    return [
      { label: 'خانه', href: '/' },
      { label: 'نتایج جستجو', href: searchUrl },
      { label: 'جزئیات سفر', href: tripUrl },
      { label: 'پرداخت' },
    ]
  }, [tripDetails, originalSearchParams])

  // Handle booking submission
  const handleBooking = useCallback(async () => {
    setIsLoading(true)

    try {
      const response = await fetch('/api/book-ticket', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tripId: originalSearchParams.tripId,
          date: originalSearchParams.date,
          seatIds: selectedSeats.map((seat) => seat.id),
          paymentMethod: selectedPaymentMethod,
          fromTerminalId: tripDetails.from?.id,
          toTerminalId: tripDetails.to?.id,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        let errorMessage = result.error || 'Booking failed'
        if (result.details && Array.isArray(result.details)) {
          errorMessage = result.details.join(', ')
        }
        throw new Error(errorMessage)
      }

      if (result.success) {
        // Show success toast immediately
        toast.success('🎉 رزرو با موفقیت انجام شد! در حال هدایت به صفحه تأیید...')

        // Store booking data in both session and local storage for success page
        const bookingData = JSON.stringify(result.data)
        sessionStorage.setItem('bookingResult', bookingData)
        localStorage.setItem(`bookingResult_${result.data.ticketId}`, bookingData)

        // Update user location after successful booking
        try {
          await fetch('/api/update-location', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              useFallback: true, // Use IP-based location since we're not requesting browser location
            }),
          })
        } catch (locationError) {
          // Don't fail the booking flow if location update fails
          console.warn('Failed to update location after booking:', locationError)
        }

        // Redirect to success page with ticket ID as backup
        router.push(`/booking-success?ticketId=${result.data.ticketId}`)
      } else {
        let errorMessage = result.error || 'Booking failed'
        if (result.details && Array.isArray(result.details)) {
          errorMessage = result.details.join(', ')
        }
        throw new Error(errorMessage)
      }
    } catch (err) {
      console.error('Booking error:', err)
      toast.error(err instanceof Error ? err.message : 'رزرو ناموفق بود. لطفاً دوباره تلاش کنید.')
    } finally {
      setIsLoading(false)
    }
  }, [originalSearchParams, selectedSeats, selectedPaymentMethod, router])

  const handleBackStep = useCallback(() => {
    // Build trip URL with all relevant parameters to preserve navigation context
    const tripParams = new URLSearchParams()
    tripParams.append('date', tripDetails.originalDate)
    if (tripDetails.from?.id) tripParams.append('from', tripDetails.from.id)
    if (tripDetails.to?.id) tripParams.append('to', tripDetails.to.id)
    if (originalSearchParams.fromProvince)
      tripParams.append('fromProvince', originalSearchParams.fromProvince)
    if (originalSearchParams.toProvince)
      tripParams.append('toProvince', originalSearchParams.toProvince)

    const tripUrl = `/trip/${tripDetails.id}?${tripParams.toString()}`
    router.push(tripUrl)
  }, [router, tripDetails, originalSearchParams])

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Breadcrumbs */}
        <div className="mb-6">
          <Breadcrumbs items={breadcrumbItems} />
        </div>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent pb-2">
            تکمیل رزرو شما
          </h1>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Right Column - Payment Method */}
          <div
            ref={leftColumnRef}
            className="lg:col-span-2 order-2 lg:order-1"
            style={{
              minHeight:
                isLargeScreen && columnHeights.left > 0 && columnHeights.right > 0
                  ? `${Math.max(columnHeights.left, columnHeights.right)}px`
                  : 'auto',
            }}
          >
            <PaymentMethod
              totalPrice={totalPrice}
              isLoading={isLoading}
              selectedPaymentMethod={selectedPaymentMethod}
              onPaymentMethodChange={setSelectedPaymentMethod}
              onConfirm={handleBooking}
              onBack={handleBackStep}
            />
          </div>

          {/* Left Column - Checkout Summary */}
          <div
            ref={rightColumnRef}
            className="lg:col-span-1 order-1 lg:order-2"
            style={{
              minHeight:
                isLargeScreen && columnHeights.left > 0 && columnHeights.right > 0
                  ? `${Math.max(columnHeights.left, columnHeights.right)}px`
                  : 'auto',
            }}
          >
            <div className="lg:sticky lg:top-6">
              <CheckoutSummary
                tripDetails={tripDetails}
                selectedSeats={selectedSeats}
                totalPrice={totalPrice}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
