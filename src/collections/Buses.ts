import { busesAccess } from '@/access/accessControls'
import type { CollectionConfig } from 'payload'

export const Buses: CollectionConfig = {
  slug: 'buses',
  labels: {
    singular: {
      en: 'Bus',
      fa: 'بس',
    },
    plural: {
      en: 'Buses',
      fa: 'بس‌ها',
    },
  },
  access: busesAccess,
  admin: {
    useAsTitle: 'number',
    defaultColumns: ['number', 'type'],
    group: {
      en: 'Operations',
      fa: 'عملیات',
    },
  },
  fields: [
    {
      name: 'number',
      label: {
        en: 'Number',
        fa: 'شماره',
      },
      type: 'text',
      required: true,
    },
    {
      name: 'type',
      label: {
        en: 'Type',
        fa: 'نوع',
      },
      type: 'relationship',
      required: true,
      relationTo: 'bus-types',
    },
    {
      name: 'images',
      label: {
        en: 'Images',
        fa: 'عکس ها',
      },
      type: 'upload',
      relationTo: 'media',
      hasMany: true,
      admin: {
        description: {
          en: 'Images of the Bus',
          fa: 'تصاویر بس',
        },
      },
    },
  ],
}
