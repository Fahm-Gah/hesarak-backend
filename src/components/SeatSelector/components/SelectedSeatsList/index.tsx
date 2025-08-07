import React, { useMemo, memo } from 'react'
import { X } from 'lucide-react'
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
    // Create seat number lookup map
    const seatNumberMap = useMemo(() => {
      if (!trip?.bus?.type?.seats) return new Map()
      return new Map(trip.bus.type.seats.map((s) => [s.id, s.seatNumber]))
    }, [trip])

    const getSeatNumber = (id: string) => seatNumberMap.get(id) || 'N/A'
    const totalPrice = trip ? selectedSeatIds.length * trip.price : 0

    if (!trip) return null

    return (
      <div className="selected-seats-list">
        <div className="selected-seats-list__header">
          <h4>Selected Seats ({selectedSeatIds.length})</h4>
          {!readOnly && selectedSeatIds.length > 0 && (
            <button
              type="button"
              className="selected-seats-list__clear-button"
              onClick={clearAll}
              aria-label="Clear all selected seats"
            >
              Clear All
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
                <span className="selected-seats-list__seat-number">Seat {getSeatNumber(id)}</span>
                <span className="selected-seats-list__seat-price">
                  AFN {trip.price.toLocaleString()}
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
                  aria-label={`Remove seat ${getSeatNumber(id)}`}
                >
                  <X size={16} />
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="selected-seats-list__total">
          <span>Total Price:</span>
          <strong>AFN {totalPrice.toLocaleString()}</strong>
        </div>
      </div>
    )
  },
)

SelectedSeatsList.displayName = 'SelectedSeatsList'
