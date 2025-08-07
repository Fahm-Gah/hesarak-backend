'use client'

import React, { useCallback, useMemo } from 'react'
import { useFormFields, toast } from '@payloadcms/ui'
import type { ArrayFieldClientComponent } from 'payload'
import { useSeatSelector } from './hooks/useSeatSelector'

// Import all components
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
    getBookingStatus,
    getIsSelected,
    getJustUpdated,
    getBookingForSeat,
    toggleSeat,
    removeSeat,
    clearAll,
  } = useSeatSelector({ path, tripId, travelDate })

  // Handle seat click with proper toast notifications
  const handleSeatClick = useCallback(
    (seatId: string) => {
      if (readOnly) return

      const status = getSeatStatus(seatId)

      // Handle toggling for available/selected seats and current-ticket seats
      if (status === 'available' || status === 'selected' || status === 'current-ticket') {
        toggleSeat(seatId)
        return
      }

      // Handle notifications for occupied seats
      const booking = getBookingForSeat(seatId)
      if (!booking) return

      const passengerName = booking.passenger?.fullName || 'another passenger'

      switch (status) {
        case 'booked':
          toast.error(
            <div>
              Seat booked by <strong>{passengerName}</strong>
              <br />
              Ticket: {booking.ticketNumber}
            </div>,
          )
          break

        case 'unpaid':
          toast.warning(
            <div>
              Seat reserved by <strong>{passengerName}</strong>
              <br />
              Ticket: {booking.ticketNumber}
            </div>,
          )
          break
      }
    },
    [getSeatStatus, toggleSeat, getBookingForSeat, readOnly],
  )

  // Memoize the seat map for optimal performance
  const seatMap = useMemo(() => {
    if (!trip?.bus?.type?.seats) return null

    return trip.bus.type.seats.map((seat) => {
      const status = getSeatStatus(seat.id)
      const bookingStatus = getBookingStatus(seat.id)
      const isSelected = getIsSelected(seat.id)
      const justUpdated = getJustUpdated(seat.id)

      return (
        <SeatCell
          key={seat.id}
          seat={seat}
          status={status}
          bookingStatus={bookingStatus}
          isSelected={isSelected}
          justUpdated={justUpdated}
          onClick={() => handleSeatClick(seat.id)}
          isDisabled={loading || readOnly}
        />
      )
    })
  }, [
    trip,
    getSeatStatus,
    getBookingStatus,
    getIsSelected,
    getJustUpdated,
    handleSeatClick,
    loading,
    readOnly,
  ])

  // Error state
  if (error) {
    return (
      <StateDisplay type="error">
        <p>{error}</p>
      </StateDisplay>
    )
  }

  // Empty state
  if (!tripId || !travelDate) {
    return (
      <StateDisplay type="info">
        <p>Please select a trip and travel date to view the seat map.</p>
      </StateDisplay>
    )
  }

  // Loading state (initial load only)
  if (loading && !trip) {
    return (
      <StateDisplay type="loading">
        <p>Loading seat map...</p>
      </StateDisplay>
    )
  }

  // Main render
  return (
    <div className="seat-selector-wrapper">
      <div className="seat-selector__container">
        {/* Header */}
        {trip && <TripHeader trip={trip} />}

        {/* Legend */}
        <Legend />

        {/* Seat Grid */}
        <div className="seat-selector__grid-wrapper">
          {/* Loading overlay for data refresh */}
          {loading && trip && (
            <div className="seat-selector__grid-overlay">
              <div className="seat-selector__loading-shimmer">
                <div className="seat-selector__shimmer-bar seat-selector__shimmer-bar--1" />
                <div className="seat-selector__shimmer-bar seat-selector__shimmer-bar--2" />
                <div className="seat-selector__shimmer-bar seat-selector__shimmer-bar--3" />
                <div className="seat-selector__shimmer-bar seat-selector__shimmer-bar--4" />
                <div className="seat-selector__shimmer-bar seat-selector__shimmer-bar--5" />
              </div>
            </div>
          )}

          {/* Main seat grid */}
          {seatMap && (
            <div
              className="seat-selector__grid"
              style={{
                gridTemplateRows: `repeat(${gridDimensions.rows}, minmax(45px, 1fr))`,
                gridTemplateColumns: `repeat(${gridDimensions.cols}, minmax(45px, 1fr))`,
              }}
              role="grid"
              aria-label="Bus seat map"
              aria-busy={loading}
            >
              {seatMap}
            </div>
          )}
        </div>

        {/* Footer Section */}
        {selectedSeats.length > 0 ? (
          <SelectedSeatsList
            selectedSeatIds={selectedSeats}
            trip={trip}
            removeSeat={removeSeat}
            clearAll={clearAll}
            readOnly={readOnly}
          />
        ) : (
          !readOnly && (
            <div className="seat-selector__instructions">
              <p>Click on available seats to select them for booking.</p>
            </div>
          )
        )}
      </div>
    </div>
  )
}

export default SeatSelectorField
