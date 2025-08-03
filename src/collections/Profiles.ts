import type { CollectionConfig } from 'payload'

export const Profiles: CollectionConfig = {
  slug: 'profiles',
  admin: {
    useAsTitle: 'fullName',
    defaultColumns: ['fullName', 'fatherName', 'phoneNumber', 'gender'],
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
      admin: {
        description: 'Original phone number as entered by user',
        readOnly: true,
      },
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
