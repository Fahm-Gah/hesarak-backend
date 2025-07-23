import type { PayloadRequest } from 'payload'
import type { TripSchedule } from '@/types/tripTypes'
import { Ticket, Terminal } from '@/payload-types'

interface RouteStop {
  terminal: Terminal | string
  time: string
  isOrigin?: boolean
  isStop?: boolean
}

interface RouteMatchResult {
  pickupIndex: number
  pickupTerminal: Terminal | string
  pickupTime: string
  dropoffIndex: number
  dropoffTerminal: Terminal | string
  dropoffTime: string
}

export const findActiveTripSchedules = async (
  payload: PayloadRequest['payload'],
): Promise<TripSchedule[]> => {
  try {
    const result = await payload.find({
      collection: 'trip-schedules',
      where: {
        isActive: { equals: true },
      },
      depth: 2,
      limit: 500,
    })

    return result.docs as TripSchedule[]
  } catch (error) {
    console.error('Error finding active trip schedules:', error)
    throw new Error('Failed to find active trip schedules')
  }
}

export const findExistingTickets = async (
  payload: PayloadRequest['payload'],
  tripIds: string[],
  date: string,
): Promise<Ticket[]> => {
  if (!tripIds?.length || !date?.trim()) {
    return []
  }

  try {
    const result = await payload.find({
      collection: 'tickets',
      where: {
        and: [
          { date: { equals: date.trim() } },
          { status: { not_equals: 'cancelled' } },
          { trip: { in: tripIds.filter((id) => id?.trim()) } },
        ],
      },
      depth: 1,
      limit: 1000,
    })

    return result.docs as Ticket[]
  } catch (error) {
    console.error('Error finding existing tickets:', error)
    throw new Error('Failed to find existing tickets')
  }
}

const tripRunsOnDay = (trip: TripSchedule, dayOfWeek: string): boolean => {
  if (trip.frequency === 'daily') {
    return true
  }

  if (trip.frequency === 'specific-days') {
    return trip.days?.some((dayObj) => dayObj.day === dayOfWeek) || false
  }

  return false
}

const findStopMatch = (
  routeStops: RouteStop[],
  terminalIds: string[],
  startIndex: number,
): { index: number; terminal: Terminal | string; time: string } | null => {
  for (let i = startIndex; i < routeStops.length; i++) {
    const stop = routeStops[i]
    const terminalId = typeof stop.terminal === 'object' ? stop.terminal.id : stop.terminal

    if (terminalIds.includes(terminalId)) {
      return {
        index: i,
        terminal: stop.terminal,
        time: stop.time,
      }
    }
  }
  return null
}

const findRouteMatch = (
  trip: TripSchedule,
  fromTerminalIds: string[],
  toTerminalIds: string[],
): RouteMatchResult | null => {
  // Create a route array: [origin, ...stops]
  const routeStops: RouteStop[] = [
    {
      terminal: trip.from,
      time: trip.timeOfDay,
      isOrigin: true,
    },
    ...(trip.stops || []).map((stop) => ({
      terminal: stop.terminal,
      time: stop.time,
      isStop: true,
    })),
  ]

  // Find pickup point (from province)
  const pickupMatch = findStopMatch(routeStops, fromTerminalIds, 0)
  if (!pickupMatch) {
    return null
  }

  // Find dropoff point (to province) - must be after pickup point
  const dropoffMatch = findStopMatch(routeStops, toTerminalIds, pickupMatch.index + 1)
  if (!dropoffMatch) {
    return null
  }

  return {
    pickupIndex: pickupMatch.index,
    pickupTerminal: pickupMatch.terminal,
    pickupTime: pickupMatch.time,
    dropoffIndex: dropoffMatch.index,
    dropoffTerminal: dropoffMatch.terminal,
    dropoffTime: dropoffMatch.time,
  }
}

