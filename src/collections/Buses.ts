import { busesAccess } from '@/access/accessControl'
import type { CollectionConfig } from 'payload'

export const Buses: CollectionConfig = {
  slug: 'buses',
  access: busesAccess,
  admin: {
    useAsTitle: 'number',
    defaultColumns: ['number', 'type'],
    group: 'Operations',
  },
  fields: [
    {
      name: 'number',
      type: 'text',
      required: true,
    },
    {
      name: 'type',
      type: 'relationship',
      required: true,
      relationTo: 'bus-types',
    },
    {
      name: 'images',
      type: 'upload',
      relationTo: 'media',
      hasMany: true,
      admin: {
        description: 'Images of the Bus',
      },
    },
  ],
}
