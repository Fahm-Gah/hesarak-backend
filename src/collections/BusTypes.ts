import type { CollectionConfig } from 'payload'

export const BusTypes: CollectionConfig = {
  slug: 'bus-types',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'capacity', 'updatedAt'],
  },
  hooks: {
    beforeChange: [
      ({ data }) => {
        // Automatically calculate capacity from seats array
        if (data.seats && Array.isArray(data.seats)) {
          data.capacity = data.seats.length
        } else {
          data.capacity = 0
        }
        return data
      },
    ],
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
    {
      name: 'amenities',
      type: 'array',
      fields: [{ name: 'name', type: 'text', required: true }],
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
    {
      name: 'capacity',
      type: 'number',
      required: true,
      admin: {
        readOnly: true,
        description: 'Automatically calculated from the number of seats',
      },
    },
  ],
}
