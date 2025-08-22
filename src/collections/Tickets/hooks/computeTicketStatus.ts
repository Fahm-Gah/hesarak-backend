import type { CollectionAfterReadHook } from 'payload'

/**
 * Hook to compute if ticket is expired based on payment deadline
 * Only adds isExpired virtual field without modifying the actual document
 */
export const computeTicketStatus: CollectionAfterReadHook = ({ doc }) => {
  // Check if payment deadline exists and has passed
  let isExpired = false

  if (doc.paymentDeadline && !doc.isPaid && !doc.isCancelled) {
    try {
      const deadline = new Date(doc.paymentDeadline)
      const now = new Date()

      // Validate deadline and check if expired
      if (!isNaN(deadline.getTime()) && deadline < now) {
        isExpired = true
      }
    } catch (error) {
      console.warn('Error parsing paymentDeadline for ticket:', doc.id, error)
    }
  }

  // Return document with only isExpired virtual field
  return {
    ...doc,
    isExpired,
  }
}
