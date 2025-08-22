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
    // Clear the booked seats when trip or date changes
    // This forces the user to select new seats for the new trip/date combination
    if (originalDoc.bookedSeats && originalDoc.bookedSeats.length > 0) {
      data.bookedSeats = []
    }
  }

  return data
}
