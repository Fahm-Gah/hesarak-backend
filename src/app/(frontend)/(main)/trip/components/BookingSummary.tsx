import React, { useMemo, memo } from 'react'
import { Loader2, CreditCard, Users } from 'lucide-react'
import clsx from 'clsx'

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
  }
  to: {
    id: string
    name: string
    province: string
  } | null
}

interface UserBookingInfo {
  canBookMoreSeats: boolean
  remainingSeatsAllowed: number
  totalBookedSeats: number
  maxSeatsPerUser: number
}

interface BookingSummaryProps {
  tripDetails: TripDetails
  busLayout: BusLayoutElement[]
  selectedSeats: string[]
  userBookingInfo: UserBookingInfo | null
  isAuthenticated: boolean
  onProceedToBooking: () => void
  onClearSelection: () => void
  isLoading?: boolean
  className?: string
}

const EmptyState = memo<{
  userBookingInfo: UserBookingInfo | null
  isAuthenticated: boolean
}>(({ userBookingInfo, isAuthenticated }) => (
  <div className="text-center py-8">
    <div className="mx-auto w-16 h-16 bg-gradient-to-br from-orange-100 to-orange-200 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
      <Users className="w-8 h-8 text-orange-600" />
    </div>
    <h4 className="text-lg font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-2">
      Select Your Seats
    </h4>
    <p className="text-gray-600 text-sm">
      Choose your preferred seats from the layout above to continue.
    </p>

    {isAuthenticated && userBookingInfo && (
      <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200/50">
        <div className="text-sm text-blue-700">
          <p className="font-semibold mb-1">Booking Limits:</p>
          <p>
            You can book up to{' '}
            <span className="font-bold">{userBookingInfo.remainingSeatsAllowed}</span> more seats
          </p>
          <p className="text-xs mt-1 text-blue-600">
            ({userBookingInfo.totalBookedSeats} of {userBookingInfo.maxSeatsPerUser} seats already
            booked)
          </p>
        </div>
      </div>
    )}
  </div>
))

EmptyState.displayName = 'EmptyState'

