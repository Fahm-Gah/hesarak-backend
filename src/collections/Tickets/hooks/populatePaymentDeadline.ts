import type { CollectionBeforeChangeHook } from 'payload'

/**
 * Hook to populate payment deadline dynamically based on business requirements
 *
 * Business Rules:
 * 1. Only applies to unpaid tickets
 * 2. All payment methods get deadlines for consistent status tracking
 * 3. Time-based deadlines:
 *    - >7 days to departure: 48 hours from booking
 *    - 1-7 days to departure: 24 hours from booking
 *    - <24 hours to departure: 2 hours before departure
 * 4. Explicitly set deadlines take precedence
 * 5. Minimum 15-minute grace period for edge cases
 */
export const populatePaymentDeadline: CollectionBeforeChangeHook = async ({
  data,
  req,
  operation,
  originalDoc,
}) => {
  // FIRST: Check if payment deadline is already explicitly set (admin override)
  // This must come before all other logic to ensure admin-set deadlines are always respected
  if (data.paymentDeadline) {
    // For admin-set deadlines, we should respect them completely
    // Only validate that it's a valid date, don't adjust based on time
    const deadline = new Date(data.paymentDeadline)

    // Only reject completely invalid dates
    if (isNaN(deadline.getTime())) {
      console.warn('Invalid payment deadline date provided, using fallback:', {
        originalDeadline: data.paymentDeadline,
        newDeadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      })
      data.paymentDeadline = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    }

    return data
  }

  // Skip if ticket is already paid (and no manual deadline was set)
  if (data.isPaid === true) {
    // Clear payment deadline for paid tickets
    data.paymentDeadline = undefined
    return data
  }

  // Note: We now populate payment deadlines for all payment methods
  // This allows tracking payment status consistently across all ticket types

  // Auto-populate payment deadline for unpaid tickets (regardless of payment method)
  if (!data.paymentDeadline) {
    try {
      // Fetch trip details to get departure time
      if (!data.trip || !data.date) {
        // Fallback for missing trip or date
        return data
      }

      const tripId = typeof data.trip === 'string' ? data.trip : data.trip.id
      const trip = await req.payload.findByID({
        collection: 'trip-schedules',
        id: tripId,
        depth: 1,
      })

      if (!trip || !trip.departureTime) {
        // Fallback: 24 hours from booking for trips without departure time
        data.paymentDeadline = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        return data
      }

      // Calculate departure datetime by combining trip date with departure time
      const departureTime = new Date(trip.departureTime)
      const tripDate = new Date(data.date)

      const departureDateTime = new Date(
        tripDate.getFullYear(),
        tripDate.getMonth(),
        tripDate.getDate(),
        departureTime.getHours(),
        departureTime.getMinutes(),
        departureTime.getSeconds(),
      )

      // Calculate payment deadline based on time until departure
      const now = new Date()
      const timeToDeparture = departureDateTime.getTime() - now.getTime()
      const daysToDeparture = timeToDeparture / (1000 * 60 * 60 * 24)

      let paymentDeadline: Date

      if (daysToDeparture > 7) {
        // More than 7 days: 48 hours to pay
        paymentDeadline = new Date(now.getTime() + 48 * 60 * 60 * 1000)
      } else if (daysToDeparture > 1) {
        // 1-7 days: 24 hours to pay
        paymentDeadline = new Date(now.getTime() + 24 * 60 * 60 * 1000)
      } else {
        // Less than 24 hours: 2 hours before departure
        paymentDeadline = new Date(departureDateTime.getTime() - 2 * 60 * 60 * 1000)

        // If that puts deadline in the past, give 30 minutes
        if (paymentDeadline <= now) {
          if (timeToDeparture > 30 * 60 * 1000) {
            paymentDeadline = new Date(now.getTime() + 30 * 60 * 1000)
          } else {
            // Last resort: 15 minutes grace period
            paymentDeadline = new Date(now.getTime() + 15 * 60 * 1000)
          }
        }
      }

      // Ensure deadline is at least 15 minutes from now (minimum processing time)
      const minimumDeadline = new Date(now.getTime() + 15 * 60 * 1000)
      if (paymentDeadline < minimumDeadline) {
        paymentDeadline = minimumDeadline
      }

      data.paymentDeadline = paymentDeadline.toISOString()
    } catch (error) {
      console.error('Error populating payment deadline:', error)
      // Fallback: 4 hours from booking time
      data.paymentDeadline = new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString()
    }
  }

  return data
}
