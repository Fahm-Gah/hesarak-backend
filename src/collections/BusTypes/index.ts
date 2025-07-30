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
      type: 'array',
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true,
          admin: {
            placeholder: 'e.g., AC, WiFi, Phone Charger',
          },
        },
      ],
    },
    {
      name: 'seats',
      type: 'array',
      required: true,
      admin: {
        description: 'Define the complete bus layout including seats, WC, doors, etc.',
      },
      fields: [
        {
          name: 'type',
          type: 'select',
          required: true,
          options: [
            { label: 'Seat', value: 'seat' },
            { label: 'WC', value: 'wc' },
            { label: 'Driver', value: 'driver' },
            { label: 'Door', value: 'door' },
          ],
          defaultValue: 'seat',
        },
        {
          name: 'seatNumber',
          type: 'text',
          required: true,
          admin: {
            condition: (_, siblingData) => siblingData?.type === 'seat',
          },
        },
        {
          name: 'position',
          type: 'group',
          fields: [
            {
              name: 'row',
              type: 'number',
              required: true,
              min: 1,
              admin: {
                description: 'Grid row position LTR',
              },
            },
            {
              name: 'col',
              type: 'number',
              required: true,
              min: 1,
              admin: {
                description: 'Grid column position TTB',
              },
            },
          ],
        },
        {
          name: 'size',
          type: 'group',
          admin: {
            description: 'Size of the element in grid cells',
            condition: (_, siblingData) => siblingData?.type !== 'seat',
          },
          fields: [
            {
              name: 'rowSpan',
              type: 'number',
              defaultValue: 1,
              min: 1,
              max: 5,
              admin: {
                description: 'Number of rows this element spans',
              },
            },
            {
              name: 'colSpan',
              type: 'number',
              defaultValue: 1,
              min: 1,
              max: 5,
              admin: {
                description: 'Number of columns this element spans',
              },
            },
          ],
        },
        {
          name: 'disabled',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description:
              'If checked, this seat will not be bookable by end users through the website',
            condition: (_, siblingData) => siblingData?.type === 'seat',
          },
        },
      ],
    },
    {
      name: 'capacity',
      type: 'number',
      required: true,
      hidden: true,
    },
  ],
  hooks: {
    beforeChange: [calculateCapacity],
  },
}
