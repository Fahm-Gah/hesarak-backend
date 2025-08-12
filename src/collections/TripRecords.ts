import { fieldAccessAdminOnly, tripRecordsAccess } from '@/access/accessControl'
import { CollectionConfig } from 'payload'

export const TripRecords: CollectionConfig = {
  slug: 'trip-records',
  access: tripRecordsAccess,
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['date', 'driver', 'bus', 'from', 'to', 'commission'],
    group: 'Operations',
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
      access: {
        read: fieldAccessAdminOnly,
        update: fieldAccessAdminOnly,
      },
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
