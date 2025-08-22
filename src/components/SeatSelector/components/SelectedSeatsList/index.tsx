import React, { useMemo, memo, useCallback } from 'react'
import { X } from 'lucide-react'
import { useFormFields } from '@payloadcms/ui'
import { useLanguage } from '@/hooks/useLanguage'
import { getOptimizedTranslations } from '../../utils'
import type { Trip } from '../../types'
import './index.scss'
import { unstable_batchedUpdates } from 'react-dom'

interface SelectedSeatsListProps {
  selectedSeatIds: string[]
  trip: Trip | null
  removeSeat: (id: string) => void
  clearAll: () => void
  readOnly?: boolean
}

// Memoized seat item component
const SeatItem = memo<{
  id: string
  seatNumber: string
  price: number
  onRemove: (id: string) => void
  readOnly: boolean
  t: any
}>(({ id, seatNumber, price, onRemove, readOnly, t }) => {
  const handleClick = useCallback(() => {
    if (!readOnly) {
      unstable_batchedUpdates(() => {
        onRemove(id)
      })
    }
  }, [id, onRemove, readOnly])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!readOnly && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault()
        onRemove(id)
      }
    },
    [id, onRemove, readOnly],
  )

  const handleButtonClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      onRemove(id)
    },
    [id, onRemove],
  )

  return (
    <div
      className="selected-seats-list__seat-item"
      role={readOnly ? 'listitem' : 'button'}
      tabIndex={readOnly ? -1 : 0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      <div className="selected-seats-list__seat-details">
        <span className="selected-seats-list__seat-number">
          {t.seatTypes.seat} {seatNumber}
        </span>
        <span className="selected-seats-list__seat-price">AFN {price.toLocaleString()}</span>
      </div>
      {!readOnly && (
        <button
          type="button"
          className="selected-seats-list__seat-remove-button"
          onClick={handleButtonClick}
          aria-label={`${t.labels.removeSeat} ${seatNumber}`}
        >
          <X size={16} />
        </button>
      )}
    </div>
  )
})

SeatItem.displayName = 'SeatItem'

export const SelectedSeatsList = memo<SelectedSeatsListProps>(
  ({ selectedSeatIds, trip, removeSeat, clearAll, readOnly = false }) => {
    const lang = useLanguage()
    const t = useMemo(() => getOptimizedTranslations(lang), [lang])

    const priceField = useFormFields(([fields]) => fields?.pricePerTicket)
    const rawOverride = priceField?.value

    const parsedOverride = useMemo(() => {
      if (rawOverride === null || rawOverride === undefined || rawOverride === '') return undefined
      const n = Number(rawOverride)
      return Number.isNaN(n) ? undefined : n
    }, [rawOverride])

    // Optimized seat number mapping
    const seatNumberMap = useMemo(() => {
      const seats = trip?.bus?.type?.seats
      if (!seats || !Array.isArray(seats) || seats.length === 0) {
        return EMPTY_SEAT_MAP
      }

      const map = new Map<string, string>()
      for (let idx = 0; idx < seats.length; idx++) {
        const seat = seats[idx] as any
        const seatId =
          (typeof seat.id === 'string' && seat.id) ||
          (typeof seat._id === 'string' && seat._id) ||
          `${seat.position.row}-${seat.position.col}-${idx}`

        map.set(seatId, seat.seatNumber || 'N/A')
      }

      return map
    }, [trip?.bus?.type?.seats])

    // Stable empty map reference
    const EMPTY_SEAT_MAP = useMemo(() => new Map<string, string>(), [])

    const getSeatNumber = useCallback(
      (id: string) => seatNumberMap.get(id) || 'N/A',
      [seatNumberMap],
    )

    const effectivePerSeatPrice = useMemo(() => {
      if (typeof parsedOverride === 'number') return parsedOverride
      if (trip && typeof trip.price === 'number') return trip.price
      return 0
    }, [parsedOverride, trip])

    const totalPrice = useMemo(() => {
      return selectedSeatIds.length * effectivePerSeatPrice
    }, [selectedSeatIds.length, effectivePerSeatPrice])

    // Optimized clear all handler
    const handleClearAll = useCallback(() => {
      unstable_batchedUpdates(() => {
        clearAll()
      })
    }, [clearAll])

    // Memoized seat items data
    const seatItemsData = useMemo(() => {
      return selectedSeatIds.map((id) => ({
        id,
        seatNumber: getSeatNumber(id),
        price: effectivePerSeatPrice,
      }))
    }, [selectedSeatIds, getSeatNumber, effectivePerSeatPrice])

    if (!trip) return null

    return (
      <div className="selected-seats-list">
        <div className="selected-seats-list__header">
          <h4>
            {t.labels.selectedSeats} ({selectedSeatIds.length})
          </h4>
          {!readOnly && selectedSeatIds.length > 0 && (
            <button
              type="button"
              className="selected-seats-list__clear-button"
              onClick={handleClearAll}
              aria-label={t.labels.clearAll}
            >
              {t.labels.clearAll}
            </button>
          )}
        </div>

        <div className="selected-seats-list__seats-container">
          {seatItemsData.map(({ id, seatNumber, price }) => (
            <SeatItem
              key={id}
              id={id}
              seatNumber={seatNumber}
              price={price}
              onRemove={removeSeat}
              readOnly={readOnly}
              t={t}
            />
          ))}
        </div>

        <div className="selected-seats-list__total">
          <span>{t.labels.totalPrice}:</span>
          <strong>AFN {totalPrice.toLocaleString()}</strong>
        </div>
      </div>
    )
  },
)

SelectedSeatsList.displayName = 'SelectedSeatsList'
