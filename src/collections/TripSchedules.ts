import { CollectionConfig } from 'payload'

export const TripSchedules: CollectionConfig = {
  slug: 'tripSchedules',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'busType', 'timeOfDay', 'from', 'to', 'updatedAt'],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description:
          'must be unique across all trip schedules e.g. "VIP | Kabul - Parwaan - Mazaar | 10:00 AM | Daily"',
      },
    },
    {
      name: 'price',
      type: 'number',
      required: true,
      admin: {
        position: 'sidebar',
        description: 'Price per seat',
      },
    },
    {
      name: 'busType',
      type: 'relationship',
      relationTo: 'busTypes',
      required: true,
    },
    {
      name: 'timeOfDay',
      type: 'date',
      admin: { date: { pickerAppearance: 'timeOnly' }, description: 'Departure time (recurring)' },
      required: true,
    },
    { name: 'from', type: 'relationship', relationTo: 'terminals', required: true },
    {
      name: 'stops',
      type: 'array',
      fields: [
        {
          name: 'terminal',
          type: 'relationship',
          relationTo: 'terminals',
          required: true,
        },
        {
          name: 'time',
          type: 'date',
          admin: { date: { pickerAppearance: 'timeOnly' } },
          required: true,
        },
      ],
    },
    {
      name: 'frequency',
      type: 'select',
      options: [
        { label: 'Daily', value: 'daily' },
        { label: 'Specific Days', value: 'specific-days' },
      ],
      defaultValue: 'daily',
      required: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'days',
      type: 'array',
      required: false,
      fields: [
        {
          name: 'day',
          type: 'select',
          options: [
            { label: 'Saturday', value: 'sat' },
            { label: 'Sunday', value: 'sun' },
            { label: 'Monday', value: 'mon' },
            { label: 'Tuesday', value: 'tue' },
            { label: 'Wednesday', value: 'wed' },
            { label: 'Thursday', value: 'thu' },
            { label: 'Friday', value: 'fri' },
          ],
          required: true,
        },
      ],
      admin: {
        condition: (_, { frequency }) => frequency === 'specific-days',
        position: 'sidebar',
      },
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        position: 'sidebar',
      },
    },
  ],
}
