import React, { useMemo, memo } from 'react'
import { X } from 'lucide-react'
import { useFormFields } from '@payloadcms/ui'
import { useLanguage } from '@/hooks/useLanguage'
import { getSeatSelectorTranslations } from '@/utils/seatSelectorTranslations'
import type { Trip } from '../../types'
import './index.scss'

interface SelectedSeatsListProps {
  selectedSeatIds: string[]
  trip: Trip | null
  removeSeat: (id: string) => void
  clearAll: () => void
  readOnly?: boolean
}

export const SelectedSeatsList = memo<SelectedSeatsListProps>(
  ({ selectedSeatIds, trip, removeSeat, clearAll, readOnly = false }) => {
    const lang = useLanguage()
    const t = getSeatSelectorTranslations(lang)

    const priceField = useFormFields(([fields]) => fields?.pricePerTicket)
    const rawOverride = priceField?.value

    const parsedOverride = useMemo(() => {
      if (rawOverride === null || rawOverride === undefined || rawOverride === '') return undefined
      const n = Number(rawOverride)
      return Number.isNaN(n) ? undefined : n
    }, [rawOverride])

    const seatNumberMap = useMemo(() => {
      if (!trip?.bus?.type?.seats || !Array.isArray(trip.bus.type.seats)) {
        return new Map<string, string>()
      }
      return new Map(
        trip.bus.type.seats.map((seat: any, idx: number) => {
          const seatId =
            (typeof seat.id === 'string' && seat.id) ||
            (typeof seat._id === 'string' && seat._id) ||
            `${seat.position.row}-${seat.position.col}-${idx}`

          return [seatId, seat.seatNumber || 'N/A']
        }),
      )
    }, [trip])

    const getSeatNumber = (id: string) => seatNumberMap.get(id) || 'N/A'

    const effectivePerSeatPrice = useMemo(() => {
      if (typeof parsedOverride === 'number') return parsedOverride
      if (trip && typeof trip.price === 'number') return trip.price
      return 0
    }, [parsedOverride, trip])

    const totalPrice = useMemo(() => {
      return selectedSeatIds.reduce((acc) => acc + effectivePerSeatPrice, 0)
    }, [selectedSeatIds, effectivePerSeatPrice])

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
              onClick={clearAll}
              aria-label={t.labels.clearAll}
            >
              {t.labels.clearAll}
            </button>
          )}
        </div>

        <div className="selected-seats-list__seats-container">
          {selectedSeatIds.map((id) => (
            <div
              key={id}
              className="selected-seats-list__seat-item"
              role={readOnly ? 'listitem' : 'button'}
              tabIndex={readOnly ? -1 : 0}
              onClick={!readOnly ? () => removeSeat(id) : undefined}
              onKeyDown={
                !readOnly
                  ? (e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        removeSeat(id)
                      }
                    }
                  : undefined
              }
            >
              <div className="selected-seats-list__seat-details">
                <span className="selected-seats-list__seat-number">
                  {t.seatTypes.seat} {getSeatNumber(id)}
                </span>
                <span className="selected-seats-list__seat-price">
                  AFN {effectivePerSeatPrice.toLocaleString()}
                </span>
              </div>
              {!readOnly && (
                <button
                  type="button"
                  className="selected-seats-list__seat-remove-button"
                  onClick={(e) => {
                    e.stopPropagation()
                    removeSeat(id)
                  }}
                  aria-label={`${t.labels.removeSeat} ${getSeatNumber(id)}`}
                >
                  <X size={16} />
                </button>
              )}
            </div>
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
