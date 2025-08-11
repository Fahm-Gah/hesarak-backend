import type { CollectionBeforeChangeHook } from 'payload'

export const normalizeDateToMidnight: CollectionBeforeChangeHook = async ({
  data,
  operation,
  originalDoc,
}) => {
  // Check if we need to normalize the date
  const dateChanged = data.date && data.date !== originalDoc?.date

  if ((operation === 'create' || dateChanged) && data.date) {
    try {
      // Parse the date
      const ticketDate = new Date(data.date)

      // Check if the date is valid
      if (!isNaN(ticketDate.getTime())) {
        // Set to midnight UTC
        ticketDate.setUTCHours(0, 0, 0, 0)

        // Store as ISO string
        data.date = ticketDate.toISOString()
      }
    } catch (err) {
      console.error('Error normalizing date to midnight:', err)
    }
  }

  return data
}
