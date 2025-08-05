import type { CollectionBeforeChangeHook } from 'payload'

export const calculateTotalPrice: CollectionBeforeChangeHook = async ({
  data,
  operation,
  originalDoc,
  req,
}) => {
  // Check if we need to recalculate the price
  const tripChanged = data.trip && data.trip !== originalDoc?.trip
  const seatsChanged =
    Array.isArray(data.bookedSeats) &&
    JSON.stringify(data.bookedSeats) !== JSON.stringify(originalDoc?.bookedSeats)
  const priceChanged = data.pricePerTicket !== originalDoc?.pricePerTicket

  if (
    (operation === 'create' || tripChanged || seatsChanged || priceChanged) &&
    data.trip &&
    Array.isArray(data.bookedSeats)
  ) {
    const seatCount = data.bookedSeats.length

    // Use override price if provided
    if (data.pricePerTicket && data.pricePerTicket > 0) {
      data.totalPrice = data.pricePerTicket * seatCount
    } else {
      // Otherwise, fetch the trip's default price
      try {
        const tripDoc = await req.payload.findByID({
          collection: 'trip-schedules',
          id: typeof data.trip === 'string' ? data.trip : data.trip.id,
        })

        if (tripDoc?.price) {
          data.totalPrice = tripDoc.price * seatCount
        } else {
          // Fallback to 0 if no price is found
          data.totalPrice = 0
        }
      } catch (err) {
        console.error('Error fetching trip price:', err)
        data.totalPrice = 0
      }
    }
  }

  return data
}
