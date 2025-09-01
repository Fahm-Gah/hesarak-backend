import type { Endpoint } from 'payload'
import { convertPersianDateToGregorian, formatTime } from '../utils/dateUtils'
import { validateBookingRequest, validateBookingConstraints } from '../validations/booking'
import { getLocaleFromRequest, createErrorResponse, createSuccessResponse, t } from '../utils/i18n'
import {
  generateTicketConfirmationEmail,
  generateAdminBookingNotification,
} from '../utils/emailTemplates'

export const bookTicket: Endpoint = {
  path: '/book-ticket',
  method: 'post',
  handler: async (req) => {
    const { payload, user } = req
    const locale = getLocaleFromRequest({
      headers: Object.fromEntries(req.headers.entries()),
    })

    if (!user) {
      return createErrorResponse('AUTH_REQUIRED', 401, locale)
    }

    let requestBody: unknown
    try {
      requestBody = (await req.json?.()) || req.body
    } catch (e) {
      return createErrorResponse('INVALID_JSON', 400, locale)
    }

    // Validate request using our validation schema
    const validation = validateBookingRequest(requestBody)
    if (!validation.isValid) {
      return createErrorResponse('VALIDATION_FAILED', 400, locale, undefined, validation.errors)
    }

    const bookingData = validation.data!

    // Validate business constraints
    const constraintValidation = validateBookingConstraints(bookingData)
    if (!constraintValidation.isValid) {
      return createErrorResponse(
        'BOOKING_CONSTRAINTS_VIOLATED',
        400,
        locale,
        undefined,
        constraintValidation.errors,
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
        return createErrorResponse('USER_INACTIVE', 401, locale)
      }

      if (!authUser.profile || typeof authUser.profile === 'string') {
        return createErrorResponse('PROFILE_REQUIRED', 400, locale)
      }

      // Get trip information
      const trip = (await payload.findByID({
        collection: 'trip-schedules',
        id: tripId,
        depth: 3,
      })) as any

      if (!trip?.isActive) {
        return createErrorResponse('TRIP_NOT_FOUND', 404, locale)
      }

      // Check if booking is allowed based on departure time (2 hour cutoff)
      try {
        const now = new Date()
        let departureTimeToCheck = trip.departureTime

        // If user has specific boarding terminals, find the actual boarding time
        if (fromTerminalId && trip.stops) {
          const boardingStop = trip.stops.find((stop: any) => stop.terminal?.id === fromTerminalId)
          if (boardingStop && boardingStop.time) {
            departureTimeToCheck = boardingStop.time
          }
        }

        if (departureTimeToCheck) {
          // Extract time string from ISO date or time string using dateUtils
          const timeString = formatTime(departureTimeToCheck)

          if (timeString && timeString.includes(':')) {
            const [hours, minutes] = timeString.split(':').map(Number)

            // Create departure datetime using the normalized date
            const departureDateTime = new Date(normalizedDate)
            departureDateTime.setHours(hours, minutes, 0, 0)

            const timeDiffInHours = (departureDateTime.getTime() - now.getTime()) / (1000 * 60 * 60)

            // Prevent booking if trip has already departed
            if (timeDiffInHours <= 0) {
              return createErrorResponse('TRIP_ALREADY_DEPARTED', 400, locale)
            }

            // Prevent booking if within 2 hours of departure
            if (timeDiffInHours < 2) {
              return createErrorResponse('BOOKING_TOO_CLOSE', 400, locale)
            }
          } else {
            console.warn('Invalid departure time format:', departureTimeToCheck)
          }
        }
      } catch (departureValidationError) {
        console.error('Error validating departure time in bookTicket:', departureValidationError)
        // Don't continue with booking if time validation fails - this is critical for security
        return createErrorResponse('DEPARTURE_TIME_VALIDATION_FAILED', 500, locale)
      }

      // Validate seats exist in bus configuration
      const busType = trip.bus?.type
      if (!busType || !busType.seats) {
        return createErrorResponse('BUS_CONFIG_NOT_FOUND', 500, locale)
      }

      const validSeats = busType.seats.filter(
        (seat: any) => seat.type === 'seat' && !seat.disabled && uniqueSeatIds.includes(seat.id),
      )

      if (validSeats.length !== uniqueSeatIds.length) {
        const invalidIds = uniqueSeatIds.filter(
          (id) => !validSeats.some((seat: any) => seat.id === id),
        )
        return createErrorResponse('INVALID_SEAT_IDS', 400, locale, {
          seatIds: invalidIds.join(', '),
        })
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

        return createErrorResponse('SEATS_ALREADY_BOOKED', 409, locale, {
          seats: conflictedSeats.join(', '),
        })
      }

      // Check user booking limits - IMPROVED VALIDATION
      const maxSeatsPerUser = 2
      const totalSeatsAfterBooking = userExistingSeats + uniqueSeatIds.length

      if (totalSeatsAfterBooking > maxSeatsPerUser) {
        return createErrorResponse('BOOKING_LIMIT_EXCEEDED', 400, locale, {
          maxSeats: maxSeatsPerUser,
        })
      }

      // Additional safety check - prevent booking if user already has max seats
      if (userExistingSeats >= maxSeatsPerUser) {
        return createErrorResponse('MAX_SEATS_REACHED', 400, locale, { maxSeats: maxSeatsPerUser })
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
        return createErrorResponse('BOOKING_LIMIT_EXCEEDED', 400, locale, {
          maxSeats: maxSeatsPerUser,
        })
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

      const ticket = (await payload.create({
        collection: 'tickets',
        data: ticketData,
      })) as any

      // Send email notifications
      try {
        const userProfile = authUser.profile
        const hasEmail = userProfile.email || authUser.email

        if (hasEmail) {
          const emailData = {
            ticketNumber: ticket.ticketNumber,
            passengerName:
              userProfile.fullName ||
              `${userProfile.firstName || ''} ${userProfile.lastName || ''}`.trim() ||
              'مسافر',
            tripName: trip.tripName,
            fromTerminal: ticket.from?.name || trip.from?.name || 'نامشخص',
            toTerminal: ticket.to?.name || trip.to?.name || 'نامشخص',
            departureDate: new Date(normalizedDate).toLocaleDateString('fa-IR', {
              timeZone: 'Asia/Kabul',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            }),
            departureTime: formatTime(trip.departureTime) || 'نامشخص',
            seatNumbers: validSeats.map((seat: any) => seat.seatNumber),
            totalPrice,
            isPaid: ticket.isPaid,
            paymentMethod: ticket.paymentMethod || paymentMethod,
            paymentDeadline: ticket.paymentDeadline
              ? new Date(ticket.paymentDeadline).toLocaleDateString('fa-IR', {
                  timeZone: 'Asia/Kabul',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })
              : undefined,
          }

          // Send confirmation email to user
          const userEmail = generateTicketConfirmationEmail(emailData)
          await payload.sendEmail({
            to: hasEmail,
            subject: `تایید رزرو تکت ${ticket.ticketNumber} - حصارک پنجشیر`,
            html: userEmail.html,
            text: userEmail.text,
          })

          // Send notification to admin
          const adminEmailData = {
            ...emailData,
            passengerPhone: userProfile.phoneNumber || authUser.phoneNumber || 'نامشخص',
          }
          const adminEmail = generateAdminBookingNotification(adminEmailData)
          await payload.sendEmail({
            to: 'hesarak.trans600@gmail.com',
            subject: `رزرو جدید: ${ticket.ticketNumber} - ${emailData.passengerName}`,
            html: adminEmail.html,
            text: adminEmail.text,
          })
        }
      } catch (emailError) {
        console.error('Email sending failed for booking:', emailError)
        // Don't fail the booking if email fails - just log it
      }

      return createSuccessResponse(
        'BOOKING_SUCCESS',
        {
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
        locale,
      )
    } catch (error: unknown) {
      console.error('Booking error:', error)
      return createErrorResponse('INTERNAL_ERROR', 500, locale)
    }
  },
}
