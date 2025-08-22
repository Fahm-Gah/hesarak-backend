'use client'

import React, { useCallback, useMemo, memo, startTransition, Suspense, lazy } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useFormFields, toast } from '@payloadcms/ui'
import type { FieldClientComponent } from 'payload'
import { useSeatSelector } from './hooks/useSeatSelector'
import { useLanguage } from '@/hooks/useLanguage'
import { useInView } from 'react-intersection-observer'
import { unstable_batchedUpdates } from 'react-dom'
import { useVirtualizer } from '@tanstack/react-virtual'
import { Clock } from 'lucide-react'
import type { Trip, BookedTicket } from './types'
import { getOptimizedTranslations } from './utils'
import { ANIMATION_VARIANTS, PERFORMANCE_CONFIG } from './constants'

const Legend = lazy(() => import('./components/Legend').then((m) => ({ default: m.Legend })))
const SelectedSeatsList = lazy(() =>
  import('./components/SelectedSeatsList').then((m) => ({ default: m.SelectedSeatsList })),
)
const TripHeader = lazy(() =>
  import('./components/TripHeader').then((m) => ({ default: m.TripHeader })),
)
const StateDisplay = lazy(() =>
  import('./components/StateDisplay').then((m) => ({ default: m.StateDisplay })),
)

import { SeatCell } from './components/SeatCell'
import './index.scss'

interface SeatSelectorClientProps {
  path: string
  readOnly?: boolean
  serverData?: {
    trip: Trip | null
    bookings: BookedTicket[]
    error: string | null
    tripId: string
    travelDate: string
    gridDimensions?: { rows: number; cols: number }
    hasExpiredTickets?: boolean
  }
  onSeatSelect?: (seatIds: string[]) => void
  initialSelectedSeats?: string[]
}

const ExpiredIndicator = memo<{ isExpired: boolean; lang: string }>(({ isExpired, lang }) => {
  if (!isExpired) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="seat-selector__expired-indicator"
      role="alert"
      aria-live="polite"
    >
      <Clock size={14} aria-hidden="true" />
      <span>{lang === 'fa' ? 'منقضی شده' : 'Expired'}</span>
    </motion.div>
  )
})

ExpiredIndicator.displayName = 'ExpiredIndicator'

const VirtualizedSeatGrid = memo<{
  seats: any[]
  gridDimensions: { rows: number; cols: number }
  onSeatClick: (seatId: string) => void
  getSeatStatus: (seatId: string) => any
  getBookingStatus: (seatId: string) => any
  getIsSelected: (seatId: string) => boolean
  getJustUpdated: (seatId: string) => boolean
  loading: boolean
  readOnly: boolean
}>(
  ({
    seats,
    gridDimensions,
    onSeatClick,
    getSeatStatus,
    getBookingStatus,
    getIsSelected,
    getJustUpdated,
    loading,
    readOnly,
  }) => {
    const parentRef = React.useRef<HTMLDivElement>(null)

    const virtualizer = useVirtualizer({
      count: Math.ceil(seats.length / gridDimensions.cols),
      getScrollElement: () => parentRef.current,
      estimateSize: () => PERFORMANCE_CONFIG.VIRTUAL_ITEM_HEIGHT,
      overscan: PERFORMANCE_CONFIG.VIRTUAL_OVERSCAN,
    })

    const seatMap = useMemo(() => {
      return seats.map((seat: any) => (
        <SeatCell
          key={seat.id}
          seat={seat}
          status={getSeatStatus(seat.id)}
          bookingStatus={getBookingStatus(seat.id)}
          isSelected={getIsSelected(seat.id)}
          justUpdated={getJustUpdated(seat.id)}
          onClick={() => onSeatClick(seat.id)}
          isDisabled={loading || readOnly}
        />
      ))
    }, [
      seats,
      getSeatStatus,
      getBookingStatus,
      getIsSelected,
      getJustUpdated,
      onSeatClick,
      loading,
      readOnly,
    ])

    if (seats.length <= PERFORMANCE_CONFIG.VIRTUALIZATION_THRESHOLD) {
      return (
        <div
          className="seat-selector__grid"
          style={{
            gridTemplateRows: `repeat(${gridDimensions.rows}, minmax(45px, 1fr))`,
            gridTemplateColumns: `repeat(${gridDimensions.cols}, minmax(45px, 1fr))`,
          }}
        >
          <AnimatePresence mode="wait">{seatMap}</AnimatePresence>
        </div>
      )
    }

    return (
      <div ref={parentRef} className="seat-selector__virtual-grid">
        <div
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {virtualizer.getVirtualItems().map((virtualRow) => {
            const startIndex = virtualRow.index * gridDimensions.cols
            const endIndex = Math.min(startIndex + gridDimensions.cols, seats.length)
            const rowSeats = seats.slice(startIndex, endIndex)

            return (
              <div
                key={virtualRow.index}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                  display: 'grid',
                  gridTemplateColumns: `repeat(${gridDimensions.cols}, minmax(45px, 1fr))`,
                  gap: 'calc(var(--base) * 0.4)',
                }}
              >
                {rowSeats.map((seat: any) => (
                  <SeatCell
                    key={seat.id}
                    seat={seat}
                    status={getSeatStatus(seat.id)}
                    bookingStatus={getBookingStatus(seat.id)}
                    isSelected={getIsSelected(seat.id)}
                    justUpdated={getJustUpdated(seat.id)}
                    onClick={() => onSeatClick(seat.id)}
                    isDisabled={loading || readOnly}
                  />
                ))}
              </div>
            )
          })}
        </div>
      </div>
    )
  },
)

