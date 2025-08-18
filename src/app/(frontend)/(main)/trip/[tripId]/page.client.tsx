'use client'

import React, { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Breadcrumbs } from '@/app/(frontend)/components/Breadcrumbs'
import { SeatLayout } from '../components/SeatLayout'
import { TripInfo } from '../components/TripInfo'
import { BookingSummary } from '../components/BookingSummary'
import { XCircle, Phone } from 'lucide-react'

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
}

export const TripDetailsClient = ({
  tripDetails,
  user,
  isAuthenticated
}: TripDetailsClientProps) => {
  const router = useRouter()
  const [selectedSeats, setSelectedSeats] = useState<string[]>([])
  const [isBookingLoading, setIsBookingLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Calculate if user can select more seats
  // Default to 2 seats if userBookingInfo is not available (for unauthenticated users or when API doesn't return it)
  const maxAllowedSeats = tripDetails.userBookingInfo?.remainingSeatsAllowed ?? 2
  const canBookMoreSeats = tripDetails.userBookingInfo?.canBookMoreSeats ?? true
  // Allow seat selection for both authenticated and unauthenticated users
  const canSelectMoreSeats = canBookMoreSeats && selectedSeats.length < maxAllowedSeats
  
  

  const handleSeatSelect = useCallback((seatId: string) => {
    setError(null)

    setSelectedSeats(prev => {
      const isCurrentlySelected = prev.includes(seatId)
      
      if (isCurrentlySelected) {
        // Deselect seat
        return prev.filter(id => id !== seatId)
      } else {
        // Check if user can select more seats
        const maxSeats = tripDetails.userBookingInfo?.remainingSeatsAllowed ?? 2
        if (prev.length >= maxSeats) {
          setError(`You can only select up to ${maxSeats} seats`)
          return prev
        }
        
        // Select seat
        return [...prev, seatId]
      }
    })
  }, [isAuthenticated, tripDetails.userBookingInfo?.remainingSeatsAllowed])

  const handleClearSelection = useCallback(() => {
    setSelectedSeats([])
    setError(null)
  }, [])

  const handleProceedToBooking = useCallback(async () => {
    if (selectedSeats.length === 0) {
      setError('Please select at least one seat')
      return
    }

    setIsBookingLoading(true)
    setError(null)

    try {
      if (!isAuthenticated) {
        // Create checkout URL with selected seats and trip details
        const checkoutUrl = `/checkout?tripId=${tripDetails.id}&date=${encodeURIComponent(tripDetails.searchDate)}&seats=${selectedSeats.join(',')}`
        const loginUrl = '/auth/login?redirect=' + encodeURIComponent(checkoutUrl)
        router.push(loginUrl)
      } else {
        // Navigate directly to checkout for authenticated users
        const checkoutUrl = `/checkout?tripId=${tripDetails.id}&date=${encodeURIComponent(tripDetails.searchDate)}&seats=${selectedSeats.join(',')}`
        router.push(checkoutUrl)
      }
      
    } catch (err) {
      console.error('Booking error:', err)
      setError('Failed to proceed with booking. Please try again.')
    } finally {
      setIsBookingLoading(false)
    }
  }, [isAuthenticated, selectedSeats, router, tripDetails.id, tripDetails.searchDate])

  // Build search URL with parameters to maintain search context  
  const searchUrl = `/search?from=${encodeURIComponent(tripDetails.from.province)}&to=${encodeURIComponent(tripDetails.to?.province || '')}&date=${encodeURIComponent(tripDetails.searchDate)}`

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Search Results', href: searchUrl },
    { label: 'Trip Details' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Breadcrumbs */}
        <div className="mb-6">
          <Breadcrumbs items={breadcrumbItems} />
        </div>


        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <XCircle className="w-5 h-5 text-red-500 mr-2" />
              <span className="text-red-700 text-sm">{error}</span>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Left Column - Trip Info */}
          <div className="xl:col-span-2">
            <TripInfo tripDetails={tripDetails} />
          </div>

          {/* Right Column - Seat Selection and Booking Summary */}
          <div className="xl:col-span-1 space-y-6">
            {/* Seat Selection */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-800">Select Your Seats</h3>
                {selectedSeats.length > 0 && (
                  <div className="text-sm text-gray-600">
                    {selectedSeats.length} seat{selectedSeats.length > 1 ? 's' : ''} selected
                  </div>
                )}
              </div>
              
              <SeatLayout
                busLayout={tripDetails.busLayout}
                selectedSeats={selectedSeats}
                onSeatSelect={handleSeatSelect}
                canSelectMoreSeats={canSelectMoreSeats}
                maxSeatsAllowed={Math.max(maxAllowedSeats, 1)}
                currentSelectedCount={selectedSeats.length}
                isAuthenticated={isAuthenticated}
              />
            </div>

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
        <div className="mt-8 bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Important Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-600">
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Booking Policy</h4>
              <ul className="space-y-1 list-disc list-inside">
                <li>Maximum {tripDetails.userBookingInfo?.maxSeatsPerUser || 2} seats per user</li>
                <li>Payment required within 24 hours</li>
                <li>Cancellation allowed up to 24 hours before departure</li>
                <li>Refund processing takes 3-5 business days</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Travel Requirements</h4>
              <ul className="space-y-1 list-disc list-inside">
                <li>Valid ID required for boarding</li>
                <li>Arrive 30 minutes before departure</li>
                <li>No smoking or alcohol on board</li>
                <li>Luggage weight limit: 20kg per passenger</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="mt-6 bg-gradient-to-r from-orange-100 to-red-100 rounded-2xl border border-orange-200 p-6">
          <div className="flex items-center">
            <Phone className="w-6 h-6 text-orange-600 mr-3" />
            <div>
              <h4 className="font-medium text-orange-800">Need Help?</h4>
              <p className="text-orange-700 text-sm">
                Contact our support team for assistance with your booking or travel questions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}