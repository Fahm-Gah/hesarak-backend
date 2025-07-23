import type { PayloadRequest, Endpoint } from 'payload'
import { searchTrips } from '@/services/tripSearch'
import { validateSearchParams } from '@/validators/tripSearch'

export const availableTripsEndpoint: Endpoint = {
  path: '/available-trips',
  method: 'get',
  handler: async (req: PayloadRequest) => {
    // Validate request parameters
    const validation = validateSearchParams(req.query)
    if (!validation.success) {
      return Response.json(validation, { status: 400 })
    }

    // Search for trips
    const result = await searchTrips(req.payload, validation.data!)

    // Return appropriate status code
    const statusCode = result.success ? 200 : 500
    return Response.json(result, { status: statusCode })
  },
}
