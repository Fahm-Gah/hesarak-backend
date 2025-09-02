import { uploadthingStorage } from '@payloadcms/storage-uploadthing'
import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { payloadCloudPlugin } from '@payloadcms/payload-cloud'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'
import { resendAdapter } from '@payloadcms/email-resend'

import { en } from '@payloadcms/translations/languages/en'
import { fa } from '@payloadcms/translations/languages/fa'

import { Users } from './collections/Users'
import { Profiles } from './collections/Profiles'
import { Media } from './collections/Media'
import { Posts } from './collections/Posts'
import { Buses } from './collections/Buses'
import { BusTypes } from './collections/BusTypes'
import { Terminals } from './collections/Terminals'
import { TripSchedules } from './collections/TripSchedules'
import { Tickets } from './collections/Tickets'
import { getProvinces } from './endpoints/provinces'
import { searchTrips } from './endpoints/searchTrips'
import { getTripDetails } from './endpoints/getTripDetails'
import { registerUser } from './endpoints/registerUser'
import { bookTicket } from './endpoints/bookTicket'
import { getUserTickets } from './endpoints/getUserTickets'
import { updateLocation } from './endpoints/updateLocation'
import { getTicketDetails } from './endpoints/getTicketDetails'
import { getPopularRoutes } from './endpoints/getPopularRoutes'
import { contactForm } from './endpoints/contactForm'
import { TripRecords } from './collections/TripRecords'
import { Drivers } from './collections/Drivers'

const getAllowedOrigins = (): string[] => {
  const baseUrls = [
    process.env.NEXT_PUBLIC_SERVER_URL,
    ...(process.env.ALLOWED_ORIGINS?.split(',') || []),
  ]
    .filter(Boolean)
    .map((url) => url?.trim())

  // Add development-specific URLs
  if (process.env.NODE_ENV === 'development') {
    baseUrls.push('http://localhost:3000')
    // Add VPS IP for testing from external devices
    if (process.env.VPS_IP) {
      baseUrls.push(`http://${process.env.VPS_IP}:3000`)
    }
  }

  // Remove duplicates and normalize (remove trailing slashes)
  return [...new Set(baseUrls.map((url) => url?.replace(/\/$/, '') || '').filter(Boolean))]
}

const allowedOrigins = getAllowedOrigins()

// Debug logging to see what origins are being used
console.log('🔍 Environment Variables:')
console.log('  NEXT_PUBLIC_SERVER_URL:', process.env.NEXT_PUBLIC_SERVER_URL)
console.log('  ALLOWED_ORIGINS:', process.env.ALLOWED_ORIGINS)
console.log('  VPS_IP:', process.env.VPS_IP)
console.log('  NODE_ENV:', process.env.NODE_ENV)
console.log('🔍 Final Allowed Origins:', allowedOrigins)

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    timezones: {
      defaultTimezone: 'Asia/Kabul',
    },
  },
  email: resendAdapter({
    defaultFromAddress: 'onboarding@resend.dev',
    defaultFromName: 'Hesarak Panjshir',
    apiKey: process.env.RESEND_API_KEY!,
  }),
  // i18n configuration with Persian as default
  i18n: {
    // Set Persian as the fallback (default) language
    fallbackLanguage: 'fa',
    // Support both Persian and English
    supportedLanguages: {
      fa: fa as any,
      en: en as any,
    },
  },
  collections: [
    Users,
    Profiles,
    Media,
    Posts,
    Buses,
    BusTypes,
    Terminals,
    TripSchedules,
    Tickets,
    TripRecords,
    Drivers,
  ],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: mongooseAdapter({
    url: process.env.DATABASE_URI || '',
  }),
  sharp,
  plugins: [
    payloadCloudPlugin(),
    uploadthingStorage({
      collections: {
        media: true,
      },
      options: {
        token: process.env.UPLOADTHING_TOKEN || '',
        acl: 'public-read',
      },
    }),
  ],
  cors: allowedOrigins,
  csrf: allowedOrigins,
  endpoints: [
    getProvinces,
    searchTrips,
    getTripDetails,
    registerUser,
    bookTicket,
    getUserTickets,
    updateLocation,
    getTicketDetails,
    getPopularRoutes,
    contactForm,
  ],
})
