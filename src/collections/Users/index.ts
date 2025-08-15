import type { CollectionConfig } from 'payload'
import { parsePhoneNumberFromString } from 'libphonenumber-js'
import { normalizePhone } from './hooks/normalizePhone'
import { updateLastLogin } from './hooks/updateLastLogin'
import { fieldAccessSuperAdminOnly, usersAccess } from '@/access/accessControls'

export const Users: CollectionConfig = {
  slug: 'users',
  labels: {
    singular: {
      en: 'User',
      fa: 'کاربر',
    },
    plural: {
      en: 'Users',
      fa: 'کاربران',
    },
  },
  access: usersAccess,
  enableQueryPresets: true,
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['profile', 'email', 'username', 'roles', 'isActive'],
    group: {
      en: 'Users & Access',
      fa: 'کاربران و دسترسی',
    },
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
      label: {
        en: 'Phone Number',
        fa: 'شماره تلفن',
      },
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        description: {
          en: 'Phone number in E.164 format (automatically normalized to AF)',
          fa: 'شماره تلفن به فرمت E.164 (به صورت خودکار به AF نرمال می‌شود)',
        },
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
        hidden: true,
        description: {
          en: 'E.164 formatted phone number (auto-generated)',
          fa: 'شماره تلفن به فرمت E.164 (تولید خودکار)',
        },
        position: 'sidebar',
      },
    },
    {
      name: 'profile',
      label: {
        en: 'Profile',
        fa: 'پروفایل',
      },
      type: 'relationship',
      relationTo: 'profiles',
      required: false,
      admin: {
        description: {
          en: 'User profile information',
          fa: 'اطلاعات پروفایل کاربر',
        },
      },
    },
    {
      name: 'roles',
      label: {
        en: 'Roles',
        fa: 'وظایف',
      },
      type: 'select',
      options: [
        { label: { en: 'Customer', fa: 'مشتری' }, value: 'customer' },
        { label: { en: 'Editor', fa: 'ویرایشگر' }, value: 'editor' },
        { label: { en: 'Agent', fa: 'نماینده' }, value: 'agent' },
        { label: { en: 'Driver', fa: 'راننده' }, value: 'driver' },
        { label: { en: 'Admin', fa: 'مدیر' }, value: 'admin' },
        { label: { en: 'Super Admin', fa: 'مدیر ارشد' }, value: 'superadmin' },
        { label: { en: 'Developer', fa: 'مدیر وب سایت' }, value: 'dev' },
      ],
      defaultValue: 'customer',
      required: true,
      hasMany: true,
      admin: {
        description: {
          en: 'User roles and permissions',
          fa: 'نقش‌ها و دسترسی‌های کاربر',
        },
      },
      // Only admins can change roles
      access: {
        create: fieldAccessSuperAdminOnly,
        update: fieldAccessSuperAdminOnly,
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
        description: {
          en: 'Whether the user account is active',
          fa: 'آیا حساب کاربری فعال است',
        },
      },
      // Only admins can activate/deactivate users
      access: {
        create: fieldAccessSuperAdminOnly,
        update: fieldAccessSuperAdminOnly,
      },
    },
    {
      name: 'lastLoginAt',
      label: {
        en: 'Last Login At',
        fa: 'آخرین ورود در',
      },
      type: 'date',
      admin: {
        readOnly: true,
        position: 'sidebar',
        date: {
          pickerAppearance: 'dayAndTime',
        },
        components: {
          Field: '@/components/PersianDatePickerField',
        },
      },
    },
    // Location UI Field for Admin Panel
    {
      name: 'locationDisplay',
      type: 'ui',
      admin: {
        components: {
          Field: '@/components/UserLocation',
        },
        condition: (data, siblingData, { user }: any) => {
          if (!user) return false
          if (typeof user === 'string') return false
          const roles = Array.isArray(user.roles) ? user.roles : []
          return roles.includes('superadmin') || roles.includes('dev')
        },
      },
    },
    // Location tracking fields
    {
      name: 'location',
      type: 'group',
      label: {
        en: 'Location Information',
        fa: 'اطلاعات موقعیت',
      },
      admin: {
        description: {
          en: 'User location data from browser or IP geolocation',
          fa: 'داده‌های موقعیت کاربر از مرورگر یا موقعیت IP',
        },
        // condition: () => false, // Hide the raw fields
      },
      // Only the user themselves or admins can view location data
      access: {
        read: fieldAccessSuperAdminOnly,
        update: fieldAccessSuperAdminOnly,
      },
      fields: [
        {
          name: 'coordinates',
          type: 'point',
          label: {
            en: 'Geographic Coordinates',
            fa: 'مختصات جغرافیایی',
          },
        },
        {
          name: 'accuracy',
          type: 'number',
          label: {
            en: 'Location Accuracy (meters)',
            fa: 'دقت موقعیت (متر)',
          },
        },
        {
          name: 'city',
          type: 'text',
          label: {
            en: 'City',
            fa: 'شهر',
          },
        },
        {
          name: 'region',
          type: 'text',
          label: {
            en: 'Region/State',
            fa: 'منطقه/ولایت',
          },
        },
        {
          name: 'country',
          type: 'text',
          label: {
            en: 'Country',
            fa: 'کشور',
          },
        },
        {
          name: 'countryCode',
          type: 'text',
          label: {
            en: 'Country Code',
            fa: 'کد کشور',
          },
          maxLength: 2,
        },
        {
          name: 'timezone',
          type: 'text',
          label: {
            en: 'Timezone',
            fa: 'منطقه زمانی',
          },
        },
        {
          name: 'source',
          type: 'select',
          label: {
            en: 'Location Source',
            fa: 'منبع موقعیت',
          },
          options: [
            { label: { en: 'Browser Geolocation', fa: 'موقعیت مرورگر' }, value: 'browser' },
            { label: { en: 'IP Geolocation', fa: 'موقعیت IP' }, value: 'ip' },
            { label: { en: 'Manual Entry', fa: 'ورود دستی' }, value: 'manual' },
          ],
        },
        {
          name: 'ipAddress',
          type: 'text',
          label: {
            en: 'IP Address',
            fa: 'آدرس IP',
          },
        },
        {
          name: 'lastUpdated',
          type: 'date',
          admin: {
            components: {
              Field: '@/components/PersianDatePickerField',
            },
            date: {
              pickerAppearance: 'dayAndTime',
            },
            readOnly: true,
          },
          label: {
            en: 'Location Last Updated',
            fa: 'آخرین بروزرسانی موقعیت',
          },
        },
        {
          name: 'permissionGranted',
          type: 'checkbox',
          label: {
            en: 'Location Permission Granted',
            fa: 'اجازه موقعیت داده شده',
          },
          defaultValue: false,
        },
      ],
    },
    {
      name: 'locationHistory',
      type: 'array',
      label: {
        en: 'Location History',
        fa: 'تاریخچه موقعیت',
      },
      admin: {
        description: {
          en: 'Historical location data (last 10 entries)',
          fa: 'داده‌های تاریخی موقعیت (آخرین ۱۰ مورد)',
        },
        hidden: true,
      },
      // Only admins can view location history
      access: {
        read: fieldAccessSuperAdminOnly,
        create: fieldAccessSuperAdminOnly,
        update: fieldAccessSuperAdminOnly,
      },
      fields: [
        {
          name: 'coordinates',
          type: 'point',
          label: {
            en: 'Coordinates',
            fa: 'مختصات',
          },
        },
        {
          name: 'city',
          type: 'text',
          label: {
            en: 'City',
            fa: 'شهر',
          },
        },
        {
          name: 'country',
          type: 'text',
          label: {
            en: 'Country',
            fa: 'کشور',
          },
        },
        {
          name: 'source',
          type: 'select',
          options: [
            { label: { en: 'Browser', fa: 'مرورگر' }, value: 'browser' },
            { label: { en: 'IP', fa: 'IP' }, value: 'ip' },
          ],
        },
        {
          name: 'timestamp',
          type: 'date',
          label: {
            en: 'Recorded At',
            fa: 'ثبت شده در',
          },
          admin: {
            components: {
              Field: '@/components/TripDateField',
            },
            date: {
              pickerAppearance: 'dayAndTime',
            },
          },
        },
      ],
      maxRows: 10,
    },
  ],
  hooks: {
    beforeChange: [normalizePhone],
    afterLogin: [updateLastLogin],
  },
}
