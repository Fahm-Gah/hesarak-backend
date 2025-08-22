import React, { useCallback, memo, useMemo } from 'react'
import { Armchair, Ticket } from 'lucide-react'
import { motion } from 'framer-motion'
import type { Seat, SeatStatus } from '../../types'
import './index.scss'
import { useLanguage } from '@/hooks/useLanguage'

interface SeatCellProps {
  seat: Seat
  status: SeatStatus
  bookingStatus: 'available' | 'booked' | 'unpaid' | 'currentTicket'
  isSelected: boolean
  onClick: () => void
  isDisabled?: boolean
  justUpdated?: boolean
}

const SEAT_TYPE_LABELS_FA = {
  seat: 'صندلی',
  driver: 'راننده',
  wc: 'دستشویی',
  door: 'دروازه',
} as const

const SEAT_TYPE_LABELS_EN = {
  seat: 'Seat',
  driver: 'Driver',
  wc: 'WC',
  door: 'Door',
} as const

const STATUS_LABELS_FA = {
  available: 'خالی',
  selected: 'انتخاب شده',
  currentTicket: 'تکت فعلی شما',
  booked: 'بوک شده',
  unpaid: 'قید شده',
} as const

const STATUS_LABELS_EN = {
  available: 'Available',
  selected: 'Selected',
  currentTicket: 'Your existing booking',
  booked: 'Booked',
  unpaid: 'Reserved',
} as const

const getSeatTypeLabels = (lang: 'en' | 'fa') =>
  lang === 'fa' ? SEAT_TYPE_LABELS_FA : SEAT_TYPE_LABELS_EN

const getStatusLabels = (lang: 'en' | 'fa') => (lang === 'fa' ? STATUS_LABELS_FA : STATUS_LABELS_EN)

const ANIMATION_VARIANTS = {
  initial: { scale: 1 },
  tap: { scale: 0.95, transition: { duration: 0.1 } },
  hover: { scale: 1.05, transition: { duration: 0.2 } },
  updated: {
    scale: [1, 1.1, 1],
    boxShadow: [
      '0 0 0 0 rgba(59, 130, 246, 0.7)',
      '0 0 0 8px rgba(59, 130, 246, 0.3)',
      '0 0 0 0 rgba(59, 130, 246, 0)',
    ],
    transition: { duration: 0.6 },
  },
}

export const SeatCell = memo<SeatCellProps>(
  ({ seat, status, bookingStatus, isSelected, onClick, isDisabled, justUpdated = false }) => {
    const lang = useLanguage()

    const {
      seatTypeLabels,
      statusLabels,
      isSeat,
      label,
      isInteractive,
      shouldShowTicketIcon,
      showPunchHole,
    } = useMemo(() => {
      const _seatTypeLabels = getSeatTypeLabels(lang)
      const _statusLabels = getStatusLabels(lang)
      const _isSeat = seat.type === 'seat'
      const _label = _seatTypeLabels[seat.type] || _seatTypeLabels.seat

      const _isInteractive =
        _isSeat &&
        !isDisabled &&
        (status === 'available' ||
          status === 'selected' ||
          status === 'currentTicket' ||
          status === 'booked' ||
          status === 'unpaid')

      const _shouldShowTicketIcon =
        bookingStatus === 'booked' ||
        bookingStatus === 'unpaid' ||
        bookingStatus === 'currentTicket'

      return {
        seatTypeLabels: _seatTypeLabels,
        statusLabels: _statusLabels,
        isSeat: _isSeat,
        label: _label,
        isInteractive: _isInteractive,
        shouldShowTicketIcon: _shouldShowTicketIcon,
        showPunchHole: _shouldShowTicketIcon,
      }
    }, [seat.type, lang, isDisabled, status, bookingStatus])

    const IconComponent = useMemo(() => {
      if (!isSeat) return null

      const IconElement = shouldShowTicketIcon ? Ticket : Armchair
      return <IconElement className="seat-cell__icon" size={16} aria-hidden="true" />
    }, [isSeat, shouldShowTicketIcon])

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        if (!isInteractive) return
        if (e.key !== 'Enter' && e.key !== ' ') return

        e.preventDefault()
        onClick()
      },
      [isInteractive, onClick],
    )

    const { className, cursor, statusLabel, bookingStatusLabel, gridStyle, ariaLabel } =
      useMemo(() => {
        const _className = [
          'seat-cell',
          `seat-cell--${seat.type}`,
          isSeat && `seat-cell--${status}`,
          isDisabled && 'seat-cell--disabled',
          justUpdated && 'seat-cell--just-updated',
        ]
          .filter(Boolean)
          .join(' ')

        const _cursor = !isSeat
          ? 'default'
          : isDisabled
            ? 'not-allowed'
            : status === 'booked' || status === 'unpaid'
              ? 'help'
              : isInteractive
                ? 'pointer'
                : 'default'

        const _statusLabel = statusLabels[status] || status
        const _bookingStatusLabel =
          bookingStatus === 'currentTicket' ? statusLabels['currentTicket'] : _statusLabel

        const _gridStyle = {
          gridRow: `${seat.position.row} / span ${seat.size?.rowSpan || 1}`,
          gridColumn: `${seat.position.col} / span ${seat.size?.colSpan || 1}`,
          cursor: _cursor,
          direction: 'ltr' as const,
          willChange: justUpdated ? 'transform' : 'auto',
        }

        const seatNumber = seat.seatNumber || ''
        const currentTicketText =
          bookingStatus === 'currentTicket' ? ` (${statusLabels['currentTicket']})` : ''

        const _ariaLabel = !isSeat
          ? label
          : lang === 'fa'
            ? `${label} ${seatNumber}, وضعیت: ${_statusLabel}${currentTicketText}`
            : `${label} ${seatNumber}, Status: ${_statusLabel}${currentTicketText}`

        return {
          className: _className,
          cursor: _cursor,
          statusLabel: _statusLabel,
          bookingStatusLabel: _bookingStatusLabel,
          gridStyle: _gridStyle,
          ariaLabel: _ariaLabel,
        }
      }, [
        seat.type,
        seat.position.row,
        seat.position.col,
        seat.size?.rowSpan,
        seat.size?.colSpan,
        seat.seatNumber,
        isSeat,
        status,
        isDisabled,
        justUpdated,
        isInteractive,
        statusLabels,
        bookingStatus,
        label,
        lang,
      ])

    return (
      <motion.div
        className={className}
        style={gridStyle}
        onClick={isInteractive ? onClick : undefined}
        onKeyDown={handleKeyDown}
        role={isSeat ? 'button' : 'presentation'}
        tabIndex={isSeat && !isDisabled ? 0 : -1}
        aria-label={ariaLabel}
        aria-pressed={isSeat ? isSelected : undefined}
        aria-disabled={isSeat && isDisabled}
        title={isSeat ? `${label} ${seat.seatNumber || ''} - ${bookingStatusLabel}` : label}
        variants={ANIMATION_VARIANTS}
        initial="initial"
        whileTap={isInteractive ? 'tap' : undefined}
        whileHover={isInteractive && !isDisabled ? 'hover' : undefined}
        animate={justUpdated ? 'updated' : 'initial'}
        layout
      >
        {IconComponent}
        <span className="seat-cell__content">{isSeat ? seat.seatNumber : label}</span>
        {showPunchHole && <span className="seat-cell__punch-hole" aria-hidden="true" />}
      </motion.div>
    )
  },
)

SeatCell.displayName = 'SeatCell'
