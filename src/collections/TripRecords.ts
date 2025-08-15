import { fieldAccessAdminOnly, tripRecordsAccess } from '@/access/accessControls'
import { CollectionConfig } from 'payload'

export const TripRecords: CollectionConfig = {
  slug: 'trip-records',
  labels: {
    singular: {
      en: 'Trip Record',
      fa: 'سابقه سفر',
    },
    plural: {
      en: 'Trip Records',
      fa: 'سوابق سفر',
    },
  },
  access: tripRecordsAccess,
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['date', 'driver', 'bus', 'from', 'to', 'commission'],
    group: {
      en: 'Records & Finances',
      fa: 'سوابق و امور مالی',
    },
  },
  fields: [
    {
      name: 'driver',
      label: {
        en: 'Driver',
        fa: 'راننده',
      },
      type: 'relationship',
      relationTo: 'drivers',
      required: true,
    },
    {
      name: 'bus',
      label: {
        en: 'Bus',
        fa: 'بس',
      },
      type: 'relationship',
      relationTo: 'buses',
      required: true,
    },
    {
      name: 'commission',
      label: {
        en: 'Commission',
        fa: 'کمیشن',
      },
      type: 'number',
      required: true,
      access: {
        read: fieldAccessAdminOnly,
        update: fieldAccessAdminOnly,
      },
    },
    {
      name: 'date',
      type: 'date',
      label: {
        en: 'Date',
        fa: 'تاریخ',
      },
      admin: {
        components: {
          Field: '@/components/PersianDatePickerField',
        },
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
  ],
}
