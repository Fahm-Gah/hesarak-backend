'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronRight, Bus, Wifi, Tv, Wind, Coffee, UtensilsCrossed, Toilet } from 'lucide-react'

interface Trip {
  id: string
  tripName: string
  price: number
  departureTime: string
  arrivalTime: string | null
  duration: string | null
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
    type: {
      id: string
      name: string
      amenities?: { amenity: string }[] | null
    }
  }
  availability: {
    totalSeats: number
    bookedSeats: number
    availableSeats: number
  }
  isBookingAllowed: boolean
  bookingBlockedReason?: string
  stops?: {
    terminal: {
      id: string
      name: string
      province: string
      address?: string
    }
    time: string
    isUserBoardingPoint?: boolean
    isUserDestination?: boolean
    isBeforeBoarding?: boolean
    isAfterDestination?: boolean
  }[]
  userBoardingIndex?: number
  userDestinationIndex?: number
  mainDeparture?: {
    id: string
    name: string
    province: string
    address?: string
    time: string
  }
}

interface TripCardProps {
  trip: Trip
  isExpanded: boolean
  onToggleExpand: (tripId: string) => void
  searchParams: {
    from: string
    to: string
    date: string
  }
}

// Function to convert 24-hour time to 12-hour format with Persian AM/PM
const formatToPersian12Hour = (time24: string): string => {
  const [hours, minutes] = time24.split(':')
  const hour = parseInt(hours, 10)
  const minute = parseInt(minutes, 10)
  const period = hour >= 12 ? 'ب.ظ' : 'ق.ظ'
  const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour

  // Convert to Persian digits
  const persianHour = convertToPersianDigits(hour12)
  const persianMinutes = convertToPersianDigits(minute).padStart(2, '۰')

  return `${persianHour}:${persianMinutes} ${period}`
}

// Function to convert English digits to Persian digits
const convertToPersianDigits = (num: number): string => {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹']
  return num.toString().replace(/\d/g, (digit) => persianDigits[parseInt(digit)])
}

// Function to format duration to Persian with full words
const formatDurationToPersian = (duration: string): string => {
  if (!duration || duration === 'Unknown' || duration === 'نامشخص') {
    return 'نامشخص'
  }

  // Parse duration like "9h 30m" or "9h 0m"
  const hourMatch = duration.match(/(\d+)h/)
  const minuteMatch = duration.match(/(\d+)m/)

  const hours = hourMatch ? parseInt(hourMatch[1]) : 0
  const minutes = minuteMatch ? parseInt(minuteMatch[1]) : 0

  let result = ''

  if (hours > 0) {
    result += `${convertToPersianDigits(hours)} ساعت`
  }

  if (minutes > 0) {
    if (result) result += ' '
    result += `${convertToPersianDigits(minutes)} دقیقه`
  }

  return result || 'نامشخص'
}

