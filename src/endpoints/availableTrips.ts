import type { PayloadRequest, Endpoint } from 'payload'
import { validateDate, getDayOfWeek, formatTime } from '@/utils/dateUtils'

export const availableTripsEndpoint: Endpoint = {
  path: '/available-trips',
  method: 'get',
  handler: async (req: PayloadRequest) => {
    const fromProvince = req.query?.from as string
    const toProvince = req.query?.to as string
    const dateParam = req.query?.date as string

    // Input validation
    if (!fromProvince || !toProvince || !dateParam) {
      return Response.json(
        {
          success: false,
          error: 'From province, to province, and date are required',
          message: 'Example: /available-trips?from=Kabul&to=Mazaar&date=2025-10-01',
        },
        { status: 400 },
      )
    }

    if (fromProvince === toProvince) {
      return Response.json(
        {
          success: false,
          error: 'From and to provinces cannot be the same',
        },
        { status: 400 },
      )
    }

    try {
      // 1) Validate date
      const { isValid, date: travelDate, error: dateErr } = validateDate(dateParam)
      if (!isValid || !travelDate) {
        return Response.json(
          {
            success: false,
            error: dateErr || 'Invalid date format',
          },
          { status: 400 },
        )
      }

      // 2) Get day of week for frequency check
      const dayCode = getDayOfWeek(dateParam)

      // 3) Find all active trip schedules
      const { docs: allTrips } = await req.payload.find({
        collection: 'trip-schedules',
        where: {
          isActive: { equals: true },
        },
        depth: 3,
        limit: 1000,
      })

      // 4) Filter trips based on route and date
      const matchingTrips = allTrips.filter((trip) => {
        // Check if trip runs on the selected date
        if (trip.frequency === 'specific-days') {
          const runsOnDate = (trip.days || []).some((d) => d.day === dayCode)
          if (!runsOnDate) return false
        }

        // Get from terminal province
        const fromTerminal = typeof trip.from === 'object' ? trip.from : null
        if (!fromTerminal || fromTerminal.province !== fromProvince) {
          return false
        }

        // Check if any stop matches the destination province
        const hasDestination = (trip.stops || []).some((stop) => {
          const terminal = typeof stop.terminal === 'object' ? stop.terminal : null
          return terminal && terminal.province === toProvince
        })

        return hasDestination
      })

      // 5) Build date range for seat availability check
      const startOfDay = new Date(travelDate)
      startOfDay.setUTCHours(0, 0, 0, 0)
      const endOfDay = new Date(startOfDay)
      endOfDay.setUTCDate(endOfDay.getUTCDate() + 1)

      // 6) Get all bookings for the date to calculate availability
      const { docs: dayBookings } = await req.payload.find({
        collection: 'tickets',
        where: {
          and: [
            { date: { greater_than_equal: startOfDay.toISOString() } },
            { date: { less_than: endOfDay.toISOString() } },
            { status: { not_equals: 'cancelled' } },
          ],
        },
        depth: 0,
        limit: 5000,
      })

      // 7) Process each matching trip
      const availableTrips = matchingTrips
        .map((trip) => {
          // Get bus information
          const bus = typeof trip.busType === 'object' ? trip.busType : null
          const totalSeats = bus?.capacity || 0

          // Calculate booked seats for this trip
          const tripBookings = dayBookings.filter((booking) => booking.trip === trip.id)
          const bookedSeatsCount = tripBookings.reduce((total, booking) => {
            return total + (booking.bookedSeats || []).length
          }, 0)

          const availableSeats = totalSeats - bookedSeatsCount

          // Find the destination stop info
          const destinationStop = (trip.stops || []).find((stop) => {
            const terminal = typeof stop.terminal === 'object' ? stop.terminal : null
            return terminal && terminal.province === toProvince
          })

          const destinationTerminal =
            destinationStop && typeof destinationStop.terminal === 'object'
              ? destinationStop.terminal
              : null

          return {
            id: trip.id,
            name: trip.name,
            price: trip.price,
            departureTime: formatTime(trip.timeOfDay),
            frequency: trip.frequency,
            from: {
              id: typeof trip.from === 'object' ? trip.from.id : '',
              province: typeof trip.from === 'object' ? trip.from.province : '',
              address: typeof trip.from === 'object' ? trip.from.address : '',
            },
            to: destinationTerminal
              ? {
                  id: destinationTerminal.id,
                  province: destinationTerminal.province,
                  address: destinationTerminal.address,
                }
              : null,
            arrivalTime: destinationStop ? formatTime(destinationStop.time) : null,
            bus: bus
              ? {
                  id: bus.id,
                  name: bus.name,
                  capacity: bus.capacity,
                  amenities: (bus.amenities || []).map((a) => a.name),
                }
              : null,
            availability: {
              totalSeats,
              availableSeats,
              bookedSeats: bookedSeatsCount,
              isAvailable: availableSeats > 0,
            },
            travelDate: startOfDay.toISOString().split('T')[0],
          }
        })
        .filter((trip) => trip.availability.isAvailable) // Only return trips with available seats

      // 8) Sort by departure time
      availableTrips.sort((a, b) => a.departureTime.localeCompare(b.departureTime))

      return Response.json(
        {
          success: true,
          data: {
            trips: availableTrips,
            searchCriteria: {
              from: fromProvince,
              to: toProvince,
              date: startOfDay.toISOString().split('T')[0],
            },
            resultsCount: availableTrips.length,
          },
        },
        { status: 200 },
      )
    } catch (error) {
      console.error('Error searching trips:', error)
      return Response.json(
        {
          success: false,
          error: 'An error occurred while searching for trips',
        },
        { status: 500 },
      )
    }
  },
}