VirtualizedSeatGrid.displayName = 'VirtualizedSeatGrid'

const SeatSelectorFieldCore = memo<SeatSelectorClientProps>(
  ({ path, readOnly = false, serverData, onSeatSelect, initialSelectedSeats }) => {
    const lang = useLanguage()
    const t = useMemo(() => getOptimizedTranslations(lang), [lang])

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
      isTicketExpired,
      revalidateBookings,
    } = useSeatSelector({
      path,
      tripId,
      travelDate,
      serverData,
      onSeatSelect,
      initialSelectedSeats,
    })

    const handleSeatClick = useCallback(
      async (seatId: string) => {
        if (readOnly) return

        const status = getSeatStatus(seatId)

        // Handle available, selected, or current ticket seats
        if (status === 'available' || status === 'selected' || status === 'currentTicket') {
          startTransition(() => {
            unstable_batchedUpdates(() => {
              toggleSeat(seatId)
            })
          })

          // Immediately revalidate to get fresh booking data
          await revalidateBookings()
          return
        }

        // Handle booked/unpaid seats
        const booking = getBookingForSeat(seatId)
        if (booking) {
          const isExpired = (() => {
            if (!booking.paymentDeadline || booking.isPaid || booking.isCancelled) {
              return false
            }
            try {
              const deadline = new Date(booking.paymentDeadline)
              return !isNaN(deadline.getTime()) && deadline.getTime() < Date.now()
            } catch {
              return false
            }
          })()

          if (isExpired) {
            startTransition(() => {
              unstable_batchedUpdates(() => {
                toggleSeat(seatId)
              })
            })
            await revalidateBookings()
            return
          }

          // Show booking information for non-expired bookings
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

          const statusText =
            status === 'booked' ? t.messages.seatBookedBy : t.messages.seatReservedBy
          const msg = (
            <div>
              {t.seatTypes.seat} {statusText} <strong>{passengerName}</strong>
              {bookedByName && bookedByName !== passengerName && (
                <>
                  <br />
                  Booked by: <strong>{bookedByName}</strong>
                </>
              )}
              <br />
              {t.messages.ticket}: {booking.ticketNumber}
            </div>
          )
          status === 'booked' ? toast.error(msg) : toast.warning(msg)
          return
        }

        // Fallback for other cases
        startTransition(() => {
          unstable_batchedUpdates(() => {
            toggleSeat(seatId)
          })
        })
        await revalidateBookings()
      },
      [getSeatStatus, toggleSeat, getBookingForSeat, readOnly, t, revalidateBookings],
    )

    const seatMapData = useMemo(() => {
      const seats = trip?.bus?.type?.seats
      if (!Array.isArray(seats)) return { seats: [], seatIdMap: new Map() }

      const seatIdMap = new Map()
      const processedSeats: any[] = []

      seats.forEach((seat: any, idx: number) => {
        try {
          // Validate seat has required properties
          if (!seat?.position || typeof seat.position !== 'object') {
            console.warn('Invalid seat position:', seat)
            return
          }

          const { row, col } = seat.position
          if (typeof row !== 'number' || typeof col !== 'number') {
            console.warn('Invalid seat position coordinates:', seat)
            return
          }

          const seatId =
            (typeof seat.id === 'string' && seat.id) ||
            (typeof seat._id === 'string' && seat._id) ||
            `${row}-${col}-${idx}`

          const seatData = { ...seat, id: seatId }
          seatIdMap.set(seatId, seatData)
          processedSeats.push(seatData)
        } catch (error) {
          console.warn('Error processing seat:', error, seat)
        }
      })

      return { seats: processedSeats, seatIdMap }
    }, [trip?.bus?.type?.seats])

    const { ref: containerRef, inView } = useInView({
      threshold: 0.1,
      triggerOnce: true,
    })

    if (error) {
      return (
        <Suspense fallback={<div className="seat-selector-loading">Loading...</div>}>
          <StateDisplay type="error">
            <p>{error}</p>
          </StateDisplay>
        </Suspense>
      )
    }

    if (!tripId || !travelDate) {
      return (
        <Suspense fallback={<div className="seat-selector-loading">Loading...</div>}>
          <StateDisplay type="info">
            <p>{t.messages.selectTripDate}</p>
          </StateDisplay>
        </Suspense>
      )
    }

    if (loading && !trip) {
      return (
        <Suspense fallback={<div className="seat-selector-loading">Loading...</div>}>
          <StateDisplay type="loading">
            <p>{t.messages.loadingSeatMap}</p>
          </StateDisplay>
        </Suspense>
      )
    }

    return (
      <motion.div
        className="seat-selector-wrapper"
        ref={containerRef}
        initial="exit"
        animate="enter"
        variants={ANIMATION_VARIANTS}
      >
        <div className="seat-selector__container">
          <ExpiredIndicator isExpired={isTicketExpired} lang={lang} />

          {trip && (
            <Suspense fallback={<div className="seat-selector__loading-skeleton" />}>
              <TripHeader trip={trip} />
            </Suspense>
          )}

          <Suspense fallback={<div className="seat-selector__loading-skeleton" />}>
            <Legend />
          </Suspense>

          <div className="seat-selector__grid-wrapper">
            <AnimatePresence>
              {loading && trip && (
                <motion.div
                  className="seat-selector__grid-overlay"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="seat-selector__loading-shimmer" />
                </motion.div>
              )}
            </AnimatePresence>

            {seatMapData.seats.length > 0 && inView && (
              <VirtualizedSeatGrid
                seats={seatMapData.seats}
                gridDimensions={gridDimensions}
                onSeatClick={handleSeatClick}
                getSeatStatus={getSeatStatus}
                getBookingStatus={getBookingStatus}
                getIsSelected={getIsSelected}
                getJustUpdated={getJustUpdated}
                loading={loading}
                readOnly={readOnly}
              />
            )}
          </div>

          <AnimatePresence mode="wait">
            {selectedSeats.length > 0 ? (
              <motion.div
                key="selected-seats"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Suspense fallback={<div className="seat-selector__loading-skeleton" />}>
                  <SelectedSeatsList
                    selectedSeatIds={selectedSeats}
                    trip={trip}
                    removeSeat={removeSeat}
                    clearAll={clearAll}
                    readOnly={readOnly}
                  />
                </Suspense>
              </motion.div>
            ) : (
              !readOnly && (
                <motion.div
                  key="instructions"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="seat-selector__instructions"
                >
                  <p>{t.messages.clickToSelect}</p>
                </motion.div>
              )
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    )
  },
)

SeatSelectorFieldCore.displayName = 'SeatSelectorFieldCore'

const SeatSelectorClient = memo<SeatSelectorClientProps>((props) => (
  <Suspense fallback={<div className="seat-selector-loading">Loading seat selector...</div>}>
    <SeatSelectorFieldCore {...props} />
  </Suspense>
))

SeatSelectorClient.displayName = 'SeatSelectorClient'

export const SeatSelectorField: FieldClientComponent = memo(({ path, readOnly = false }) => (
  <SeatSelectorClient path={String(path)} readOnly={readOnly} />
))

SeatSelectorField.displayName = 'SeatSelectorField'

export { SeatSelectorClient }
export default SeatSelectorClient
