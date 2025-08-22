import { describe, it, expect } from 'vitest'
import {
  extractSeatId,
  calculateGridDimensions,
  processBookings,
  getSeatStatus,
  getBookingStatus,
} from '@/components/SeatSelector/lib/seatCalculations'

describe('seatCalculations', () => {
  describe('extractSeatId', () => {
    it('should extract seat ID from string', () => {
      expect(extractSeatId('seat-123')).toBe('seat-123')
    })

    it('should extract seat ID from object with seat string', () => {
      expect(extractSeatId({ seat: 'seat-456' })).toBe('seat-456')
    })

    it('should extract seat ID from object with seat object', () => {
      expect(extractSeatId({ seat: { id: 'seat-789' } })).toBe('seat-789')
      expect(extractSeatId({ seat: { _id: 'seat-789' } })).toBe('seat-789')
    })

    it('should extract seat ID from object with direct ID', () => {
      expect(extractSeatId({ id: 'seat-direct' })).toBe('seat-direct')
      expect(extractSeatId({ _id: 'seat-direct' })).toBe('seat-direct')
      expect(extractSeatId({ seatId: 'seat-direct' })).toBe('seat-direct')
    })

    it('should return null for invalid input', () => {
      expect(extractSeatId(null)).toBe(null)
      expect(extractSeatId(undefined)).toBe(null)
      expect(extractSeatId({})).toBe(null)
      expect(extractSeatId(123)).toBe(null)
    })

    it('should cache extracted seat IDs', () => {
      const seatObj = { id: 'cached-seat' }
      expect(extractSeatId(seatObj)).toBe('cached-seat')
      // Should return cached result on second call
      expect(extractSeatId(seatObj)).toBe('cached-seat')
    })
  })

  describe('calculateGridDimensions', () => {
    it('should return default dimensions for null trip', () => {
      expect(calculateGridDimensions(null)).toEqual({ rows: 10, cols: 4 })
    })

    it('should return default dimensions for trip without seats', () => {
      const trip = { bus: { type: { seats: [] } } } as any
      expect(calculateGridDimensions(trip)).toEqual({ rows: 10, cols: 4 })
    })

    it('should calculate correct dimensions for simple seats', () => {
      const trip = {
        bus: {
          type: {
            seats: [
              { position: { row: 1, col: 1 } },
              { position: { row: 2, col: 3 } },
              { position: { row: 4, col: 2 } },
            ]
          }
        }
      } as any

      expect(calculateGridDimensions(trip)).toEqual({ rows: 4, cols: 3 })
    })

    it('should calculate dimensions including span sizes', () => {
      const trip = {
        bus: {
          type: {
            seats: [
              { position: { row: 1, col: 1 }, size: { rowSpan: 2, colSpan: 3 } },
              { position: { row: 3, col: 2 } },
            ]
          }
        }
      } as any

      // seat 1: ends at row 2 (1+2-1), col 3 (1+3-1)
      // seat 2: ends at row 3, col 2
      expect(calculateGridDimensions(trip)).toEqual({ rows: 3, cols: 3 })
    })

    it('should handle calculation errors gracefully', () => {
      const trip = {
        bus: {
          type: {
            seats: [
              { position: null }, // Invalid position
            ]
          }
        }
      } as any

      expect(calculateGridDimensions(trip)).toEqual({ rows: 10, cols: 4 })
    })
  })

  describe('processBookings', () => {
    const mockBookings = [
      {
        id: 'booking-1',
        isPaid: true,
        isCancelled: false,
        paymentDeadline: null,
        bookedSeats: [{ seat: 'A1' }, { seat: 'A2' }]
      },
      {
        id: 'booking-2', 
        isPaid: false,
        isCancelled: false,
        paymentDeadline: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
        bookedSeats: [{ seat: 'B1' }]
      },
      {
        id: 'booking-3',
        isPaid: false,
        isCancelled: false,
        paymentDeadline: new Date(Date.now() - 86400000).toISOString(), // Yesterday (expired)
        bookedSeats: [{ seat: 'C1' }]
      },
      {
        id: 'current-ticket',
        isPaid: false,
        isCancelled: false,
        paymentDeadline: null,
        bookedSeats: [{ seat: 'D1' }]
      }
    ] as any

    it('should process bookings correctly', () => {
      const result = processBookings(mockBookings, 'current-ticket')
      
      expect(result.hasExpiredTickets).toBe(true)
      expect(result.currentTicketOriginalSeats.has('D1')).toBe(true)
      expect(result.allBookedSeatsMap.has('A1')).toBe(true)
      expect(result.allBookedSeatsMap.has('A2')).toBe(true)
      expect(result.allBookedSeatsMap.has('B1')).toBe(true)
      expect(result.allBookedSeatsMap.has('C1')).toBe(false) // Expired, so not blocked
      expect(result.allBookedSeatsMap.has('D1')).toBe(false) // Current ticket
    })

    it('should handle empty bookings', () => {
      const result = processBookings([], 'current-ticket')
      
      expect(result.hasExpiredTickets).toBe(false)
      expect(result.currentTicketOriginalSeats.size).toBe(0)
      expect(result.allBookedSeatsMap.size).toBe(0)
    })

    it('should handle mixed ID types', () => {
      const bookings = [
        { id: 123, isPaid: true, isCancelled: false, bookedSeats: [{ seat: 'A1' }] }
      ] as any
      
      const result = processBookings(bookings, 123)
      expect(result.currentTicketOriginalSeats.has('A1')).toBe(true)
    })
  })

  describe('getSeatStatus', () => {
    const allBookedSeatsMap = new Map([
      ['A1', { isPaid: true } as any],
      ['B1', { isPaid: false } as any],
    ])
    const currentTicketOriginalSeats = new Set(['C1'])
    const selectedSeats = ['D1', 'D2']

    it('should return booked for paid seats', () => {
      expect(getSeatStatus('A1', allBookedSeatsMap, currentTicketOriginalSeats, selectedSeats)).toBe('booked')
    })

    it('should return unpaid for unpaid seats', () => {
      expect(getSeatStatus('B1', allBookedSeatsMap, currentTicketOriginalSeats, selectedSeats)).toBe('unpaid')
    })

    it('should return selected for selected seats', () => {
      expect(getSeatStatus('D1', allBookedSeatsMap, currentTicketOriginalSeats, selectedSeats)).toBe('selected')
      expect(getSeatStatus('D2', allBookedSeatsMap, currentTicketOriginalSeats, selectedSeats)).toBe('selected')
    })

    it('should return currentTicket for current ticket seats', () => {
      expect(getSeatStatus('C1', allBookedSeatsMap, currentTicketOriginalSeats, [], 'current-ticket')).toBe('currentTicket')
    })

    it('should return available for unbooked seats', () => {
      expect(getSeatStatus('E1', allBookedSeatsMap, currentTicketOriginalSeats, selectedSeats)).toBe('available')
    })

    it('should prioritize booking status over selection', () => {
      const selectedWithBooked = ['A1'] // A1 is booked
      expect(getSeatStatus('A1', allBookedSeatsMap, currentTicketOriginalSeats, selectedWithBooked)).toBe('booked')
    })
  })

  describe('getBookingStatus', () => {
    const allBookedSeatsMap = new Map([
      ['A1', { isPaid: true } as any],
      ['B1', { isPaid: false } as any],
    ])
    const currentTicketOriginalSeats = new Set(['C1'])

    it('should return correct booking statuses', () => {
      expect(getBookingStatus('A1', allBookedSeatsMap, currentTicketOriginalSeats)).toBe('booked')
      expect(getBookingStatus('B1', allBookedSeatsMap, currentTicketOriginalSeats)).toBe('unpaid')
      expect(getBookingStatus('C1', allBookedSeatsMap, currentTicketOriginalSeats, 'current-ticket')).toBe('currentTicket')
      expect(getBookingStatus('D1', allBookedSeatsMap, currentTicketOriginalSeats)).toBe('available')
    })
  })
})