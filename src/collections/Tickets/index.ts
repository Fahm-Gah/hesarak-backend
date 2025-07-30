import type { CollectionConfig } from 'payload'
import { generateUniqueTicket } from './hooks/generateUniqueTicket'
import { populateBookedBy } from './hooks/populateBookedBy'
import { calculateTotalPrice } from './hooks/calculateTotalPrice'

export const Tickets: CollectionConfig = {
  slug: 'tickets',
  admin: {
    useAsTitle: 'passenger',
    defaultColumns: ['bookedBy', 'passenger', 'trip', 'date', 'isPaid', 'bookedSeats'],
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
          name: 'seat',
          type: 'text',
          required: true,
        },
      ],
    },

    {
      name: 'pricePerTicket',
      type: 'number',
      admin: {
        description: "Override price per seat (leave empty to use the trip's fixed price)",
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
      admin: { position: 'sidebar', readOnly: true },
    },
    {
      name: 'bookedBy',
      type: 'relationship',
      relationTo: 'users',
      admin: { hidden: true },
    },
  ],
  hooks: {
    beforeChange: [generateUniqueTicket, populateBookedBy, calculateTotalPrice],
  },
}
