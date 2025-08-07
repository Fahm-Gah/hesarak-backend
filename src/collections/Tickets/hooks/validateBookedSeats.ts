import { CollectionBeforeChangeHook, ValidationFieldError, ValidationError } from 'payload'

export const validateBookedSeats: CollectionBeforeChangeHook = async ({ data, req }) => {
  const errors: ValidationFieldError[] = []

  // 1) at least one seat
  const seats = Array.isArray(data.bookedSeats) ? data.bookedSeats : []
  if (seats.length === 0) {
    errors.push({
      path: 'bookedSeats',
      message: 'You must select at least one seat.',
    })
  }

  // 2) no double-booking
  if (seats.length > 0) {
    const existing = await req.payload.find({
      collection: 'tickets',
      where: {
        trip: { equals: data.trip },
        date: { equals: data.date },
        isCancelled: { equals: false },
      },
      limit: 1000,
      depth: 0,
    })

    const takenIds = new Set<string>()
    existing.docs.forEach((doc: any) => {
      const bs = Array.isArray(doc.bookedSeats) ? doc.bookedSeats : []
      bs.forEach((s: any) => {
        if (s.id) takenIds.add(s.id)
      })
    })

    seats.forEach((seat) => {
      const id = typeof seat === 'object' && seat !== null ? seat.id : String(seat)
      if (takenIds.has(id)) {
        errors.push({
          path: 'bookedSeats',
          message: `Seat ${id} is already taken.`,
        })
      }
    })
  }

  // 3) if any errors, throw with a global message
  if (errors.length) {
    // collect all messages into one string
    const combined = errors.map((e) => e.message).join(' | ')
    throw new ValidationError(
      {
        collection: 'tickets',
        errors, // still there if you want field-level
        global: combined, // this shows up at top of form
      },
      req.t,
    )
  }
}
