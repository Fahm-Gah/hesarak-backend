// import type { PayloadRequest, Endpoint } from 'payload'
// import { validateDate, getDayOfWeek } from '@/utils/dateUtils'

// export const bookTicketEndpoint: Endpoint = {
//   path: '/:tripId/:date/book',
//   method: 'post',
//   handler: async (req: PayloadRequest) => {
//     const tripId = req.routeParams?.tripId as string
//     const dateParam = req.routeParams?.date as string

//     if (!tripId || !dateParam) {
//       return Response.json(
//         {
//           success: false,
//           error: 'Trip ID and date are required',
//         },
//         { status: 400 },
//       )
//     }

//     try {
//       // Get request body
//       if (!req.json) {
//         return Response.json(
//           {
//             success: false,
//             error: 'Request body is required',
//           },
//           { status: 400 },
//         )
//       }

//       const body = await req.json()
//       const { userId, seatLabels } = body

//       // Input validation
//       if (!userId) {
//         return Response.json(
//           {
//             success: false,
//             error: 'User ID is required',
//           },
//           { status: 400 },
//         )
//       }

//       if (!seatLabels || !Array.isArray(seatLabels) || seatLabels.length === 0) {
//         return Response.json(
//           {
//             success: false,
//             error: 'At least one seat must be selected',
//           },
//           { status: 400 },
//         )
//       }

//       if (seatLabels.length > 2) {
//         return Response.json(
//           {
//             success: false,
//             error: 'Maximum 2 seats can be booked at once',
//           },
//           { status: 400 },
//         )
//       }

//       // 1) Validate date
//       const { isValid, date: travelDate, error: dateErr } = validateDate(dateParam)
//       if (!isValid || !travelDate) {
//         return Response.json(
//           {
//             success: false,
//             error: dateErr || 'Invalid date format',
//           },
//           { status: 400 },
//         )
//       }

//       // 2) Load trip schedule
//       const tripSchedule = await req.payload.findByID({
//         collection: 'trip-schedules',
//         id: tripId,
//         depth: 2,
//       })

//       if (!tripSchedule) {
//         return Response.json(
//           {
//             success: false,
//             error: 'Trip not found',
//           },
//           { status: 404 },
//         )
//       }

//       if (!tripSchedule.isActive) {
//         return Response.json(
//           {
//             success: false,
//             error: 'This trip is not currently available for booking',
//           },
//           { status: 400 },
//         )
//       }

//       // 3) Check if trip runs on selected date
//       const dayCode = getDayOfWeek(dateParam)
//       if (
//         tripSchedule.frequency === 'specific-days' &&
//         !(tripSchedule.days || []).some((d) => d.day === dayCode)
//       ) {
//         return Response.json(
//           {
//             success: false,
//             error: 'Trip does not run on the selected date',
//           },
//           { status: 400 },
//         )
//       }

//       // 4) Verify user exists
//       const user = await req.payload.findByID({
//         collection: 'users',
//         id: userId,
//       })

//       if (!user) {
//         return Response.json(
//           {
//             success: false,
//             error: 'User not found',
//           },
//           { status: 404 },
//         )
//       }

//       // 5) Get bus seat layout
//       const bus = typeof tripSchedule.busType === 'object' ? tripSchedule.busType : null
//       const allSeats = Array.isArray(bus?.seats) ? bus.seats : []

//       // Validate selected seats exist in bus layout
//       const validSeatLabels = allSeats.map((seat) => seat.label)
//       const invalidSeats = seatLabels.filter((label) => !validSeatLabels.includes(label))

//       if (invalidSeats.length > 0) {
//         return Response.json(
//           {
//             success: false,
//             error: `Invalid seat selection: ${invalidSeats.join(', ')}`,
//           },
//           { status: 400 },
//         )
//       }

//       // 6) Build date range for checking existing bookings
//       const startOfDay = new Date(travelDate)
//       startOfDay.setUTCHours(0, 0, 0, 0)
//       const endOfDay = new Date(startOfDay)
//       endOfDay.setUTCDate(endOfDay.getUTCDate() + 1)

