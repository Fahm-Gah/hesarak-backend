import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'fullname', 'fatherName', 'role', 'isActive'],
  },
  auth: true,
  fields: [
    {
      name: 'profile',
      type: 'relationship',
      relationTo: 'profiles',
      required: false,
    },
    {
      name: 'roles',
      type: 'select',
      options: [
        { label: 'Customer', value: 'customer' },
        { label: 'Agent', value: 'agent' },
        { label: 'Driver', value: 'driver' },
        { label: 'Admin', value: 'admin' },
        { label: 'Super Admin', value: 'superadmin' },
      ],
      defaultValue: 'customer',
      required: true,
      hasMany: true,
    },
    {
      name: 'terminal',
      type: 'relationship',
      relationTo: 'terminals',
      required: false,
      hasMany: true,
      admin: {
        condition: (_, { roles }) => roles.includes('agent'),
        description: 'Terminal where this agent works',
      },
    },
  ],
}
