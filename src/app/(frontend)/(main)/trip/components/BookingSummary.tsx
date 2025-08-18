import React from 'react'
import { MapPin, AlertTriangle, Loader2 } from 'lucide-react'

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

export const BookingSummary = ({
  tripDetails,
  busLayout,
  selectedSeats,
  userBookingInfo,
  isAuthenticated,
  onProceedToBooking,
  onClearSelection,
  isLoading = false,
  className = ''
}: BookingSummaryProps) => {
  const formatTo12Hour = (time24: string): string => {
    const [hours, minutes] = time24.split(':')
    const hour = parseInt(hours, 10)
    const period = hour >= 12 ? 'PM' : 'AM'
    const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
    return `${hour12}:${minutes} ${period}`
  }

  const getSelectedSeatNumbers = () => {
    return selectedSeats
      .map(seatId => {
        const seat = busLayout.find(element => element.id === seatId && element.type === 'seat')
        return seat?.seatNumber
      })
      .filter(Boolean)
      .sort((a, b) => {
        // Natural sort for seat numbers
        const aNum = parseInt(a?.replace(/\D/g, '') || '0')
        const bNum = parseInt(b?.replace(/\D/g, '') || '0')
        return aNum - bNum
      })
  }

  const selectedSeatNumbers = getSelectedSeatNumbers()
  const totalPrice = selectedSeats.length * tripDetails.price
  const hasSelectedSeats = selectedSeats.length > 0

  if (!hasSelectedSeats) {
    return (
      <div className={`bg-white rounded-2xl shadow-lg border border-gray-200 p-6 ${className}`}>
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Booking Summary</h3>
        
        <div className="text-center py-8">
          <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <MapPin className="w-8 h-8 text-gray-400" />
          </div>
          <h4 className="text-lg font-medium text-gray-700 mb-2">Select Your Seats</h4>
          <p className="text-gray-500">
            Choose your preferred seats from the layout above to continue.
          </p>
          
          {isAuthenticated && userBookingInfo && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <div className="text-sm text-blue-700">
                <p className="font-medium">Booking Limits:</p>
                <p>You can book up to {userBookingInfo.remainingSeatsAllowed} more seats</p>
                <p className="text-xs mt-1">
                  ({userBookingInfo.totalBookedSeats} of {userBookingInfo.maxSeatsPerUser} seats already booked)
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-2xl shadow-lg border border-gray-200 p-6 ${className}`}>
      <h3 className="text-xl font-semibold text-gray-800 mb-6">Booking Summary</h3>
      
      {/* Trip Info Summary */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">Route</span>
          <span className="font-medium text-gray-800">
            {tripDetails.from.name} → {tripDetails.to?.name}
          </span>
        </div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">Date</span>
          <span className="font-medium text-gray-800">{tripDetails.originalDate}</span>
        </div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">Departure</span>
          <span className="font-medium text-gray-800">
            {formatTo12Hour(tripDetails.departureTime)}
          </span>
        </div>
        {tripDetails.arrivalTime && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Arrival</span>
            <span className="font-medium text-gray-800">
              {formatTo12Hour(tripDetails.arrivalTime)}
            </span>
          </div>
        )}
      </div>

      {/* Selected Seats */}
      <div className="mb-6">
        <h4 className="font-medium text-gray-700 mb-3">Selected Seats</h4>
        <div className="space-y-2">
          {selectedSeatNumbers.map((seatNumber, index) => (
            <div key={seatNumber} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-orange-500 text-white rounded-lg flex items-center justify-center text-sm font-medium mr-3">
                  {seatNumber}
                </div>
                <span className="font-medium text-gray-800">Seat {seatNumber}</span>
              </div>
              <span className="font-semibold text-gray-800">
                {tripDetails.price.toLocaleString()} AF
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Pricing Breakdown */}
      <div className="border-t border-gray-200 pt-4 mb-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">
              {selectedSeats.length} seat{selectedSeats.length > 1 ? 's' : ''} × {tripDetails.price.toLocaleString()} AF
            </span>
            <span className="text-gray-800">{totalPrice.toLocaleString()} AF</span>
          </div>
          <div className="flex items-center justify-between text-lg font-semibold pt-2 border-t border-gray-100">
            <span className="text-gray-800">Total</span>
            <span className="text-orange-600">{totalPrice.toLocaleString()} AF</span>
          </div>
        </div>
      </div>

      {/* User Booking Info */}
      {userBookingInfo && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <div className="text-sm text-blue-700">
            <p className="font-medium mb-1">Booking Status:</p>
            <p>
              You can book {userBookingInfo.remainingSeatsAllowed - selectedSeats.length} more seats after this booking
            </p>
            <p className="text-xs mt-1">
              ({userBookingInfo.totalBookedSeats + selectedSeats.length} of {userBookingInfo.maxSeatsPerUser} seats will be booked)
            </p>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-3">
        <button
          onClick={onProceedToBooking}
          disabled={isLoading || !hasSelectedSeats}
          className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-200 ${
            hasSelectedSeats && !isLoading
              ? 'bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              Processing...
            </div>
          ) : (
            `Book ${selectedSeats.length} Seat${selectedSeats.length > 1 ? 's' : ''}`
          )}
        </button>

        {hasSelectedSeats && (
          <button
            onClick={onClearSelection}
            disabled={isLoading}
            className="w-full py-2 px-4 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50"
          >
            Clear Selection
          </button>
        )}
      </div>


      {/* Terms and Conditions */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="text-xs text-gray-500 space-y-1">
          <p>• Seats are held for 15 minutes during the booking process</p>
          <p>• Payment must be completed within 24 hours of booking</p>
          <p>• Cancellation policies apply as per terms and conditions</p>
        </div>
      </div>
    </div>
  )
}