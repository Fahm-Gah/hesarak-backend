'use client'

import React, { memo, useCallback } from 'react'
import {
  CheckCircle2,
  Download,
  Calendar,
  Clock,
  MapPin,
  User,
  Phone,
  CreditCard,
  Home,
  Share2,
  Copy,
} from 'lucide-react'
import clsx from 'clsx'

interface BookingData {
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
    paymentDeadline?: string
  }
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

interface BookingConfirmationProps {
  bookingData: BookingData
  tripDetails: TripDetails
  className?: string
}

export const BookingConfirmation = memo<BookingConfirmationProps>(
  ({ bookingData, tripDetails, className = '' }) => {
    const formatTo12Hour = useCallback((time24: string): string => {
      const [hours, minutes] = time24.split(':')
      const hour = parseInt(hours, 10)
      const period = hour >= 12 ? 'PM' : 'AM'
      const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
      return `${hour12}:${minutes} ${period}`
    }, [])

    const handleDownloadTicket = useCallback(() => {
      // This would implement PDF ticket generation
      console.log('Download ticket:', bookingData.ticketNumber)
    }, [bookingData.ticketNumber])

    const handleShareBooking = useCallback(async () => {
      if (navigator.share) {
        try {
          await navigator.share({
            title: 'Bus Ticket Booking',
            text: `Booking confirmed! Ticket: ${bookingData.ticketNumber}`,
            url: window.location.href,
          })
        } catch (error) {
          console.log('Error sharing:', error)
        }
      } else {
        // Fallback: copy to clipboard
        navigator.clipboard.writeText(
          `Booking Confirmed!\nTicket: ${bookingData.ticketNumber}\nRoute: ${tripDetails.from.name} → ${tripDetails.to?.name}\nDate: ${bookingData.booking.originalDate}`,
        )
      }
    }, [bookingData, tripDetails])

    const handleCopyTicketNumber = useCallback(() => {
      navigator.clipboard.writeText(bookingData.ticketNumber)
    }, [bookingData.ticketNumber])

    const seatNumbers = bookingData.booking.seats
      .map((seat) => seat.seatNumber)
      .sort((a, b) => {
        const aNum = parseInt(a.replace(/\D/g, '') || '0')
        const bNum = parseInt(b.replace(/\D/g, '') || '0')
        return aNum - bNum
      })
      .join(', ')

    return (
      <div
        className={clsx(
          'bg-gradient-to-br from-white via-green-50/20 to-emerald-50/20 rounded-3xl shadow-xl border border-green-200/50 p-8 backdrop-blur-sm',
          className,
        )}
      >
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <CheckCircle2 className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
            Booking Confirmed!
          </h2>
          <p className="text-gray-600">Your seats have been successfully reserved</p>
        </div>

        {/* Ticket Number */}
        <div className="bg-gradient-to-r from-green-100 via-green-50 to-emerald-100 rounded-2xl p-6 mb-8 border border-green-200/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Ticket Number</p>
              <p className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                {bookingData.ticketNumber}
              </p>
            </div>
            <button
              onClick={handleCopyTicketNumber}
              className="p-3 bg-white/80 hover:bg-white border border-green-200 rounded-xl transition-all duration-200 hover:shadow-md"
              title="Copy ticket number"
            >
              <Copy className="w-5 h-5 text-green-600" />
            </button>
          </div>
        </div>

        {/* Trip Details */}
        <div className="bg-white/90 rounded-2xl p-6 mb-8 border border-green-200/30 backdrop-blur-sm">
          <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-green-600" />
            Trip Details
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Route */}
            <div>
              <p className="text-sm font-medium text-gray-600 mb-2">Route</p>
              <div className="font-bold text-gray-800 text-lg">
                {tripDetails.from.name} → {tripDetails.to?.name}
              </div>
              <div className="text-sm text-gray-600">
                {tripDetails.from.province} to {tripDetails.to?.province}
              </div>
            </div>

            {/* Date & Time */}
            <div>
              <p className="text-sm font-medium text-gray-600 mb-2">Date & Time</p>
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="w-4 h-4 text-green-600" />
                <span className="font-semibold text-gray-800">
                  {bookingData.booking.originalDate}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-green-600" />
                <span className="font-semibold text-gray-800">
                  {formatTo12Hour(tripDetails.departureTime)}
                  {tripDetails.arrivalTime && (
                    <span className="text-gray-600">
                      {' '}
                      → {formatTo12Hour(tripDetails.arrivalTime)}
                    </span>
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Passenger & Booking Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Passenger Details */}
          <div className="bg-white/90 rounded-2xl p-6 border border-green-200/30">
            <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-green-600" />
              Passenger Details
            </h4>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Full Name</p>
                <p className="font-semibold text-gray-800">{bookingData.passenger.fullName}</p>
              </div>
              {bookingData.passenger.fatherName && (
                <div>
                  <p className="text-sm text-gray-600">Father's Name</p>
                  <p className="font-semibold text-gray-800">{bookingData.passenger.fatherName}</p>
                </div>
              )}
              {bookingData.passenger.phoneNumber && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-gray-800">{bookingData.passenger.phoneNumber}</span>
                </div>
              )}
            </div>
          </div>

          {/* Booking Summary */}
          <div className="bg-white/90 rounded-2xl p-6 border border-green-200/30">
            <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-green-600" />
              Booking Summary
            </h4>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Selected Seats</p>
                <p className="font-semibold text-gray-800">{seatNumbers}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Amount</p>
                <p className="font-bold text-lg text-gray-800">
                  {bookingData.booking.totalPrice.toLocaleString()} AF
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Payment Status</p>
                <div
                  className={clsx(
                    'inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold',
                    bookingData.status.isPaid
                      ? 'bg-green-100 text-green-700'
                      : 'bg-orange-100 text-orange-700',
                  )}
                >
                  {bookingData.status.isPaid ? 'Paid' : 'Pay at Pickup'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Important Instructions */}
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-6 mb-8">
          <h4 className="font-bold text-orange-800 mb-3">Important Instructions</h4>
          <ul className="space-y-2 text-sm text-orange-800">
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 flex-shrink-0" />
              <span>Arrive at the pickup location at least 15 minutes before departure time</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 flex-shrink-0" />
              <span>Bring a valid ID that matches the passenger information</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 flex-shrink-0" />
              <span>Show this confirmation to the conductor when boarding</span>
            </li>
            {!bookingData.status.isPaid && (
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 flex-shrink-0" />
                <span>Payment must be completed before departure (cash or card accepted)</span>
              </li>
            )}
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={handleDownloadTicket}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-2xl font-semibold hover:from-green-600 hover:to-emerald-600 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <Download className="w-5 h-5" />
            Download Ticket
          </button>

          <button
            onClick={handleShareBooking}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-white border-2 border-green-300 text-green-600 rounded-2xl font-semibold hover:bg-green-50 hover:border-green-400 transition-all duration-200"
          >
            <Share2 className="w-5 h-5" />
            Share Booking
          </button>

          <button
            onClick={() => (window.location.href = '/')}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gray-100 border-2 border-gray-300 text-gray-700 rounded-2xl font-semibold hover:bg-gray-200 hover:border-gray-400 transition-all duration-200"
          >
            <Home className="w-5 h-5" />
            Back to Home
          </button>
        </div>
      </div>
    )
  },
)

BookingConfirmation.displayName = 'BookingConfirmation'
