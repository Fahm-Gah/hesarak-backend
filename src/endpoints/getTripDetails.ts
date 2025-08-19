import type { Endpoint, PayloadRequest } from 'payload'
import {
  formatTime,
  calculateDuration,
  validateDate,
  convertPersianDateToGregorian,
} from '../utils/dateUtils'

interface BusLayoutElement {
  id: string
  type: 'seat' | 'wc' | 'driver' | 'door'
  seatNumber?: string
  position: {
    row: number
    col: number
  }
  size?: {
    rowSpan: number
    colSpan: number
  }
  isBooked?: boolean
  isBookedByCurrentUser?: boolean
  isPaid?: boolean
}

export const getTripDetails: Endpoint = {
  path: '/trips/:tripId/date/:date',
  method: 'get',
  handler: async (req: PayloadRequest) => {
    const { payload, routeParams, user, searchParams } = req
    const { tripId, date: rawDate } = routeParams as { tripId?: string; date?: string }

    // Extract optional from/to terminal IDs from query parameters
    const fromTerminalId = searchParams?.get('from') || undefined
    const toTerminalId = searchParams?.get('to') || undefined

    // Debug logging
    if (process.env.NODE_ENV === 'development') {
      console.log('getTripDetails - Parameters received:', {
        tripId,
        rawDate,
        fromTerminalId,
        toTerminalId,
      })
    }

    if (!tripId || !rawDate) {
      return Response.json(
        {
          success: false,
          error: 'Trip ID and date are required',
        },
        { status: 400 },
      )
    }

    const decodedDate = decodeURIComponent(rawDate.trim())
    const convertedDate = convertPersianDateToGregorian(decodedDate)

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
      const trip = (await payload.findByID({
        collection: 'trip-schedules',
        id: tripId,
        depth: 3,
      })) as any

      if (!trip?.isActive) {
        return Response.json(
          {
            success: false,
            error: 'Trip not found or no longer available',
          },
          { status: 404 },
        )
      }

      // Get booked tickets for this trip and date with proper date range
      const dateObj = new Date(convertedDate)
      const startOfDay = new Date(dateObj)
      startOfDay.setHours(0, 0, 0, 0)

      const endOfDay = new Date(dateObj)
      endOfDay.setHours(23, 59, 59, 999)

      const bookedTicketsResult = await payload.find({
        collection: 'tickets',
        where: {
          and: [
            { trip: { equals: tripId } },
            {
              date: {
                greater_than_equal: startOfDay.toISOString(),
                less_than_equal: endOfDay.toISOString(),
              },
            },
            { isCancelled: { not_equals: true } },
          ],
        },
        depth: 2,
      })

      // Process bus layout first to get busType
      const busType = trip.bus?.type

      // Create a map of booked seats and track current user's bookings
      const bookedSeatsMap = new Map<
        string,
        {
          ticketNumber: string
          passengerName: string
          passengerProfile: any
          userId?: string
          isPaid: boolean
          paymentDeadline?: string
        }
      >()

      let userBookedSeatCount = 0

      bookedTicketsResult.docs.forEach((ticket: any) => {
        // Check if this ticket belongs to the current user's profile
        let isCurrentUserTicket = false
        if (user?.profile) {
          const profileId = typeof user.profile === 'string' ? user.profile : user.profile.id
          const ticketProfileId =
            typeof ticket.passenger === 'string' ? ticket.passenger : ticket.passenger?.id
          isCurrentUserTicket = profileId === ticketProfileId
        }

        if (Array.isArray(ticket.bookedSeats)) {
          ticket.bookedSeats.forEach((seatData: any) => {
            // Handle seat data format: {seat: "id"}
            const seatId = seatData.seat || seatData.id
            if (seatId) {
              bookedSeatsMap.set(seatId, {
                ticketNumber: ticket.ticketNumber,
                passengerName: ticket.passenger?.fullName || 'Unknown Passenger',
                passengerProfile: ticket.passenger,
                userId: ticket.bookedBy?.id,
                isPaid: ticket.isPaid,
                paymentDeadline: ticket.paymentDeadline,
              })

              // Track current user's bookings if authenticated
              if (isCurrentUserTicket) {
                userBookedSeatCount++
              }
            }
          })
        }
      })

      // Process bus layout (single source of truth) with disabled seats as booked
      const busLayout: BusLayoutElement[] = []
      let totalSeats = 0
      let actuallyAvailableSeats = 0
      let disabledSeatsCount = 0

      if (busType?.seats && Array.isArray(busType.seats)) {
        busType.seats.forEach((element: any) => {
          const layoutElement: BusLayoutElement = {
            id: element.id,
            type: element.type,
            position: element.position,
          }

          // Add size if it exists
          if (element.size) {
            layoutElement.size = element.size
          }

          if (element.type === 'seat') {
            const bookedInfo = bookedSeatsMap.get(element.id)
            const isActuallyBooked = !!bookedInfo
            const isDisabled = element.disabled

            // Check if booked by current user using profile comparison
            let isBookedByCurrentUser = false
            if (user?.profile && bookedInfo) {
              const profileId = typeof user.profile === 'string' ? user.profile : user.profile.id
              const ticketProfileId =
                typeof bookedInfo.passengerProfile === 'string'
                  ? bookedInfo.passengerProfile
                  : bookedInfo.passengerProfile?.id
              isBookedByCurrentUser = profileId === ticketProfileId
            }

            layoutElement.seatNumber = element.seatNumber

            // Only show fields when true/relevant for optimization
            if (isActuallyBooked || isDisabled) {
              layoutElement.isBooked = true
            }

            if (isBookedByCurrentUser) {
              layoutElement.isBookedByCurrentUser = true
              // Only show payment status for current user's bookings
              if (bookedInfo?.isPaid) {
                layoutElement.isPaid = true
              }
            }

            // Count seats (include all seats, disabled and enabled)
            totalSeats++
            if (isDisabled) {
              disabledSeatsCount++
            } else if (!isActuallyBooked) {
              actuallyAvailableSeats++
            }
          }

          busLayout.push(layoutElement)
        })
      }

      // Determine user's boarding and destination points based on provided terminal IDs
      let userBoardingTerminal = trip.from
      let userBoardingTime = formatTime(trip.departureTime)
      let destinationTerminal = null
      let arrivalTime: string | null = null
      let duration: string | null = null

      // If fromTerminalId is provided, find the matching terminal
      if (fromTerminalId) {
        if (trip.from.id === fromTerminalId) {
          // User boards at main departure terminal
          userBoardingTerminal = trip.from
          userBoardingTime = formatTime(trip.departureTime)
        } else if (trip.stops) {
          // Look for boarding point in stops
          const boardingStop = trip.stops.find((stop: any) => stop.terminal.id === fromTerminalId)
          if (boardingStop) {
            userBoardingTerminal = boardingStop.terminal
            userBoardingTime = formatTime(boardingStop.time)
          }
        }
      }

      // If toTerminalId is provided, find the matching terminal
      if (toTerminalId && trip.stops) {
        const destinationStop = trip.stops.find((stop: any) => stop.terminal.id === toTerminalId)
        if (destinationStop) {
          destinationTerminal = destinationStop.terminal
          arrivalTime = formatTime(destinationStop.time)
          duration = calculateDuration(userBoardingTime, arrivalTime)
        }
      }

      // Fallback: if no specific destination provided, use last stop
      if (!destinationTerminal && trip.stops && trip.stops.length > 0) {
        const lastStop = trip.stops[trip.stops.length - 1]
        destinationTerminal = lastStop.terminal
        arrivalTime = formatTime(lastStop.time)
        duration = calculateDuration(userBoardingTime, arrivalTime)
      }

      const processedStops =
        trip.stops?.map((stop: any, index: number) => ({
          terminal: {
            id: stop.terminal.id,
            name: stop.terminal.name,
            province: stop.terminal.province,
            address: stop.terminal.address || '',
          },
          time: formatTime(stop.time),
          isDestination: index === trip.stops.length - 1,
        })) || []

      // Calculate user booking info (only if authenticated)
      let userBookingInfo = null
      if (user?.id) {
        const maxSeatsPerUser = 2
        const remainingSeatsAllowed = Math.max(0, maxSeatsPerUser - userBookedSeatCount)
        const canBookMoreSeats = remainingSeatsAllowed > 0 && actuallyAvailableSeats > 0

        userBookingInfo = {
          canBookMoreSeats,
          remainingSeatsAllowed,
          totalBookedSeats: userBookedSeatCount,
          maxSeatsPerUser,
        }
      }

      // Calculate effective booking numbers for user display
      const actualBookingsCount = bookedSeatsMap.size
      const effectiveBookedSeats = actualBookingsCount + disabledSeatsCount

      // Debug logging for final terminals
      if (process.env.NODE_ENV === 'development') {
        console.log('getTripDetails - Returning terminals:', {
          userBoardingTerminal: {
            id: userBoardingTerminal.id,
            name: userBoardingTerminal.name,
            province: userBoardingTerminal.province,
          },
          destinationTerminal: destinationTerminal
            ? {
                id: destinationTerminal.id,
                name: destinationTerminal.name,
                province: destinationTerminal.province,
              }
            : null,
          originalTripFrom: {
            id: trip.from.id,
            name: trip.from.name,
            province: trip.from.province,
          },
        })
      }

      return Response.json({
        success: true,
        data: {
          id: trip.id,
          name: trip.name,
          price: trip.price,
          departureTime: userBoardingTime,
          arrivalTime,
          duration,
          searchDate: convertedDate,
          originalDate: decodedDate,
          // User-specific journey information (for booking summaries, etc.)
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
          // Additional user journey details for components that need them
          userJourney: {
            boardingTerminal: {
              id: userBoardingTerminal.id,
              name: userBoardingTerminal.name,
              province: userBoardingTerminal.province,
              address: userBoardingTerminal.address || '',
            },
            boardingTime: userBoardingTime,
            destinationTerminal: destinationTerminal
              ? {
                  id: destinationTerminal.id,
                  name: destinationTerminal.name,
                  province: destinationTerminal.province,
                  address: destinationTerminal.address || '',
                }
              : null,
            arrivalTime,
            duration,
          },
          // Original trip information (for components that need full route)
          originalTrip: {
            from: {
              id: trip.from.id,
              name: trip.from.name,
              province: trip.from.province,
              address: trip.from.address || '',
            },
            departureTime: formatTime(trip.departureTime),
            isUserBoardingAtMainTerminal: userBoardingTerminal.id === trip.from.id,
          },
          bus: {
            id: trip.bus.id,
            number: trip.bus.number,
            images:
              trip.bus.images?.map((img: any) => ({
                id: img.id,
                url: img.url,
                filename: img.filename,
                alt: img.alt || '',
                width: img.width || 800,
                height: img.height || 600,
              })) || [],
            type: {
              id: busType?.id || '',
              name: busType?.name || '',
              capacity: busType?.capacity || 0,
              amenities: busType?.amenities || [],
            },
          },
          busLayout,
          seatAvailability: {
            totalSeats,
            availableSeats: actuallyAvailableSeats,
            bookedSeats: effectiveBookedSeats, // Includes disabled seats
          },
          stops: processedStops,
          userBookingInfo,
        },
      })
    } catch (error) {
      console.error('Error fetching trip details:', error)
      return Response.json(
        {
          success: false,
          error: 'Internal server error',
        },
        { status: 500 },
      )
    }
  },
}
