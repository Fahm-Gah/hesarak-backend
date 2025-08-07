import type { CollectionConfig } from 'payload'
import { generateUniqueTicket } from './hooks/generateUniqueTicket'
import { populateBookedBy } from './hooks/populateBookedBy'
import { calculateTotalPrice } from './hooks/calculateTotalPrice'
import { validateBookedSeats } from './hooks/validateBookedSeats'

export const Tickets: CollectionConfig = {
  slug: 'tickets',
  admin: {
    useAsTitle: 'ticketNumber',
    defaultColumns: ['passenger', 'trip', 'date', 'isPaid', 'totalPrice'],
  },
  disableDuplicate: true,
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
      type: 'json',
      required: true,
      admin: {
        components: {
          Field: './components/SeatSelector',
        },
        readOnly: true,
      },
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
      admin: { position: 'sidebar', hidden: true },
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
        hidden: true,
      },
    },
  ],
  hooks: {
    beforeChange: [
      validateBookedSeats,
      generateUniqueTicket,
      populateBookedBy,
      calculateTotalPrice,
    ],
  },
}
