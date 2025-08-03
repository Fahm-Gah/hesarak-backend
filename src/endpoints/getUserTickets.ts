import type { Endpoint } from 'payload'

interface UserTicket {
  ticketId: string
  ticketNumber: string
  trip: {
    id: string
    name: string
    from: {
      name: string
      province: string
    }
    to: {
      name: string
      province: string
    }
    timeOfDay: string
    bus: {
      number: string
      type: {
        name: string
        amenities?: Array<{ name: string }>
      }
    }
  }
  booking: {
    date: string
    seats: Array<{
      id: string
      seatNumber: string
    }>
    totalPrice: number
    pricePerSeat: number
  }
  status: {
    isPaid: boolean
    isCancelled: boolean
    paymentDeadline?: string
  }
  bookedAt: string
}

interface GetUserTicketsResponse {
  success: true
  data: {
    tickets: UserTicket[]
    total: number
    page?: number
    limit?: number
    hasMore?: boolean
  }
}

export const getUserTickets: Endpoint = {
  path: '/user/tickets',
  method: 'get',
  handler: async (req) => {
    const { payload, user } = req

    // Authentication required
    if (!user) {
      return Response.json({ error: 'Authentication required' }, { status: 401 })
    }

    try {
      // Get authenticated user with profile
      const authUser = await payload.findByID({
        collection: 'users',
        id: user.id,
        depth: 1,
      })

      if (!authUser?.isActive) {
        return Response.json({ error: 'User account is inactive' }, { status: 401 })
      }

      if (!authUser.profile || typeof authUser.profile === 'string') {
        return Response.json({ error: 'Profile required' }, { status: 400 })
      }

      // Parse optional query parameters
      const searchParams = new URLSearchParams(req.url?.split('?')[1] || '')
      const page = searchParams.get('page') ? parseInt(searchParams.get('page')!) : undefined
      const limit = searchParams.get('limit')
        ? Math.min(parseInt(searchParams.get('limit')!), 100)
        : undefined
      const depth = searchParams.get('depth') ? parseInt(searchParams.get('depth')!) : 4
      const sort = searchParams.get('sort') || '-date'

      // Build query options
      const queryOptions: any = {
        collection: 'tickets',
        where: {
          passenger: { equals: authUser.profile.id },
        },
        depth: Math.min(depth, 5), // Max depth of 5 for safety
        sort,
      }

      // Add pagination only if requested
      if (page !== undefined) {
        queryOptions.page = page
      }
      if (limit !== undefined) {
        queryOptions.limit = limit
      }

      // Find all tickets where this user is the passenger
      const tickets = await payload.find(queryOptions)

      // Transform tickets to response format
      const transformedTickets: UserTicket[] = tickets.docs.map((ticket: any) => {
        const trip = ticket.trip
        const bus = trip?.bus
        const busType = bus?.type

        // Map seat IDs to seat numbers
        const seats =
          ticket.bookedSeats?.map((bookedSeat: any) => {
            const seatId = bookedSeat.seat

            // Find the seat in the bus type configuration
            const busTypeSeat = busType?.seats?.find(
              (seat: any) => seat.id === seatId && seat.type === 'seat',
            )

            return {
              id: seatId,
              seatNumber: busTypeSeat?.seatNumber || seatId,
            }
          }) || []

        // Calculate price per seat
        const pricePerSeat = ticket.pricePerTicket || trip?.price || 0

        return {
          ticketId: ticket.id,
          ticketNumber: ticket.ticketNumber,
          trip: {
            id: trip?.id || '',
            name: trip?.name || '',
            from: {
              name: trip?.from?.name || '',
              province: trip?.from?.province || '',
            },
            to: {
              name: trip?.to?.name || '',
              province: trip?.to?.province || '',
            },
            timeOfDay: trip?.timeOfDay || '',
            bus: {
              number: bus?.number || '',
              type: {
                name: busType?.name || '',
                amenities: busType?.amenities || undefined,
              },
            },
          },
          booking: {
            date: ticket.date,
            seats,
            totalPrice: ticket.totalPrice || 0,
            pricePerSeat,
          },
          status: {
            isPaid: ticket.isPaid || false,
            isCancelled: ticket.isCancelled || false,
            paymentDeadline: ticket.paymentDeadline || undefined,
          },
          bookedAt: ticket.createdAt || ticket.updatedAt || new Date().toISOString(),
        }
      })

      // Build response with conditional pagination info
      const responseData: GetUserTicketsResponse['data'] = {
        tickets: transformedTickets,
        total: tickets.totalDocs || transformedTickets.length,
      }

      // Add pagination info only if pagination was used
      if (page !== undefined || limit !== undefined) {
        responseData.page = tickets.page || 1
        responseData.limit = tickets.limit || transformedTickets.length
        responseData.hasMore = tickets.hasNextPage || false
      }

      const response: GetUserTicketsResponse = {
        success: true,
        data: responseData,
      }

      return Response.json(response, { status: 200 })
    } catch (error: unknown) {
      console.error('Get user tickets error:', error)
      return Response.json(
        {
          error: 'Failed to fetch tickets. Please try again.',
        },
        { status: 500 },
      )
    }
  },
}
