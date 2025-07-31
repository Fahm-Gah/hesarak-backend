import type { PayloadRequest, Endpoint } from 'payload'

export const getProvinces: Endpoint = {
  path: '/provinces',
  method: 'get',
  handler: async (req: PayloadRequest) => {
    try {
      // Fetch all terminals
      const { docs: terminals } = await req.payload.find({
        collection: 'terminals',
        limit: 100,
        depth: 0,
      })

      // Extract unique provinces
      const provinces = [...new Set(terminals.map((terminal) => terminal.province))]
        .filter(Boolean) // Remove any null/undefined values
        .sort() // Sort alphabetically

      return Response.json(
        {
          success: true,
          data: {
            provinces,
            count: provinces.length,
          },
        },
        { status: 200 },
      )
    } catch (error) {
      console.error('Error fetching provinces:', error)
      return Response.json(
        {
          success: false,
          error: 'An error occurred while fetching provinces',
        },
        { status: 500 },
      )
    }
  },
}
