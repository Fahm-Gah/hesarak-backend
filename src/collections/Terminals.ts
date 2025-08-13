import { terminalsAccess } from '@/access/accessControls'
import type { CollectionConfig } from 'payload'

export const Terminals: CollectionConfig = {
  slug: 'terminals',
  labels: {
    singular: {
      en: 'Terminal',
      fa: 'ترمینال',
    },
    plural: {
      en: 'Terminals',
      fa: 'ترمینال‌ها',
    },
  },
  access: terminalsAccess,
  admin: {
    useAsTitle: 'name',
    group: {
      en: 'Operations',
      fa: 'عملیات',
    },
  },
  fields: [
    {
      name: 'name',
      label: {
        en: 'name',
        fa: 'نام',
      },
      type: 'text',
      required: true,
    },
    {
      name: 'province',
      label: {
        en: 'province',
        fa: 'ولایت',
      },
      type: 'text',
      required: true,
    },
    {
      name: 'address',
      label: {
        en: 'address',
        fa: 'آدرس',
      },
      type: 'textarea',
      required: true,
    },
  ],
}
