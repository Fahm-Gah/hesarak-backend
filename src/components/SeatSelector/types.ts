// types.ts - Complete type definitions for the seat selector

/**
 * Seat status enumeration for type safety
 */
export type SeatStatus =
  | 'available' // Seat is open for booking
  | 'selected' // Seat is selected in current session (new selection)
  | 'current-ticket' // Seat belongs to the ticket being edited (editable)
  | 'booked' // Seat is paid and confirmed by others
  | 'unpaid' // Seat is reserved but unpaid by others

/**
 * Seat types in the bus layout
 */
export type SeatType = 'seat' | 'wc' | 'driver' | 'door'

/**
 * Position in the grid
 */
export interface GridPosition {
  row: number
  col: number
}

/**
 * Size span for grid items
 */
export interface GridSize {
  rowSpan: number
  colSpan: number
}

/**
 * Individual seat or bus element
 */
export interface Seat {
  id: string
  type: SeatType
  seatNumber?: string
  position: GridPosition
  size?: GridSize
}

/**
 * Terminal/Stop information
 */
export interface Terminal {
  id: string
  name: string
  province?: string
}

/**
 * Stop along a trip route
 */
export interface TripStop {
  terminal: Terminal
  time: string
}

/**
 * Bus amenity
 */
export interface Amenity {
  name: string
  icon?: string
}

/**
 * Bus type configuration
 */
export interface BusType {
  id: string
  name: string
  seats: Seat[]
  amenities: Amenity[]
  capacity?: number
}

/**
 * Bus information
 */
export interface Bus {
  id: string
  number: string
  type: BusType
}

/**
 * Trip schedule information
 */
export interface Trip {
  id: string
  name: string
  from: Terminal
  stops: TripStop[]
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night'
  bus: Bus
  price: number
  isActive: boolean
  departureTime?: string
  arrivalTime?: string
}

/**
 * Passenger information
 */
export interface Passenger {
  id: string
  fullName: string
  phoneNumber: string
  gender: 'male' | 'female' | 'other'
  email?: string
}

/**
 * Booked seat reference
 */
export interface BookedSeat {
  seat: string | Seat
  id?: string
}

/**
 * Ticket document from API
 */
export interface BookedTicket {
  id: string
  ticketNumber: string
  passenger: Passenger
  trip?: Trip | string
  bookedSeats: BookedSeat[]
  isPaid: boolean
  isCancelled: boolean
  totalPrice?: number
  pricePerTicket?: number
  date?: string
  paymentDeadline?: string
  createdAt?: string
  updatedAt?: string
}

/**
 * API response wrapper
 */
export interface ApiResponse<T> {
  docs: T[]
  totalDocs: number
  limit: number
  page: number
  totalPages: number
  hasPrevPage: boolean
  hasNextPage: boolean
  prevPage: number | null
  nextPage: number | null
}

/**
 * Form field value for seat selection
 */
export interface SeatFieldValue {
  seats?: BookedSeat[]
  [key: string]: any
}

/**
 * Error response from API
 */
export interface ApiError {
  message: string
  status?: number
  errors?: Array<{
    field?: string
    message: string
  }>
}
