'use client'

import React, { useCallback, useMemo } from 'react'
import { useFormFields, toast } from '@payloadcms/ui'
import type { FieldClientComponent } from 'payload'
import { useSeatSelector } from './hooks/useSeatSelector'
import { useLanguage } from '@/hooks/useLanguage'
import { getSeatSelectorTranslations } from '@/utils/seatSelectorTranslations'

import { Legend } from './components/Legend'
import { SelectedSeatsList } from './components/SelectedSeatsList'
import { SeatCell } from './components/SeatCell'
import { TripHeader } from './components/TripHeader'
import { StateDisplay } from './components/StateDisplay'

import './index.scss'

export const SeatSelectorField: FieldClientComponent = ({ path, readOnly = false }) => {
  const lang = useLanguage()
  const t = getSeatSelectorTranslations(lang)

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
      if (status === 'available' || status === 'selected' || status === 'currentTicket') {
        toggleSeat(seatId)
        return
      }

      // For booked/unpaid seats, check if the booking is expired
      const booking = getBookingForSeat(seatId)
      if (booking) {
        // Check if booking is expired
        const isExpired = (() => {
          if (!booking.paymentDeadline || booking.isPaid || booking.isCancelled) {
            return false
          }
          try {
            const deadline = new Date(booking.paymentDeadline)
            const now = new Date()
            return !isNaN(deadline.getTime()) && deadline < now
          } catch {
            return false
          }
        })()

        // If expired, allow selection
        if (isExpired) {
          toggleSeat(seatId)
          return
        }

        // If not expired, show blocking message
        const passengerName = booking.passenger?.fullName || 'another passenger'
        const bookedByName = (() => {
          if (typeof booking.bookedBy === 'object' && booking.bookedBy?.profile?.fullName) {
            return booking.bookedBy.profile.fullName
          }
          if (typeof booking.bookedBy === 'object' && booking.bookedBy?.email) {
            return booking.bookedBy.email
          }
          if (typeof booking.bookedBy === 'object' && booking.bookedBy?.phone) {
            return booking.bookedBy.phone
          }
          return null
        })()

        // Get the highest role of the bookedBy user
        const getHighestRole = (roles: string[] | undefined) => {
          if (!Array.isArray(roles) || roles.length === 0) return 'customer'
          const roleHierarchy = [
            'customer',
            'editor',
            'agent',
            'driver',
            'admin',
            'superadmin',
            'dev',
          ]
          return roles.reduce((highest, role) => {
            const currentIndex = roleHierarchy.indexOf(role)
            const highestIndex = roleHierarchy.indexOf(highest)
            return currentIndex > highestIndex ? role : highest
          }, 'customer')
        }

        const bookedByRole = (() => {
          if (typeof booking.bookedBy === 'object' && booking.bookedBy?.roles) {
            const highestRole = getHighestRole(booking.bookedBy.roles)
            return t.roles[highestRole as keyof typeof t.roles] || highestRole
          }
          return null
        })()

        const statusText = status === 'booked' ? t.messages.seatBookedBy : t.messages.seatReservedBy
        const bookedByText = status === 'booked' ? t.messages.bookedBy : t.messages.reservedBy
        const msg = (
          <div>
            {t.seatTypes.seat} {statusText} <strong>{passengerName}</strong>
            {bookedByRole && <span> ({bookedByRole})</span>}
            {bookedByName && bookedByName !== passengerName && (
              <>
                <br />
                {bookedByText}: <strong>{bookedByName}</strong>
                {bookedByRole && <span> ({bookedByRole})</span>}
              </>
            )}
            <br />
            {t.messages.ticket}: {booking.ticketNumber}
          </div>
        )

        if (status === 'booked') {
          toast.error(msg)
        } else {
          toast.warning(msg)
        }
        return
      }

      // Fallback: if no booking found but status suggests it's blocked, allow selection
      // This handles edge cases where the seat appears blocked but shouldn't be
      toggleSeat(seatId)
    },
    [getSeatStatus, toggleSeat, getBookingForSeat, readOnly, t],
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
        <p>{t.messages.selectTripDate}</p>
      </StateDisplay>
    )
  }

  if (loading && !trip) {
    return (
      <StateDisplay type="loading">
        <p>{t.messages.loadingSeatMap}</p>
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
                direction: 'ltr', // Force LTR for seat grid
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
              <p>{t.messages.clickToSelect}</p>
            </div>
          )
        )}
      </div>
    </div>
  )
}

export default SeatSelectorField
