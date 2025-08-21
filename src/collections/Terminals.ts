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
        en: 'Name',
        fa: 'نام',
      },
      type: 'text',
      required: true,
      unique: false,
    },
    {
      name: 'province',
      label: {
        en: 'Province',
        fa: 'ولایت',
      },
      type: 'text',
      required: true,
    },
    {
      name: 'address',
      label: {
        en: 'Address',
        fa: 'آدرس',
      },
      type: 'textarea',
      required: true,
    },
  ],
}
