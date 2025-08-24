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
  page?: string // page number for pagination
}

interface TripAvailability {
  totalSeats: number
  bookedSeats: number
  availableSeats: number
}

interface SearchedTrip {
  id: string
  tripName: string
  price: number
  departureTime: string
  arrivalTime: string | null
  duration: string | null
  from: {
    id: string
    name: string
    province: string
    address?: string
  }
  to: {
    id: string
    name: string
    province: string
    address?: string
  } | null
  bus: {
    id: string
    number: string
    type: {
      id: string
      name: string
      amenities?: any[] | null
    }
  }
  availability: TripAvailability
  isBookingAllowed: boolean
  bookingBlockedReason?: string
  stops?: {
    terminal: {
      id: string
      name: string
      province: string
      address?: string
    }
    time: string
    isUserBoardingPoint?: boolean
    isUserDestination?: boolean
    isBeforeBoarding?: boolean
    isAfterDestination?: boolean
  }[]
  userBoardingIndex?: number
  userDestinationIndex?: number
  mainDeparture?: {
    id: string
    name: string
    province: string
    address?: string
    time: string
  }
}

export const searchTrips: Endpoint = {
  path: '/trips/search',
  method: 'get',
  handler: async (req: PayloadRequest) => {
    const { payload, query } = req

    // Extract and normalize query parameters
    const { from: rawFrom, to: rawTo, date: rawDate, page: rawPage } = query as SearchQuery

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
    const from = String(rawFrom).trim().toLowerCase()
    const to = String(rawTo).trim().toLowerCase()
    const decodedDate = decodeURIComponent(String(rawDate).trim())
    const convertedDate = convertPersianDateToGregorian(decodedDate)

    // Parse and validate pagination parameters
    const pageNum = Math.max(1, parseInt(String(rawPage || '1'), 10) || 1)
    const limitNum = 10 // Fixed limit of 10 items per page

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

      // Enhanced terminal search with multiple strategies
      const searchTerminals = async (searchTerm: string) => {
        // Strategy 1: Exact province match (highest priority)
        const exactProvinceMatch = await payload.find({
          collection: 'terminals',
          where: {
            province: {
              equals: searchTerm,
            },
          },
          limit: 200,
        })

        if (exactProvinceMatch.docs.length > 0) {
          return exactProvinceMatch.docs
        }

        // Strategy 2: Case-insensitive exact match
        const caseInsensitiveMatch = await payload.find({
          collection: 'terminals',
          where: {
            or: [{ province: { like: searchTerm } }, { name: { like: searchTerm } }],
          },
          limit: 200,
        })

        if (caseInsensitiveMatch.docs.length > 0) {
          return caseInsensitiveMatch.docs
        }

        // Strategy 3: Fuzzy search with contains (fallback)
        const fuzzyMatch = await payload.find({
          collection: 'terminals',
          where: {
            or: [{ province: { contains: searchTerm } }, { name: { contains: searchTerm } }],
          },
          limit: 200,
        })

        return fuzzyMatch.docs
      }

      const fromTerminals = await searchTerminals(from)
      const toTerminals = await searchTerminals(to)

      if (fromTerminals.length === 0) {
        return Response.json(
          {
            success: false,
            error: `No terminals found for: ${from}. Please check spelling or try a different location.`,
          },
          { status: 404 },
        )
      }

      if (toTerminals.length === 0) {
        return Response.json(
          {
            success: false,
            error: `No terminals found for: ${to}. Please check spelling or try a different location.`,
          },
          { status: 404 },
        )
      }

      const fromTerminalIds = fromTerminals.map((t: any) => t.id)
      const toTerminalIds = toTerminals.map((t: any) => t.id)

      // Fetch all active trip schedules that might serve our route
      const tripSchedules = await payload.find({
        collection: 'trip-schedules',
        where: {
          isActive: { equals: true },
          or: [
            { frequency: { equals: 'daily' } },
            {
              and: [{ frequency: { equals: 'specific-days' } }, { days: { contains: dayOfWeek } }],
            },
          ],
        },
        depth: 3,
        limit: 100,
      })

      // Filter trips that serve the requested route (including intermediate stops)
      const relevantTrips = tripSchedules.docs.filter((trip: any) => {
        // Check if trip starts from a terminal in 'from' province OR has a stop in 'from' province
        const hasFromLocation =
          fromTerminalIds.includes(trip.from?.id) ||
          trip.stops?.some((stop: any) => fromTerminalIds.includes(stop.terminal?.id))

        // Check if trip has a stop in the destination province
        const hasToLocation = trip.stops?.some((stop: any) =>
          toTerminalIds.includes(stop.terminal?.id),
        )

        return hasFromLocation && hasToLocation
      })

      // Get seat availability for each trip with proper date filtering
      const tripsWithAvailability: (SearchedTrip | null)[] = await Promise.all(
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

          // Find user's boarding and destination points
          const fromStopIndex = trip.stops?.findIndex((stop: any) =>
            fromTerminalIds.includes(stop.terminal?.id),
          )

          const toStopIndex = trip.stops?.findIndex((stop: any) =>
            toTerminalIds.includes(stop.terminal?.id),
          )

          // Check if user can board at main terminal
          const canBoardAtMainTerminal = fromTerminalIds.includes(trip.from?.id)

          // Validate trip direction: user must board before destination
          // If user boards at main terminal (index -1), destination must be in stops (index >= 0)
          if (canBoardAtMainTerminal && toStopIndex < 0) {
            return null // User boards at main terminal but destination is not found in stops
          }

          // If user boards at intermediate stop, destination must come after boarding point
          if (fromStopIndex >= 0 && toStopIndex >= 0 && fromStopIndex >= toStopIndex) {
            return null // User is trying to book in the opposite direction of travel
          }

          // If user can't board at main terminal and no valid intermediate boarding point found
          if (!canBoardAtMainTerminal && fromStopIndex < 0) {
            return null // No valid boarding point found
          }

          // Determine user's actual boarding point and time
          let userBoardingTerminal, userBoardingTime: string
          if (fromTerminalIds.includes(trip.from?.id)) {
            // User boards at the main departure terminal
            userBoardingTerminal = trip.from
            userBoardingTime = formatTime(trip.departureTime)
          } else if (fromStopIndex >= 0) {
            // User boards at an intermediate stop
            userBoardingTerminal = trip.stops[fromStopIndex].terminal
            userBoardingTime = formatTime(trip.stops[fromStopIndex].time)
          } else {
            // Fallback: shouldn't happen in normal cases
            userBoardingTerminal = trip.from
            userBoardingTime = formatTime(trip.departureTime)
          }

          // Determine user's destination
          let destinationTerminal = null
          let arrivalTime: string | null = null
          let duration: string | null = null

          if (toStopIndex >= 0) {
            destinationTerminal = trip.stops[toStopIndex].terminal
            arrivalTime = formatTime(trip.stops[toStopIndex].time)
            duration = calculateDuration(userBoardingTime, arrivalTime)
          }

          // Calculate effective booked seats (actual bookings + disabled seats)
          const effectiveBookedSeats = bookedSeatsCount + disabledSeatsCount

          // Check if booking is allowed based on departure time (2 hour cutoff)
          const now = new Date()
          const [hours, minutes] = userBoardingTime.split(':').map(Number)
          const departureDateTime = new Date(convertedDate)
          departureDateTime.setHours(hours, minutes, 0, 0)

          const timeDiffInHours = (departureDateTime.getTime() - now.getTime()) / (1000 * 60 * 60)
          const isBookingAllowed = timeDiffInHours >= 2
          const bookingBlockedReason = timeDiffInHours < 2 ? 'Booking closed' : undefined

          return {
            id: trip.id,
            tripName: trip.tripName,
            price: trip.price,
            departureTime: userBoardingTime,
            arrivalTime,
            duration,
            from: {
              id: userBoardingTerminal.id,
              name: userBoardingTerminal.name,
              province: userBoardingTerminal.province,
              address: userBoardingTerminal.address || '',
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
            isBookingAllowed,
            bookingBlockedReason,
            stops:
              trip.stops?.map((stop: any, index: any) => ({
                terminal: {
                  id: stop.terminal.id,
                  name: stop.terminal.name,
                  province: stop.terminal.province,
                  address: stop.terminal.address || '',
                },
                time: formatTime(stop.time),
                isUserBoardingPoint: fromStopIndex >= 0 && index === fromStopIndex,
                isUserDestination: toStopIndex >= 0 && index === toStopIndex,
                isBeforeBoarding: fromStopIndex >= 0 ? index < fromStopIndex : false,
                isAfterDestination: toStopIndex >= 0 ? index > toStopIndex : false,
              })) || [],
            userBoardingIndex: fromStopIndex,
            userDestinationIndex: toStopIndex,
            mainDeparture: {
              id: trip.from.id,
              name: trip.from.name,
              province: trip.from.province,
              address: trip.from.address || '',
              time: formatTime(trip.departureTime),
            },
          }
        }),
      )

      // Filter out null results (invalid direction trips) and sort by departure time
      const validTrips: SearchedTrip[] = tripsWithAvailability.filter(
        (trip): trip is SearchedTrip => trip !== null,
      )
      validTrips.sort((a, b) => a.departureTime.localeCompare(b.departureTime))
      const availableTrips = validTrips.filter((trip) => trip.availability.availableSeats > 0)

      // Apply pagination
      const totalCount = validTrips.length
      const totalPages = Math.ceil(totalCount / limitNum)
      const startIndex = (pageNum - 1) * limitNum
      const endIndex = Math.min(startIndex + limitNum, totalCount)
      const paginatedTrips = validTrips.slice(startIndex, endIndex)

      return Response.json({
        success: true,
        data: {
          searchParams: {
            fromProvince: from,
            toProvince: to,
            originalDate: decodedDate,
            convertedDate,
          },
          trips: paginatedTrips,
          pagination: {
            currentPage: pageNum,
            totalPages,
            totalCount,
            hasNextPage: pageNum < totalPages,
            hasPrevPage: pageNum > 1,
          },
          summary: {
            totalTrips: validTrips.length,
            availableTrips: availableTrips.length,
            fullyBookedTrips: validTrips.length - availableTrips.length,
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
