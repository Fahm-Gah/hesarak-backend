import type { Endpoint, PayloadRequest } from 'payload'
import {
  formatTime,
  calculateDuration,
  validateDate,
  convertPersianDateToGregorian,
} from '../utils/dateUtils'

interface SeatInfo {
  seatNumber: string
  position: {
    row: number
    col: number
  }
  isBooked: boolean
  isDisabled: boolean
  isBookedByCurrentUser: boolean
  isPaid?: boolean
  paymentDeadline?: string
  bookedBy?: {
    ticketNumber: string
    passengerName: string
  }
}

interface BusLayoutElement {
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
  isDisabled?: boolean
  isBookedByCurrentUser?: boolean
  isPaid?: boolean
  paymentDeadline?: string
  bookedBy?: {
    ticketNumber: string
    passengerName: string
  }
}

interface TripDetailsResponse {
  id: string
  name: string
  price: number
  departureTime: string
  arrivalTime: string | null
  duration: string | null
  searchDate: string
  originalDate: string
  from: {
    id: string
    name: string
    province: string
    address: string
  }
  to: {
    id: string
    name: string
    province: string
    address: string
  } | null
  bus: {
    id: string
    number: string
    images: Array<{
      id: string
      url: string
      filename: string
    }>
    type: {
      id: string
      name: string
      capacity: number
      amenities: Array<{ name: string }>
    }
  }
  busLayout: BusLayoutElement[]
  seatAvailability: {
    totalSeats: number
    availableSeats: number
    bookedSeats: number
    userBookedSeats: number
    seats: SeatInfo[]
  }
  stops: Array<{
    terminal: {
      id: string
      name: string
      province: string
      address: string
    }
    time: string
    isDestination?: boolean
  }>
  isDirectRoute: boolean
  userBookingInfo: {
    canBookMoreSeats: boolean
    remainingSeatsAllowed: number
    currentBookedSeats: string[]
    maxSeatsPerUser: number
    unpaidTickets: Array<{
      ticketNumber: string
      seats: string[]
      paymentDeadline: string
      totalPrice: number
      hoursUntilDeadline: number
    }>
    totalUnpaidAmount: number
  }
  bookingInfo: {
    maxSeatsPerBooking: number
    globalPaymentDeadline: string
    cancellationPolicy: string
    bookingRules: string[]
  }
}

