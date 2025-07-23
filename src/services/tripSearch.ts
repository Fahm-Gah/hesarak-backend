import type { PayloadRequest } from 'payload'
import type {
  AvailableTrip,
  SearchParams,
  ApiResponse,
  TripStop,
  TripSchedule,
} from '@/types/tripTypes'
import { findTerminalsByProvince, getTerminalById } from './terminals'
import {
  findActiveTripSchedules,
  filterTripsByRoute,
  findExistingTickets,
  calculateAvailableSeats,
} from './trips'
import { validateDate, getDayOfWeek, formatTime, calculateDuration } from '@/utils/dateUtils'
import { Terminal, Ticket, Media } from '@/payload-types'

const ensureTerminalObject = async (
  payload: PayloadRequest['payload'],
  terminal: Terminal | string,
): Promise<Terminal | null> => {
  try {
    if (typeof terminal === 'object') {
      return terminal
    }
    const terminalObject = await getTerminalById(payload, terminal)
    return terminalObject
  } catch (error) {
    console.error(
      `Error fetching terminal ${typeof terminal === 'string' ? terminal : terminal.id}:`,
      error,
    )
    return null
  }
}

const buildEnhancedStops = async (
  payload: PayloadRequest['payload'],
  trip: TripSchedule,
  pickupTerminal: Terminal,
  dropoffTerminal: Terminal,
): Promise<TripStop[]> => {
  const stops: TripStop[] = []

  try {
    // Add origin stop
    const originTerminal = await ensureTerminalObject(payload, trip.from)
    if (originTerminal) {
      stops.push({
        terminal: {
          id: originTerminal.id,
          province: originTerminal.province,
        },
        time: formatTime(trip.timeOfDay),
        isPickup: originTerminal.id === pickupTerminal.id,
        isDropoff: originTerminal.id === dropoffTerminal.id,
      })
    }

    // Add intermediate stops
    if (trip.stops) {
      for (const stop of trip.stops) {
        try {
          const terminal = await ensureTerminalObject(payload, stop.terminal)
          if (terminal) {
            stops.push({
              terminal: {
                id: terminal.id,
                province: terminal.province,
              },
              time: formatTime(stop.time),
              isPickup: terminal.id === pickupTerminal.id,
              isDropoff: terminal.id === dropoffTerminal.id,
            })
          }
        } catch (error) {
          console.error(`Error processing stop terminal:`, error)
          // Continue with other stops
          continue
        }
      }
    }
  } catch (error) {
    console.error(`Error building enhanced stops for trip ${trip.id}:`, error)
  }

  return stops
}

const buildBusTypeInfo = (trip: TripSchedule) => {
  const busType = trip.busType
  return {
    id: busType.id,
    name: busType.name,
    capacity: busType.capacity,
    amenities: busType.amenities || null,
    image: formatBusTypeImage(busType.image),
    seats: busType.seats || null,
    updatedAt: busType.updatedAt,
    createdAt: busType.createdAt,
  }
}

const formatBusTypeImage = (image: (string | null) | Media | undefined) => {
  if (!image || image === null || typeof image === 'string') {
    return undefined
  }

  // image is Media object - only return if url exists
  if (!image.url) {
    return undefined
  }

  return {
    id: image.id,
    url: image.url,
    alt: image.alt || undefined,
  }
}

const buildTerminalInfo = (terminal: Terminal) => {
  return {
    id: terminal.id,
    name: terminal.name,
    province: terminal.province,
    address: terminal.address,
    createdAt: terminal.createdAt,
    updatedAt: terminal.updatedAt,
  }
}

