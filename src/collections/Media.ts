import { mediaAccess } from '@/access/accessControls'
import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  labels: {
    singular: {
      en: 'Media',
      fa: 'میدیا',
    },
    plural: {
      en: 'Media',
      fa: 'میدیا',
    },
  },
  access: mediaAccess,
  admin: {
    group: {
      en: 'Content',
      fa: 'محتوا',
    },
  },
  fields: [
    {
      name: 'alt',
      label: {
        en: 'alt',
        fa: 'شرح تصویر',
      },
      type: 'text',
      required: true,
    },
  ],
  upload: true,
}
