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
      const ticketDate = new Date(data.date)

      // Check if the date is valid
      if (!isNaN(ticketDate.getTime())) {
        ticketDate.setHours(0, 0, 0, 0) // Set to midnight
        data.date = ticketDate.toISOString()

        console.log(`Normalized ticket date to midnight: ${data.date}`)
      }
    } catch (err) {
      console.error('Error normalizing date to midnight:', err)
    }
  }

  return data
}
