// Production-ready trip search endpoint for Hesarak Bus System
// Supports Persian calendar dates, province-based search, and real-time availability

import type { Endpoint, PayloadRequest } from 'payload'
import {
  getDayOfWeek,
  formatTime,
  calculateDuration,
  validateDate,
  convertPersianDateToGregorian,
} from '../utils/dateUtils'

interface SearchQuery {
  from?: string // province name
  to?: string // province name
  date?: string // date in Persian or Gregorian format
}

interface TripAvailability {
  totalSeats: number
  bookedSeats: number
  availableSeats: number
  availableSeatNumbers: string[]
}

interface SearchedTrip {
  id: string
  name: string
  price: number
  departureTime: string
  arrivalTime: string | null
  duration: string | null
  from: {
    id: string
    name: string
    province: string
  }
  to: {
    id: string
    name: string
    province: string
  } | null
  bus: {
    id: string
    number: string
    type: {
      id: string
      name: string
      amenities: Array<{ name: string }>
    }
  }
  availability: TripAvailability
  stops: Array<{
    terminal: {
      id: string
      name: string
      province: string
    }
    time: string
  }>
  isDirectRoute: boolean
}

export const searchTrips: Endpoint = {
  path: '/trips/search',
  method: 'get',
  handler: async (req: PayloadRequest) => {
    const { payload, query } = req

    // Extract and normalize query parameters with URL decoding
    const { from: rawFrom, to: rawTo, date: rawDate } = query as SearchQuery

    // Input validation
    if (!rawFrom || !rawTo || !rawDate) {
      return Response.json(
        {
          success: false,
          error: 'Missing required parameters: from, to, and date are required (provinces)',
        },
        { status: 400 },
      )
    }

    // Normalize province names (case-insensitive) and decode + convert Persian date
    const from = rawFrom.trim()
    const to = rawTo.trim()

    // Decode URL-encoded Persian characters first, then convert
    const decodedDate = decodeURIComponent(rawDate.trim())
    const convertedDate = convertPersianDateToGregorian(decodedDate)

    // Validate date format and check if it's not in the past (validate AFTER conversion)
    const dateValidation = validateDate(decodedDate)
    if (!dateValidation.isValid) {
      return Response.json(
        {
          success: false,
          error: dateValidation.error,
        },
        { status: 400 },
      )
    }

    try {
      const searchDate = dateValidation.date!
      const dayOfWeek = getDayOfWeek(convertedDate) // Use converted Gregorian date for day calculation

      // Find terminals in the 'from' province (case-insensitive search)
      let fromTerminalsResult = await payload.find({
        collection: 'terminals',
        where: {
          province: { equals: from },
        },
        limit: 100,
      })

      // If no exact match found, try case-insensitive search
      if (fromTerminalsResult.docs.length === 0) {
        fromTerminalsResult = await payload.find({
          collection: 'terminals',
          where: {
            province: { like: from },
          },
          limit: 100,
        })
      }

      // Find terminals in the 'to' province (case-insensitive search)
      let toTerminalsResult = await payload.find({
        collection: 'terminals',
        where: {
          province: { equals: to },
        },
        limit: 100,
      })

      // If no exact match found, try case-insensitive search
      if (toTerminalsResult.docs.length === 0) {
        toTerminalsResult = await payload.find({
          collection: 'terminals',
          where: {
            province: { like: to },
          },
          limit: 100,
        })
      }

      // Validate terminal results
      if (fromTerminalsResult.docs.length === 0) {
        return Response.json(
          {
            success: false,
            error: `No terminals found in province: ${from}`,
          },
          { status: 404 },
        )
      }

      if (toTerminalsResult.docs.length === 0) {
        return Response.json(
          {
            success: false,
            error: `No terminals found in province: ${to}`,
          },
          { status: 404 },
        )
      }

      const fromTerminalIds = fromTerminalsResult.docs.map((t: any) => t.id)
      const toTerminalIds = toTerminalsResult.docs.map((t: any) => t.id)

      // Fetch trip schedules with full data population
      const tripSchedules = await payload.find({
        collection: 'trip-schedules',
        where: {
          from: { in: fromTerminalIds },
          isActive: { equals: true },
          or: [
            { frequency: { equals: 'daily' } },
            {
              and: [
                { frequency: { equals: 'specific-days' } },
                { 'days.day': { contains: dayOfWeek } },
              ],
            },
          ],
        },
        depth: 3, // Deep populate for terminal names, bus details, etc.
        limit: 50, // Reasonable limit for performance
      })

      // Filter trips that serve the requested route (province to province)
      const relevantTrips = tripSchedules.docs.filter((trip: any) => {
        // Check if trip goes directly to a terminal in the destination province
        if (toTerminalIds.includes(trip.to?.id)) {
          return true
        }

        // Check if any stop is in the destination province
        return trip.stops?.some((stop: any) => toTerminalIds.includes(stop.terminal?.id))
      })

      // Get seat availability for each trip on the specified date
      const tripsWithAvailability: SearchedTrip[] = await Promise.all(
        relevantTrips.map(async (trip: any) => {
          // Get all non-cancelled tickets for this trip on the specified date
          const bookedTickets = await payload.find({
            collection: 'tickets',
            where: {
              and: [
                { trip: { equals: trip.id } },
                { date: { equals: convertedDate } }, // Use converted Gregorian date
                { isCancelled: { not_equals: true } },
              ],
            },
          })

          // Calculate booked seats
          const bookedSeats = new Set<string>()
          bookedTickets.docs.forEach((ticket: any) => {
            ticket.bookedSeats?.forEach((seat: any) => {
              bookedSeats.add(seat.seat)
            })
          })

          // Get total available seats from bus type (excluding disabled seats)
          const busType = trip.bus?.type
          const totalSeats =
            busType?.seats?.filter((seat: any) => seat.type === 'seat' && !seat.disabled) || []

          const availableSeats = totalSeats.filter((seat: any) => !bookedSeats.has(seat.seatNumber))

          // Calculate arrival time and duration
          let arrivalTime: string | null = null
          let duration: string | null = null
          let destinationTerminal = null
          const isDirectRoute = toTerminalIds.includes(trip.to?.id)

          if (!isDirectRoute) {
            // Find the first stop in the destination province
            const stopIndex = trip.stops?.findIndex((stop: any) =>
              toTerminalIds.includes(stop.terminal?.id),
            )
            if (stopIndex >= 0) {
              destinationTerminal = trip.stops[stopIndex].terminal
              arrivalTime = formatTime(trip.stops[stopIndex].time)
              duration = calculateDuration(formatTime(trip.timeOfDay), arrivalTime)
            }
          } else {
            destinationTerminal = trip.to
            // For direct routes, calculate based on final stop or estimate
            if (trip.stops && trip.stops.length > 0) {
              const lastStop = trip.stops[trip.stops.length - 1]
              arrivalTime = formatTime(lastStop.time)
              duration = calculateDuration(formatTime(trip.timeOfDay), arrivalTime)
            }
          }

          return {
            id: trip.id,
            name: trip.name,
            price: trip.price,
            departureTime: formatTime(trip.timeOfDay),
            arrivalTime,
            duration,
            from: {
              id: trip.from.id,
              name: trip.from.name,
              province: trip.from.province,
            },
            to: destinationTerminal
              ? {
                  id: destinationTerminal.id,
                  name: destinationTerminal.name,
                  province: destinationTerminal.province,
                }
              : null,
            bus: {
              id: trip.bus.id,
              number: trip.bus.number,
              type: {
                id: busType?.id || '',
                name: busType?.name || '',
                amenities: busType?.amenities || [],
              },
            },
            availability: {
              totalSeats: totalSeats.length,
              bookedSeats: bookedSeats.size,
              availableSeats: availableSeats.length,
              availableSeatNumbers: availableSeats.map((seat: any) => seat.seatNumber),
            },
            stops:
              trip.stops?.map((stop: any) => ({
                terminal: {
                  id: stop.terminal.id,
                  name: stop.terminal.name,
                  province: stop.terminal.province,
                },
                time: formatTime(stop.time),
              })) || [],
            isDirectRoute,
          }
        }),
      )

      // Sort trips by departure time
      tripsWithAvailability.sort((a, b) => a.departureTime.localeCompare(b.departureTime))

      // Filter trips with available seats
      const availableTrips = tripsWithAvailability.filter(
        (trip) => trip.availability.availableSeats > 0,
      )

      // Return comprehensive search results
      return Response.json({
        success: true,
        data: {
          searchParams: {
            fromProvince: from,
            toProvince: to,
            originalDate: decodedDate, // Original Persian date from frontend
            convertedDate, // Converted Gregorian date used for search
            dayOfWeek,
            fromTerminals: fromTerminalsResult.docs.map((t: any) => ({
              id: t.id,
              name: t.name,
            })),
            toTerminals: toTerminalsResult.docs.map((t: any) => ({
              id: t.id,
              name: t.name,
            })),
          },
          trips: tripsWithAvailability,
          summary: {
            totalTrips: tripsWithAvailability.length,
            availableTrips: availableTrips.length,
            fullyBookedTrips: tripsWithAvailability.length - availableTrips.length,
          },
        },
      })
    } catch (error) {
      // Log error for debugging (in production, use proper logging service)
      console.error('Error searching trips:', error)

      return Response.json(
        {
          success: false,
          error: 'Internal server error while searching trips',
        },
        { status: 500 },
      )
    }
  },
}
