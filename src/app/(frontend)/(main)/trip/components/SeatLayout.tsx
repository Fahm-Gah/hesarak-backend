import React, { useMemo, useCallback, memo } from 'react'
import { User, DoorOpen, Toilet } from 'lucide-react'
import clsx from 'clsx'
import styles from './SeatLayout.module.css'
import { convertToPersianDigits } from '@/utils/persianDigits'

interface BusLayoutElement {
  id: string
  type: 'seat' | 'wc' | 'driver' | 'door'
  seatNumber?: string
  position: {
    row: number
    col: number
  }
  size?: {
    rowSpan: number
    colSpan: number
  }
  isBooked?: boolean
  isBookedByCurrentUser?: boolean
  isPaid?: boolean
}

interface SeatLayoutProps {
  busLayout: BusLayoutElement[]
  selectedSeats: string[]
  onSeatSelect: (seatId: string) => void
  canSelectMoreSeats: boolean
  maxSeatsAllowed?: number
  currentSelectedCount?: number
  isAuthenticated: boolean
  seatAvailability?: {
    totalSeats: number
    availableSeats: number
    bookedSeats: number
  }
  className?: string
}

// Pre-computed style configurations for better performance
const seatStyles = {
  available: {
    bg: 'bg-gradient-to-br from-orange-100 via-orange-200 to-orange-300 hover:from-orange-200 hover:via-orange-300 hover:to-orange-400',
    shadow: 'shadow-orange-200/40 hover:shadow-orange-300/50',
    border: 'border-orange-200/50 hover:border-orange-300/60',
    text: 'text-orange-700 hover:text-orange-800 font-semibold',
    cursor: 'cursor-pointer',
  },
  selected: {
    bg: 'bg-gradient-to-br from-orange-500 via-orange-600 to-red-600',
    shadow: 'shadow-orange-500/50',
    border: 'border-orange-400/60',
    text: 'text-white drop-shadow-sm font-extrabold',
    cursor: 'cursor-pointer',
    ring: 'ring-2 ring-orange-300/70 ring-offset-2 ring-offset-white/50',
  },
  bookedByUser: {
    bg: 'bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-800',
    shadow: 'shadow-emerald-600/60',
    border: 'border-emerald-400/80',
    text: 'text-white drop-shadow-sm font-bold',
    cursor: 'cursor-not-allowed',
    ring: 'ring-2 ring-emerald-300/70 ring-offset-2 ring-offset-white/50',
  },
  bookedByUserPending: {
    bg: 'bg-gradient-to-br from-amber-500 via-amber-600 to-orange-600',
    shadow: 'shadow-amber-500/60',
    border: 'border-amber-400/80',
    text: 'text-white drop-shadow-sm font-bold',
    cursor: 'cursor-not-allowed',
    ring: 'ring-2 ring-amber-300/70 ring-offset-2 ring-offset-white/50',
  },
  booked: {
    bg: 'bg-gradient-to-br from-gray-500 via-gray-600 to-gray-700',
    shadow: 'shadow-gray-500/40',
    border: 'border-gray-400/60',
    text: 'text-white drop-shadow-sm',
    cursor: 'cursor-not-allowed',
  },
  disabled: {
    bg: 'bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300',
    shadow: 'shadow-gray-200/30',
    border: 'border-gray-300/40',
    text: 'text-gray-500',
    cursor: 'cursor-not-allowed',
  },
} as const

