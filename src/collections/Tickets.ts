import type { CollectionConfig } from 'payload'

export const Tickets: CollectionConfig = {
  slug: 'tickets',
  admin: {
    useAsTitle: 'ticketNumber',
    defaultColumns: ['ticketNumber', 'user', 'trip', 'date', 'status'],
  },
  fields: [
    {
      name: 'ticketNumber',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        readOnly: true,
        hidden: true,
      },
      hooks: {
        beforeChange: [
          ({ data }) => {
            if (data && !data.ticketNumber) {
              data.ticketNumber = `TK-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
            }
          },
        ],
      },
    },
    { name: 'user', type: 'relationship', relationTo: 'users', required: true },
    { name: 'trip', type: 'relationship', relationTo: 'trip-schedules', required: true },
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
      fields: [
        {
          name: 'seatLabel',
          type: 'text',
          required: true,
          admin: {
            description: 'Seat identifier (e.g., A1, B2)',
          },
        },
      ],
      required: true,
      minRows: 1,
    },
    {
      name: 'totalPrice',
      type: 'number',
      required: true,
      admin: {
        readOnly: true,
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
      defaultValue: 'unpaid',
    },
  ],
  hooks: {
    beforeChange: [
      async ({ data, req }) => {
        // Calculate total price based on trip price and number of seats
        if (data.trip && data.bookedSeats) {
          try {
            const trip = await req.payload.findByID({
              collection: 'trip-schedules',
              id: data.trip,
            })
            data.totalPrice = trip.price * data.bookedSeats.length
          } catch (error) {
            console.error('Error calculating total price:', error)
          }
        }
      },
    ],
  },
}
