import { CollectionBeforeChangeHook, ValidationFieldError, ValidationError } from 'payload'

// Helper function to normalize date for comparison
const normalizeDate = (date: string | Date): string => {
  const d = new Date(date)
  d.setUTCHours(0, 0, 0, 0)
  return d.toISOString().split('T')[0] // Return just the date part: YYYY-MM-DD
}

// Helper to extract seat ID from various formats
const extractSeatId = (seatData: any): string | null => {
  if (!seatData) return null
  if (typeof seatData === 'string') return seatData

  if (typeof seatData === 'object') {
    if (seatData.seat) {
      if (typeof seatData.seat === 'string') return seatData.seat
      if (typeof seatData.seat === 'object') {
        return seatData.seat.id || seatData.seat._id || null
      }
    }
    return seatData.id || seatData._id || seatData.seatId || null
  }

  return null
}

// Helper to get bus type seats safely
const getBusTypeSeats = async (trip: any, payload: any): Promise<any[]> => {
  try {
    // If bus is not populated, return empty array
    if (!trip.bus) return []

    let busType: any = null

    // Check if bus is populated (object) or just an ID (string)
    if (typeof trip.bus === 'object' && trip.bus !== null) {
      // Bus is populated, now check if type is populated
      if (trip.bus.type && typeof trip.bus.type === 'object' && trip.bus.type !== null) {
        busType = trip.bus.type
      } else if (trip.bus.type && typeof trip.bus.type === 'string') {
        // Type is just an ID, need to fetch it
        busType = await payload.findByID({
          collection: 'bus-types',
          id: trip.bus.type,
          depth: 0,
        })
      }
    } else if (typeof trip.bus === 'string') {
      // Bus is just an ID, need to fetch it with type populated
      const bus = await payload.findByID({
        collection: 'buses',
        id: trip.bus,
        depth: 1, // This should populate the type relationship
      })

      if (bus) {
        if (bus.type && typeof bus.type === 'object') {
          busType = bus.type
        } else if (bus.type && typeof bus.type === 'string') {
          busType = await payload.findByID({
            collection: 'bus-types',
            id: bus.type,
            depth: 0,
          })
        }
      }
    }

    // Return seats array or empty array
    return busType?.seats && Array.isArray(busType.seats) ? busType.seats : []
  } catch (error) {
    console.error('Error fetching bus type seats:', error)
    return []
  }
}

