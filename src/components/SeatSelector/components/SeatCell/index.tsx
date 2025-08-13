import React, { useCallback, memo } from 'react'
import { Armchair, Ticket } from 'lucide-react'
import type { Seat, SeatStatus } from '../../types'
import './index.scss'
import { useLanguage } from '@/hooks/useLanguage'

interface SeatCellProps {
  seat: Seat
  status: SeatStatus // For colors/styling only
  bookingStatus: 'available' | 'booked' | 'unpaid' | 'currentTicket' // Fixed to kebab-case
  isSelected: boolean // For selection state only
  onClick: () => void
  isDisabled?: boolean
  justUpdated?: boolean // Add visual feedback for recent updates
}

// Bilingual seat type labels
const getSeatTypeLabels = (lang: 'en' | 'fa'): Record<string, string> => ({
  seat: lang === 'fa' ? 'صندلی' : 'Seat',
  driver: lang === 'fa' ? 'راننده' : 'Driver',
  wc: lang === 'fa' ? 'دستشویی' : 'WC',
  door: lang === 'fa' ? 'دروازه' : 'Door',
})

// Bilingual status labels
const getStatusLabels = (lang: 'en' | 'fa'): Record<string, string> => ({
  available: lang === 'fa' ? 'خالی' : 'Available',
  selected: lang === 'fa' ? 'انتخاب شده' : 'Selected',
  currentTicket: lang === 'fa' ? 'تکت فعلی شما' : 'Your existing booking',
  booked: lang === 'fa' ? 'بوک شده' : 'Booked',
  unpaid: lang === 'fa' ? 'قید شده' : 'Reserved',
})

/**
 * Memoized seat cell component for optimal grid performance
 */
export const SeatCell = memo<SeatCellProps>(
  ({ seat, status, bookingStatus, isSelected, onClick, isDisabled, justUpdated = false }) => {
    const lang = useLanguage()
    const seatTypeLabels = getSeatTypeLabels(lang)
    const statusLabels = getStatusLabels(lang)

    const isSeat = seat.type === 'seat'
    const label = seatTypeLabels[seat.type] || seatTypeLabels.seat

    // Determine if this seat is interactive
    const isInteractive =
      isSeat &&
      !isDisabled &&
      (status === 'available' ||
        status === 'selected' ||
        status === 'currentTicket' ||
        status === 'booked' ||
        status === 'unpaid')

    // CRITICAL: Icon determination - ONLY based on bookingStatus, NEVER changes
    const shouldShowTicketIcon =
      bookingStatus === 'booked' || bookingStatus === 'unpaid' || bookingStatus === 'currentTicket'

    const getIcon = () => {
      if (!isSeat) return null

      if (shouldShowTicketIcon) {
        return <Ticket className="seat-cell__icon" size={16} aria-hidden="true" />
      }

      return <Armchair className="seat-cell__icon" size={16} aria-hidden="true" />
    }

    const showPunchHole = shouldShowTicketIcon

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        if (isInteractive && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault()
          onClick()
        }
      },
      [isInteractive, onClick],
    )

    const className = [
      'seat-cell',
      `seat-cell--${seat.type}`,
      isSeat && `seat-cell--${status}`,
      isDisabled && 'seat-cell--disabled',
      justUpdated && 'seat-cell--just-updated',
    ]
      .filter(Boolean)
      .join(' ')

    // Determine cursor style
    const cursor = !isSeat
      ? 'default'
      : isDisabled
        ? 'not-allowed'
        : status === 'booked' || status === 'unpaid'
          ? 'help'
          : isInteractive
            ? 'pointer'
            : 'default'

    // Get the appropriate status label
    const statusLabel = statusLabels[status] || status
    const bookingStatusLabel =
      bookingStatus === 'currentTicket' ? statusLabels['currentTicket'] : statusLabel

    return (
      <div
        className={className}
        style={{
          gridRow: `${seat.position.row} / span ${seat.size?.rowSpan || 1}`,
          gridColumn: `${seat.position.col} / span ${seat.size?.colSpan || 1}`,
          cursor,
          direction: 'ltr',
        }}
        onClick={isInteractive ? onClick : undefined}
        onKeyDown={handleKeyDown}
        role={isSeat ? 'button' : 'presentation'}
        tabIndex={isSeat && !isDisabled ? 0 : -1}
        aria-label={
          isSeat
            ? lang === 'fa'
              ? `${label} ${seat.seatNumber || ''}, وضعیت: ${statusLabel}${
                  bookingStatus === 'currentTicket' ? ` (${statusLabels['currentTicket']})` : ''
                }`
              : `${label} ${seat.seatNumber || ''}, Status: ${statusLabel}${
                  bookingStatus === 'currentTicket' ? ` (${statusLabels['currentTicket']})` : ''
                }`
            : label
        }
        aria-pressed={isSeat ? isSelected : undefined}
        aria-disabled={isSeat && isDisabled}
        title={isSeat ? `${label} ${seat.seatNumber || ''} - ${bookingStatusLabel}` : label}
      >
        {getIcon()}
        <span className="seat-cell__content">{isSeat ? seat.seatNumber : label}</span>

        {/* Punch hole - only based on bookingStatus, never changes */}
        {showPunchHole && <span className="seat-cell__punch-hole" aria-hidden="true"></span>}
      </div>
    )
  },
)

SeatCell.displayName = 'SeatCell'
