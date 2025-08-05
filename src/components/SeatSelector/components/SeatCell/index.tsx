import React, { useCallback } from 'react'
import { Armchair, Ticket } from 'lucide-react'
import type { Seat, SeatStatus } from '../../types'
import './index.scss' // Import component's own SCSS

// Map seat types to labels only. The Icon for 'seat' will be handled dynamically.
const seatTypeDetails = {
  seat: { label: 'Seat' },
  driver: { label: 'Driver' },
  wc: { label: 'WC' },
  door: { label: 'Door' },
}

interface SeatCellProps {
  seat: Seat
  status: SeatStatus
  onClick: () => void
  isDisabled?: boolean
}

/**
 * Renders an individual seat or non-seat element (e.g., driver, WC, door)
 * within the bus layout grid. It handles visual status, click interactions,
 * and accessibility attributes, displaying appropriate icons for different seat states.
 */
export const SeatCell: React.FC<SeatCellProps> = ({ seat, status, onClick, isDisabled }) => {
  const isSeat = seat.type === 'seat'

  // A seat is clickable for toggling only if it's a seat, not disabled, and available/selected.
  const isToggleable = isSeat && !isDisabled && (status === 'available' || status === 'selected')

  // Get the appropriate label based on seat type
  const { label } = seatTypeDetails[seat.type] || seatTypeDetails.seat // Fallback to 'seat' details

  // Determine the Icon component based on seat type and status
  const getIconComponent = useCallback(() => {
    if (!isSeat) return undefined

    // Show ticket icon for booked, unpaid, and current-ticket statuses
    if (status === 'booked' || status === 'unpaid' || status === 'current-ticket') {
      return Ticket
    }

    // Show armchair for all other seat statuses (available, selected, disabled)
    return Armchair
  }, [isSeat, status])

  const IconComponent = getIconComponent()

  // Determine the CSS classes for the cell
  const classes = [
    'seat-cell', // Base class
    `seat-cell--${seat.type}`, // Type-specific class (e.g., seat-cell--seat, seat-cell--driver)
    isSeat ? `seat-cell--${status}` : '', // Status-specific class for actual seats
    isDisabled && 'seat-cell--disabled', // Disabled state class
  ]
    .filter(Boolean)
    .join(' ')

  // Handle click events for the cell
  const handleClick = useCallback(() => {
    if (isToggleable) {
      onClick()
    } else if (
      isSeat &&
      (status === 'booked' || status === 'unpaid' || status === 'current-ticket')
    ) {
      onClick()
    }
  }, [isToggleable, isSeat, status, onClick])

  // Handle keyboard events for accessibility
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        handleClick()
      }
    },
    [handleClick],
  )

  // Determine cursor style based on interactivity
  const getCursorStyle = useCallback((): string => {
    if (!isSeat) return 'default'
    if (isDisabled) return 'not-allowed'
    if (isToggleable) return 'pointer'
    if (status === 'booked' || status === 'unpaid' || status === 'current-ticket') return 'pointer'
    return 'default'
  }, [isSeat, isDisabled, isToggleable, status])

  return (
    <div
      className={classes}
      style={{
        gridRow: `${seat.position.row} / span ${seat.size?.rowSpan || 1}`,
        gridColumn: `${seat.position.col} / span ${seat.size?.colSpan || 1}`,
        cursor: getCursorStyle(),
      }}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role={isSeat ? 'button' : 'presentation'}
      tabIndex={isSeat ? 0 : -1}
      aria-label={
        isSeat
          ? `${label} ${seat.seatNumber ? seat.seatNumber + ',' : ''} Status: ${status}`
          : label
      }
      aria-pressed={isSeat && status === 'selected'}
      aria-disabled={isSeat && !isToggleable}
      title={isSeat ? `${label} ${seat.seatNumber || ''} - ${status}` : label}
    >
      {/* Conditionally render Icon based on seat type and status */}
      {IconComponent && <IconComponent className="seat-cell__icon" size={16} aria-hidden="true" />}
      <span className="seat-cell__content">
        {isSeat ? seat.seatNumber : label} {/* Display seat number or label */}
      </span>
    </div>
  )
}
