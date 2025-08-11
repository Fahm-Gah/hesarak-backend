import type { CollectionConfig } from 'payload'
import { calculateCapacity } from './hooks/calculateCapacity'

export const BusTypes: CollectionConfig = {
  slug: 'bus-types',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'capacity', 'updatedAt'],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      admin: {
        description: 'Name of the bus type (e.g., "VIP 2+1", "Standard 2+2")',
      },
    },
    {
      name: 'amenities',
      type: 'text',
      hasMany: true,
    },
    {
      name: 'seats',
      type: 'json',
      required: true,
      admin: { components: { Field: '/components/SeatLayoutDesigner' } },
    },
    {
      name: 'capacity',
      type: 'number',
      admin: { hidden: true },
    },
  ],
  hooks: {
    beforeChange: [calculateCapacity],
  },
}
