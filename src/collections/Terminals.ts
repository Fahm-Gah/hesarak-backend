import type { CollectionConfig } from 'payload'

export const Terminals: CollectionConfig = {
  slug: 'terminals',
  admin: {
    useAsTitle: 'province',
  },
  fields: [
    {
      name: 'province',
      type: 'text',
      required: true,
      unique: false,
    },
    {
      name: 'address',
      type: 'textarea',
      required: true,
    },
  ],
}
