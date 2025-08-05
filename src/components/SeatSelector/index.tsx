// index.tsx
'use client'

import React, { useCallback, useMemo } from 'react'
import { useFormFields, toast, ShimmerEffect } from '@payloadcms/ui'
import type { ArrayFieldClientComponent } from 'payload'
import { useSeatSelector } from './hooks/useSeatSelector'

// Import all components together for cleaner imports
import { Legend } from './components/Legend'
import { SelectedSeatsList } from './components/SelectedSeatsList'
import { SeatCell } from './components/SeatCell'
import { TripHeader } from './components/TripHeader'
import { StateDisplay } from './components/StateDisplay'

import './index.scss'

export const SeatSelectorField: ArrayFieldClientComponent = ({ field, path, readOnly = false }) => {
  // Extract trip and date from form fields
  const { tripId, travelDate } = useFormFields(([fields]) => ({
    tripId: fields.trip?.value as string | undefined,
    travelDate: fields.date?.value as string | undefined,
  }))

  // Use the hook to manage state and logic
  const {
    trip,
    loading,
    error,
    gridDimensions,
    selectedSeats,
    getSeatStatus,
    getBookingForSeat,
    toggleSeat,
    removeSeat,
    clearAll,
  } = useSeatSelector({ path, tripId, travelDate })

  // Handle seat click with toasts, memoized for performance
  const handleSeatClick = useCallback(
    (seatId: string) => {
      if (readOnly) return

      const status = getSeatStatus(seatId)
      console.log(`Clicked seat ${seatId}, status: ${status}`)

      // Handle toggling selected seats
      if (status === 'available' || status === 'selected') {
        toggleSeat(seatId)
        return
      }

      // Handle notifications for occupied seats
      const booking = getBookingForSeat(seatId)
      if (booking) {
        const passengerName = booking.passenger?.fullName || 'another passenger'

        const message = (() => {
          switch (status) {
            case 'current-ticket':
              return 'This seat is already part of this ticket.'

            case 'booked':
              return `Seat taken by ${passengerName} (Ticket: ${booking.ticketNumber}). Payment confirmed.`

            case 'unpaid':
              return `Seat reserved by ${passengerName} (Ticket: ${booking.ticketNumber}). Payment pending.`

            default:
              return undefined
          }
        })()

        if (message) {
          toast.error(message)
        }
      }
    },
    [getSeatStatus, toggleSeat, getBookingForSeat, readOnly],
  )

  // Memoize the seat map for performance optimization
  const seatMap = useMemo(
    () =>
      trip?.bus.type.seats.map((seat) => (
        <SeatCell
          key={seat.id}
          seat={seat}
          status={getSeatStatus(seat.id)}
          onClick={() => handleSeatClick(seat.id)}
          isDisabled={loading || readOnly}
        />
      )),
    [trip, getSeatStatus, handleSeatClick, loading, readOnly],
  )

  // Conditional rendering based on state
  if (error) {
    return (
      <StateDisplay type="error">
        <p>{error}</p>
      </StateDisplay>
    )
  }

  if (!tripId || !travelDate) {
    return (
      <StateDisplay type="info">
        <p>Please select a trip and travel date to view the seat map.</p>
      </StateDisplay>
    )
  }

  return (
    <div className="seat-selector-wrapper">
      <div className="seat-selector__container">
        {/* Header */}
        {trip && <TripHeader trip={trip} />}

        {/* Legend for seat statuses */}
        <Legend />

        <div className="seat-selector__grid-wrapper">
          {/* Loading overlay with PayloadCMS shimmer effect */}
          {loading && (
            <div className="seat-selector__grid-overlay">
              <ShimmerEffect height="100%" width="100%" disableInlineStyles={true} />
            </div>
          )}

          {/* Main seat grid */}
          <div
            className="seat-selector__grid"
            style={{
              gridTemplateRows: `repeat(${gridDimensions.rows}, minmax(45px, 1fr))`,
              gridTemplateColumns: `repeat(${gridDimensions.cols}, minmax(45px, 1fr))`,
            }}
            role="grid"
            aria-label="Bus seat map"
          >
            {seatMap}
          </div>
        </div>

        {/* Statistics and selected seats list */}
        {selectedSeats.length > 0 ? (
          <SelectedSeatsList
            selectedSeatIds={selectedSeats}
            trip={trip}
            removeSeat={removeSeat}
            clearAll={clearAll}
          />
        ) : (
          <div className="seat-selector__instructions">
            <p>Click on an available seat to select it.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default SeatSelectorField