const buildAvailableTrips = async (
  payload: PayloadRequest['payload'],
  trips: TripSchedule[],
  tickets: Ticket[],
): Promise<AvailableTrip[]> => {
  const availableTrips: AvailableTrip[] = []

  for (const trip of trips) {
    try {
      const availableSeats = calculateAvailableSeats(trip, tickets)

      // Only include trips with available seats
      if (availableSeats <= 0) continue

      // Ensure we have pickup and dropoff info (should be set by filterTripsByRoute)
      if (!trip._pickupInfo || !trip._dropoffInfo) {
        console.warn(`Trip ${trip.id} missing pickup/dropoff info, skipping`)
        continue
      }

      const pickupTerminal = await ensureTerminalObject(payload, trip._pickupInfo.terminal)
      const dropoffTerminal = await ensureTerminalObject(payload, trip._dropoffInfo.terminal)

      if (!pickupTerminal || !dropoffTerminal) {
        console.warn(`Trip ${trip.id} has invalid terminals, skipping`)
        continue
      }

      const departureTime = formatTime(trip._pickupInfo.time)
      const arrivalTime = formatTime(trip._dropoffInfo.time)

      // Build enhanced stops
      const enhancedStops = await buildEnhancedStops(payload, trip, pickupTerminal, dropoffTerminal)

      const availableTrip: AvailableTrip = {
        id: trip.id,
        name: trip.name,
        price: trip.price,
        departureTime,
        arrivalTime,
        busType: buildBusTypeInfo(trip),
        from: buildTerminalInfo(pickupTerminal),
        to: buildTerminalInfo(dropoffTerminal),
        stops: enhancedStops,
        availableSeats,
        duration: calculateDuration(departureTime, arrivalTime),
        route: `${pickupTerminal.province} → ${dropoffTerminal.province}`,
      }

      availableTrips.push(availableTrip)
    } catch (error) {
      console.error(`Error processing trip ${trip.id}:`, error)
      // Continue with other trips instead of failing completely
      continue
    }
  }

  return availableTrips
}

export const searchTrips = async (
  payload: PayloadRequest['payload'],
  params: SearchParams,
): Promise<ApiResponse<AvailableTrip[]>> => {
  try {
    const { from, to, date } = params

    // Validate date
    const dateValidation = validateDate(date)
    if (!dateValidation.isValid) {
      return {
        success: false,
        error: dateValidation.error,
      }
    }

    const dayOfWeek = getDayOfWeek(date)

    // Find terminals in both provinces
    const [fromTerminals, toTerminals] = await Promise.all([
      findTerminalsByProvince(payload, from),
      findTerminalsByProvince(payload, to),
    ])

    if (fromTerminals.length === 0) {
      return {
        success: true,
        data: [],
        message: `No terminals found in province: ${from}`,
        meta: { from, to, date, totalFound: 0 },
      }
    }

    if (toTerminals.length === 0) {
      return {
        success: true,
        data: [],
        message: `No terminals found in province: ${to}`,
        meta: { from, to, date, totalFound: 0 },
      }
    }

    const fromTerminalIds = fromTerminals.map((terminal: Terminal) => terminal.id)
    const toTerminalIds = toTerminals.map((terminal: Terminal) => terminal.id)

    // Find and filter trip schedules
    const allTripSchedules = await findActiveTripSchedules(payload)
    const relevantTrips = filterTripsByRoute(
      allTripSchedules,
      fromTerminalIds,
      toTerminalIds,
      dayOfWeek,
    )

    if (relevantTrips.length === 0) {
      return {
        success: true,
        data: [],
        message: `No trips found from ${from} to ${to} on the specified date`,
        meta: {
          from,
          to,
          date,
          totalFound: 0,
          availableFromTerminals: fromTerminals.length,
          availableToTerminals: toTerminals.length,
        },
      }
    }

    // Get existing tickets
    const tripIds = relevantTrips.map((trip) => trip.id)
    const existingTickets = await findExistingTickets(payload, tripIds, date)

    // Build available trips
    const availableTrips = await buildAvailableTrips(payload, relevantTrips, existingTickets)

    // Sort by departure time
    availableTrips.sort((a, b) => {
      const timeA = new Date(`1970-01-01T${a.departureTime}`).getTime()
      const timeB = new Date(`1970-01-01T${b.departureTime}`).getTime()
      return timeA - timeB
    })

    return {
      success: true,
      data: availableTrips,
      meta: {
        from,
        to,
        date,
        dayOfWeek,
        totalFound: availableTrips.length,
        searchDate: dateValidation.date!.toISOString().split('T')[0],
        fromTerminalsFound: fromTerminals.length,
        toTerminalsFound: toTerminals.length,
      },
    }
  } catch (error) {
    console.error('Error in trip search:', error)
    return {
      success: false,
      error: 'Internal server error while fetching available trips',
      message: 'Please try again later or contact support if the issue persists',
    }
  }
}
