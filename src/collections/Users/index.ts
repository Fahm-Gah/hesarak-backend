import type { CollectionConfig } from 'payload'
import { parsePhoneNumberFromString } from 'libphonenumber-js'
import { normalizePhone } from './hooks/normalizePhone'
import { updateLastLogin } from './hooks/updateLastLogin'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['profile', 'email', 'username', 'roles', 'isActive'],
    description: 'User accounts with phone-based authentication',
  },
  auth: {
    loginWithUsername: {
      allowEmailLogin: true, // Users can login with email or phone
      requireEmail: false, // Email is not required for username login
    },
    tokenExpiration: 60 * 60 * 24 * 7, // 7 days
    maxLoginAttempts: 5,
    lockTime: 60 * 60 * 2, // 2 hours lockout after max attempts
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

        // Check if it's already in E.164 format (from hook normalization)
        if (value.startsWith('+') && /^\+\d{10,15}$/.test(value)) {
          return true
        }

        // Otherwise validate as Afghan phone number
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
          displayFormat: 'DD/MM/YYYY HH:mm',
        },
      },
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