//       // 7) Check for existing bookings (seat availability and user limit)
//       const { docs: existingBookings } = await req.payload.find({
//         collection: 'tickets',
//         where: {
//           and: [
//             { trip: { equals: tripId } },
//             { date: { greater_than_equal: startOfDay.toISOString() } },
//             { date: { less_than: endOfDay.toISOString() } },
//             { status: { not_equals: 'cancelled' } },
//           ],
//         },
//         depth: 0,
//         limit: 1000,
//       })

//       // Get already booked seat labels
//       const bookedSeatLabels = existingBookings
//         .flatMap((ticket) => (ticket.bookedSeats || []).map((seat) => seat.seatLabel))
//         .filter(Boolean)

//       // Check if any selected seats are already booked
//       const alreadyBookedSeats = seatLabels.filter((label) => bookedSeatLabels.includes(label))

//       if (alreadyBookedSeats.length > 0) {
//         return Response.json(
//           {
//             success: false,
//             error: `The following seats are already booked: ${alreadyBookedSeats.join(', ')}`,
//             bookedSeats: alreadyBookedSeats,
//           },
//           { status: 409 },
//         ) // Conflict status
//       }

//       // Check user's total seat count for this trip (max 2 seats total)
//       const userExistingBookings = existingBookings.filter((ticket) => ticket.passenger === userId)
//       const userCurrentSeatCount = userExistingBookings.reduce(
//         (total, ticket) => total + (ticket.bookedSeats || []).length,
//         0,
//       )

//       const totalSeatsAfterBooking = userCurrentSeatCount + seatLabels.length

//       if (totalSeatsAfterBooking > 2) {
//         const remainingSeats = Math.max(0, 2 - userCurrentSeatCount)
//         return Response.json(
//           {
//             success: false,
//             error: `You can only book a maximum of 2 seats per trip. You currently have ${userCurrentSeatCount} seat(s) booked and can book ${remainingSeats} more.`,
//             userBookingInfo: {
//               currentSeats: userCurrentSeatCount,
//               maxSeats: 2,
//               remainingSeats: remainingSeats,
//               requestedSeats: seatLabels.length,
//             },
//           },
//           { status: 409 },
//         )
//       }

//       // 8) Create the booking
//       const ticketData: any = {
//         user: userId,
//         trip: tripId,
//         date: startOfDay.toISOString(),
//         bookedSeats: seatLabels.map((label) => ({ seatLabel: label })),
//         status: 'unpaid' as const,
//         // ticketNumber and totalPrice will be calculated by the beforeChange hooks
//       }

//       const ticket = await req.payload.create({
//         collection: 'tickets',
//         data: ticketData,
//       })

//       // 9) Return booking confirmation
//       const bookingConfirmation = {
//         success: true,
//         data: {
//           ticketId: ticket.id,
//           ticketNumber: ticket.ticketNumber,
//           trip: {
//             id: tripSchedule.id,
//             name: tripSchedule.name,
//             price: tripSchedule.price,
//             travelDate: startOfDay.toISOString().split('T')[0],
//             departureTime: tripSchedule.timeOfDay,
//           },
//           booking: {
//             seats: seatLabels,
//             seatCount: seatLabels.length,
//             totalPrice: ticket.totalPrice,
//             status: ticket.status,
//           },
//           user: {
//             id: user.id,
//             email: user.email,
//             // name: user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
//             // phone: user.phone || null,
//           },
//           bookingDate: new Date().toISOString(),
//           paymentRequired: ticket.status === 'unpaid',
//         },
//       }

//       return Response.json(bookingConfirmation, { status: 201 })
//     } catch (error) {
//       console.error('Error creating booking:', error)
//       return Response.json(
//         {
//           success: false,
//           error: 'An error occurred while processing your booking. Please try again.',
//         },
//         { status: 500 },
//       )
//     }
//   },
// }
