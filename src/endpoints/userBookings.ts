import type { PayloadRequest, Endpoint } from 'payload'
import { formatTime } from '@/utils/dateUtils'

export const userBookingsEndpoint: Endpoint = {
  path: '/:userId/bookings',
  method: 'get',
  handler: async (req: PayloadRequest) => {
    const userId = req.routeParams?.userId as string

    if (!userId) {
      return Response.json(
        {
          success: false,
          error: 'User ID is required',
        },
        { status: 400 },
      )
    }

    try {
      // Optional query parameters for filtering
      const status = req.query?.status as string
      const limit = parseInt(req.query?.limit as string) || 50
      const page = parseInt(req.query?.page as string) || 1

      // 1) Verify user exists
      const user = await req.payload.findByID({
        collection: 'users',
        id: userId,
      })

      if (!user) {
        return Response.json(
          {
            success: false,
            error: 'User not found',
          },
          { status: 404 },
        )
      }

      // 2) Build query conditions
      const whereConditions: any = {
        and: [{ user: { equals: userId } }],
      }

      // Add status filter if provided
      if (status && ['paid', 'unpaid', 'cancelled'].includes(status)) {
        whereConditions.and.push({ status: { equals: status } })
      }

      // 3) Fetch user's tickets
      const {
        docs: tickets,
        totalDocs,
        totalPages,
        hasNextPage,
        hasPrevPage,
      } = await req.payload.find({
        collection: 'tickets',
        where: whereConditions,
        depth: 3, // Deep populate trip and related data
        limit: 0,
        page,
        sort: '-createdAt', // Most recent first
      })

      // 4) Process and format ticket data
      const bookings = tickets.map((ticket) => {
        const trip = typeof ticket.trip === 'object' ? ticket.trip : null
        const bus = trip && typeof trip.busType === 'object' ? trip.busType : null

        // Get destination info from stops
        let destination = null
        if (trip && trip.stops && trip.stops.length > 0) {
          const lastStop = trip.stops[trip.stops.length - 1]
          const terminal = typeof lastStop.terminal === 'object' ? lastStop.terminal : null
          if (terminal) {
            destination = {
              id: terminal.id,
              province: terminal.province,
              address: terminal.address,
              arrivalTime: formatTime(lastStop.time),
            }
          }
        }

        return {
          id: ticket.id,
          ticketNumber: ticket.ticketNumber,
          status: ticket.status,
          totalPrice: ticket.totalPrice,
          bookingDate: ticket.createdAt,
          travelDate: ticket.date,

          // Trip information
          trip: trip
            ? {
                id: trip.id,
                name: trip.name,
                price: trip.price,
                departureTime: formatTime(trip.timeOfDay),
                frequency: trip.frequency,

                // Route info
                from:
                  typeof trip.from === 'object'
                    ? {
                        id: trip.from.id,
                        province: trip.from.province,
                        address: trip.from.address,
                      }
                    : null,

                to: destination,

                // All stops for reference
                stops: (trip.stops || [])
                  .map((stop) => {
                    const terminal = typeof stop.terminal === 'object' ? stop.terminal : null
                    return {
                      terminal: terminal
                        ? {
                            id: terminal.id,
                            province: terminal.province,
                            address: terminal.address,
                          }
                        : null,
                      time: formatTime(stop.time),
                    }
                  })
                  .filter((stop) => stop.terminal),
              }
            : null,

          // Bus information
          bus: bus
            ? {
                id: bus.id,
                name: bus.name,
                capacity: bus.capacity,
                amenities: (bus.amenities || []).map((a) => a.name),
              }
            : null,

          // Booked seats
          seats: {
            count: (ticket.bookedSeats || []).length,
            labels: (ticket.bookedSeats || []).map((seat) => seat.seatLabel),
          },

          // Booking status helpers
          isPaid: ticket.status === 'paid',
          isCancelled: ticket.status === 'cancelled',
          canBeCancelled: ticket.status !== 'cancelled' && new Date(ticket.date) > new Date(),
        }
      })

      // 5) Categorize bookings for easier frontend handling
      const categorizedBookings = {
        upcoming: bookings.filter((b) => !b.isCancelled && new Date(b.travelDate) >= new Date()),
        past: bookings.filter((b) => !b.isCancelled && new Date(b.travelDate) < new Date()),
        cancelled: bookings.filter((b) => b.isCancelled),
      }

      // 6) Summary statistics
      const summary = {
        total: totalDocs,
        paid: bookings.filter((b) => b.isPaid).length,
        unpaid: bookings.filter((b) => b.status === 'unpaid').length,
        cancelled: bookings.filter((b) => b.isCancelled).length,
        upcoming: categorizedBookings.upcoming.length,
        past: categorizedBookings.past.length,
      }

      return Response.json(
        {
          success: true,
          data: {
            bookings,
            categorized: categorizedBookings,
            summary,
            pagination: {
              page,
              totalPages,
              totalDocs,
              hasNextPage,
              hasPrevPage,
              limit,
            },
            user: {
              id: user.id,
              email: user.email,
              //   name: user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
            },
          },
        },
        { status: 200 },
      )
    } catch (error) {
      console.error('Error fetching user bookings:', error)
      return Response.json(
        {
          success: false,
          error: 'An error occurred while fetching your bookings',
        },
        { status: 500 },
      )
    }
  },
}
