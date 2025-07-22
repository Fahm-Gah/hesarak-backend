import type { CollectionConfig } from 'payload'

export const BusTypes: CollectionConfig = {
  slug: 'busTypes',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'capacity', 'updatedAt'],
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      required: false,
      admin: {
        description: 'Image of the bus type',
      },
    },
    { name: 'capacity', type: 'number', required: true },
    {
      name: 'amenities',
      type: 'array',
      fields: [{ name: 'amenity', type: 'text', required: true }],
    },
    {
      name: 'seats',
      type: 'array',
      required: false,
      fields: [
        { name: 'label', type: 'text', required: true },
        { name: 'row', type: 'number', required: false },
        { name: 'col', type: 'number', required: false },
      ],
    },
  ],
}
