import { profilesAccess } from '@/access/accessControls'
import type { CollectionConfig } from 'payload'
import { normalizePhone } from './hooks/normalizePhone'
import { attachUser } from './hooks/attachUser'
import { validatePhoneNumber } from './validation'

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
    beforeChange: [normalizePhone],
    afterRead: [attachUser],
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
      validate: validatePhoneNumber,
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
