import type { Trip, BookedTicket, SeatStatus } from '../types'
import { isTicketExpired } from '../utils'

const seatIdCache = new WeakMap<object, string>()

export const extractSeatId = (seatData: any): string | null => {
  if (!seatData) return null
  if (typeof seatData === 'string') return seatData

  if (typeof seatData === 'object') {
    const cached = seatIdCache.get(seatData)
    if (cached) return cached

    let result: string | null = null

    if (seatData.seat) {
      if (typeof seatData.seat === 'string') {
        result = seatData.seat
      } else if (typeof seatData.seat === 'object') {
        result = seatData.seat.id || seatData.seat._id || null
      }
    } else {
      result = seatData.id || seatData._id || seatData.seatId || null
    }

    if (result) {
      seatIdCache.set(seatData, result)
    }

    return result
  }

  return null
}

export const calculateGridDimensions = (trip: Trip | null) => {
  const seats = trip?.bus?.type?.seats
  if (!seats || !Array.isArray(seats) || seats.length === 0) {
    return { rows: 10, cols: 4 }
  }

  try {
    let maxRow = 0
    let maxCol = 0

    for (const seat of seats) {
      if (!seat?.position || typeof seat.position !== 'object') continue

      const { row, col } = seat.position
      if (typeof row !== 'number' || typeof col !== 'number' || row < 0 || col < 0) continue

      const rowSpan = seat.size?.rowSpan || 1
      const colSpan = seat.size?.colSpan || 1

      if (typeof rowSpan !== 'number' || typeof colSpan !== 'number' || rowSpan < 1 || colSpan < 1)
        continue

      const endRow = row + rowSpan - 1
      const endCol = col + colSpan - 1

      if (endRow > maxRow) maxRow = endRow
      if (endCol > maxCol) maxCol = endCol
    }

    // If no valid seats were processed, return default dimensions
    if (maxRow === 0 && maxCol === 0) {
      return { rows: 10, cols: 4 }
    }

    return {
      rows: Math.max(maxRow, 1),
      cols: Math.max(maxCol, 1),
    }
  } catch (error) {
    console.error('Error calculating grid dimensions:', error)
    return { rows: 10, cols: 4 }
  }
}

export const processBookings = (bookings: BookedTicket[], currentTicketId?: string | number) => {
  const allBookedSeatsMap = new Map<string, BookedTicket>()
  const currentTicketOriginalSeats = new Set<string>()
  let hasExpiredTickets = false

  if (!bookings || !Array.isArray(bookings) || bookings.length === 0) {
    return {
      allBookedSeatsMap,
      currentTicketOriginalSeats,
      hasExpiredTickets,
    }
  }

  try {
    bookings.forEach((ticket: BookedTicket) => {
      if (!ticket || typeof ticket !== 'object') return

      const bookedSeats = ticket.bookedSeats
      if (!bookedSeats || !Array.isArray(bookedSeats) || bookedSeats.length === 0) return

      const isExpired = isTicketExpired(ticket)
      if (isExpired) hasExpiredTickets = true

      const isCurrentTicket = String(ticket.id) === String(currentTicketId)
      const shouldBlock = !ticket.isCancelled && !isExpired && !isCurrentTicket

      bookedSeats.forEach((seatData) => {
        try {
          const seatId = extractSeatId(seatData)
          if (!seatId) return

          if (isCurrentTicket) {
            currentTicketOriginalSeats.add(seatId)
          } else if (shouldBlock) {
            allBookedSeatsMap.set(seatId, ticket)
          }
        } catch (error) {
          console.warn('Error processing seat data:', error, seatData)
        }
      })
    })
  } catch (error) {
    console.error('Error processing bookings:', error)
  }

  return {
    allBookedSeatsMap,
    currentTicketOriginalSeats,
    hasExpiredTickets,
  }
}

export const getSeatStatus = (
  seatId: string,
  allBookedSeatsMap: Map<string, BookedTicket>,
  currentTicketOriginalSeats: Set<string>,
  selectedSeats: string[],
  currentTicketId?: string | number,
): SeatStatus => {
  const booking = allBookedSeatsMap.get(seatId)

  if (booking) {
    return booking.isPaid ? 'booked' : 'unpaid'
  }

  if (selectedSeats.includes(seatId)) {
    return 'selected'
  }

  if (currentTicketId && currentTicketOriginalSeats.has(seatId)) {
    return 'currentTicket'
  }

  return 'available'
}

export const getBookingStatus = (
  seatId: string,
  allBookedSeatsMap: Map<string, BookedTicket>,
  currentTicketOriginalSeats: Set<string>,
  currentTicketId?: string | number,
): 'available' | 'booked' | 'unpaid' | 'currentTicket' => {
  const booking = allBookedSeatsMap.get(seatId)
  if (booking) {
    return booking.isPaid ? 'booked' : 'unpaid'
  }

  if (currentTicketId && currentTicketOriginalSeats.has(seatId)) {
    return 'currentTicket'
  }

  return 'available'
}
