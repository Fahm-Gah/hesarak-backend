import type { Endpoint } from 'payload'
import { convertPersianDateToGregorian } from '../utils/dateUtils'
import { validateBookingRequest, validateBookingConstraints } from '../validations/booking'

export const bookTicket: Endpoint = {
  path: '/book-ticket',
  method: 'post',
  handler: async (req) => {
    const { payload, user } = req

    if (!user) {
      return Response.json(
        {
          success: false,
          error: 'Authentication required',
        },
        { status: 401 },
      )
    }

    let requestBody: unknown
    try {
      requestBody = (await req.json?.()) || req.body
    } catch (e) {
      return Response.json(
        {
          success: false,
          error: 'Invalid JSON in request body',
        },
        { status: 400 },
      )
    }

    // Validate request using our validation schema
    const validation = validateBookingRequest(requestBody)
    if (!validation.isValid) {
      return Response.json(
        {
          success: false,
          error: 'Validation failed',
          details: validation.errors,
        },
        { status: 400 },
      )
    }

    const bookingData = validation.data!

    // Validate business constraints
    const constraintValidation = validateBookingConstraints(bookingData)
    if (!constraintValidation.isValid) {
      return Response.json(
        {
          success: false,
          error: 'Booking constraints violated',
          details: constraintValidation.errors,
        },
        { status: 400 },
      )
    }

    const {
      tripId,
      date,
      seatIds,
      paymentMethod = 'cash',
      fromTerminalId,
      toTerminalId,
    } = bookingData
    const normalizedDate = convertPersianDateToGregorian(date)
    const uniqueSeatIds = [...new Set(seatIds)]

    try {
      // Get user with profile
      const authUser = (await payload.findByID({
        collection: 'users',
        id: user.id,
        depth: 1,
      })) as any

      if (!authUser?.isActive) {
        return Response.json(
          {
            success: false,
            error: 'User account is inactive',
          },
          { status: 401 },
        )
      }

      if (!authUser.profile || typeof authUser.profile === 'string') {
        return Response.json(
          {
            success: false,
            error: 'Profile required. Please complete your profile before booking tickets.',
          },
          { status: 400 },
        )
      }

      // Get trip information
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

      // Validate seats exist in bus configuration
      const busType = trip.bus?.type
      if (!busType || !busType.seats) {
        return Response.json(
          {
            success: false,
            error: 'Bus configuration not found',
          },
          { status: 500 },
        )
      }

      const validSeats = busType.seats.filter(
        (seat: any) => seat.type === 'seat' && !seat.disabled && uniqueSeatIds.includes(seat.id),
      )

      if (validSeats.length !== uniqueSeatIds.length) {
        const invalidIds = uniqueSeatIds.filter(
          (id) => !validSeats.some((seat: any) => seat.id === id),
        )
        return Response.json(
          {
            success: false,
            error: `Invalid or disabled seat IDs: ${invalidIds.join(', ')}`,
          },
          { status: 400 },
        )
      }

      // Check for existing bookings with proper date range filtering
      const dateObj = new Date(normalizedDate)
      const startOfDay = new Date(dateObj)
      startOfDay.setHours(0, 0, 0, 0)

      const endOfDay = new Date(dateObj)
      endOfDay.setHours(23, 59, 59, 999)

      const existingTickets = await payload.find({
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
        limit: 1000, // Ensure we get all tickets
      })

      // Filter out expired tickets since they shouldn't block new bookings
      // Note: isExpired is added by the afterRead hook
      const activeTickets = existingTickets.docs.filter((ticket: any) => !ticket.isExpired)

      // Check for conflicts and user limits with improved logic
      const bookedSeatIds = new Set<string>()
      let userExistingSeats = 0
      const userTickets: any[] = []

      activeTickets.forEach((ticket: any) => {
        if (Array.isArray(ticket.bookedSeats)) {
          ticket.bookedSeats.forEach((seatData: any) => {
            // Handle different seat data formats
            let seatId: string | null = null

            if (typeof seatData === 'string') {
              seatId = seatData
            } else if (seatData && typeof seatData === 'object') {
              seatId = seatData.seat || seatData.id || seatData._id || seatData.seatId
              // Handle nested seat objects
              if (typeof seatId === 'object' && seatId !== null) {
                seatId = (seatId as any).id || (seatId as any)._id || null
              }
            }

            if (seatId) {
              bookedSeatIds.add(seatId)
            }
          })
        }

        // Count user's existing seats with better user ID comparison
        let isUserTicket = false

        if (typeof ticket.bookedBy === 'string') {
          isUserTicket = ticket.bookedBy === user.id
        } else if (ticket.bookedBy && typeof ticket.bookedBy === 'object') {
          isUserTicket = ticket.bookedBy.id === user.id
        }

        if (isUserTicket) {
          const seatCount = Array.isArray(ticket.bookedSeats) ? ticket.bookedSeats.length : 0
          userExistingSeats += seatCount
          userTickets.push(ticket)
        }
      })

      // Check for conflicts
      const conflictingIds = uniqueSeatIds.filter((id: string) => bookedSeatIds.has(id))
      if (conflictingIds.length > 0) {
        const conflictedSeats = validSeats
          .filter((seat: any) => conflictingIds.includes(seat.id))
          .map((seat: any) => seat.seatNumber)

        return Response.json(
          {
            success: false,
            error: `The following seats are already booked: ${conflictedSeats.join(', ')}`,
          },
          { status: 409 },
        )
      }

      // Check user booking limits - IMPROVED VALIDATION
      const maxSeatsPerUser = 2
      const totalSeatsAfterBooking = userExistingSeats + uniqueSeatIds.length

      if (totalSeatsAfterBooking > maxSeatsPerUser) {
        const remainingSeats = Math.max(0, maxSeatsPerUser - userExistingSeats)
        return Response.json(
          {
            success: false,
            error: `Booking limit exceeded. You already have ${userExistingSeats} seat(s) booked for this trip. You can only book ${remainingSeats} more seat(s). Maximum ${maxSeatsPerUser} seats per user per trip.`,
          },
          { status: 400 },
        )
      }

      // Additional safety check - prevent booking if user already has max seats
      if (userExistingSeats >= maxSeatsPerUser) {
        return Response.json(
          {
            success: false,
            error: `You have already reached the maximum limit of ${maxSeatsPerUser} seats for this trip.`,
          },
          { status: 400 },
        )
      }

      // CRITICAL: Re-check user limits right before creating the ticket (race condition protection)
      const finalCheck = await payload.find({
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
            { bookedBy: { equals: user.id } },
          ],
        },
        limit: 1000,
      })

      // Filter out expired tickets from final check as well
      const activeFinalTickets = finalCheck.docs.filter((ticket: any) => !ticket.isExpired)

      let finalUserSeatCount = 0
      activeFinalTickets.forEach((ticket: any) => {
        const seatCount = Array.isArray(ticket.bookedSeats) ? ticket.bookedSeats.length : 0
        finalUserSeatCount += seatCount
      })

      if (finalUserSeatCount + uniqueSeatIds.length > maxSeatsPerUser) {
        return Response.json(
          {
            success: false,
            error: `You have already booked ${finalUserSeatCount} seat(s) for this trip. You can only book a maximum of ${maxSeatsPerUser} seats per trip.`,
          },
          { status: 400 },
        )
      }

      // Calculate pricing
      const pricePerSeat = trip.price
      const totalPrice = pricePerSeat * uniqueSeatIds.length

      // Determine payment status based on payment method
      const isPaid = paymentMethod !== 'cash' // Only paid if not cash payment

      // Payment deadline will be automatically populated by the populatePaymentDeadline hook

      // Create ticket with simplified bookedSeats format
      const ticketData: any = {
        passenger: authUser.profile.id,
        trip: tripId,
        date: normalizedDate,
        bookedSeats: validSeats.map((seat: any) => ({
          seat: seat.id, // Store only the seat ID
        })),
        pricePerTicket: pricePerSeat,
        totalPrice,
        isPaid,
        isCancelled: false,
        bookedBy: user.id,
        paymentMethod,
        // Note: paymentDeadline will be auto-populated by the populatePaymentDeadline hook
      }

      // Add user-specified from/to terminals if provided
      if (fromTerminalId) {
        ticketData.from = fromTerminalId
      }
      if (toTerminalId) {
        ticketData.to = toTerminalId
      }

      // Debug logging
      if (process.env.NODE_ENV === 'development') {
        console.log('bookTicket - Creating ticket with terminals:', {
          tripId,
          fromTerminalId,
          toTerminalId,
          hasFromTerminal: !!fromTerminalId,
          hasToTerminal: !!toTerminalId,
        })
      }

      const ticket = (await payload.create({
        collection: 'tickets',
        data: ticketData,
      })) as any

      // Debug logging for created ticket
      if (process.env.NODE_ENV === 'development') {
        console.log('bookTicket - Ticket created with:', {
          ticketId: ticket.id,
          ticketNumber: ticket.ticketNumber,
          from: ticket.from,
          to: ticket.to,
          fromTerminalName: ticket.fromTerminalName,
          toTerminalName: ticket.toTerminalName,
        })
      }

      return Response.json(
        {
          success: true,
          message: 'Tickets booked successfully',
          data: {
            ticketId: ticket.id,
            ticketNumber: ticket.ticketNumber,
            passenger: {
              id: authUser.profile.id,
              fullName: authUser.profile.fullName,
              fatherName: authUser.profile.fatherName || '',
              phoneNumber: authUser.profile.phoneNumber || '',
              gender: authUser.profile.gender || 'male',
            },
            trip: {
              id: trip.id,
              tripName: trip.tripName,
              price: trip.price,
              from:
                ticket.from && typeof ticket.from === 'object'
                  ? {
                      id: ticket.from.id,
                      name: ticket.from.name,
                      province: ticket.from.province,
                      address: ticket.from.address || '',
                    }
                  : null,
              to:
                ticket.to && typeof ticket.to === 'object'
                  ? {
                      id: ticket.to.id,
                      name: ticket.to.name,
                      province: ticket.to.province,
                      address: ticket.to.address || '',
                    }
                  : null,
            },
            booking: {
              date: normalizedDate,
              originalDate: date,
              seats: validSeats.map((seat: any) => ({
                id: seat.id,
                seatNumber: seat.seatNumber,
              })),
              totalPrice,
              pricePerSeat,
            },
            status: {
              isPaid: ticket.isPaid,
              isExpired: ticket.isExpired || false,
              paymentMethod: ticket.paymentMethod || paymentMethod,
              paymentDeadline: ticket.paymentDeadline || null,
            },
          },
        },
        { status: 201 },
      )
    } catch (error: unknown) {
      console.error('Booking error:', error)
      return Response.json(
        {
          success: false,
          error: 'Booking failed due to an internal error. Please try again.',
        },
        { status: 500 },
      )
    }
  },
}
