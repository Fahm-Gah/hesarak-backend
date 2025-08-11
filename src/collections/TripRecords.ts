import { CollectionConfig } from 'payload'

export const TripRecords: CollectionConfig = {
  slug: 'trip-records',
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['date', 'driver', 'bus', 'from', 'to', 'commission'],
  },
  fields: [
    {
      name: 'driver',
      type: 'relationship',
      relationTo: 'drivers',
      required: true,
    },
    {
      name: 'bus',
      type: 'relationship',
      relationTo: 'buses',
      required: true,
    },
    {
      name: 'commission',
      type: 'number',
      required: true,
    },
    {
      name: 'date',
      type: 'date',
      required: true,
    },
    {
      name: 'from',
      type: 'relationship',
      relationTo: 'terminals',
      required: true,
    },
    {
      name: 'to',
      type: 'relationship',
      relationTo: 'terminals',
      required: true,
    },
  ],
}
