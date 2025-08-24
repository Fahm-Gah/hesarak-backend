import React, { memo } from 'react'
import { MapPin, Calendar, CreditCard, Armchair, Clock } from 'lucide-react'
import type { BookingData } from './types'

interface TripDetailsProps {
  bookingData: BookingData
  getTravelDate: (bookingData: BookingData) => string
  status: 'success' | 'cancelled'
}

export const TripDetails = memo<TripDetailsProps>(({ bookingData, getTravelDate, status }) => {
  const seatNumbers = bookingData.booking.seats.map((seat) => seat.seatNumber).sort()

  // Format time function
  const formatTime = (dateStr: string): string => {
    try {
      const date = new Date(dateStr)
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      })
    } catch {
      return ''
    }
  }

  // Build route display
  const getRouteDisplay = (): string => {
    if (bookingData.trip.from?.province && bookingData.trip.to?.province) {
      return `${bookingData.trip.from.province} → ${bookingData.trip.to.province}`
    }
    // Fallback to trip name if no terminal info
    return bookingData.trip.tripName
  }

  const getThemeColors = () => {
    if (status === 'success') {
      return {
        bgGradient: 'bg-gradient-to-r from-green-50/80 via-white/90 to-emerald-50/80',
        border: 'border-green-200/30',
        accentBar: 'bg-gradient-to-b from-green-500 to-emerald-500',
        textGradient: 'bg-gradient-to-r from-green-600 to-emerald-600',
        iconBg: 'bg-gradient-to-br from-green-100 to-emerald-100',
        iconColor: 'text-green-600',
      }
    } else {
      return {
        bgGradient: 'bg-gradient-to-r from-red-50/80 via-white/90 to-orange-50/80',
        border: 'border-red-200/30',
        accentBar: 'bg-gradient-to-b from-red-500 to-orange-500',
        textGradient: 'bg-gradient-to-r from-red-600 to-orange-600',
        iconBg: 'bg-gradient-to-br from-red-100 to-orange-100',
        iconColor: 'text-red-600',
      }
    }
  }

  const theme = getThemeColors()

  return (
    <div
      className={`${theme.bgGradient} rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8 ${theme.border} backdrop-blur-sm`}
    >
      <div className="flex items-center gap-3 mb-4 sm:mb-6">
        <div className={`w-2 h-8 ${theme.accentBar} rounded-full`} />
        <h3 className={`text-xl font-bold ${theme.textGradient} bg-clip-text text-transparent`}>
          Trip Details
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
        {/* Route & Date */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 ${theme.iconBg} rounded-xl flex items-center justify-center`}
            >
              <MapPin className={`w-5 h-5 ${theme.iconColor}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-600">Route</p>
              <p className="font-bold text-gray-800 truncate">{getRouteDisplay()}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 ${theme.iconBg} rounded-xl flex items-center justify-center`}
            >
              <Calendar className={`w-5 h-5 ${theme.iconColor}`} />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-600">Travel Date</p>
              <p className="font-bold text-gray-800">{getTravelDate(bookingData)}</p>
              {formatTime(bookingData.booking.date) && (
                <p className="text-sm text-gray-600 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatTime(bookingData.booking.date)}
                </p>
              )}
            </div>
          </div>

          {bookingData.trip.bus && (
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 ${theme.iconBg} rounded-xl flex items-center justify-center`}
              >
                <svg
                  className={`w-5 h-5 ${theme.iconColor}`}
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M4 16c0 .88.39 1.67 1 2.22V20c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h8v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1.78c.61-.55 1-1.34 1-2.22V6c0-3.5-3.58-4-8-4s-8 .5-8 4v10zm3.5 1c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-6H6V6h12v5z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-600">Bus Details</p>
                <p className="font-bold text-gray-800">
                  Bus #{bookingData.trip.bus.number}
                  {bookingData.trip.bus.type && (
                    <span className="text-sm font-normal text-gray-600 ml-2">
                      - {bookingData.trip.bus.type.name}
                    </span>
                  )}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Price & Seats */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 ${theme.iconBg} rounded-xl flex items-center justify-center`}
            >
              <CreditCard className={`w-5 h-5 ${theme.iconColor}`} />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-600">Price Calculation</p>
              <p
                className={`font-bold text-gray-800 ${status === 'cancelled' ? 'line-through opacity-75' : ''}`}
              >
                {bookingData.booking.pricePerSeat.toLocaleString()} AF ×{' '}
                {bookingData.booking.seats.length} seat
                {bookingData.booking.seats.length > 1 ? 's' : ''}
              </p>
              <p
                className={`text-sm font-semibold ${status === 'cancelled' ? 'line-through opacity-75' : 'text-green-600'}`}
              >
                Total: {bookingData.booking.totalPrice.toLocaleString()} AF
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 ${theme.iconBg} rounded-xl flex items-center justify-center`}
            >
              <Armchair className={`w-5 h-5 ${theme.iconColor}`} />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-600">Seat Number</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {seatNumbers.map((seatNumber, index) => (
                  <span
                    key={index}
                    className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold ${
                      status === 'cancelled'
                        ? 'bg-red-100 text-red-700 line-through'
                        : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {seatNumber}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
})

TripDetails.displayName = 'TripDetails'