// Memoized individual seat component for better performance
const SeatButton = memo<{
  element: BusLayoutElement
  isSelected: boolean
  canClick: boolean
  currentSelectedCount: number
  effectiveMaxSeats: number
  canSelectMoreSeats: boolean
  onSeatSelect: (seatId: string) => void
  gridStyle: React.CSSProperties
}>(
  ({
    element,
    isSelected,
    canClick,
    currentSelectedCount,
    effectiveMaxSeats,
    canSelectMoreSeats,
    onSeatSelect,
    gridStyle,
  }) => {
    const getSeatStyleConfig = useCallback(() => {
      const isBooked = element.isBooked
      const isBookedByUser = element.isBookedByCurrentUser
      const isPaid = element.isPaid

      if (isBooked) {
        if (isBookedByUser) {
          return isPaid ? seatStyles.bookedByUser : seatStyles.bookedByUserPending
        }
        return seatStyles.booked
      }

      if (isSelected) {
        return seatStyles.selected
      }

      // Check if user has reached maximum selection limit or can't book more seats
      if (
        (!canSelectMoreSeats && !isSelected) ||
        (currentSelectedCount >= effectiveMaxSeats && !isSelected)
      ) {
        return seatStyles.disabled
      }

      return seatStyles.available
    }, [
      element.isBooked,
      element.isBookedByCurrentUser,
      element.isPaid,
      isSelected,
      currentSelectedCount,
      effectiveMaxSeats,
      canSelectMoreSeats,
    ])

    const styleConfig = getSeatStyleConfig()

    const seatClassName = clsx(
      // Base classes
      'flex items-center justify-center font-bold text-sm relative shadow-lg hover:shadow-2xl backdrop-blur-sm rounded-2xl border-2',
      styles.seatHover,
      // Dynamic classes
      styleConfig.bg,
      styleConfig.shadow,
      styleConfig.border,
      styleConfig.text,
      styleConfig.cursor,
      // Ring styles for selected and user-booked seats
      (isSelected || element.isBookedByCurrentUser) && 'ring' in styleConfig && styleConfig.ring,
      isSelected && styles.seatSelected,
    )

    const getAriaLabel = useCallback(() => {
      const isBooked = element.isBooked
      const isBookedByUser = element.isBookedByCurrentUser
      const isPaid = element.isPaid

      if (isBooked) {
        if (isBookedByUser) {
          return `Your seat ${element.seatNumber} (${isPaid ? 'Paid' : 'Pending Payment'})`
        }
        return `Seat ${element.seatNumber} - Booked`
      }

      if (isSelected) {
        return `Seat ${element.seatNumber} - Selected, click to deselect`
      }

      if (!canSelectMoreSeats || currentSelectedCount >= effectiveMaxSeats) {
        return `Seat ${element.seatNumber} - Cannot select, maximum seats reached`
      }

      return `Seat ${element.seatNumber} - Available, click to select`
    }, [
      element.isBooked,
      element.isBookedByCurrentUser,
      element.isPaid,
      element.seatNumber,
      isSelected,
      currentSelectedCount,
      effectiveMaxSeats,
      canSelectMoreSeats,
    ])

    return (
      <button
        onClick={() => canClick && onSeatSelect(element.id)}
        disabled={!canClick}
        className={seatClassName}
        style={gridStyle}
        aria-label={getAriaLabel()}
        aria-pressed={isSelected}
        aria-disabled={!canClick}
        role="button"
        tabIndex={canClick ? 0 : -1}
      >
        <span aria-hidden="true">{element.seatNumber}</span>
      </button>
    )
  },
)

SeatButton.displayName = 'SeatButton'

// Memoized facility element component
const FacilityElement = memo<{
  element: BusLayoutElement
  gridStyle: React.CSSProperties
}>(({ element, gridStyle }) => {
  const getIconAndClasses = () => {
    switch (element.type) {
      case 'driver':
        return {
          icon: <User className="w-5 h-5 drop-shadow-sm" />,
          className:
            'bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 border-amber-400/60 text-amber-900 cursor-default shadow-amber-500/50',
        }
      case 'wc':
        return {
          icon: <Toilet className="w-5 h-5 drop-shadow-sm" />,
          className:
            'bg-gradient-to-br from-gray-200 via-gray-300 to-gray-400 border-gray-300/60 text-gray-700 cursor-default shadow-gray-300/40',
        }
      case 'door':
        return {
          icon: <DoorOpen className="w-5 h-5 drop-shadow-sm" />,
          className:
            'bg-gradient-to-br from-gray-200 via-gray-300 to-gray-400 border-gray-300/60 text-gray-700 cursor-default shadow-gray-300/40',
        }
      default:
        return null
    }
  }

  const config = getIconAndClasses()
  if (!config) return null

  return (
    <div
      className={clsx(
        'flex items-center justify-center font-bold text-sm relative shadow-lg backdrop-blur-sm rounded-2xl border-2',
        config.className,
      )}
      style={gridStyle}
    >
      {config.icon}
    </div>
  )
})

