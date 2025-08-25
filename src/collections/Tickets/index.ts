import type { CollectionConfig } from 'payload'
import { generateUniqueTicket } from './hooks/generateUniqueTicket'
import { populateBookedBy } from './hooks/populateBookedBy'
import { calculateTotalPrice } from './hooks/calculateTotalPrice'
import { validateBookedSeats } from './hooks/validateBookedSeats'
import { normalizeDateToMidnight } from './hooks/normalizeDateToMidnight'
import { validateTicketDate } from './hooks/validateTicketDate'
import { clearSeatsOnTripDateChange } from './hooks/clearSeatsOnTripDateChange'
import { populateFromAndTo } from './hooks/populateFromAndTo'
import { populatePaymentDeadline } from './hooks/populatePaymentDeadline'
import { computeTicketStatus } from './hooks/computeTicketStatus'
import { ticketsAccess } from '@/access/accessControls'

export const Tickets: CollectionConfig = {
  slug: 'tickets',
  labels: {
    singular: {
      en: 'Ticket',
      fa: 'تکت',
    },
    plural: {
      en: 'Tickets',
      fa: 'تکت‌ها',
    },
  },
  access: ticketsAccess,
  enableQueryPresets: true,
  admin: {
    useAsTitle: 'ticketNumber',
    defaultColumns: ['passenger', 'trip', 'date', 'isPaid', 'totalPrice', 'createdAt', 'bookedBy'],
    listSearchableFields: [
      'passenger.fullName',
      'ticketNumber',
      'fromTerminalName',
      'toTerminalName',
    ],
    pagination: {
      defaultLimit: 10,
      limits: [10, 25, 50, 100, 200],
    },
    group: {
      en: 'Bookings & Reservation System',
      fa: 'سیستم بوکینگ و قید کردن تکت',
    },
  },
  disableDuplicate: true,
  fields: [
    {
      name: 'ticketNumber',
      label: {
        en: 'Ticket Number',
        fa: 'شماره تکت',
      },
      type: 'text',
      unique: true,
      admin: {
        hidden: true,
        position: 'sidebar',
      },
    },
    {
      name: 'passenger',
      label: {
        en: 'Passenger',
        fa: 'مسافر',
      },
      type: 'relationship',
      relationTo: 'profiles',
      required: true,
      admin: {
        allowCreate: true,
        components: {
          Field: '@/components/ProfileSelectorField',
        },
      },
    },
    {
      name: 'trip',
      label: {
        en: 'Trip',
        fa: 'سفر',
      },
      type: 'relationship',
      relationTo: 'trip-schedules',
      required: true,
      admin: {
        allowEdit: false,
        allowCreate: false,
      },
    },
    // Hidden relationship fields for database queries and joins
    {
      name: 'from',
      label: {
        en: 'From',
        fa: 'مبدأ',
      },
      type: 'relationship',
      relationTo: 'terminals',
      required: false,
      admin: {
        hidden: true,
        condition: () => false,
      },
      index: true,
    },
    {
      name: 'to',
      label: {
        en: 'To',
        fa: 'مقصد',
      },
      type: 'relationship',
      relationTo: 'terminals',
      required: false,
      admin: {
        hidden: true,
        condition: () => false,
      },
      index: true,
    },
    // Denormalized text fields for easy searching and filtering
    {
      name: 'fromTerminalName',
      type: 'text',
      admin: {
        hidden: true,
        condition: () => false,
      },
      index: true,
    },
    {
      name: 'toTerminalName',
      type: 'text',
      admin: {
        hidden: true,
        condition: () => false,
      },
      index: true,
    },
    {
      name: 'date',
      label: {
        en: 'Date',
        fa: 'تاریخ',
      },
      type: 'date',
      required: true,
      validate: validateTicketDate,
      index: true,
      admin: {
        date: {
          displayFormat: 'EEE, MMM d, yyyy',
        },
        components: {
          Field: '@/components/TripDateField',
        },
      },
    },
    {
      name: 'bookedSeats',
      type: 'json',
      required: true,
      validate: (value: any) => {
        if (!value || !Array.isArray(value) || value.length === 0) {
          return 'Please select at least one seat'
        }
        return true
      },
      admin: {
        components: {
          Field: '@/components/SeatSelector',
        },
        readOnly: true,
      },
    },
    {
      name: 'pricePerTicket',
      label: {
        en: 'Price Per Ticket',
        fa: 'قیمت هر تکت',
      },
      type: 'number',
      admin: {
        description: {
          en: "Override price per seat (leave empty to use the trip's default price)",
          fa: 'قیمت سفارشی برای هر صندلی (خالی بگذارید تا قیمت پیش‌فرض سفر استفاده شود)',
        },
        position: 'sidebar',
      },
    },
    {
      name: 'totalPrice',
      label: {
        en: 'Total Price',
        fa: 'قیمت مجموعه',
      },
      type: 'number',
      admin: {
        readOnly: true,
        description: {
          en: 'Automatically calculated based on seats and price',
          fa: 'به صورت خودکار بر اساس صندلی‌ها و قیمت محاسبه می‌شود',
        },
        position: 'sidebar',
      },
      index: true,
    },
    {
      name: 'isPaid',
      label: {
        en: 'Is Paid',
        fa: 'پرداخت شده',
      },
      type: 'checkbox',
      defaultValue: true,
      admin: {
        position: 'sidebar',
      },
      index: true,
    },
    {
      name: 'isCancelled',
      label: {
        en: 'Is Cancelled',
        fa: 'لغو شده',
      },
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: {
          en: 'Mark as cancelled (keeps record but frees seats)',
          fa: 'علامت‌گذاری به عنوان لغو شده (سابقه حفظ می‌شود اما صندلی‌ها آزاد می‌شوند)',
        },
      },
      index: true,
    },
    {
      name: 'bookedBy',
      label: {
        en: 'Booked By',
        fa: 'لغو شده',
      },
      type: 'relationship',
      relationTo: 'users',
      admin: {
        hidden: true,
        position: 'sidebar',
      },
    },
    {
      name: 'paymentMethod',
      label: {
        en: 'Payment Method',
        fa: 'روش پرداخت',
      },
      type: 'select',
      defaultValue: 'cash',
      options: [
        {
          label: {
            en: 'Cash',
            fa: 'نقد',
          },
          value: 'cash',
        },
        {
          label: {
            en: 'Credit/Debit Card',
            fa: 'کارت اعتباری/نقدی',
          },
          value: 'card',
        },
        {
          label: {
            en: 'Mobile Payment',
            fa: 'پرداخت موبایل',
          },
          value: 'mobile',
        },
      ],
      admin: {
        position: 'sidebar',
        hidden: true,
      },
      index: true,
    },
    {
      name: 'paymentDeadline',
      label: {
        en: 'Payment Deadline',
        fa: 'مهلت پرداخت',
      },
      type: 'date',
      admin: {
        position: 'sidebar',
        condition: (data) => !data.isPaid,
        description: {
          en: 'Payment deadline for online payments (auto-populated if not set)',
          fa: 'مهلت پرداخت برای پرداخت‌های آنلاین (در صورت عدم تنظیم، خودکار پر می‌شود)',
        },
        components: {
          Field: '@/components/PersianDatePickerField',
        },
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
  ],
  hooks: {
    beforeChange: [
      clearSeatsOnTripDateChange,
      validateBookedSeats,
      generateUniqueTicket,
      populateBookedBy,
      normalizeDateToMidnight, // Normalize date first
      populatePaymentDeadline, // Then populate payment deadline with normalized date
      calculateTotalPrice,
      populateFromAndTo,
    ],
    afterRead: [computeTicketStatus],
  },
}
