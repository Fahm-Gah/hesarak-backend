import type { Endpoint, PayloadRequest } from 'payload'
import { convertGregorianToPersianDisplay } from '../utils/dateUtils'

export const getTicketDetails: Endpoint = {
  path: '/ticket-details/:ticketId',
  method: 'get',
  handler: async (req: PayloadRequest) => {
    const { payload, user, routeParams } = req
    const { ticketId } = routeParams || {}

    if (!user) {
      return Response.json(
        {
          success: false,
          error: 'Authentication required',
        },
        { status: 401 },
      )
    }

    if (!ticketId || typeof ticketId !== 'string') {
      return Response.json(
        {
          success: false,
          error: 'Ticket ID is required',
        },
        { status: 400 },
      )
    }

    try {
      // Fetch the ticket with related data
      const ticket = (await payload.findByID({
        collection: 'tickets',
        id: ticketId as string,
        depth: 3, // Include passenger profile, trip details, etc.
      })) as any

      if (!ticket) {
        return Response.json(
          {
            success: false,
            error: 'Ticket not found',
          },
          { status: 404 },
        )
      }

      // Check if user owns this ticket or is admin
      const canAccess =
        ticket.bookedBy?.id === user.id ||
        ticket.bookedBy === user.id ||
        (Array.isArray(user.roles) &&
          user.roles.some((role: string) => ['admin', 'superadmin', 'dev'].includes(role)))

      if (!canAccess) {
        return Response.json(
          {
            success: false,
            error: 'Access denied. You can only view your own tickets.',
          },
          { status: 403 },
        )
      }

      // Determine user-specific terminals
      let userFrom = ticket.trip?.from
      let userTo = null

      // Use ticket's specific from terminal if available
      if (ticket.from && typeof ticket.from === 'object') {
        userFrom = ticket.from
      }

      // Use ticket's specific to terminal if available
      if (ticket.to && typeof ticket.to === 'object') {
        userTo = ticket.to
      } else if (ticket.trip?.stops && ticket.trip.stops.length > 0) {
        // Fallback: use last stop as destination
        const lastStop = ticket.trip.stops[ticket.trip.stops.length - 1]
        userTo = lastStop.terminal
      }

      // Format the response similar to booking endpoint
      const response = {
        ticketId: ticket.id,
        ticketNumber: ticket.ticketNumber,
        passenger: {
          id: ticket.passenger?.id || '',
          fullName: ticket.passenger?.fullName || '',
          fatherName: ticket.passenger?.fatherName || '',
          phoneNumber: ticket.passenger?.phoneNumber || '',
          gender: ticket.passenger?.gender || 'male',
        },
        trip: {
          id: ticket.trip?.id || '',
          tripName: ticket.trip?.tripName || '',
          price: ticket.trip?.price || 0,
          from: userFrom
            ? {
                id: userFrom.id,
                name: userFrom.name,
                province: userFrom.province,
                address: userFrom.address || '',
              }
            : null,
          to: userTo
            ? {
                id: userTo.id,
                name: userTo.name,
                province: userTo.province,
                address: userTo.address || '',
              }
            : null,
          bus: ticket.trip?.bus
            ? {
                id: ticket.trip.bus.id,
                number: ticket.trip.bus.number || ticket.trip.bus.busNumber || '',
                images: ticket.trip.bus.images || [],
                type: ticket.trip.bus.type
                  ? {
                      id: ticket.trip.bus.type.id,
                      name: ticket.trip.bus.type.name || '',
                      capacity:
                        ticket.trip.bus.type.capacity || ticket.trip.bus.type.seatCount || 0,
                      amenities: ticket.trip.bus.type.amenities || [],
                    }
                  : undefined,
              }
            : undefined,
        },
        booking: {
          date: ticket.date,
          originalDate: convertGregorianToPersianDisplay(ticket.date), // Convert to Persian format
          seats: Array.isArray(ticket.bookedSeats)
            ? ticket.bookedSeats.map((seatData: any) => {
                // Handle different seat data formats
                if (typeof seatData === 'string') {
                  return { id: seatData, seatNumber: 'Unknown' }
                }
                if (seatData?.seat) {
                  // Get seat details from trip bus layout
                  const busLayout = ticket.trip?.bus?.type?.seats || []
                  const seatInfo = busLayout.find((s: any) => s.id === seatData.seat)
                  return {
                    id: seatData.seat,
                    seatNumber: seatInfo?.seatNumber || 'Unknown',
                  }
                }
                return {
                  id: seatData?.id || seatData?.seatId || 'unknown',
                  seatNumber: seatData?.seatNumber || 'Unknown',
                }
              })
            : [],
          totalPrice: ticket.totalPrice || 0,
          pricePerSeat: ticket.pricePerTicket || ticket.trip?.price || 0,
        },
        status: {
          isPaid: ticket.isPaid || false,
          isCancelled: ticket.isCancelled || false,
          isExpired: ticket.isExpired || false,
          paymentMethod: ticket.paymentMethod || 'cash',
          paymentDeadline: ticket.paymentDeadline || '',
        },
      }

      return Response.json({
        success: true,
        data: response,
      })
    } catch (error: unknown) {
      console.error('Error fetching ticket details:', error)
      return Response.json(
        {
          success: false,
          error: 'Failed to fetch ticket details',
        },
        { status: 500 },
      )
    }
  },
}
