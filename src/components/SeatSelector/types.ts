// src/components/SeatSelector/types.ts

/**
 * Defines the status of a single seat in the UI.
 * - available: The seat is open for booking.
 * - selected: The seat has been clicked by the user in the current session.
 * - booked: The seat is paid for and confirmed in another ticket.
 * - unpaid: The seat is reserved in another ticket but not yet paid for.
 * - current-ticket: The seat is already part of the ticket being edited.
 */
export type SeatStatus = 'available' | 'selected' | 'booked' | 'unpaid' | 'current-ticket'

/**
 * Represents a physical or logical item in the bus layout grid.
 */
export interface Seat {
  id: string
  type: 'seat' | 'wc' | 'driver' | 'door'
  seatNumber?: string
  position: { row: number; col: number }
  size?: { rowSpan: number; colSpan: number }
}

/**
 * Represents the full trip schedule, including its route, bus, and pricing.
 */
export interface Trip {
  id: string
  name: string
  from: { id: string; name: string; province?: string }
  stops: Array<{ terminal: { id: string; name: string; province?: string }; time: string }>
  timeOfDay: string
  bus: {
    id: string
    number: string
    type: {
      id: string
      name: string
      seats: Seat[]
      amenities: { name: string }[]
    }
  }
  price: number
  isActive: boolean
}

/**
 * Represents a ticket document as returned by the Payload API.
 * This is the data structure for a single booking, which may contain multiple seats.
 */
export interface BookedTicket {
  id: string
  ticketNumber: string
  passenger: { id: string; fullName: string; phoneNumber: string; gender: string }
  bookedSeats: Array<{ seat: string; id?: string }>
  isPaid: boolean
  isCancelled: boolean
}
