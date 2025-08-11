import type { CollectionConfig } from 'payload'
import { parsePhoneNumberFromString } from 'libphonenumber-js'
import { normalizePhone } from './hooks/normalizePhone'
import { updateLastLogin } from './hooks/updateLastLogin'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['profile', 'email', 'username', 'roles', 'isActive'],
  },
  auth: {
    cookies: {
      sameSite: 'None',
      secure: false,
    },
    loginWithUsername: {
      allowEmailLogin: true,
      requireEmail: false,
    },
    tokenExpiration: 60 * 60 * 24 * 7, // 7 days
    maxLoginAttempts: 5,
    lockTime: 60 * 60 * 2,
  },
  fields: [
    {
      name: 'username',
      label: 'Phone Number',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        description: 'Phone number in E.164 format (automatically normalized to AF)',
      },
      validate: (value: any) => {
        if (!value) return 'Phone number is required'

        if (value.startsWith('+') && /^\+\d{10,15}$/.test(value)) {
          return true
        }

        try {
          const phoneNumber = parsePhoneNumberFromString(value, 'AF')
          if (!phoneNumber || !phoneNumber.isValid()) {
            return 'Please enter a valid Afghan phone number'
          }
          return true
        } catch (error) {
          return 'Invalid phone number format'
        }
      },
    },
    {
      name: 'normalizedPhone',
      type: 'text',
      required: false,
      unique: true,
      index: true,
      admin: {
        readOnly: true,
        description: 'E.164 formatted phone number (auto-generated)',
        position: 'sidebar',
      },
    },
    {
      name: 'profile',
      type: 'relationship',
      relationTo: 'profiles',
      required: false,
      admin: {
        description: 'User profile information',
      },
    },
    {
      name: 'roles',
      type: 'select',
      options: [
        { label: 'Customer', value: 'customer' },
        { label: 'Agent', value: 'agent' },
        { label: 'Driver', value: 'driver' },
        { label: 'Admin', value: 'admin' },
        { label: 'Super Admin', value: 'superadmin' },
        { label: 'Developer', value: 'dev' },
      ],
      defaultValue: 'customer',
      required: true,
      hasMany: true,
      admin: {
        description: 'User roles and permissions',
      },
    },
    {
      name: 'terminal',
      type: 'relationship',
      relationTo: 'terminals',
      required: false,
      hasMany: true,
      admin: {
        condition: (_, { roles }) => roles?.includes('agent'),
        description: 'Terminals where this agent works',
      },
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Whether the user account is active',
      },
    },
    {
      name: 'lastLoginAt',
      type: 'date',
      admin: {
        readOnly: true,
        position: 'sidebar',
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    // Location UI Field for Admin Panel
    {
      name: 'locationDisplay',
      type: 'ui',
      admin: {
        components: {
          Field: '@/components/LocationField',
        },
      },
    },
    // Location tracking fields
    {
      name: 'location',
      type: 'group',
      label: 'Location Information',
      admin: {
        description: 'User location data from browser or IP geolocation',
        condition: () => false, // Hide the raw fields, show only through UI component
      },
      fields: [
        {
          name: 'coordinates',
          type: 'point',
          label: 'Geographic Coordinates',
        },
        {
          name: 'accuracy',
          type: 'number',
          label: 'Location Accuracy (meters)',
        },
        {
          name: 'city',
          type: 'text',
          label: 'City',
        },
        {
          name: 'region',
          type: 'text',
          label: 'Region/State',
        },
        {
          name: 'country',
          type: 'text',
          label: 'Country',
        },
        {
          name: 'countryCode',
          type: 'text',
          label: 'Country Code',
          maxLength: 2,
        },
        {
          name: 'timezone',
          type: 'text',
          label: 'Timezone',
        },
        {
          name: 'source',
          type: 'select',
          label: 'Location Source',
          options: [
            { label: 'Browser Geolocation', value: 'browser' },
            { label: 'IP Geolocation', value: 'ip' },
            { label: 'Manual Entry', value: 'manual' },
          ],
        },
        {
          name: 'ipAddress',
          type: 'text',
          label: 'IP Address',
        },
        {
          name: 'lastUpdated',
          type: 'date',
          label: 'Location Last Updated',
        },
        {
          name: 'permissionGranted',
          type: 'checkbox',
          label: 'Location Permission Granted',
          defaultValue: false,
        },
      ],
    },
    {
      name: 'locationHistory',
      type: 'array',
      label: 'Location History',
      admin: {
        description: 'Historical location data (last 10 entries)',
        hidden: true,
      },
      fields: [
        {
          name: 'coordinates',
          type: 'point',
          label: 'Coordinates',
        },
        {
          name: 'city',
          type: 'text',
          label: 'City',
        },
        {
          name: 'country',
          type: 'text',
          label: 'Country',
        },
        {
          name: 'source',
          type: 'select',
          options: [
            { label: 'Browser', value: 'browser' },
            { label: 'IP', value: 'ip' },
          ],
        },
        {
          name: 'timestamp',
          type: 'date',
          label: 'Recorded At',
        },
      ],
      maxRows: 10,
    },
    {
      name: 'createdAt',
      type: 'date',
      admin: {
        readOnly: true,
        description: 'Account creation date',
        position: 'sidebar',
      },
    },
  ],
  hooks: {
    beforeChange: [normalizePhone],
    afterLogin: [updateLastLogin],
  },
}
