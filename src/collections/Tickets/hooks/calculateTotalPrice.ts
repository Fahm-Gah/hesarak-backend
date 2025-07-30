import type { CollectionBeforeChangeHook } from 'payload'

export const calculateTotalPrice: CollectionBeforeChangeHook = async ({
  data,
  operation,
  originalDoc,
  req,
}) => {
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
    if (data.pricePerTicket && data.pricePerTicket > 0) {
      data.totalPrice = data.pricePerTicket * seatCount
    } else {
      try {
        const tripDoc = await req.payload.findByID({
          collection: 'trip-schedules',
          id: data.trip,
        })
        if (tripDoc?.price) {
          data.totalPrice = tripDoc.price * seatCount
        }
      } catch (err) {
        console.error('Error fetching trip price:', err)
      }
    }
  }

  return data
}