export const validateBookedSeats: CollectionBeforeChangeHook = async ({
  data,
  req,
  originalDoc,
  operation,
}) => {
  const errors: ValidationFieldError[] = []

  // 1) Validate that we have trip and date
  if (!data.trip) {
    errors.push({
      path: 'trip',
      message: 'Trip is required to book seats.',
    })
  }

  if (!data.date) {
    errors.push({
      path: 'date',
      message: 'Travel date is required to book seats.',
    })
  }

  // 2) Validate at least one seat is selected
  const seats = Array.isArray(data.bookedSeats) ? data.bookedSeats : []
  const seatIds = seats.map(extractSeatId).filter((id): id is string => id !== null)

  if (seatIds.length === 0) {
    errors.push({
      path: 'bookedSeats',
      message: 'You must select at least one seat.',
    })
  }

  // If we have basic validation errors, throw early
  if (errors.length > 0) {
    const combined = errors.map((e) => e.message).join(' | ')
    throw new ValidationError(
      {
        collection: 'tickets',
        errors,
        global: combined,
      },
      req.t,
    )
  }

  // 3) Validate seats belong to the selected trip
  if (data.trip && seatIds.length > 0) {
    try {
      // Fetch the trip to get available seats
      const trip = await req.payload.findByID({
        collection: 'trip-schedules',
        id: typeof data.trip === 'string' ? data.trip : data.trip.id,
        depth: 3, // Increase depth to ensure we get bus.type.seats
      })

      if (!trip) {
        errors.push({
          path: 'trip',
          message: 'Selected trip not found.',
        })
      } else {
        // Get all valid seat IDs from the trip's bus
        const validSeatIds = new Set<string>()

        // Get bus type seats using helper function
        const busTypeSeats = await getBusTypeSeats(trip, req.payload)

        // Process seats to build valid seat IDs set
        busTypeSeats.forEach((seat: any, idx: number) => {
          // Only add seats that are actually bookable (type === 'seat')
          if (seat.type === 'seat') {
            const seatId =
              (typeof seat.id === 'string' && seat.id) ||
              (typeof seat._id === 'string' && seat._id) ||
              `${seat.position.row}-${seat.position.col}-${idx}`

            validSeatIds.add(seatId)
          }
        })

        // Check if all selected seats are valid for this trip
        const invalidSeats = seatIds.filter((id) => !validSeatIds.has(id))

        if (invalidSeats.length > 0) {
          errors.push({
            path: 'bookedSeats',
            message: `The following seats are not valid for this trip: ${invalidSeats.join(', ')}. Please reselect your seats.`,
          })
        }

        // 4) Check for double-booking ONLY if seats are valid
        if (invalidSeats.length === 0 && data.date) {
          const normalizedDate = normalizeDate(data.date)

          // Build the where query
          const whereQuery: any = {
            trip: { equals: data.trip },
            isCancelled: { equals: false },
          }

          // If updating, exclude current document
          if (operation === 'update' && originalDoc?.id) {
            whereQuery.id = { not_equals: originalDoc.id }
          }

          const existing = await req.payload.find({
            collection: 'tickets',
            where: whereQuery,
            limit: 1000,
            depth: 0,
          })

          // Filter by normalized date and collect taken seats (excluding expired tickets)
          const takenSeats = new Map<string, any>() // seat ID -> ticket info

          existing.docs.forEach((doc: any) => {
            if (!doc.date) return

            // Only consider tickets for the same date
            if (normalizeDate(doc.date) === normalizedDate) {
              // Check if this ticket is expired (manual check since isExpired is virtual)
              const isExpired = (() => {
                if (!doc.paymentDeadline || doc.isPaid || doc.isCancelled) {
                  return false
                }
                try {
                  const deadline = new Date(doc.paymentDeadline)
                  const now = new Date()
                  const expired = !isNaN(deadline.getTime()) && deadline < now

                  return expired
                } catch (error) {
                  console.error('Error checking expiration:', error)
                  return false
                }
              })()

              // Skip expired tickets - they don't block new bookings
              if (isExpired) {
                return
              }

              const bookedSeats = Array.isArray(doc.bookedSeats) ? doc.bookedSeats : []

              bookedSeats.forEach((seatData: any) => {
                const seatId = extractSeatId(seatData)
                if (seatId) {
                  takenSeats.set(seatId, {
                    ticketNumber: doc.ticketNumber,
                    isPaid: doc.isPaid,
                  })
                }
              })
            }
          })

          // Check for conflicts
          const conflicts: string[] = []

          seatIds.forEach((seatId) => {
            const existingBooking = takenSeats.get(seatId)
            if (existingBooking) {
              conflicts.push(
                `Seat ${seatId} is already ${existingBooking.isPaid ? 'booked' : 'reserved'} (Ticket: ${existingBooking.ticketNumber})`,
              )
            }
          })

          if (conflicts.length > 0) {
            errors.push({
              path: 'bookedSeats',
              message: conflicts.join(', '),
            })
          }
        }
      }
    } catch (error) {
      console.error('Error validating booked seats:', error)
      errors.push({
        path: 'bookedSeats',
        message: 'Error validating seat selection. Please try again.',
      })
    }
  }

  // 5) Throw validation error if any issues found
  if (errors.length > 0) {
    const combined = errors.map((e) => e.message).join(' | ')
    throw new ValidationError(
      {
        collection: 'tickets',
        errors,
        global: combined,
      },
      req.t,
    )
  }
}
