import type { Endpoint } from 'payload'
import { formatTime, calculateDuration } from '../utils/dateUtils'

interface UserTicket {
  id: string
  ticketNumber: string
  trip: {
    id: string
    name: string
    from: {
      name: string
      province: string
      address: string
    }
    to: {
      name: string
      province: string
      address: string
    } | null
    departureTime: string
    arrivalTime: string | null
    duration: string | null
    bus: {
      number: string
      type: {
        name: string
        amenities?: string[] | null
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
    isPaid?: boolean
    isCancelled?: boolean
    paymentDeadline?: string
  }
  bookedAt: string
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
      // Use profile directly from user object (consistent with other endpoints)
      if (!user?.profile) {
        return Response.json({ error: 'Profile required' }, { status: 400 })
      }

      // Parse optional query parameters
      const searchParams = new URLSearchParams(req.url?.split('?')[1] || '')
      const page = searchParams.get('page') ? parseInt(searchParams.get('page')!) : undefined
      const limit = searchParams.get('limit')
        ? Math.min(parseInt(searchParams.get('limit')!), 100)
        : undefined
      const sort = searchParams.get('sort') || '-date'

      const profileId = typeof user.profile === 'string' ? user.profile : user.profile.id

      // Build query options
      const queryOptions: any = {
        collection: 'tickets',
        where: {
          passenger: { equals: profileId },
        },
        depth: 3, // Consistent depth
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

        // Debug logging
        if (process.env.NODE_ENV === 'development') {
          console.log('getUserTickets - Processing ticket:', {
            ticketId: ticket.id,
            ticketNumber: ticket.ticketNumber,
            hasTicketFrom: !!ticket.from,
            hasTicketTo: !!ticket.to,
            ticketFromId: ticket.from?.id,
            ticketToId: ticket.to?.id,
            tripFromId: trip?.from?.id,
            fromTerminalName: ticket.fromTerminalName,
            toTerminalName: ticket.toTerminalName,
          })
        }

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

        // Use ticket's specific from/to terminals if available, otherwise fall back to trip defaults
        let userBoardingTerminal = trip?.from
        let userBoardingTime = formatTime(trip?.departureTime) || ''
        let destinationTerminal = null
        let arrivalTime: string | null = null
        let duration: string | null = null

        // If ticket has specific from terminal, use it
        if (ticket.from && typeof ticket.from === 'object') {
          userBoardingTerminal = ticket.from
          // Find the boarding time for this specific terminal
          if (ticket.from.id === trip?.from?.id) {
            userBoardingTime = formatTime(trip.departureTime) || ''
          } else if (trip?.stops) {
            const boardingStop = trip.stops.find((stop: any) => stop.terminal.id === ticket.from.id)
            if (boardingStop) {
              userBoardingTime = formatTime(boardingStop.time) || ''
            }
          }
        }

        // If ticket has specific to terminal, use it
        if (ticket.to && typeof ticket.to === 'object') {
          destinationTerminal = ticket.to
          // Find the arrival time for this specific terminal
          if (trip?.stops) {
            const destinationStop = trip.stops.find(
              (stop: any) => stop.terminal.id === ticket.to.id,
            )
            if (destinationStop) {
              arrivalTime = formatTime(destinationStop.time)
            }
          }
        } else if (trip?.stops && trip.stops.length > 0) {
          // Fallback: use last stop as destination
          const lastStop = trip.stops[trip.stops.length - 1]
          destinationTerminal = lastStop.terminal
          arrivalTime = formatTime(lastStop.time)
        }

        // Calculate duration if both times are available
        if (
          userBoardingTime &&
          arrivalTime &&
          userBoardingTime !== 'Invalid Date' &&
          arrivalTime !== 'Invalid Date'
        ) {
          duration = calculateDuration(userBoardingTime, arrivalTime)
        }

        // Calculate price per seat
        const pricePerSeat = ticket.pricePerTicket || trip?.price || 0

        // Build status object with only meaningful fields
        const status: UserTicket['status'] = {}
        if (ticket.isPaid) status.isPaid = true
        if (ticket.isCancelled) status.isCancelled = true
        if (ticket.paymentDeadline) status.paymentDeadline = ticket.paymentDeadline

        return {
          id: ticket.id,
          ticketNumber: ticket.ticketNumber,
          trip: {
            id: trip?.id || '',
            name: trip?.name || '',
            from: {
              name: userBoardingTerminal?.name || '',
              province: userBoardingTerminal?.province || '',
              address: userBoardingTerminal?.address || '',
            },
            to: destinationTerminal
              ? {
                  name: destinationTerminal.name,
                  province: destinationTerminal.province,
                  address: destinationTerminal.address || '',
                }
              : null,
            departureTime: userBoardingTime,
            arrivalTime,
            duration,
            bus: {
              number: bus?.number || '',
              type: {
                name: busType?.name || '',
                amenities: busType?.amenities?.length > 0 ? busType.amenities : null,
              },
            },
          },
          booking: {
            date: ticket.date,
            seats,
            totalPrice: ticket.totalPrice || 0,
            pricePerSeat,
          },
          status,
          bookedAt: ticket.createdAt || ticket.updatedAt || new Date().toISOString(),
        }
      })

      // Build response with conditional pagination info
      const responseData: any = {
        tickets: transformedTickets,
        total: tickets.totalDocs || transformedTickets.length,
      }

      // Add pagination info only if pagination was used
      if (page !== undefined || limit !== undefined) {
        responseData.page = tickets.page || 1
        responseData.limit = tickets.limit || transformedTickets.length
        responseData.hasMore = tickets.hasNextPage || false
      }

      return Response.json({
        success: true,
        data: responseData,
      })
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
