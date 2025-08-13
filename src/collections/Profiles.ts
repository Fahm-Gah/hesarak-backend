import { profilesAccess } from '@/access/accessControls'
import type { CollectionConfig } from 'payload'

export const Profiles: CollectionConfig = {
  slug: 'profiles',
  labels: {
    singular: {
      en: 'Profile',
      fa: 'پروفایل',
    },
    plural: {
      en: 'Profiles',
      fa: 'پروفایل‌ها',
    },
  },
  access: profilesAccess,
  enableQueryPresets: true,
  admin: {
    useAsTitle: 'fullName',
    defaultColumns: ['fullName', 'fatherName', 'phoneNumber', 'gender'],
    group: {
      en: 'Bookings',
      fa: 'رزروها',
    },
  },
  fields: [
    {
      name: 'fullName',
      label: {
        en: 'full name',
        fa: 'نام کامل',
      },
      type: 'text',
      required: true,
      minLength: 2,
      maxLength: 100,
    },
    {
      name: 'fatherName',
      label: {
        en: 'father name',
        fa: 'نام پدر',
      },
      type: 'text',
      required: false,
      maxLength: 100,
    },
    {
      name: 'phoneNumber',
      label: {
        en: 'phone number',
        fa: 'شماره تلفن',
      },
      type: 'text',
      required: false,
    },
    {
      name: 'gender',
      label: {
        en: 'gender',
        fa: 'جنسیت',
      },
      type: 'select',
      options: [
        { label: { en: 'Male', fa: 'مرد' }, value: 'male' },
        { label: { en: 'Female', fa: 'زن' }, value: 'female' },
      ],
      required: false,
      defaultValue: 'male',
    },
  ],
}
