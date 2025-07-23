import type { CollectionConfig } from 'payload'

export const Terminals: CollectionConfig = {
  slug: 'terminals',
  admin: {
    useAsTitle: 'name',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'province',
      type: 'text',
      required: true,
    },
    {
      name: 'address',
      type: 'textarea',
      required: true,
    },
  ],
}
