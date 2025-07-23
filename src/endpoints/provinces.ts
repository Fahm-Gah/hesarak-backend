import type { PayloadRequest, Endpoint } from 'payload'
import { getAllProvinces } from '@/services/terminals'

export const provincesEndpoint: Endpoint = {
  path: '/provinces',
  method: 'get',
  handler: async (req: PayloadRequest) => {
    try {
      const provinces = await getAllProvinces(req.payload)

      return Response.json({
        success: true,
        data: provinces,
        total: provinces.length,
      })
    } catch (error) {
      console.error('Error fetching provinces:', error)
      return Response.json(
        {
          success: false,
          error: 'Failed to fetch provinces',
        },
        { status: 500 },
      )
    }
  },
}