export const TripCard = ({ trip, isExpanded, onToggleExpand, searchParams }: TripCardProps) => {
  const router = useRouter()
  const [isNavigating, setIsNavigating] = useState(false)

  const handleCardClick = (e: React.MouseEvent) => {
    // Prevent navigation if clicking on the route toggle button
    if ((e.target as HTMLElement).closest('button')) {
      return
    }

    // Prevent navigation if booking is not allowed or fully booked
    if (!trip.isBookingAllowed || trip.availability.availableSeats === 0) {
      return
    }

    setIsNavigating(true)
    const { from, to, date } = searchParams

    // Build URL with user's specific from/to terminals from search results
    const params = new URLSearchParams()
    params.append('date', date)

    // Use the user's boarding and destination terminals from the search result
    if (trip.from?.id) {
      params.append('from', trip.from.id)
    }
    if (trip.to?.id) {
      params.append('to', trip.to.id)
    }

    // Also pass the original search provinces for breadcrumb navigation
    if (from) {
      params.append('fromProvince', from)
    }
    if (to) {
      params.append('toProvince', to)
    }

    router.push(`/trip/${trip.id}?${params.toString()}`)
  }

  const isDisabled = !trip.isBookingAllowed || trip.availability.availableSeats === 0

  return (
    <div
      onClick={handleCardClick}
      className={`group relative w-full bg-white border border-gray-100 rounded-2xl shadow-sm transition-all duration-300 overflow-hidden ${
        isDisabled
          ? 'opacity-60 cursor-not-allowed'
          : 'cursor-pointer hover:shadow-xl hover:-translate-y-1'
      }`}
      dir="rtl"
    >
      {/* Gradient accent bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 to-red-500"></div>

      <div className="p-6">
        {/* Header: Trip Times */}
        <div className="flex items-center justify-between mb-5">
          <div className="text-right">
            <div className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
              {formatToPersian12Hour(trip.departureTime)}
            </div>
            <div className="text-xs sm:text-sm font-medium text-gray-600">{trip.from.name}</div>
          </div>

          <div className="flex-1 px-3 sm:px-6">
            <div className="flex items-center">
              <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-orange-500 relative">
                <div className="absolute inset-0 rounded-full bg-orange-500 animate-ping opacity-25"></div>
              </div>
              <div className="flex-1 h-0.5 bg-gradient-to-r from-orange-500 via-gray-300 to-red-500 mx-2 sm:mx-3 relative flex items-center justify-center">
                <span className="bg-white px-1 sm:px-2 text-[10px] sm:text-xs font-medium text-gray-500">
                  {formatDurationToPersian(trip.duration || '')}
                </span>
              </div>
              <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-red-500 relative">
                <div className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-25"></div>
              </div>
            </div>
          </div>

          <div className="text-left">
            <div className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
              {trip.arrivalTime ? formatToPersian12Hour(trip.arrivalTime) : 'نامشخص'}
            </div>
            <div className="text-xs sm:text-sm font-medium text-gray-600">
              {trip.to?.name || 'مقصد'}
            </div>
          </div>
        </div>

        {/* Bus Type Badge */}
        <div className="flex flex-row items-center justify-between mt-4 pt-4 border-t border-gray-100 gap-3">
          {/* Amenities Preview */}
          {trip.bus.type.amenities && trip.bus.type.amenities.length > 0 && (
            <div className="flex flex-wrap items-center gap-1 sm:gap-2">
              {trip.bus.type.amenities.slice(0, 4).map((amenityObj, index) => {
                const getAmenityIcon = (amenity: string) => {
                  const lowerAmenity = amenity.toLowerCase()
                  if (lowerAmenity.includes('wifi') || lowerAmenity.includes('wi-fi')) {
                    return <Wifi className="w-3 h-3" />
                  }
                  if (lowerAmenity.includes('tv') || lowerAmenity.includes('television')) {
                    return <Tv className="w-3 h-3" />
                  }
                  if (
                    lowerAmenity.includes('ac') ||
                    lowerAmenity.includes('air') ||
                    lowerAmenity.includes('fan') ||
                    lowerAmenity.includes('cooler') ||
                    lowerAmenity.includes('conditioning')
                  ) {
                    return <Wind className="w-3 h-3" />
                  }
                  if (lowerAmenity.includes('coffee') || lowerAmenity.includes('tea')) {
                    return <Coffee className="w-3 h-3" />
                  }
                  if (lowerAmenity.includes('food') || lowerAmenity.includes('meal')) {
                    return <UtensilsCrossed className="w-3 h-3" />
                  }
                  if (lowerAmenity.includes('wc') || lowerAmenity.includes('toilet')) {
                    return <Toilet className="w-3 h-3" />
                  }
                  return
                }

                return (
                  <div key={index} className="px-2 py-1 bg-gray-100 rounded-md">
                    <span className="text-xs text-gray-700 font-medium">{amenityObj.amenity}</span>
                  </div>
                )
              })}
              {trip.bus.type.amenities.length > 4 && (
                <span className="text-xs text-gray-500 px-2 py-1 bg-gray-100 rounded-md">
                  +{trip.bus.type.amenities.length - 4} بیشتر
                </span>
              )}
            </div>
          )}

          <div className="flex items-center gap-2">
            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded bg-blue-100 flex items-center justify-center">
              <Bus className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
            </div>
            <span className="text-sm font-medium text-gray-700">{trip.bus.type.name}</span>
            <span className="text-xs text-gray-500">• اتوبوس {trip.bus.number}</span>
          </div>
        </div>

        {/* Price and Status */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-3">
            <div
              className={`px-2 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-semibold border-2 ${
                !trip.isBookingAllowed
                  ? 'bg-amber-50 border-amber-200 text-amber-800'
                  : trip.availability.availableSeats > 10
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : trip.availability.availableSeats > 0
                      ? 'bg-orange-50 border-orange-200 text-orange-800'
                      : 'bg-red-50 border-red-200 text-red-800'
              }`}
            >
              {!trip.isBookingAllowed
                ? 'تکت کردن بسته است'
                : trip.availability.availableSeats > 0
                  ? `${convertToPersianDigits(trip.availability.availableSeats)} چوکی خالی`
                  : 'تمام شده'}
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="text-left">
              <div className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                {convertToPersianDigits(trip.price).replace(/\B(?=(\d{3})+(?!\d))/g, '،')} افغانی
              </div>
              <div className="text-xs text-gray-500">از هر مسافر</div>
            </div>

            {/* Arrow indicator */}
            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gray-100 group-hover:bg-orange-500 flex items-center justify-center transition-all duration-300">
              <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600 group-hover:text-white transition-colors duration-300 rotate-180" />
            </div>
          </div>
        </div>
      </div>

      {/* Disabled overlay */}
      {isDisabled && (
        <div className="absolute inset-0 bg-gray-50/50 rounded-2xl pointer-events-none"></div>
      )}
    </div>
  )
}
