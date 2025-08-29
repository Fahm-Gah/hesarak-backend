'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { Breadcrumbs } from '@/app/(frontend)/components/Breadcrumbs'
import { SeatLayout } from '../components/SeatLayout'
import { TripInfo } from '../components/TripInfo'
import { BookingSummary } from '../components/BookingSummary'
import { Phone } from 'lucide-react'
import toast from 'react-hot-toast'
import { getMeUser } from '@/utils/getMeUser.client'

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
      cache: 'no-store',
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

export const TripDetailsPageClient = () => {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()

  // State
  const [tripDetails, setTripDetails] = useState<TripDetails | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedSeats, setSelectedSeats] = useState<string[]>([])
  const [isBookingLoading, setIsBookingLoading] = useState(false)

  // Get URL parameters
  const tripId = params.tripId as string
  const date = searchParams.get('date')
  const initialError = searchParams.get('error')
  const from = searchParams.get('from')
  const to = searchParams.get('to')
  const fromProvince = searchParams.get('fromProvince')
  const toProvince = searchParams.get('toProvince')

  const originalSearchParams = {
    fromProvince,
    toProvince,
    date,
  }

  // Check if date is provided, redirect to search if not
  useEffect(() => {
    if (!date) {
      router.push('/search')
      return
    }
  }, [date, router])

  // Load user authentication status
  useEffect(() => {
    let isMounted = true

    const checkAuth = async () => {
      try {
        const result = await getMeUser()
        if (isMounted) {
          setUser(result.user)
          setIsAuthenticated(!!result.user)
        }
      } catch (error) {
        if (isMounted) {
          setUser(null)
          setIsAuthenticated(false)
        }
      }
    }

    checkAuth()

    return () => {
      isMounted = false
    }
  }, [])

  // Load trip details after we have the parameters
  useEffect(() => {
    let isMounted = true

    const loadTripDetails = async () => {
      if (!date || !tripId) return

      setLoading(true)
      try {
        const details = await fetchTripDetails(tripId, date, from || undefined, to || undefined)
        if (isMounted) {
          if (!details) {
            setError('Trip not found')
          } else {
            setTripDetails(details)
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
  }, [tripId, date, from, to])

  // Handle initial error from URL parameters
  useEffect(() => {
    if (initialError) {
      switch (initialError) {
        case 'booking_limit_exceeded':
          toast.error(
            'شما قبلاً حداکثر تعداد چوکی مجاز برای این سفر را رزرو کرده‌اید. لطفاً برای تغییرات، رزروهای موجود خود را مدیریت کنید.',
          )
          break
        case 'too_many_seats':
          toast.error('شما سعی می‌کنید چوکی‌های بیشتری از حد مجاز برای این سفر رزرو کنید.')
          break
        default:
          toast.error('خطایی در پردازش رزرو شما رخ داده است.')
      }
      setSelectedSeats([]) // Clear any selected seats
    }
  }, [initialError])

  // Only clear selected seats if user can't book more, but don't show error message automatically
  useEffect(() => {
    if (
      isAuthenticated &&
      tripDetails?.userBookingInfo &&
      !tripDetails.userBookingInfo.canBookMoreSeats &&
      !initialError
    ) {
      setSelectedSeats([]) // Clear any selected seats silently
    }
  }, [isAuthenticated, tripDetails?.userBookingInfo, initialError])

  // Calculate if user can select more seats
  const maxAllowedSeats = tripDetails?.userBookingInfo?.remainingSeatsAllowed ?? 2
  const canBookMoreSeats = tripDetails?.userBookingInfo?.canBookMoreSeats ?? true
  const canSelectMoreSeats = canBookMoreSeats && selectedSeats.length < maxAllowedSeats

  // Seat selection handler
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
            tripDetails?.userBookingInfo &&
            !tripDetails.userBookingInfo.canBookMoreSeats
          ) {
            toast.error('شما قبلاً حداکثر تعداد چوکی مجاز برای این سفر را رزرو کرده‌اید.')
            return prev
          }

          // Check if user can select more seats
          const maxSeats = tripDetails?.userBookingInfo?.remainingSeatsAllowed ?? 2
          if (prev.length >= maxSeats) {
            toast.error(`شما فقط می‌توانید حداکثر ${maxSeats} چوکی انتخاب کنید`)
            return prev
          }

          // Select seat
          return [...prev, seatId]
        }
      })
    },
    [
      isAuthenticated,
      tripDetails?.userBookingInfo?.remainingSeatsAllowed,
      tripDetails?.userBookingInfo?.canBookMoreSeats,
    ],
  )

  // Clear selection handler
  const handleClearSelection = useCallback(() => {
    setSelectedSeats([])
    toast.success('انتخاب پاک شد')
  }, [])

  // Proceed to booking handler
  const handleProceedToBooking = useCallback(async () => {
    if (selectedSeats.length === 0) {
      toast.error('لطفاً حداقل یک چوکی انتخاب کنید')
      return
    }

    // Check if authenticated user can book the selected number of seats
    if (isAuthenticated && tripDetails?.userBookingInfo) {
      const { canBookMoreSeats, remainingSeatsAllowed } = tripDetails.userBookingInfo

      if (!canBookMoreSeats) {
        toast.error('شما قبلاً حداکثر تعداد چوکی مجاز برای این سفر را رزرو کرده‌اید.')
        return
      }

      if (selectedSeats.length > remainingSeatsAllowed) {
        toast.error(`شما فقط می‌توانید ${remainingSeatsAllowed} چوکی دیگر برای این سفر رزرو کنید.`)
        return
      }
    }

    setIsBookingLoading(true)

    try {
      const checkoutParams = new URLSearchParams()
      checkoutParams.append('tripId', tripDetails?.id || '')
      checkoutParams.append('date', tripDetails?.originalDate || '')
      checkoutParams.append('seats', selectedSeats.join(','))

      // Include user's specific from/to terminals
      if (tripDetails?.from?.id) {
        checkoutParams.append('from', tripDetails.from.id)
      }
      if (tripDetails?.to?.id) {
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

      if (!isAuthenticated) {
        const loginUrl = '/auth/login?redirect=' + encodeURIComponent(checkoutUrl)
        router.push(loginUrl)
      } else {
        router.push(checkoutUrl)
      }
    } catch (err) {
      console.error('Booking error:', err)
      toast.error('ادامه رزرو ناموفق بود. لطفاً دوباره تلاش کنید.')
      setIsBookingLoading(false)
    }
  }, [
    isAuthenticated,
    selectedSeats,
    router,
    tripDetails?.id,
    tripDetails?.originalDate,
    tripDetails?.userBookingInfo,
    tripDetails?.from?.id,
    tripDetails?.to?.id,
    originalSearchParams?.fromProvince,
    originalSearchParams?.toProvince,
  ])

  // Build breadcrumbs
  const searchFromProvince = originalSearchParams?.fromProvince || tripDetails?.from?.province
  const searchToProvince = originalSearchParams?.toProvince || tripDetails?.to?.province || ''
  const searchDate = originalSearchParams?.date || tripDetails?.originalDate

  const searchUrl = `/search?from=${encodeURIComponent(searchFromProvince || '')}&to=${encodeURIComponent(searchToProvince)}&date=${encodeURIComponent(searchDate || '')}`

  const breadcrumbItems = [
    { label: 'صفحه اصلی', href: '/' },
    { label: 'نتایج جستجو', href: searchUrl },
    { label: 'جزئیات سفر' },
  ]

  // Show loading while fetching trip details
  if (loading || !tripDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50" dir="rtl">
        <div className="max-w-7xl mx-auto px-4 py-6">
          {/* Breadcrumb skeleton */}
          <div className="mb-6">
            <div className="h-4 bg-gray-200 rounded animate-pulse w-32"></div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Left Column - Trip Info skeleton */}
            <div className="xl:col-span-2 space-y-6">
              {/* Trip header skeleton */}
              <div className="bg-white rounded-xl shadow-lg p-6 animate-pulse">
                <div className="flex flex-col lg:flex-row lg:items-start justify-between mb-6">
                  <div className="space-y-3">
                    <div className="h-7 bg-gray-200 rounded w-48"></div>
                    <div className="h-4 bg-gray-100 rounded w-32"></div>
                  </div>
                  <div className="h-8 bg-gray-100 rounded-full w-24 mt-4 lg:mt-0"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-100 rounded w-16"></div>
                    <div className="h-6 bg-gray-200 rounded w-40"></div>
                  </div>
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-100 rounded w-20"></div>
                    <div className="h-6 bg-gray-200 rounded w-32"></div>
                  </div>
                </div>
              </div>

              {/* Bus info skeleton */}
              <div className="bg-white rounded-xl shadow-lg p-6 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="h-32 bg-gray-100 rounded-lg"></div>
                  </div>
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-100 rounded w-24"></div>
                    <div className="h-5 bg-gray-200 rounded w-36"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-100 rounded w-20"></div>
                      <div className="flex flex-wrap gap-2">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="h-6 bg-gray-100 rounded-full w-16"></div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column skeleton */}
            <div className="xl:col-span-1 space-y-6">
              {/* Seat layout skeleton */}
              <div className="bg-white rounded-xl shadow-lg p-6 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-28 mb-4"></div>
                <div className="h-64 bg-gray-100 rounded-lg mb-4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-100 rounded w-32"></div>
                  <div className="h-4 bg-gray-100 rounded w-24"></div>
                </div>
              </div>

              {/* Booking summary skeleton */}
              <div className="bg-white rounded-xl shadow-lg p-6 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-28 mb-4"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-100 rounded w-full"></div>
                  <div className="h-4 bg-gray-100 rounded w-3/4"></div>
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
          <p className="text-gray-600 mb-4">امکان بارگذاری جزئیات سفر وجود ندارد</p>
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

  // Main content
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50" dir="rtl">
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
              اطلاعات مهم
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gradient-to-r from-orange-50/80 via-white/90 to-red-50/80 rounded-2xl p-6 border border-orange-200/30 backdrop-blur-sm">
              <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <div className="w-1.5 h-6 bg-gradient-to-b from-orange-500 to-red-500 rounded-full"></div>
                سیاست رزرو
              </h4>
              <div className="space-y-3 text-sm text-gray-700">
                <div className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 bg-orange-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span>
                    حداکثر{' '}
                    <span className="font-semibold text-orange-700">
                      {tripDetails?.userBookingInfo?.maxSeatsPerUser || 2}
                    </span>{' '}
                    چوکی برای هر کاربر. برای قید کردن بیش از دو چوکی به شماره تلفن ما به تماس شوید
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 bg-orange-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span>
                    مهلت پرداخت: بیش از ۷ روز{' '}
                    <span className="font-semibold text-orange-700">(۴۸ ساعت)</span>، ۱-۷ روز{' '}
                    <span className="font-semibold text-orange-700">(۲۴ ساعت)</span>، کمتر از ۲۴
                    ساعت <span className="font-semibold text-orange-700">(۲ ساعت قبل حرکت)</span>
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 bg-orange-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span>
                    لغو تا <span className="font-semibold text-orange-700">۲۴ ساعت</span> قبل از
                    حرکت امکان‌پذیر است
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 bg-orange-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span>
                    پردازش بازپرداخت{' '}
                    <span className="font-semibold text-orange-700">۳-۵ روز کاری</span> طول می‌کشد
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-orange-50/80 via-white/90 to-red-50/80 rounded-2xl p-6 border border-orange-200/30 backdrop-blur-sm">
              <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <div className="w-1.5 h-6 bg-gradient-to-b from-orange-500 to-red-500 rounded-full"></div>
                شرایط سفر
              </h4>
              <div className="space-y-3 text-sm text-gray-700">
                <div className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 bg-orange-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span>
                    <span className="font-semibold text-orange-700">کارت شناسایی معتبر</span> برای
                    سوار شدن ضروری است
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 bg-orange-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span>
                    <span className="font-semibold text-orange-700">۳۰ دقیقه</span> قبل از حرکت حضور
                    یابید
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 bg-orange-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span>
                    <span className="font-semibold text-orange-700">سیگار و الکل</span> در بس ممنوع
                    است
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 bg-orange-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span>
                    محدودیت وزن بار:{' '}
                    <span className="font-semibold text-orange-700">۲۰ کیلو برای هر مسافر</span>
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
                نیاز به کمک دارید؟
              </h4>
              <p className="text-orange-800 text-sm leading-relaxed">
                برای کمک در مورد رزرو یا سوالات سفر، با تیم پشتیبانی ما تماس بگیرید. ما اینجا هستیم
                تا سفر شما راحت و آسان باشد.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
