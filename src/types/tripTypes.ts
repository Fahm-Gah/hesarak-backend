import { Terminal, BusType } from '@/payload-types'

export interface TripStop {
  terminal: {
    id: string
    province: string
  }
  time: string
  isPickup?: boolean
  isDropoff?: boolean
}

export interface AvailableTrip {
  id: string
  name: string
  price: number
  departureTime: string
  arrivalTime?: string
  busType: {
    id: string
    name: string
    capacity: number
    amenities: Array<{ name: string; id?: string | null }> | null
    seats?: Array<{
      label: string
      row?: number | null
      col?: number | null
      id?: string | null
    }> | null
    image?: {
      id: string
      url: string
      alt?: string
    }
    updatedAt: string
    createdAt: string
  }
  from: Terminal
  to: Terminal
  stops: TripStop[]
  availableSeats: number
  duration?: string
  route: string
}

export interface TripSchedule {
  id: string
  name: string
  price: number
  timeOfDay: string
  frequency: 'daily' | 'specific-days'
  days?: Array<{ day: string }>
  isActive: boolean
  from: Terminal
  busType: BusType
  stops?: Array<{
    terminal: Terminal | string
    time: string
  }>
  _pickupInfo?: {
    terminal: Terminal | string
    time: string
    index: number
  }
  _dropoffInfo?: {
    terminal: Terminal | string
    time: string
    index: number
  }
}

export interface SearchParams {
  from: string
  to: string
  date: string
}

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
  meta?: Record<string, unknown>
}

// Additional helper types for the TripService
export interface RouteStop {
  terminal: Terminal | string
  time: string
  isOrigin?: boolean
  isStop?: boolean
}

export interface RouteMatchResult {
  pickupIndex: number
  pickupTerminal: Terminal | string
  pickupTime: string
  dropoffIndex: number
  dropoffTerminal: Terminal | string
  dropoffTime: string
}

export interface TripValidationResult {
  isValid: boolean
  errors: string[]
}