FacilityElement.displayName = 'FacilityElement'

export const SeatLayout = memo<SeatLayoutProps>(
  ({
    busLayout,
    selectedSeats,
    onSeatSelect,
    canSelectMoreSeats,
    maxSeatsAllowed = 2,
    currentSelectedCount = 0,
    isAuthenticated,
    seatAvailability,
    className = '',
  }) => {
    // Memoize expensive calculations
    const effectiveMaxSeats = useMemo(() => Math.max(maxSeatsAllowed, 1), [maxSeatsAllowed])

    const hasUserBookedSeats = useMemo(
      () => busLayout.some((element) => element.type === 'seat' && element.isBookedByCurrentUser),
      [busLayout],
    )

    const { maxRow, maxCol } = useMemo(
      () => ({
        maxRow: Math.max(
          ...busLayout.map((element) => element.position.row + (element.size?.rowSpan || 1) - 1),
        ),
        maxCol: Math.max(
          ...busLayout.map((element) => element.position.col + (element.size?.colSpan || 1) - 1),
        ),
      }),
      [busLayout],
    )

    const occupiedCells = useMemo(() => {
      const cells = new Set<string>()
      busLayout.forEach((element) => {
        const rowSpan = element.size?.rowSpan || 1
        const colSpan = element.size?.colSpan || 1

        for (let r = 0; r < rowSpan; r++) {
          for (let c = 0; c < colSpan; c++) {
            cells.add(`${element.position.row + r}-${element.position.col + c}`)
          }
        }
      })
      return cells
    }, [busLayout])

    const emptyGridCells = useMemo(() => {
      const cells = []
      for (let row = 1; row <= maxRow; row++) {
        for (let col = 1; col <= maxCol; col++) {
          const cellKey = `${row}-${col}`
          if (!occupiedCells.has(cellKey)) {
            cells.push(
              <div
                key={cellKey}
                style={{
                  gridRow: row,
                  gridColumn: col,
                  minWidth: '40px',
                  minHeight: '40px',
                }}
                className="bg-transparent"
              />,
            )
          }
        }
      }
      return cells
    }, [maxRow, maxCol, occupiedCells])

    const selectedSeatsSet = useMemo(() => new Set(selectedSeats), [selectedSeats])

    const gridStyleVars = useMemo(
      () =>
        ({
          '--grid-rows': maxRow,
          '--grid-cols': maxCol,
        }) as React.CSSProperties,
      [maxRow, maxCol],
    )

    const memoizedOnSeatSelect = useCallback(
      (seatId: string) => {
        onSeatSelect(seatId)
      },
      [onSeatSelect],
    )

    const renderedElements = useMemo(() => {
      return busLayout.map((element) => {
        const rowSpan = element.size?.rowSpan || 1
        const colSpan = element.size?.colSpan || 1

        const gridStyle: React.CSSProperties = {
          gridRow: `${element.position.row} / span ${rowSpan}`,
          gridColumn: `${element.position.col} / span ${colSpan}`,
          minWidth: '48px',
          minHeight: '48px',
        }

        if (element.type === 'seat') {
          const isSelected = selectedSeatsSet.has(element.id)
          const canClick =
            !element.isBooked &&
            (isSelected || (canSelectMoreSeats && currentSelectedCount < effectiveMaxSeats))

          return (
            <SeatButton
              key={element.id}
              element={element}
              isSelected={isSelected}
              canClick={canClick}
              currentSelectedCount={currentSelectedCount}
              effectiveMaxSeats={effectiveMaxSeats}
              canSelectMoreSeats={canSelectMoreSeats}
              onSeatSelect={memoizedOnSeatSelect}
              gridStyle={gridStyle}
            />
          )
        }

        return <FacilityElement key={element.id} element={element} gridStyle={gridStyle} />
      })
    }, [
      busLayout,
      selectedSeatsSet,
      currentSelectedCount,
      effectiveMaxSeats,
      canSelectMoreSeats,
      memoizedOnSeatSelect,
    ])

    return (
      <div
        className={clsx(
          'relative bg-gradient-to-br from-white via-orange-50/20 to-red-50/20 rounded-3xl shadow-xl border border-orange-200/50 overflow-hidden backdrop-blur-sm',
          className,
        )}
      >
        {/* Header Section */}
        <div className="px-8 py-6 bg-gradient-to-r from-orange-50/80 via-white/90 to-red-50/80 border-b border-orange-200/30 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div
                className="w-2 h-8 bg-gradient-to-b from-orange-500 to-red-500 rounded-full"
                aria-hidden="true"
              />
              <h3 className="text-xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                چوکی های خود را انتخاب کنید
              </h3>
            </div>
          </div>

          {/* Compact Legend */}
          <div
            className="flex items-center justify-center flex-wrap gap-4 sm:gap-6"
            role="group"
            aria-label="راهنمای وضعیت چوکی ها"
          >
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 bg-gradient-to-br from-orange-100 to-orange-200 rounded-lg shadow-sm border border-orange-200/40"
                aria-hidden="true"
              />
              <span className="text-xs font-medium text-gray-700">خالی</span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg shadow-sm border border-orange-300/50"
                aria-hidden="true"
              />
              <span className="text-xs font-medium text-gray-700">انتخابی</span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 bg-gradient-to-br from-gray-400 to-gray-500 rounded-lg shadow-sm border border-gray-300/50"
                aria-hidden="true"
              />
              <span className="text-xs font-medium text-gray-700">قید شده</span>
            </div>
            {hasUserBookedSeats && (
              <>
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-lg shadow-sm border border-emerald-400/50 ring-1 ring-emerald-300/40"
                    aria-hidden="true"
                  />
                  <span className="text-xs font-medium text-gray-700">شما (پرداخت شده)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg shadow-sm border border-amber-400/50 ring-1 ring-amber-300/40"
                    aria-hidden="true"
                  />
                  <span className="text-xs font-medium text-gray-700">شما (قید شده)</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Seat Layout Grid - Luxury Interior */}
        <div
          dir="ltr"
          className="relative p-10 bg-gradient-to-b from-orange-50/30 via-white/80 to-red-50/30"
        >
          {/* Elegant Aisle Lines */}
          <div className="absolute inset-x-0 top-10 bottom-10 flex justify-center">
            <div className="w-px bg-gradient-to-b from-transparent via-orange-300/60 to-transparent opacity-80 shadow-sm" />
          </div>

          <div
            className={clsx('relative z-10', styles.seatGrid)}
            style={{
              ...gridStyleVars,
              gridTemplateRows: `repeat(${maxRow}, minmax(48px, auto))`,
              gridTemplateColumns: `repeat(${maxCol}, minmax(48px, auto))`,
            }}
            role="grid"
            aria-label="طرح بندی چوکی های بس"
          >
            {emptyGridCells}
            {renderedElements}
          </div>
        </div>

        {/* Seat Availability Info */}
        {seatAvailability && (
          <div className="px-8 py-6 bg-gradient-to-r from-orange-50/80 via-white/90 to-red-50/80 border-t border-orange-200/30 backdrop-blur-sm">
            <div className="flex items-center justify-center gap-8 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gradient-to-br from-orange-100 to-orange-200 rounded-lg shadow-sm border border-orange-200/40" />
                <span className="font-medium text-gray-700">
                  خالی:{' '}
                  <span className="font-bold text-orange-700">
                    {convertToPersianDigits(seatAvailability.availableSeats)}
                  </span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-700">
                  کل:{' '}
                  <span className="font-bold text-gray-800">
                    {convertToPersianDigits(seatAvailability.totalSeats)}
                  </span>
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  },
)

SeatLayout.displayName = 'SeatLayout'
