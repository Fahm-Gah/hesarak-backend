import React from 'react'
import { User, DoorOpen, Bus, AlertTriangle, Toilet } from 'lucide-react'

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
  className?: string
}

export const SeatLayout = ({
  busLayout,
  selectedSeats,
  onSeatSelect,
  canSelectMoreSeats,
  maxSeatsAllowed = 2,
  currentSelectedCount = 0,
  isAuthenticated,
  className = '',
}: SeatLayoutProps) => {
  // Ensure maxSeatsAllowed is at least 1 for seat selection to work
  const effectiveMaxSeats = Math.max(maxSeatsAllowed, 1)

  // Check if user has any booked seats in this layout
  const hasUserBookedSeats = busLayout.some(
    (element) => element.type === 'seat' && element.isBookedByCurrentUser,
  )
  // Calculate grid dimensions
  const maxRow = Math.max(
    ...busLayout.map((element) => element.position.row + (element.size?.rowSpan || 1) - 1),
  )
  const maxCol = Math.max(
    ...busLayout.map((element) => element.position.col + (element.size?.colSpan || 1) - 1),
  )

  // Create a grid to track occupied cells
  const occupiedCells = new Set<string>()
  busLayout.forEach((element) => {
    const rowSpan = element.size?.rowSpan || 1
    const colSpan = element.size?.colSpan || 1

    for (let r = 0; r < rowSpan; r++) {
      for (let c = 0; c < colSpan; c++) {
        occupiedCells.add(`${element.position.row + r}-${element.position.col + c}`)
      }
    }
  })

  const renderElement = (element: BusLayoutElement) => {
    const rowSpan = element.size?.rowSpan || 1
    const colSpan = element.size?.colSpan || 1
    const isSelected = selectedSeats.includes(element.id)

    const baseClasses = `
      flex items-center justify-center
      transition-all duration-300 ease-in-out
      transform hover:scale-110 hover:-translate-y-1
      font-bold text-sm relative
      shadow-lg hover:shadow-xl
      backdrop-blur-sm rounded-2xl border
    `

    if (element.type === 'seat') {
      const isBooked = element.isBooked
      const isBookedByUser = element.isBookedByCurrentUser
      const isPaid = element.isPaid
      // Determine if this seat can be clicked - allow for both authenticated and unauthenticated users
      const canClick = !isBooked && (isSelected || currentSelectedCount < effectiveMaxSeats)

      let seatClasses = baseClasses
      let bgColor = ''
      let borderColor = ''
      let textColor = ''
      let cursor = ''

      if (isBooked) {
        if (isBookedByUser) {
          bgColor = isPaid
            ? 'bg-gradient-to-br from-blue-500 to-blue-600 shadow-blue-500/30'
            : 'bg-gradient-to-br from-blue-400 to-blue-500 shadow-blue-400/30'
          borderColor = 'border-blue-300/50'
          textColor = 'text-white'
          cursor = 'cursor-not-allowed'
        } else {
          bgColor = 'bg-gradient-to-br from-gray-400 to-gray-500 shadow-gray-400/30'
          borderColor = 'border-gray-300/50'
          textColor = 'text-white'
          cursor = 'cursor-not-allowed'
        }
      } else if (isSelected) {
        bgColor =
          'bg-gradient-to-br from-orange-500 to-red-500 shadow-orange-500/40 ring-2 ring-orange-300 seat-selected seat-glow'
        borderColor = 'border-orange-300/50'
        textColor = 'text-white'
        cursor = 'cursor-pointer'
      } else if (currentSelectedCount >= effectiveMaxSeats && !isSelected) {
        bgColor = 'bg-gradient-to-br from-gray-100 to-gray-200 shadow-gray-200/20'
        borderColor = 'border-gray-200/50'
        textColor = 'text-gray-400'
        cursor = 'cursor-not-allowed'
      } else {
        bgColor =
          'bg-gradient-to-br from-green-200 to-green-300 hover:from-green-300 hover:to-green-400 shadow-green-300/40 hover:shadow-green-400/50'
        borderColor = 'border-green-200/50 hover:border-green-300'
        textColor = 'text-green-800 hover:text-green-900'
        cursor = 'cursor-pointer'
      }

      seatClasses += ` ${bgColor} ${borderColor} ${textColor} ${cursor}`

      return (
        <button
          key={element.id}
          onClick={() => canClick && onSeatSelect(element.id)}
          disabled={!canClick}
          className={seatClasses}
          style={{
            gridRow: `${element.position.row} / span ${rowSpan}`,
            gridColumn: `${element.position.col} / span ${colSpan}`,
            minWidth: '48px',
            minHeight: '48px',
          }}
          title={
            isBooked
              ? isBookedByUser
                ? `Your seat ${element.seatNumber} (${isPaid ? 'Paid' : 'Pending Payment'})`
                : `Seat ${element.seatNumber} - Booked`
              : currentSelectedCount >= effectiveMaxSeats
                ? 'Maximum seats selected'
                : `Seat ${element.seatNumber} - Available`
          }
        >
          {element.seatNumber}
        </button>
      )
    }

    if (element.type === 'driver') {
      return (
        <div
          key={element.id}
          className={`${baseClasses} bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700/50 text-white cursor-default shadow-gray-800/30`}
          style={{
            gridRow: `${element.position.row} / span ${rowSpan}`,
            gridColumn: `${element.position.col} / span ${colSpan}`,
            minWidth: '48px',
            minHeight: '48px',
          }}
        >
          <User className="w-5 h-5" />
        </div>
      )
    }

    if (element.type === 'wc') {
      return (
        <div
          key={element.id}
          className={`${baseClasses} bg-gradient-to-br from-blue-100 to-blue-200 border-blue-300/50 text-blue-700 cursor-default shadow-blue-200/30`}
          style={{
            gridRow: `${element.position.row} / span ${rowSpan}`,
            gridColumn: `${element.position.col} / span ${colSpan}`,
            minWidth: '48px',
            minHeight: '48px',
          }}
        >
          <Toilet className="w-5 h-5" />
        </div>
      )
    }

    if (element.type === 'door') {
      return (
        <div
          key={element.id}
          className={`${baseClasses} bg-gradient-to-br from-yellow-100 to-yellow-200 border-yellow-300/50 text-yellow-700 cursor-default shadow-yellow-200/30`}
          style={{
            gridRow: `${element.position.row} / span ${rowSpan}`,
            gridColumn: `${element.position.col} / span ${colSpan}`,
            minWidth: '48px',
            minHeight: '48px',
          }}
        >
          <DoorOpen className="w-5 h-5" />
        </div>
      )
    }

    return null
  }

  // Create empty cells for unoccupied grid positions
  const gridCells = []
  for (let row = 1; row <= maxRow; row++) {
    for (let col = 1; col <= maxCol; col++) {
      const cellKey = `${row}-${col}`
      if (!occupiedCells.has(cellKey)) {
        gridCells.push(
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

  return (
    <div className={`${className}`}>
      {/* Modern Bus Container */}
      <div className="relative bg-gradient-to-b from-gray-50 to-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden">
        {/* Compact Legend */}
        <div className="px-6 py-4 bg-gray-50/50 border-b border-gray-200">
          <div className="flex items-center justify-center flex-wrap gap-6">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gradient-to-br from-green-200 to-green-300 rounded-lg shadow-sm"></div>
              <span className="text-xs font-medium text-gray-700">Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg shadow-sm"></div>
              <span className="text-xs font-medium text-gray-700">Selected</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gradient-to-br from-gray-400 to-gray-500 rounded-lg shadow-sm"></div>
              <span className="text-xs font-medium text-gray-700">Booked</span>
            </div>
            {hasUserBookedSeats && (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-sm"></div>
                <span className="text-xs font-medium text-gray-700">Yours</span>
              </div>
            )}
          </div>
        </div>

        {/* Seat Layout Grid - Modern Interior */}
        <div className="relative p-8 bg-gradient-to-b from-gray-50 to-gray-100">
          {/* Aisle Lines */}
          <div className="absolute inset-x-0 top-8 bottom-8 flex justify-center">
            <div className="w-px bg-gradient-to-b from-transparent via-gray-300 to-transparent opacity-60"></div>
          </div>

          <div
            className="relative z-10"
            style={{
              display: 'grid',
              gridTemplateRows: `repeat(${maxRow}, minmax(48px, auto))`,
              gridTemplateColumns: `repeat(${maxCol}, minmax(48px, auto))`,
              gap: '12px',
              justifyContent: 'center',
              padding: '16px',
            }}
          >
            {gridCells}
            {busLayout.map(renderElement)}
          </div>
        </div>
      </div>
    </div>
  )
}
