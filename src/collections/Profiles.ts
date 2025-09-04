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
    afterRead: [
      async ({ doc, req }) => {
        // Find user associated with this profile if any
        try {
          const payload = req.payload
          const userResult = await payload.find({
            collection: 'users',
            where: {
              profile: { equals: doc.id },
            },
            depth: 0,
            limit: 1,
          })

          if (userResult.docs.length > 0) {
            // Add user information to the profile
            doc.user = userResult.docs[0]
          }
        } catch (error) {
          // Silently fail if we can't fetch the user
          console.error('Failed to fetch user for profile:', error)
        }

        return doc
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