export const BookingSummary = memo<BookingSummaryProps>(
  ({
    tripDetails,
    busLayout,
    selectedSeats,
    userBookingInfo,
    isAuthenticated,
    onProceedToBooking,
    onClearSelection,
    isLoading = false,
    className = '',
  }) => {
    const formatTo12Hour = (time24: string): string => {
      const [hours, minutes] = time24.split(':')
      const hour = parseInt(hours, 10)
      const period = hour >= 12 ? 'PM' : 'AM'
      const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
      return `${hour12}:${minutes} ${period}`
    }

    const { selectedSeatNumbers, totalPrice, hasSelectedSeats } = useMemo(() => {
      const seatNumbers = selectedSeats
        .map((seatId) => {
          const seat = busLayout.find((element) => element.id === seatId && element.type === 'seat')
          return seat?.seatNumber
        })
        .filter(Boolean)
        .sort((a, b) => {
          // Natural sort for seat numbers
          const aNum = parseInt(a?.replace(/\D/g, '') || '0')
          const bNum = parseInt(b?.replace(/\D/g, '') || '0')
          return aNum - bNum
        })

      return {
        selectedSeatNumbers: seatNumbers,
        totalPrice: selectedSeats.length * tripDetails.price,
        hasSelectedSeats: selectedSeats.length > 0,
      }
    }, [selectedSeats, busLayout, tripDetails.price])

    if (!hasSelectedSeats) {
      return (
        <div
          className={clsx(
            'bg-gradient-to-br from-white via-orange-50/20 to-red-50/20 rounded-3xl shadow-xl border border-orange-200/50 p-8 backdrop-blur-sm',
            className,
          )}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-2 h-8 bg-gradient-to-b from-orange-500 to-red-500 rounded-full" />
            <h3 className="text-xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              Booking Summary
            </h3>
          </div>

          <EmptyState userBookingInfo={userBookingInfo} isAuthenticated={isAuthenticated} />
        </div>
      )
    }

    return (
      <div
        className={clsx(
          'bg-gradient-to-br from-white via-orange-50/20 to-red-50/20 rounded-3xl shadow-xl border border-orange-200/50 p-8 backdrop-blur-sm',
          className,
        )}
      >
        <div className="flex items-center gap-3 mb-8">
          <div className="w-2 h-8 bg-gradient-to-b from-orange-500 to-red-500 rounded-full" />
          <h3 className="text-xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
            Booking Summary
          </h3>
        </div>

        {/* Trip Info Summary */}
        <div className="bg-gradient-to-r from-orange-50/80 via-white/90 to-red-50/80 rounded-2xl p-6 mb-8 border border-orange-200/30 backdrop-blur-sm">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Route</span>
              <span className="font-bold text-gray-800">
                {tripDetails.from.name} → {tripDetails.to?.name}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Date</span>
              <span className="font-bold text-gray-800">{tripDetails.originalDate}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Departure</span>
              <span className="font-bold text-gray-800">
                {formatTo12Hour(tripDetails.departureTime)}
              </span>
            </div>
            {tripDetails.arrivalTime && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Arrival</span>
                <span className="font-bold text-gray-800">
                  {formatTo12Hour(tripDetails.arrivalTime)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Selected Seats */}
        <div className="mb-8">
          <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span>Selected Seats</span>
            <div className="flex items-center gap-1 bg-gradient-to-r from-orange-100 to-red-100 px-2 py-1 rounded-lg">
              <div className="w-1.5 h-1.5 bg-gradient-to-r from-orange-500 to-red-500 rounded-full animate-pulse" />
              <span className="text-xs font-semibold text-orange-700">{selectedSeats.length}</span>
            </div>
          </h4>
          <div className="space-y-3">
            {selectedSeatNumbers.map((seatNumber) => (
              <div
                key={seatNumber}
                className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-100 via-orange-50 to-red-100 rounded-2xl border border-orange-200/50 shadow-sm hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 text-white rounded-xl flex items-center justify-center text-sm font-bold shadow-lg">
                    {seatNumber}
                  </div>
                  <span className="font-semibold text-gray-800">Seat {seatNumber}</span>
                </div>
                <span className="font-bold text-gray-800 text-lg">
                  {tripDetails.price.toLocaleString()} AF
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing Breakdown */}
        <div className="border-t border-orange-200/50 pt-6 mb-8">
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 font-medium">
                {selectedSeats.length} seat{selectedSeats.length > 1 ? 's' : ''} ×{' '}
                {tripDetails.price.toLocaleString()} AF
              </span>
              <span className="text-gray-800 font-semibold">{totalPrice.toLocaleString()} AF</span>
            </div>
            <div className="flex items-center justify-between text-xl font-bold pt-3 border-t border-orange-200/30">
              <span className="text-gray-800">Total Amount</span>
              <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                {totalPrice.toLocaleString()} AF
              </span>
            </div>
          </div>
        </div>

        {/* User Booking Info */}
        {userBookingInfo && (
          <div className="mb-8 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200/50">
            <div className="text-sm text-blue-700">
              <p className="font-semibold mb-1">Booking Status:</p>
              <p>
                You can book{' '}
                <span className="font-bold">
                  {userBookingInfo.remainingSeatsAllowed - selectedSeats.length}
                </span>{' '}
                more seats after this booking
              </p>
              <p className="text-xs mt-1 text-blue-600">
                ({userBookingInfo.totalBookedSeats + selectedSeats.length} of{' '}
                {userBookingInfo.maxSeatsPerUser} seats will be booked)
              </p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-4">
          <button
            onClick={onProceedToBooking}
            disabled={isLoading || !hasSelectedSeats}
            className={clsx(
              'w-full py-4 px-6 rounded-2xl font-bold text-lg transition-all duration-300 shadow-lg',
              hasSelectedSeats && !isLoading
                ? 'bg-gradient-to-r from-orange-600 via-orange-500 to-red-600 hover:from-orange-700 hover:via-orange-600 hover:to-red-700 text-white shadow-orange-500/30 hover:shadow-orange-500/50 transform hover:-translate-y-1 hover:scale-105'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-gray-200/30',
            )}
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-3">
                <Loader2 className="w-6 h-6 animate-spin" />
                <span>Processing...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-3">
                <CreditCard className="w-6 h-6" />
                <span>
                  Book {selectedSeats.length} Seat{selectedSeats.length > 1 ? 's' : ''}
                </span>
              </div>
            )}
          </button>

          {hasSelectedSeats && (
            <button
              onClick={onClearSelection}
              disabled={isLoading}
              className="w-full py-3 px-4 border-2 border-orange-200 rounded-2xl font-semibold text-gray-700 hover:bg-orange-50 hover:border-orange-300 transition-all duration-200 disabled:opacity-50"
            >
              Clear Selection
            </button>
          )}
        </div>

        {/* Terms and Conditions */}
        <div className="mt-8 pt-6 border-t border-orange-200/50">
          <div className="text-xs text-gray-500 space-y-2 leading-relaxed">
            <p className="flex items-start gap-2">
              <span className="w-1 h-1 bg-orange-400 rounded-full mt-2 flex-shrink-0" />
              <span>Seats are held for 15 minutes during the booking process</span>
            </p>
            <p className="flex items-start gap-2">
              <span className="w-1 h-1 bg-orange-400 rounded-full mt-2 flex-shrink-0" />
              <span>Payment must be completed within 24 hours of booking</span>
            </p>
            <p className="flex items-start gap-2">
              <span className="w-1 h-1 bg-orange-400 rounded-full mt-2 flex-shrink-0" />
              <span>Cancellation policies apply as per terms and conditions</span>
            </p>
          </div>
        </div>
      </div>
    )
  },
)

BookingSummary.displayName = 'BookingSummary'
