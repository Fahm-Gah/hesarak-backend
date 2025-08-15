import type { CollectionConfig } from 'payload'

import {
  FixedToolbarFeature,
  HeadingFeature,
  HorizontalRuleFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'
import { postsAccess } from '@/access/accessControls'

export const Posts: CollectionConfig = {
  slug: 'posts',
  labels: {
    singular: {
      en: 'Post',
      fa: 'پست',
    },
    plural: {
      en: 'Posts',
      fa: 'پست‌ها',
    },
  },
  access: postsAccess,
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'author', 'updatedAt'],
    group: {
      en: 'Content',
      fa: 'محتوا',
    },
  },
  fields: [
    {
      name: 'title',
      label: {
        en: 'Title',
        fa: 'عنوان',
      },
      type: 'text',
      required: true,
    },
    {
      name: 'image',
      label: {
        en: 'Image',
        fa: 'عکس',
      },
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: {
          en: 'Upload an image for the post',
          fa: 'بارگذاری تصویر برای پست',
        },
      },
    },
    {
      name: 'content',
      type: 'richText',
      editor: lexicalEditor({
        features: ({ rootFeatures }) => {
          return [
            ...rootFeatures,
            HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
            FixedToolbarFeature(),
            InlineToolbarFeature(),
            HorizontalRuleFeature(),
          ]
        },
      }),
      label: false,
      required: true,
    },
    {
      name: 'author',
      label: {
        en: 'Author',
        fa: 'نویسنده',
      },
      type: 'relationship',
      admin: {
        position: 'sidebar',
      },
      relationTo: 'users',
    },
    {
      name: 'publishedAt',
      label: {
        en: 'Published At',
        fa: 'منتشر شده در',
      },
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
        components: {
          Field: '@/components/PersianDatePickerField',
        },
        position: 'sidebar',
      },
      hooks: {
        beforeChange: [
          ({ siblingData, value }) => {
            if (siblingData._status === 'published' && !value) {
              return new Date()
            }
            return value
          },
        ],
      },
    },
  ],
  versions: {
    drafts: {
      autosave: {
        interval: 5000,
      },
      schedulePublish: true,
    },
    maxPerDoc: 50,
  },
}
