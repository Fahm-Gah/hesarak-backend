// src/components/SeatSelector/index.tsx
'use client'

import React, { useCallback, useMemo } from 'react'
import { useFormFields, toast } from '@payloadcms/ui'
import type { FieldClientComponent } from 'payload'
import { useSeatSelector } from './hooks/useSeatSelector'

import { Legend } from './components/Legend'
import { SelectedSeatsList } from './components/SelectedSeatsList'
import { SeatCell } from './components/SeatCell'
import { TripHeader } from './components/TripHeader'
import { StateDisplay } from './components/StateDisplay'

import './index.scss'

export const SeatSelectorField: FieldClientComponent = ({ path, readOnly = false }) => {
  // Payload still gives you `path` of type unknown, but hook coerces it
  const { tripId, travelDate } = useFormFields(([f]) => ({
    tripId: f.trip?.value as string | undefined,
    travelDate: f.date?.value as string | undefined,
  }))

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

  const handleSeatClick = useCallback(
    (seatId: string) => {
      if (readOnly) return
      const status = getSeatStatus(seatId)
      if (status === 'available' || status === 'selected' || status === 'current-ticket') {
        toggleSeat(seatId)
        return
      }
      const booking = getBookingForSeat(seatId)
      if (!booking) return
      const name = booking.passenger?.fullName || 'another passenger'
      const msg = (
        <div>
          Seat {status === 'booked' ? 'booked' : 'reserved'} by <strong>{name}</strong>
          <br />
          Ticket: {booking.ticketNumber}
        </div>
      )
      status === 'booked' ? toast.error(msg) : toast.warning(msg)
    },
    [getSeatStatus, toggleSeat, getBookingForSeat, readOnly],
  )

  const seatMap = useMemo(() => {
    const seats = trip?.bus?.type?.seats
    if (!Array.isArray(seats)) return null

    return seats.map((seat: any, idx: number) => {
      const seatId =
        (typeof seat.id === 'string' && seat.id) ||
        (typeof seat._id === 'string' && seat._id) ||
        `${seat.position.row}-${seat.position.col}-${idx}`

      return (
        <SeatCell
          key={seatId}
          seat={{ ...seat, id: seatId }}
          status={getSeatStatus(seatId)}
          bookingStatus={getBookingStatus(seatId)}
          isSelected={getIsSelected(seatId)}
          justUpdated={getJustUpdated(seatId)}
          onClick={() => handleSeatClick(seatId)}
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

  if (loading && !trip) {
    return (
      <StateDisplay type="loading">
        <p>Loading seat map…</p>
      </StateDisplay>
    )
  }

  return (
    <div className="seat-selector-wrapper">
      <div className="seat-selector__container">
        {trip && <TripHeader trip={trip} />}
        <Legend />

        <div className="seat-selector__grid-wrapper">
          {loading && trip && (
            <div className="seat-selector__grid-overlay">
              <div className="seat-selector__loading-shimmer">
                {[1, 2, 3, 4, 5].map((n) => (
                  <div
                    key={n}
                    className={`seat-selector__shimmer-bar seat-selector__shimmer-bar--${n}`}
                  />
                ))}
              </div>
            </div>
          )}

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
