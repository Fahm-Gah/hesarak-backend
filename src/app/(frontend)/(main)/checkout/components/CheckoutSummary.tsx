import React, { memo } from 'react'
import { MapPin, Clock, Calendar, Users } from 'lucide-react'
import clsx from 'clsx'

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
}

interface SelectedSeat {
  id: string
  seatNumber: string
  isBooked: boolean
}

interface CheckoutSummaryProps {
  tripDetails: TripDetails
  selectedSeats: SelectedSeat[]
  totalPrice: number
  className?: string
}

export const CheckoutSummary = memo<CheckoutSummaryProps>(
  ({ tripDetails, selectedSeats, totalPrice, className = '' }) => {
    const formatTo12Hour = (time24: string): string => {
      const [hours, minutes] = time24.split(':')
      const hour = parseInt(hours, 10)
      const period = hour >= 12 ? 'PM' : 'AM'
      const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
      return `${hour12}:${minutes} ${period}`
    }

    const seatNumbers = selectedSeats
      .map((seat) => seat.seatNumber)
      .sort((a, b) => {
        const aNum = parseInt(a.replace(/\D/g, '') || '0')
        const bNum = parseInt(b.replace(/\D/g, '') || '0')
        return aNum - bNum
      })

    return (
      <div
        className={clsx(
          'bg-gradient-to-br from-white via-orange-50/20 to-red-50/20 rounded-3xl shadow-xl border border-orange-200/50 p-6 sm:p-8 backdrop-blur-sm',
          className,
        )}
      >
        <div className="flex items-center gap-3 mb-6 sm:mb-8">
          <div className="w-2 h-8 bg-gradient-to-b from-orange-500 to-red-500 rounded-full" />
          <h3 className="text-xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
            Booking Summary
          </h3>
        </div>

        {/* Trip Information */}
        <div className="bg-gradient-to-r from-orange-50/80 via-white/90 to-red-50/80 rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8 border border-orange-200/30 backdrop-blur-sm">
          <div className="space-y-3 sm:space-y-4">
            {/* Route */}
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-orange-600 flex-shrink-0" />
              <div className="flex-1">
                <div className="font-bold text-gray-800 text-base sm:text-lg">
                  {tripDetails.from.name} → {tripDetails.to?.name}
                </div>
              </div>
            </div>

            {/* Date & Time */}
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-orange-600 flex-shrink-0" />
              <div>
                <div className="font-semibold text-gray-800 text-sm sm:text-base">
                  {tripDetails.originalDate}
                </div>
                <div className="text-xs sm:text-sm text-gray-600">Travel Date</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-orange-600 flex-shrink-0" />
              <div>
                <div className="font-semibold text-gray-800 text-sm sm:text-base">
                  {formatTo12Hour(tripDetails.departureTime)}
                  {tripDetails.arrivalTime && (
                    <span className="text-gray-600">
                      {' '}
                      → {formatTo12Hour(tripDetails.arrivalTime)}
                    </span>
                  )}
                </div>
                <div className="text-xs sm:text-sm text-gray-600">
                  {tripDetails.duration ? `Duration: ${tripDetails.duration}` : 'Departure Time'}
                </div>
              </div>
            </div>

            {tripDetails.bus && (
              <div className="flex items-center gap-3">
                <svg
                  className="w-5 h-5 text-orange-600 flex-shrink-0"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M4 16c0 .88.39 1.67 1 2.22V20c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h8v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1.78c.61-.55 1-1.34 1-2.22V6c0-3.5-3.58-4-8-4s-8 .5-8 4v10zm3.5 1c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-6H6V6h12v5z" />
                </svg>
                <div>
                  <div className="font-semibold text-gray-800 text-sm sm:text-base">
                    Bus #{tripDetails.bus.number}
                    {tripDetails.bus.type && (
                      <span className="text-xs sm:text-sm text-gray-600 ml-2">
                        - {tripDetails.bus.type.name}
                      </span>
                    )}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600">Bus Details</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Selected Seats */}
        <div className="mb-6 sm:mb-8">
          <h4 className="font-bold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2 text-sm sm:text-base">
            <Users className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
            <span>Selected Seats</span>
            <div className="flex items-center gap-1 bg-gradient-to-r from-orange-100 to-red-100 px-2 py-1 rounded-lg">
              <div className="w-1.5 h-1.5 bg-gradient-to-r from-orange-500 to-red-500 rounded-full" />
              <span className="text-xs font-semibold text-orange-700">{selectedSeats.length}</span>
            </div>
          </h4>

          <div className="space-y-2 sm:space-y-3">
            {seatNumbers.map((seatNumber) => (
              <div
                key={seatNumber}
                className="flex items-center justify-between p-3 sm:p-4 bg-gradient-to-r from-orange-100 via-orange-50 to-red-100 rounded-2xl border border-orange-200/50"
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-orange-500 to-red-500 text-white rounded-xl flex items-center justify-center text-xs sm:text-sm font-bold shadow-lg">
                    {seatNumber}
                  </div>
                  <span className="font-semibold text-gray-800 text-sm sm:text-base">
                    Seat {seatNumber}
                  </span>
                </div>
                <span className="font-bold text-gray-800 text-sm sm:text-base">
                  {tripDetails.price.toLocaleString()} AF
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Price Breakdown */}
        <div className="border-t border-orange-200/50 pt-4 sm:pt-6 mb-6 sm:mb-8">
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <span className="text-gray-600 font-medium">
                {selectedSeats.length} seat{selectedSeats.length > 1 ? 's' : ''} ×{' '}
                {tripDetails.price.toLocaleString()} AF
              </span>
              <span className="text-gray-800 font-semibold">{totalPrice.toLocaleString()} AF</span>
            </div>

            <div className="flex items-center justify-between text-lg sm:text-xl font-bold pt-3 border-t border-orange-200/30">
              <span className="text-gray-800">Total Amount</span>
              <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                {totalPrice.toLocaleString()} AF
              </span>
            </div>
          </div>
        </div>

        {/* Payment Info */}
        <div className="bg-gradient-to-r from-orange-50/80 via-white/90 to-red-50/80 rounded-2xl p-3 sm:p-4 border border-orange-200/50">
          <div className="text-xs sm:text-sm text-orange-700">
            <div className="font-semibold mb-2">Next Step:</div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0" />
              <span>Complete payment to confirm booking</span>
            </div>
          </div>
        </div>
      </div>
    )
  },
)

CheckoutSummary.displayName = 'CheckoutSummary'
