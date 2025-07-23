import { uploadthingStorage } from '@payloadcms/storage-uploadthing'
import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { payloadCloudPlugin } from '@payloadcms/payload-cloud'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Posts } from './collections/Posts'
import { BusTypes } from './collections/BusTypes'
import { Terminals } from './collections/Terminals'
import { TripSchedules } from './collections/TripSchedules'
import { Tickets } from './collections/Tickets'
import { availableTripsEndpoint } from './endpoints/availableTrips'
import { provincesEndpoint } from './endpoints/provinces'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Users, Media, Posts, BusTypes, Terminals, TripSchedules, Tickets],
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
        media: true, // Apply to 'media' collection
      },
      options: {
        token: process.env.UPLOADTHING_TOKEN || '',
        acl: 'public-read', // This is optional
      },
    }),
  ],
  cors: {
    origins: [
      'http://localhost:3000', // local dev
      '*', // Allow all origins
    ],
  },
  endpoints: [availableTripsEndpoint, provincesEndpoint],
})
