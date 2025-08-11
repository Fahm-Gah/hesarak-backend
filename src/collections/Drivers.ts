import { CollectionConfig } from 'payload'

export const Drivers: CollectionConfig = {
  slug: 'drivers',
  admin: {
    useAsTitle: 'fullName',
    defaultColumns: ['fullName', 'phoneNumber', 'licenseNumber', 'isActive'],
  },
  fields: [
    {
      name: 'fullName',
      type: 'text',
      required: true,
    },
    {
      name: 'fatherName',
      type: 'text',
    },
    {
      name: 'phoneNumber',
      type: 'text',
      required: true,
      unique: true,
    },
    {
      name: 'licenseNumber',
      type: 'text',
      unique: true,
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
    },
  ],
}
