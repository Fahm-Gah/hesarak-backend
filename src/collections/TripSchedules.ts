import { fieldAccessAdminOnly, tripSchedulesAccess } from '@/access/accessControls'
import { CollectionConfig } from 'payload'

export const TripSchedules: CollectionConfig = {
  slug: 'trip-schedules',
  labels: {
    singular: {
      en: 'Trip Schedule',
      fa: 'برنامه سفر',
    },
    plural: {
      en: 'Trip Schedules',
      fa: 'برنامه سفرها',
    },
  },
  access: tripSchedulesAccess,
  admin: {
    useAsTitle: 'tripName',
    defaultColumns: ['tripName', 'bus', 'departureTime', 'from', 'to', 'price', 'frequency'],
    group: {
      en: 'Operations',
      fa: 'عملیات',
    },
  },
  fields: [
    {
      name: 'tripName',
      label: {
        en: 'Trip Name',
        fa: 'نام سفر',
      },
      type: 'text',
      required: true,
      unique: false,
      admin: {
        description: {
          en: '"VIP | Kabul - Parwaan - Mazaar | 10:00 AM | Daily"',
          fa: '"VIP | کابل - پروان - مزار | 10:00 صبح | روزانه"',
        },
      },
    },
    {
      name: 'price',
      label: {
        en: 'Price',
        fa: 'قیمت',
      },
      type: 'number',
      required: true,
      admin: {
        position: 'sidebar',
        description: {
          en: 'Price per seat',
          fa: 'قیمت هر صندلی',
        },
      },
      access: {
        update: fieldAccessAdminOnly,
      },
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
      name: 'departureTime',
      label: {
        en: 'Departure Time',
        fa: 'زمان حرکت',
      },
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'timeOnly',
        },
        components: {
          Field: '@/components/PersianDatePickerField',
        },
        description: {
          en: 'Departure time (recurring)',
          fa: 'زمان حرکت (تکرار شونده)',
        },
      },
      required: true,
    },
    {
      name: 'from',
      label: {
        en: 'From',
        fa: 'مبدأ',
      },
      type: 'relationship',
      relationTo: 'terminals',
      required: true,
    },
    {
      name: 'stops',
      label: {
        en: 'Stops',
        fa: 'ایستگاه‌ها',
      },
      labels: {
        singular: {
          en: 'Stop',
          fa: 'ایستگاه‌',
        },
        plural: {
          en: 'Stops',
          fa: 'ایستگاه‌ها',
        },
      },
      type: 'array',
      fields: [
        {
          name: 'terminal',
          label: {
            en: 'Terminal',
            fa: 'ترمینال',
          },
          type: 'relationship',
          relationTo: 'terminals',
          required: true,
        },
        {
          name: 'time',
          label: {
            en: 'Time',
            fa: 'زمان',
          },
          type: 'date',
          admin: {
            date: {
              pickerAppearance: 'timeOnly',
            },
            components: {
              Field: '@/components/PersianDatePickerField',
            },
          },
          required: true,
        },
      ],
    },
    {
      name: 'frequency',
      label: {
        en: 'Frequency',
        fa: 'فرکانس',
      },
      type: 'select',
      options: [
        { label: { en: 'Daily', fa: 'روزانه', dr: 'روزانه' }, value: 'daily' },
        {
          label: { en: 'Specific Days', fa: 'روزهای خاص', dr: 'روزهای خاص' },
          value: 'specific-days',
        },
      ],
      defaultValue: 'daily',
      required: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'days',
      label: {
        en: 'Days',
        fa: 'روزها',
      },
      type: 'select',
      options: [
        { label: { en: 'Saturday', fa: 'شنبه' }, value: 'sat' },
        { label: { en: 'Sunday', fa: 'یکشنبه' }, value: 'sun' },
        { label: { en: 'Monday', fa: 'دوشنبه' }, value: 'mon' },
        { label: { en: 'Tuesday', fa: 'سه‌شنبه' }, value: 'tue' },
        { label: { en: 'Wednesday', fa: 'چهارشنبه' }, value: 'wed' },
        { label: { en: 'Thursday', fa: 'پنج‌شنبه' }, value: 'thu' },
        { label: { en: 'Friday', fa: 'جمعه' }, value: 'fri' },
      ],
      required: true,
      hasMany: true,
      admin: {
        condition: (_, { frequency }) => frequency === 'specific-days',
        position: 'sidebar',
      },
    },
    {
      name: 'isActive',
      label: {
        en: 'Is Active',
        fa: 'فعال',
      },
      type: 'checkbox',
      defaultValue: true,
      admin: {
        position: 'sidebar',
      },
      access: {
        update: fieldAccessAdminOnly,
      },
    },
  ],
}