export const getTripDetails: Endpoint = {
  path: '/trips/:tripId/date/:date',
  method: 'get',
  handler: async (req: PayloadRequest) => {
    const { payload, routeParams, user } = req
    const { tripId, date: rawDate } = routeParams as { tripId?: string; date?: string }

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

      const bookedTicketsResult = await payload.find({
        collection: 'tickets',
        where: {
          and: [
            { trip: { equals: tripId } },
            { date: { equals: convertedDate } },
            { isCancelled: { not_equals: true } },
          ],
        },
        depth: 2,
      })

      const bookedSeatsMap = new Map<
        string,
        {
          ticketNumber: string
          passengerName: string
          userId?: string
          isPaid: boolean
          paymentDeadline?: string
        }
      >()

      const currentUserBookedSeats: string[] = []
      const currentUserTickets: Array<{
        ticketNumber: string
        seats: string[]
        isPaid: boolean
        paymentDeadline?: string
        totalPrice: number
      }> = []
      let userBookedSeatCount = 0

      bookedTicketsResult.docs.forEach((ticket: any) => {
        const isCurrentUserTicket = user?.id && ticket.bookedBy?.id === user.id
        const ticketSeats: string[] = []

        ticket.bookedSeats?.forEach((seatInfo: any) => {
          bookedSeatsMap.set(seatInfo.seat, {
            ticketNumber: ticket.ticketNumber,
            passengerName: ticket.passenger?.fullName || 'Unknown Passenger',
            userId: ticket.bookedBy?.id,
            isPaid: ticket.isPaid,
            paymentDeadline: ticket.paymentDeadline,
          })

          if (isCurrentUserTicket) {
            currentUserBookedSeats.push(seatInfo.seat)
            ticketSeats.push(seatInfo.seat)
            userBookedSeatCount++
          }
        })

        if (isCurrentUserTicket) {
          currentUserTickets.push({
            ticketNumber: ticket.ticketNumber,
            seats: ticketSeats,
            isPaid: ticket.isPaid,
            paymentDeadline: ticket.paymentDeadline,
            totalPrice: ticket.totalPrice,
          })
        }
      })

      const busType = trip.bus?.type
      const busLayout: BusLayoutElement[] = []
      const seatInfo: SeatInfo[] = []
      let totalSeats = 0
      let availableSeats = 0

      if (busType?.seats) {
        busType.seats.forEach((element: any) => {
          const layoutElement: BusLayoutElement = {
            type: element.type,
            position: element.position,
          }

          if (element.type !== 'seat' && element.size) {
            layoutElement.size = element.size
          }

          if (element.type === 'seat') {
            const seatNumber = element.seatNumber
            const bookedInfo = bookedSeatsMap.get(seatNumber)
            const isBooked = !!bookedInfo
            const isDisabled = element.disabled || false
            const isBookedByCurrentUser = user?.id ? bookedInfo?.userId === user.id : false

            layoutElement.seatNumber = seatNumber
            layoutElement.isBooked = isBooked
            layoutElement.isDisabled = isDisabled
            layoutElement.isBookedByCurrentUser = isBookedByCurrentUser
            layoutElement.isPaid = bookedInfo?.isPaid
            layoutElement.paymentDeadline = bookedInfo?.paymentDeadline

            if (isBooked) {
              layoutElement.bookedBy = {
                ticketNumber: bookedInfo.ticketNumber,
                passengerName: bookedInfo.passengerName,
              }
            }

            const seat: SeatInfo = {
              seatNumber,
              position: element.position,
              isBooked,
              isDisabled,
              isBookedByCurrentUser,
              isPaid: bookedInfo?.isPaid,
              paymentDeadline: bookedInfo?.paymentDeadline,
            }

            if (isBooked) {
              seat.bookedBy = {
                ticketNumber: bookedInfo.ticketNumber,
                passengerName: bookedInfo.passengerName,
              }
            }

            seatInfo.push(seat)

            if (!isDisabled) {
              totalSeats++
              if (!isBooked) {
                availableSeats++
              }
            }
          }

          busLayout.push(layoutElement)
        })
      }

      let arrivalTime: string | null = null
      let duration: string | null = null
      let destinationTerminal = null
      const isDirectRoute = !!trip.to

      if (trip.stops?.length > 0) {
        const lastStop = trip.stops[trip.stops.length - 1]
        arrivalTime = formatTime(lastStop.time)
        destinationTerminal = isDirectRoute ? trip.to : lastStop.terminal

        if (arrivalTime) {
          duration = calculateDuration(formatTime(trip.timeOfDay), arrivalTime)
        }
      } else if (isDirectRoute) {
        destinationTerminal = trip.to
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
          isDestination: isDirectRoute ? false : index === trip.stops.length - 1,
        })) || []

      if (isDirectRoute && destinationTerminal) {
        processedStops.push({
          terminal: {
            id: destinationTerminal.id,
            name: destinationTerminal.name,
            province: destinationTerminal.province,
            address: destinationTerminal.address || '',
          },
          time: arrivalTime || 'TBD',
          isDestination: true,
        })
      }

      const maxSeatsPerUser = 2
      const remainingSeatsAllowed = Math.max(0, maxSeatsPerUser - userBookedSeatCount)
      const canBookMoreSeats = remainingSeatsAllowed > 0 && availableSeats > 0

      // Process user's unpaid tickets and calculate payment info
      const now = new Date()
      const unpaidTickets = currentUserTickets
        .filter((ticket) => !ticket.isPaid && ticket.paymentDeadline)
        .map((ticket) => {
          const deadline = new Date(ticket.paymentDeadline!)
          const hoursUntilDeadline = Math.max(
            0,
            Math.floor((deadline.getTime() - now.getTime()) / (1000 * 60 * 60)),
          )
          return {
            ticketNumber: ticket.ticketNumber,
            seats: ticket.seats,
            paymentDeadline: deadline.toLocaleString('en-US', {
              month: '2-digit',
              day: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            }),
            totalPrice: ticket.totalPrice,
            hoursUntilDeadline,
          }
        })

      const totalUnpaidAmount = unpaidTickets.reduce((sum, ticket) => sum + ticket.totalPrice, 0)

      // Calculate global payment deadline (2 hours before departure)
      const departureDateTime = new Date(`${convertedDate}T${formatTime(trip.timeOfDay)}`)
      const globalPaymentDeadline = new Date(departureDateTime.getTime() - 2 * 60 * 60 * 1000)
      const hoursUntilGlobalDeadline = Math.max(
        0,
        Math.floor((globalPaymentDeadline.getTime() - now.getTime()) / (1000 * 60 * 60)),
      )

      const response: TripDetailsResponse = {
        id: trip.id,
        name: trip.name,
        price: trip.price,
        departureTime: formatTime(trip.timeOfDay),
        arrivalTime,
        duration,
        searchDate: convertedDate,
        originalDate: decodedDate,
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
          images:
            trip.bus.images?.map((img: any) => ({
              id: img.id,
              url: img.url,
              filename: img.filename,
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
          availableSeats,
          bookedSeats: totalSeats - availableSeats,
          userBookedSeats: userBookedSeatCount,
          seats: seatInfo,
        },
        stops: processedStops,
        isDirectRoute,
        userBookingInfo: {
          canBookMoreSeats,
          remainingSeatsAllowed,
          currentBookedSeats: currentUserBookedSeats,
          maxSeatsPerUser,
          unpaidTickets,
          totalUnpaidAmount,
        },
        bookingInfo: {
          maxSeatsPerBooking: Math.min(4, remainingSeatsAllowed),
          globalPaymentDeadline: `All tickets must be paid ${hoursUntilGlobalDeadline} hours before departure`,
          cancellationPolicy: 'Free cancellation up to 24 hours before departure',
          bookingRules: [
            'Maximum 2 seats per user per trip',
            'Payment required before individual ticket deadline',
            'All tickets must be paid 2 hours before departure',
            'Unpaid tickets will be automatically cancelled after deadline',
          ],
        },
      }

      return Response.json({
        success: true,
        data: response,
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
