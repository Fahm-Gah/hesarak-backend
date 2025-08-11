import type { CollectionBeforeChangeHook } from 'payload'

/**
 * Hook to clear booked seats when trip or date changes during update
 * This ensures data consistency and prevents booking seats for wrong trip/date
 */
export const clearSeatsOnTripDateChange: CollectionBeforeChangeHook = async ({
  data,
  operation,
  originalDoc,
  req,
}) => {
  // Only apply to update operations
  if (operation !== 'update' || !originalDoc) {
    return data
  }

  // Check if trip or date has changed
  const tripChanged = data.trip && data.trip !== originalDoc.trip
  const dateChanged =
    data.date && new Date(data.date).getTime() !== new Date(originalDoc.date).getTime()

  if (tripChanged || dateChanged) {
    console.log('Trip or date changed during ticket update', {
      tripChanged,
      dateChanged,
      oldTrip: originalDoc.trip,
      newTrip: data.trip,
      oldDate: originalDoc.date,
      newDate: data.date,
      hasBookedSeats: data.bookedSeats !== undefined,
      seatsCount: Array.isArray(data.bookedSeats) ? data.bookedSeats.length : 0,
    })

    // IMPORTANT: Only clear seats if:
    // 1. No seats were explicitly provided in this update (bookedSeats is undefined)
    // 2. AND there were seats in the original document
    // This allows the user to change date/trip AND select new seats in the same operation
    if (
      data.bookedSeats === undefined &&
      originalDoc.bookedSeats &&
      originalDoc.bookedSeats.length > 0
    ) {
      console.log('Clearing old seats due to trip/date change without new seat selection')
      data.bookedSeats = []
    } else if (Array.isArray(data.bookedSeats) && data.bookedSeats.length > 0) {
      console.log('Keeping explicitly selected seats for new trip/date')
      // User has selected new seats for the new trip/date - keep them
    }
  }

  return data
}
