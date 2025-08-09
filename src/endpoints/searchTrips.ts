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
      amenities?: string[] | null
    }
  }
  availability: TripAvailability
}

export const searchTrips: Endpoint = {
  path: '/trips/search',
  method: 'get',
  handler: async (req: PayloadRequest) => {
    const { payload, query } = req

    // Extract and normalize query parameters
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

    // Normalize province names and decode + convert Persian date
    const from = rawFrom.trim()
    const to = rawTo.trim()
    const decodedDate = decodeURIComponent(rawDate.trim())
    const convertedDate = convertPersianDateToGregorian(decodedDate)

    // Validate date
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
      const dayOfWeek = getDayOfWeek(convertedDate)

      // Find terminals in the 'from' province
      const fromTerminalsResult = await payload.find({
        collection: 'terminals',
        where: {
          province: { equals: from },
        },
        limit: 100,
      })

      // Find terminals in the 'to' province
      const toTerminalsResult = await payload.find({
        collection: 'terminals',
        where: {
          province: { equals: to },
        },
        limit: 100,
      })

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

      // Fetch trip schedules
      const tripSchedules = await payload.find({
        collection: 'trip-schedules',
        where: {
          from: { in: fromTerminalIds },
          isActive: { equals: true },
          or: [
            { frequency: { equals: 'daily' } },
            {
              and: [{ frequency: { equals: 'specific-days' } }, { days: { contains: dayOfWeek } }],
            },
          ],
        },
        depth: 3,
        limit: 50,
      })

      // Filter trips that serve the requested route
      const relevantTrips = tripSchedules.docs.filter((trip: any) => {
        // Check if any stop is in the destination province
        return trip.stops?.some((stop: any) => toTerminalIds.includes(stop.terminal?.id))
      })

      // Get seat availability for each trip with proper date filtering
      const tripsWithAvailability: SearchedTrip[] = await Promise.all(
        relevantTrips.map(async (trip: any) => {
          // Get booked tickets for this trip on the specified date
          const dateObj = new Date(convertedDate)
          const startOfDay = new Date(dateObj)
          startOfDay.setHours(0, 0, 0, 0)

          const endOfDay = new Date(dateObj)
          endOfDay.setHours(23, 59, 59, 999)

          const bookedTickets = await payload.find({
            collection: 'tickets',
            where: {
              and: [
                { trip: { equals: trip.id } },
                {
                  date: {
                    greater_than_equal: startOfDay.toISOString(),
                    less_than_equal: endOfDay.toISOString(),
                  },
                },
                { isCancelled: { not_equals: true } },
              ],
            },
          })

          // Get booked seat count (simplified)
          let bookedSeatsCount = 0
          bookedTickets.docs.forEach((ticket: any) => {
            if (Array.isArray(ticket.bookedSeats)) {
              bookedSeatsCount += ticket.bookedSeats.length
            }
          })

          // Get total seats from bus type (including disabled seats)
          const busType = trip.bus?.type
          let totalSeats = 0
          let disabledSeatsCount = 0

          if (busType?.seats && Array.isArray(busType.seats)) {
            // Count all actual seats (including disabled ones)
            const allSeats = busType.seats.filter((element: any) => element.type === 'seat')
            totalSeats = allSeats.length

            // Count disabled seats to add to "booked" count
            disabledSeatsCount = allSeats.filter((seat: any) => seat.disabled).length
          }

          // Find the destination terminal and arrival time
          let arrivalTime: string | null = null
          let duration: string | null = null
          let destinationTerminal = null

          const stopIndex = trip.stops?.findIndex((stop: any) =>
            toTerminalIds.includes(stop.terminal?.id),
          )

          if (stopIndex >= 0) {
            destinationTerminal = trip.stops[stopIndex].terminal
            arrivalTime = formatTime(trip.stops[stopIndex].time)
            duration = calculateDuration(formatTime(trip.departureTime), arrivalTime)
          }

          // Calculate effective booked seats (actual bookings + disabled seats)
          const effectiveBookedSeats = bookedSeatsCount + disabledSeatsCount

          return {
            id: trip.id,
            name: trip.name,
            price: trip.price,
            departureTime: formatTime(trip.departureTime),
            arrivalTime,
            duration,
            from: {
              id: trip.from.id,
              name: trip.from.name,
              province: trip.from.province,
              address: trip.from.address || '',
            },
            to: destinationTerminal
              ? {
                  id: destinationTerminal.id,
                  name: destinationTerminal.name,
                  province: destinationTerminal.province,
                  address: destinationTerminal.address || '',
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
              totalSeats,
              bookedSeats: effectiveBookedSeats, // Includes disabled seats
              availableSeats: Math.max(0, totalSeats - effectiveBookedSeats),
            },
            stops:
              trip.stops?.map((stop: any) => ({
                terminal: {
                  id: stop.terminal.id,
                  name: stop.terminal.name,
                  province: stop.terminal.province,
                  address: stop.terminal.address || '',
                },
                time: formatTime(stop.time),
              })) || [],
          }
        }),
      )

      // Sort by departure time and filter available trips
      tripsWithAvailability.sort((a, b) => a.departureTime.localeCompare(b.departureTime))
      const availableTrips = tripsWithAvailability.filter(
        (trip) => trip.availability.availableSeats > 0,
      )

      return Response.json({
        success: true,
        data: {
          searchParams: {
            fromProvince: from,
            toProvince: to,
            originalDate: decodedDate,
            convertedDate,
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
