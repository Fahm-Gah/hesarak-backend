import type { CollectionConfig } from 'payload'
import { generateUniqueTicket } from './hooks/generateUniqueTicket'
import { populateBookedBy } from './hooks/populateBookedBy'
import { calculateTotalPrice } from './hooks/calculateTotalPrice'

export const Tickets: CollectionConfig = {
  slug: 'tickets',
  admin: {
    useAsTitle: 'ticketNumber',
    defaultColumns: ['passenger', 'trip', 'date', 'isPaid', 'bookedSeats', 'totalPrice'],
  },
  fields: [
    {
      name: 'ticketNumber',
      type: 'text',
      unique: true,
      admin: {
        hidden: true,
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
    },
    {
      name: 'bookedSeats',
      type: 'array',
      required: true,
      minRows: 1,
      admin: {
        components: {
          Field: './components/SeatSelector',
        },
        description: 'Select seats from the visual seat map',
      },
      fields: [
        {
          type: 'text',
          name: 'seat',
          required: true,
          admin: {
            readOnly: true,
          },
        },
      ],
    },
    {
      name: 'pricePerTicket',
      type: 'number',
      admin: {
        description: "Override price per seat (leave empty to use the trip's default price)",
        position: 'sidebar',
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
      name: 'isPaid',
      type: 'checkbox',
      defaultValue: true,
      admin: { position: 'sidebar' },
    },
    {
      name: 'isCancelled',
      type: 'checkbox',
      defaultValue: false,
      admin: { position: 'sidebar' },
    },
    {
      name: 'bookedBy',
      type: 'relationship',
      relationTo: 'users',
      hidden: true,
    },
    {
      name: 'paymentDeadline',
      type: 'date',
      admin: {
        position: 'sidebar',
        condition: (data) => !data.isPaid,
        description: 'Payment deadline for unpaid tickets',
      },
    },
  ],
  hooks: {
    beforeChange: [generateUniqueTicket, populateBookedBy, calculateTotalPrice],
  },
}
