import type { Endpoint } from 'payload'
import { convertPersianDateToGregorian, validateDate } from '@/utils/dateUtils'

interface BookingRequest {
  tripId: string
  date: string
  seatIds: string[]
}

interface BookingResponse {
  success: true
  message: string
  data: {
    ticketId: string
    ticketNumber: string
    passenger: {
      id: string
      fullName: string
      fatherName: string
      phoneNumber: string
      gender: string
    }
    trip: {
      id: string
      name: string
      price: number
    }
    booking: {
      date: string
      originalDate: string
      seats: Array<{
        id: string
        seatNumber: string
      }>
      totalPrice: number
      pricePerSeat: number
    }
    status: {
      isPaid: boolean
      paymentDeadline: string
    }
  }
}

export const bookTicket: Endpoint = {
  path: '/book-ticket',
  method: 'post',
  handler: async (req) => {
    const { payload, user } = req

    // Authentication required
    if (!user) {
      return Response.json({ error: 'Authentication required' }, { status: 401 })
    }

    // Parse and validate request
    let body: BookingRequest
    try {
      body = (await req.json?.()) || req.body
    } catch (e) {
      return Response.json({ error: 'Invalid request body' }, { status: 400 })
    }

    const { tripId, date, seatIds } = body

    // Input validation
    if (!tripId || !date || !seatIds || !Array.isArray(seatIds) || seatIds.length === 0) {
      return Response.json(
        {
          error: 'Missing required fields: tripId, date, and seatIds are required',
        },
        { status: 400 },
      )
    }

    // Date validation
    const dateValidation = validateDate(date)
    if (!dateValidation.isValid) {
      return Response.json({ error: dateValidation.error }, { status: 400 })
    }
    const normalizedDate = convertPersianDateToGregorian(date)

    // Seat IDs validation
    const uniqueSeatIds = [...new Set(seatIds)]
    if (uniqueSeatIds.length !== seatIds.length) {
      return Response.json({ error: 'Duplicate seat IDs provided' }, { status: 400 })
    }

    if (uniqueSeatIds.length > 2) {
      return Response.json({ error: 'Maximum 2 seats per booking' }, { status: 400 })
    }

    try {
      // Get authenticated user with profile
      const authUser = (await payload.findByID({
        collection: 'users',
        id: user.id,
        depth: 1,
      })) as any

      if (!authUser?.isActive) {
        return Response.json({ error: 'User account is inactive' }, { status: 401 })
      }

      if (!authUser.profile || typeof authUser.profile === 'string') {
        return Response.json(
          {
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
        return Response.json({ error: 'Trip not found or no longer available' }, { status: 404 })
      }

      // Validate seat availability from bus configuration
      const busType = trip.bus?.type
      if (!busType || typeof busType === 'string') {
        return Response.json({ error: 'Bus configuration not found' }, { status: 500 })
      }

      const busSeats = busType.seats || []
      const validSeats = busSeats
        .filter((seat: any) => seat.type === 'seat' && !seat.disabled)
        .filter((seat: any) => uniqueSeatIds.includes(seat.id))

      if (validSeats.length !== uniqueSeatIds.length) {
        const invalidIds = uniqueSeatIds.filter(
          (id) => !validSeats.some((seat: any) => seat.id === id),
        )
        return Response.json(
          {
            error: `Invalid or disabled seat IDs: ${invalidIds.join(', ')}`,
          },
          { status: 400 },
        )
      }

      // Check existing bookings for conflicts
      const existingTickets = await payload.find({
        collection: 'tickets',
        where: {
          and: [
            { trip: { equals: tripId } },
            { date: { equals: normalizedDate } },
            { isCancelled: { equals: false } },
          ],
        },
      })

      // Analyze existing bookings
      const bookedSeatIds = new Set<string>()
      let userExistingSeats = 0

      existingTickets.docs.forEach((ticket: any) => {
        ticket.bookedSeats?.forEach((seat: any) => {
          if (seat.seat) {
            bookedSeatIds.add(seat.seat)
          }
        })

        // Count user's existing SEATS for this trip and date
        const bookedByUser =
          typeof ticket.bookedBy === 'string'
            ? ticket.bookedBy === user.id
            : ticket.bookedBy?.id === user.id

        if (bookedByUser) {
          userExistingSeats += ticket.bookedSeats?.length || 0
        }
      })

      // Check for booking conflicts using bus seat IDs
      const conflictingIds = uniqueSeatIds.filter((id: string) => bookedSeatIds.has(id))

      if (conflictingIds.length > 0) {
        const conflictedSeats = validSeats
          .filter((seat: any) => conflictingIds.includes(seat.id))
          .map((seat: any) => seat.seatNumber)

        return Response.json(
          {
            error: `The following seats are already booked: ${conflictedSeats.join(', ')}`,
          },
          { status: 409 },
        )
      }

      // Check user booking limits
      const maxSeatsPerUser = 2
      const totalSeatsAfterBooking = userExistingSeats + uniqueSeatIds.length // Now correctly adding seats to seats

      if (totalSeatsAfterBooking > maxSeatsPerUser) {
        const remainingSeats = maxSeatsPerUser - userExistingSeats
        return Response.json(
          {
            error: `Booking limit exceeded. You can only book ${remainingSeats} more seat(s). Maximum ${maxSeatsPerUser} seats per user per trip.`,
          },
          { status: 400 },
        )
      }

      // Calculate pricing
      const pricePerSeat = trip.price
      const totalPrice = pricePerSeat * uniqueSeatIds.length

      if (totalPrice <= 0) {
        return Response.json({ error: 'Invalid trip pricing configuration' }, { status: 500 })
      }

      // Create ticket - store bus seat IDs in the existing seat field
      const ticket = (await payload.create({
        collection: 'tickets',
        data: {
          passenger: authUser.profile.id,
          trip: tripId,
          date: normalizedDate,
          bookedSeats: validSeats.map((seat: any) => ({
            seat: seat.id, // Store the bus seat ID directly in the seat field
          })),
          pricePerTicket: pricePerSeat,
          totalPrice,
          isPaid: true,
          isCancelled: false,
          bookedBy: user.id,
          // I've commented this out intentionally, we will come back to it later, inshaa'Allah
          // paymentDeadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        },
      })) as any

      // Return success response
      const response: BookingResponse = {
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
            name: trip.name,
            price: trip.price,
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
            paymentDeadline: ticket.paymentDeadline || '',
          },
        },
      }

      return Response.json(response, { status: 201 })
    } catch (error: unknown) {
      console.error('Booking error:', error)

      // Handle specific PayloadCMS errors
      if (error && typeof error === 'object' && 'name' in error) {
        if (error.name === 'ValidationError') {
          const validationError = error as any
          return Response.json(
            {
              error: 'Validation failed',
              details: validationError.data || validationError.message,
            },
            { status: 400 },
          )
        }

        if (error.name === 'MongoError' || error.name === 'BulkWriteError') {
          const dbError = error as any
          if (dbError.code === 11000) {
            return Response.json(
              {
                error: 'A booking conflict occurred. Please try again.',
              },
              { status: 409 },
            )
          }
        }
      }

      return Response.json(
        {
          error: 'Booking failed due to an internal error. Please try again.',
        },
        { status: 500 },
      )
    }
  },
}
