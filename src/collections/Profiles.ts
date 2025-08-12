import { profilesAccess } from '@/access/accessControl'
import type { CollectionConfig } from 'payload'

export const Profiles: CollectionConfig = {
  slug: 'profiles',
  access: profilesAccess,
  enableQueryPresets: true,
  admin: {
    useAsTitle: 'fullName',
    defaultColumns: ['fullName', 'fatherName', 'phoneNumber', 'gender'],
    group: 'Users & Access',
  },
  fields: [
    {
      name: 'fullName',
      type: 'text',
      required: true,
      minLength: 2,
      maxLength: 100,
    },
    {
      name: 'fatherName',
      type: 'text',
      required: false,
      maxLength: 100,
    },
    {
      name: 'phoneNumber',
      type: 'text',
      required: false,
    },
    {
      name: 'gender',
      type: 'select',
      options: [
        { label: 'Male', value: 'male' },
        { label: 'Female', value: 'female' },
      ],
      required: false,
      defaultValue: 'male',
    },
  ],
}
