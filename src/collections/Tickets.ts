import type { CollectionConfig } from 'payload'

export const Tickets: CollectionConfig = {
  slug: 'tickets',
  admin: {
    useAsTitle: 'passenger',
    defaultColumns: ['passenger', 'trip', 'date', 'status', 'bookedBy'],
  },
  fields: [
    {
      name: 'ticketNumber',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        readOnly: true,
        position: 'sidebar',
      },
    },
    {
      name: 'passenger',
      type: 'relationship',
      relationTo: 'profiles',
      required: true,
    },
    {
      name: 'trip',
      type: 'relationship',
      relationTo: 'trip-schedules',
      required: true,
    },
    {
      name: 'date',
      type: 'date',
      required: true,
      admin: {
        description: 'Date of travel',
      },
    },
    {
      name: 'bookedSeats',
      type: 'array',
      required: true,
      minRows: 1,
      fields: [
        {
          name: 'seatLabel',
          type: 'text',
          required: true,
          admin: {
            description: 'Seat identifier (e.g. 24)',
          },
        },
      ],
    },
    {
      name: 'pricePerTicket',
      type: 'number',
      required: false,
      admin: {
        description: "Override price per seat (leave empty to use trip's fixed price)",
      },
    },
    {
      name: 'totalPrice',
      type: 'number',
      required: true,
      admin: {
        readOnly: true,
        description: 'Automatically calculated based on seats and price',
        position: 'sidebar',
      },
    },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Unpaid', value: 'unpaid' },
        { label: 'Paid', value: 'paid' },
        { label: 'Cancelled', value: 'cancelled' },
      ],
      defaultValue: 'paid',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'bookedBy',
      type: 'relationship',
      relationTo: 'users',
      required: false,
      admin: {
        hidden: true,
      },
    },
  ],

  // Collection-level hooks to handle all logic
  hooks: {
    beforeChange: [
      async ({ data, operation, originalDoc, req }) => {
        // Only generate ticket number on create, not update
        if (operation === 'create' && !data.ticketNumber) {
          // Generate unique ticket number
          const timestamp = Date.now()
          const randomStr = Math.random().toString(36).substring(2, 9).toUpperCase()
          data.ticketNumber = `TK${timestamp}-${randomStr}`
        }

        // Set bookedBy to current user on create (and prevent updates)
        if (operation === 'create' && req.user) {
          data.bookedBy = req.user.id
        } else if (operation === 'update' && originalDoc?.bookedBy) {
          // Preserve original bookedBy value on updates
          data.bookedBy = originalDoc.bookedBy
        }

        // Calculate totalPrice based on trip price and number of seats
        // Only recalculate if relevant fields have changed
        const tripChanged = data.trip && data.trip !== originalDoc?.trip
        const seatsChanged =
          data.bookedSeats &&
          JSON.stringify(data.bookedSeats) !== JSON.stringify(originalDoc?.bookedSeats)
        const pricePerTicketChanged = data.pricePerTicket !== originalDoc?.pricePerTicket

        if (
          (operation === 'create' || tripChanged || seatsChanged || pricePerTicketChanged) &&
          data.trip &&
          Array.isArray(data.bookedSeats)
        ) {
          try {
            // Use custom price per ticket if provided, otherwise use trip's fixed price
            if (data.pricePerTicket && data.pricePerTicket > 0) {
              data.totalPrice = data.pricePerTicket * data.bookedSeats.length
            } else {
              // Fetch trip's fixed price
              const trip = await req.payload.findByID({
                collection: 'trip-schedules',
                id: data.trip,
              })

              if (trip?.price) {
                data.totalPrice = trip.price * data.bookedSeats.length
              }
            }
          } catch (err) {
            console.error('Error calculating total price:', err)
            // Don't throw - let the operation continue
          }
        }

        return data
      },
    ],
  },
}
