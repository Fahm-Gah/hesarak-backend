import { profilesAccess } from '@/access/accessControls'
import type { CollectionConfig } from 'payload'
import { parsePhoneNumberFromString } from 'libphonenumber-js'

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
      en: 'Bookings & Reservation System',
      fa: 'سیستم بوکینگ و قید کردن تکت',
    },
  },
  hooks: {
    beforeChange: [
      async ({ data }) => {
        // Normalize phone number if provided
        if (data?.phoneNumber) {
          const parsedPhone = parsePhoneNumberFromString(data.phoneNumber, 'AF')
          if (parsedPhone && parsedPhone.isValid()) {
            data.phoneNumber = parsedPhone.format('E.164')
          } else {
            // If the number is not valid for Afghanistan, throw an error
            throw new Error('Invalid phone number format for Afghanistan')
          }
        }
        return data
      },
    ],
  },
  fields: [
    {
      name: 'fullName',
      label: {
        en: 'Full Name',
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
        en: 'Father Name',
        fa: 'نام پدر',
      },
      type: 'text',
      required: false,
      maxLength: 100,
    },
    {
      name: 'phoneNumber',
      label: {
        en: 'Phone Number',
        fa: 'شماره تلفن',
      },
      type: 'text',
      required: false,
    },
    {
      name: 'gender',
      label: {
        en: 'Gender',
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
