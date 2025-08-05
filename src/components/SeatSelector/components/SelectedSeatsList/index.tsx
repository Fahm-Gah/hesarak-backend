import React, { useMemo } from 'react'
import { X } from 'lucide-react'
import type { Trip } from '../../types'
import './index.scss' // Import component's own SCSS

interface SelectedSeatsListProps {
  selectedSeatIds: string[]
  trip: Trip
  removeSeat: (id: string) => void
  clearAll: () => void
}

/**
 * A component to display the list of currently selected seats,
 * calculate the total price, and provide controls to remove seats.
 * It ensures clear presentation and consistent styling across themes.
 */
export const SelectedSeatsList: React.FC<SelectedSeatsListProps> = ({
  selectedSeatIds,
  trip,
  removeSeat,
  clearAll,
}) => {
  // Create a map for quick seat number lookups from the full trip data.
  // This is more efficient than searching the array on every render.
  const seatNumberMap = useMemo(() => {
    if (!trip?.bus?.type?.seats) return new Map()
    return new Map(trip.bus.type.seats.map((s) => [s.id, s.seatNumber]))
  }, [trip])

  const getSeatNumber = (id: string) => seatNumberMap.get(id) || 'N/A'
  const totalPrice = selectedSeatIds.length * trip.price

  return (
    <div className="selected-seats-list">
      <div className="selected-seats-list__header">
        <h4>Selected Seats ({selectedSeatIds.length})</h4>
        {selectedSeatIds.length > 0 && (
          <button
            type="button"
            className="selected-seats-list__clear-button"
            onClick={clearAll}
            title="Clear all selected seats"
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
            onClick={() => removeSeat(id)} // <-- ADDED: Click handler for the entire item
            role="button" // <-- ADDED: Make it a button for accessibility
            tabIndex={0} // <-- ADDED: Make it tabbable
            onKeyDown={(e) => {
              // <-- ADDED: Keyboard navigation for accessibility
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                removeSeat(id)
              }
            }}
          >
            <div className="selected-seats-list__seat-details">
              <span className="selected-seats-list__seat-number">Seat {getSeatNumber(id)}</span>
              <span className="selected-seats-list__seat-price">
                AFN {trip.price.toLocaleString()}
              </span>
            </div>
            {/* The remove button is now redundant in terms of functionality,
                but keeping it for visual consistency/explicit interaction if desired.
                Its onClick will still fire, but the parent div's onClick will also fire.
                If you truly want only ONE click target, you could remove this button.
                For now, keeping it as is, but the parent div is also clickable.
            */}
            <button
              type="button"
              className="selected-seats-list__seat-remove-button"
              onClick={(e) => {
                e.stopPropagation() // <-- IMPORTANT: Stop propagation to prevent double-firing parent onClick
                removeSeat(id)
              }}
              title={`Remove seat ${getSeatNumber(id)}`}
              aria-label={`Remove seat ${getSeatNumber(id)}`}
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
      <div className="selected-seats-list__total">
        <span>Total Price:</span>
        <strong>AFN {totalPrice.toLocaleString()}</strong>
      </div>
    </div>
  )
}
