import type { CollectionConfig } from 'payload'
import { generateUniqueTicket } from './hooks/generateUniqueTicket'
import { populateBookedBy } from './hooks/populateBookedBy'
import { calculateTotalPrice } from './hooks/calculateTotalPrice'
import { validateBookedSeats } from './hooks/validateBookedSeats'
import { normalizeDateToMidnight } from './hooks/normalizeDateToMidnight'
import { validateTripDate } from './hooks/validateTripDate'
import { clearSeatsOnTripDateChange } from './hooks/clearSeatsOnTripDateChange'
import { populateFromAndTo } from './hooks/populateFromAndTo'

export const Tickets: CollectionConfig = {
  slug: 'tickets',
  enableQueryPresets: true,
  admin: {
    useAsTitle: 'ticketNumber',
    defaultColumns: [
      'ticketNumber',
      'passenger',
      'trip',
      'date',
      'isPaid',
      'totalPrice',
      'createdAt',
    ],
    listSearchableFields: [
      'ticketNumber',
      'passenger.fullName',
      'trip.name',
      'fromTerminalName',
      'toTerminalName',
    ],
    pagination: {
      defaultLimit: 50,
      limits: [10, 25, 50, 100, 200],
    },
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
      admin: {
        allowCreate: true,
      },
    },
    {
      name: 'trip',
      type: 'relationship',
      relationTo: 'trip-schedules',
      required: true,
      admin: {
        allowEdit: false,
        allowCreate: false,
      },
    },
    // Hidden relationship fields for database queries and joins
    {
      name: 'from',
      type: 'relationship',
      relationTo: 'terminals',
      required: false,
      admin: {
        hidden: true,
        condition: () => false,
      },
      index: true,
    },
    {
      name: 'to',
      type: 'relationship',
      relationTo: 'terminals',
      required: false,
      admin: {
        hidden: true,
        condition: () => false,
      },
      index: true,
    },
    // Denormalized text fields for easy searching and filtering
    {
      name: 'fromTerminalName',
      type: 'text',
      admin: {
        hidden: true,
        condition: () => false,
      },
      index: true,
    },
    {
      name: 'toTerminalName',
      type: 'text',
      admin: {
        hidden: true,
        condition: () => false,
      },
      index: true,
    },
    {
      name: 'date',
      type: 'date',
      required: true,
      validate: validateTripDate,
      index: true,
      admin: {
        date: {
          displayFormat: 'EEE, MMM d, yyyy',
        },
        components: {
          Field: '@/components/TripDateField',
        },
      },
    },
    {
      name: 'bookedSeats',
      type: 'json',
      required: true,
      validate: (value: any) => {
        if (!value || !Array.isArray(value) || value.length === 0) {
          return 'Please select at least one seat'
        }
        return true
      },
      admin: {
        components: {
          Field: '@/components/SeatSelector',
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
      index: true,
    },
    {
      name: 'isPaid',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        position: 'sidebar',
      },
      index: true,
    },
    {
      name: 'isCancelled',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'Mark as cancelled (keeps record but frees seats)',
      },
      index: true,
    },
    {
      name: 'bookedBy',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        hidden: true,
        position: 'sidebar',
      },
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
      clearSeatsOnTripDateChange,
      validateBookedSeats,
      generateUniqueTicket,
      populateBookedBy,
      calculateTotalPrice,
      normalizeDateToMidnight,
      populateFromAndTo,
    ],
  },
}
