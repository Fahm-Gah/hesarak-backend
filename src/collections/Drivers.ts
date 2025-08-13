import { driversAccess, fieldAccessAdminOnly } from '@/access/accessControls'
import { CollectionConfig } from 'payload'

export const Drivers: CollectionConfig = {
  slug: 'drivers',
  labels: {
    singular: {
      en: 'Driver',
      fa: 'راننده',
    },
    plural: {
      en: 'Drivers',
      fa: 'رانندگان',
    },
  },
  access: driversAccess,
  admin: {
    useAsTitle: 'fullName',
    defaultColumns: ['fullName', 'phoneNumber', 'licenseNumber', 'isActive'],
    group: {
      en: 'Records & Finances',
      fa: 'سوابق و امور مالی',
    },
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
    },
    {
      name: 'fatherName',
      label: {
        en: 'Father Name',
        fa: 'نام پدر',
      },
      type: 'text',
    },
    {
      name: 'phoneNumber',
      label: {
        en: 'Phone Number',
        fa: 'شماره تلفن',
      },
      type: 'text',
      required: true,
      unique: true,
    },
    {
      name: 'licenseNumber',
      label: {
        en: 'License Number',
        fa: 'شماره لایسنس',
      },
      type: 'text',
      unique: true,
    },
    {
      name: 'isActive',
      label: {
        en: 'Is Active',
        fa: 'فعال',
      },
      type: 'checkbox',
      defaultValue: true,
      access: {
        update: fieldAccessAdminOnly,
      },
    },
  ],
}
