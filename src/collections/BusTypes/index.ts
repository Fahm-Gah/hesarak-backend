import type { CollectionConfig } from 'payload'
import { calculateCapacity } from './hooks/calculateCapacity'
import { busTypesAccess } from '@/access/accessControls'

export const BusTypes: CollectionConfig = {
  slug: 'bus-types',
  labels: {
    singular: {
      en: 'Bus Type',
      fa: 'نوع بس',
    },
    plural: {
      en: 'Bus Types',
      fa: 'انواع بس',
    },
  },
  access: busTypesAccess,
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'capacity', 'amenities', 'updatedAt'],
    group: {
      en: 'Operations',
      fa: 'عملیات',
    },
  },
  fields: [
    {
      name: 'name',
      label: {
        en: 'Name',
        fa: 'نام',
      },
      type: 'text',
      required: true,
      admin: {
        description: {
          en: 'Name of the bus type (e.g., "VIP 2+1", "Standard 2+2")',
          fa: 'نام نوع بس (مثلاً "VIP 2+1", "استاندارد 2+2")',
        },
      },
    },
    {
      name: 'amenities',
      label: {
        en: 'Amenities',
        fa: 'امکانات',
      },
      type: 'text',
      hasMany: true,
    },
    {
      name: 'seats',
      label: {
        en: 'Seats',
        fa: 'صندلی ها',
      },
      type: 'json',
      required: true,
      admin: {
        components: {
          Field: '@/components/SeatLayoutDesigner',
        },
      },
    },
    {
      name: 'capacity',
      label: {
        en: 'Capacity',
        fa: 'ظرفیت',
      },
      type: 'number',
      admin: {
        hidden: true,
      },
    },
  ],
  hooks: {
    beforeChange: [calculateCapacity],
  },
}
