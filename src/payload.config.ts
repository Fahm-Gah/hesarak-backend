import { uploadthingStorage } from '@payloadcms/storage-uploadthing'
import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { payloadCloudPlugin } from '@payloadcms/payload-cloud'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

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
import { TripRecords } from './collections/TripRecords'
import { Drivers } from './collections/Drivers'

const allowedOrigins = [
  'http://localhost:3000',
  'https://hesarak-backend.vercel.app',
  'https://gheyasi.com',
]

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
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
  ],
})