export const filterTripsByRoute = (
  trips: TripSchedule[],
  fromTerminalIds: string[],
  toTerminalIds: string[],
  dayOfWeek: string,
): TripSchedule[] => {
  if (!trips?.length || !fromTerminalIds?.length || !toTerminalIds?.length || !dayOfWeek) {
    return []
  }

  return trips.filter((trip) => {
    try {
      // Check if trip runs on the search day
      if (!tripRunsOnDay(trip, dayOfWeek)) {
        return false
      }

      // Find route match
      const routeMatch = findRouteMatch(trip, fromTerminalIds, toTerminalIds)
      if (!routeMatch) {
        return false
      }

      // Store the pickup and dropoff info for later use
      trip._pickupInfo = {
        terminal: routeMatch.pickupTerminal,
        time: routeMatch.pickupTime,
        index: routeMatch.pickupIndex,
      }
      trip._dropoffInfo = {
        terminal: routeMatch.dropoffTerminal,
        time: routeMatch.dropoffTime,
        index: routeMatch.dropoffIndex,
      }

      return true
    } catch (error) {
      console.error(`Error filtering trip ${trip.id}:`, error)
      return false // Skip problematic trips instead of failing entirely
    }
  })
}

export const calculateAvailableSeats = (trip: TripSchedule, tickets: Ticket[]): number => {
  try {
    const tripTickets = tickets.filter((ticket) => {
      const ticketTripId = typeof ticket.trip === 'object' ? ticket.trip.id : ticket.trip
      return ticketTripId === trip.id
    })

    const bookedSeatsCount = tripTickets.reduce((total, ticket) => {
      return total + (ticket.bookedSeats?.length || 0)
    }, 0)

    const busCapacity = typeof trip.busType === 'object' ? trip.busType.capacity : 0

    if (busCapacity <= 0) {
      console.warn(`Trip ${trip.id} has invalid bus capacity: ${busCapacity}`)
      return 0
    }

    return Math.max(0, busCapacity - bookedSeatsCount)
  } catch (error) {
    console.error(`Error calculating available seats for trip ${trip.id}:`, error)
    return 0 // Fail safe - assume no seats available if calculation fails
  }
}

export const getTripById = async (
  payload: PayloadRequest['payload'],
  id: string,
): Promise<TripSchedule | null> => {
  if (!id?.trim()) {
    throw new Error('Trip ID is required')
  }

  try {
    const trip = await payload.findByID({
      collection: 'trip-schedules',
      id: id.trim(),
      depth: 2,
    })

    return trip as TripSchedule
  } catch (error) {
    console.error(`Error finding trip by ID ${id}:`, error)
    return null // Return null instead of throwing for optional lookups
  }
}

export const findTripsByRoute = async (
  payload: PayloadRequest['payload'],
  fromTerminalId: string,
  toTerminalId: string,
): Promise<TripSchedule[]> => {
  if (!fromTerminalId?.trim() || !toTerminalId?.trim()) {
    return []
  }

  try {
    // This is a complex query - might need to be implemented differently
    // depending on your exact schema structure
    const allTrips = await findActiveTripSchedules(payload)

    return filterTripsByRoute(allTrips, [fromTerminalId], [toTerminalId], 'daily')
  } catch (error) {
    console.error('Error finding trips by route:', error)
    return []
  }
}

export const validateTripSchedule = (
  trip: TripSchedule,
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = []

  if (!trip.id) errors.push('Trip ID is missing')
  if (!trip.name?.trim()) errors.push('Trip name is missing')
  if (!trip.price || trip.price <= 0) errors.push('Trip price is invalid')
  if (!trip.timeOfDay?.trim()) errors.push('Departure time is missing')
  if (!trip.from?.id) errors.push('Origin terminal is missing')
  if (!trip.busType?.id) errors.push('Bus type is missing')
  if (!['daily', 'specific-days'].includes(trip.frequency)) {
    errors.push('Trip frequency is invalid')
  }

  if (trip.frequency === 'specific-days' && (!trip.days || trip.days.length === 0)) {
    errors.push('Specific days are required when frequency is specific-days')
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}
