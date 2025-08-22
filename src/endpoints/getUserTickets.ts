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
    isExpired?: boolean
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
      const page = searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1
      const sort = searchParams.get('sort') || '-date'

      // Parse filter parameters
      const searchTerm = searchParams.get('search') || ''
      const status = searchParams.get('status') || ''
      const fromDate = searchParams.get('fromDate') || ''
      const toDate = searchParams.get('toDate') || ''
      const fromLocation = searchParams.get('fromLocation') || ''
      const toLocation = searchParams.get('toLocation') || ''

      const profileId = typeof user.profile === 'string' ? user.profile : user.profile.id

      // Build base where clause
      const whereClause: any = {
        passenger: { equals: profileId },
      }

      // Note: Status filtering is now handled client-side after fetching
      // to properly support the 'expired' virtual field

      // Add date range filters
      if (fromDate) {
        whereClause.date = { greater_than_equal: fromDate }
      }
      if (toDate) {
        if (whereClause.date) {
          whereClause.date.less_than_equal = toDate
        } else {
          whereClause.date = { less_than_equal: toDate }
        }
      }

      // Add search filter (for ticket number)
      if (searchTerm) {
        whereClause.ticketNumber = { contains: searchTerm }
      }

      // Build query options
      const limit = 10 // Fixed limit of 10 tickets per page
      const queryOptions: any = {
        collection: 'tickets',
        where: whereClause,
        depth: 3, // Need deeper nesting to get bus.type.seats configuration
        sort,
        page,
        limit,
      }

      // Find all tickets where this user is the passenger
      let tickets = await payload.find(queryOptions)

      // Apply client-side filters that can't be done in the database query
      let filteredDocs = tickets.docs

      // Filter by status (including expired status which is a virtual field)
      if (status) {
        const statuses = status.split(',')
        const originalCount = filteredDocs.length

        // Apply client-side status filtering for all status combinations
        // This is needed because 'expired' is a virtual field that can't be queried in the database
        filteredDocs = filteredDocs.filter((ticket: any) =>
          statuses.some((statusFilter) => {
            if (statusFilter === 'expired') {
              return ticket.isExpired === true
            } else if (statusFilter === 'paid') {
              return ticket.isPaid === true && !ticket.isExpired
            } else if (statusFilter === 'pending') {
              return !ticket.isPaid && !ticket.isCancelled && !ticket.isExpired
            } else if (statusFilter === 'cancelled') {
              return ticket.isCancelled === true && !ticket.isExpired // Manually cancelled, not expired
            }
            return false
          }),
        )
      }

      // Filter by from/to location (needs to be done after fetching due to nested relationships)
      if (fromLocation || toLocation) {
        filteredDocs = filteredDocs.filter((ticket: any) => {
          const trip = ticket.trip
          let matches = true

          if (fromLocation) {
            const userFrom = ticket.from || trip?.from
            matches = matches && userFrom?.name?.toLowerCase().includes(fromLocation.toLowerCase())
          }

          if (toLocation) {
            const userTo = ticket.to || (trip?.stops && trip.stops[trip.stops.length - 1]?.terminal)
            matches = matches && userTo?.name?.toLowerCase().includes(toLocation.toLowerCase())
          }

          return matches
        })
      }

      // Apply search term to other fields (bus number, route names)
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase()
        filteredDocs = filteredDocs.filter((ticket: any) => {
          const trip = ticket.trip
          const bus = trip?.bus
          const userFrom = ticket.from || trip?.from
          const userTo = ticket.to || (trip?.stops && trip.stops[trip.stops.length - 1]?.terminal)

          return (
            ticket.ticketNumber?.toLowerCase().includes(searchLower) ||
            userFrom?.name?.toLowerCase().includes(searchLower) ||
            userTo?.name?.toLowerCase().includes(searchLower) ||
            bus?.number?.toLowerCase().includes(searchLower)
          )
        })
      }

      // For now, when client-side filtering is applied, we need to recalculate pagination
      // This is not ideal but fixes the immediate display issue
      const hasClientFilters = fromLocation || toLocation || searchTerm || status

      if (hasClientFilters) {
        // When filters are applied, use filtered count for both display and pagination
        tickets = {
          ...tickets,
          docs: filteredDocs,
          totalDocs: filteredDocs.length,
          totalPages: Math.ceil(filteredDocs.length / limit),
          hasNextPage: false, // Since we're showing all filtered results
          hasPrevPage: false,
          page: 1,
        }
      } else {
        // No client-side filters, use original pagination
        tickets = {
          ...tickets,
          docs: filteredDocs,
          totalDocs: tickets.totalDocs, // Keep original total
        }
      }

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

            // Get seat number from bus type configuration
            let seatNumber = busTypeSeat?.seatNumber

            // If seatNumber is not available, try alternative field names
            if (!seatNumber) {
              seatNumber = busTypeSeat?.number || busTypeSeat?.label
            }

            // If still not found, create a readable seat number from ID
            if (!seatNumber) {
              // Try various approaches to extract seat number from ID

              // 1. Look for trailing numbers (e.g., "seat_001" -> "1")
              let match = seatId.match(/(\d+)$/)
              if (match) {
                seatNumber = parseInt(match[1], 10).toString() // Remove leading zeros
              } else {
                // 2. Look for any numbers in the ID (e.g., "s1r2c3" -> "1")
                match = seatId.match(/(\d+)/)
                if (match) {
                  seatNumber = match[1]
                } else {
                  // 3. Try to find position-based patterns
                  const positionMatch = seatId.match(/r(\d+)c(\d+)/)
                  if (positionMatch) {
                    const row = parseInt(positionMatch[1], 10)
                    const col = parseInt(positionMatch[2], 10)
                    // Convert row/col to seat number (assuming 2-4 seats per row)
                    seatNumber = ((row - 1) * 4 + col).toString()
                  } else {
                    // 4. Last resort: use the ID as-is but clean it up
                    seatNumber = seatId.replace(/[^0-9a-zA-Z]/g, '') || seatId
                  }
                }
              }
            }

            return {
              id: seatId,
              seatNumber,
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
        if (ticket.isExpired) status.isExpired = true
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
                amenities: null, // Remove amenities to lighten response
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
        total: tickets.totalDocs, // Use the correct total count
      }

      // Add pagination info
      responseData.page = tickets.page || 1
      responseData.totalPages = tickets.totalPages || 1
      responseData.hasMore = tickets.hasNextPage || false

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
