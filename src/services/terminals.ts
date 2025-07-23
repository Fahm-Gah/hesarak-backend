import { Terminal } from '@/payload-types'
import type { PayloadRequest } from 'payload'

export const findTerminalsByProvince = async (
  payload: PayloadRequest['payload'],
  province: string,
): Promise<Terminal[]> => {
  if (!province?.trim()) {
    throw new Error('Province parameter is required')
  }

  try {
    const result = await payload.find({
      collection: 'terminals',
      where: {
        province: {
          like: province.toLowerCase().trim(),
        },
      },
      limit: 100,
    })

    return result.docs as Terminal[]
  } catch (error) {
    console.error(`Error finding terminals in province ${province}:`, error)
    throw new Error(`Failed to find terminals in province: ${province}`)
  }
}

export const getAllProvinces = async (payload: PayloadRequest['payload']): Promise<string[]> => {
  try {
    const terminals = await payload.find({
      collection: 'terminals',
      select: {
        province: true, // Only select province field for better performance
      },
      limit: 1000,
    })

    const provinces = [
      ...new Set(
        terminals.docs
          .map((terminal) => terminal.province)
          .filter((province): province is string => Boolean(province?.trim())),
      ),
    ]

    return provinces.sort()
  } catch (error) {
    console.error('Error fetching all provinces:', error)
    throw new Error('Failed to fetch provinces')
  }
}

export const getTerminalById = async (
  payload: PayloadRequest['payload'],
  id: string,
): Promise<Terminal> => {
  if (!id?.trim()) {
    throw new Error('Terminal ID is required')
  }

  try {
    const terminal = await payload.findByID({
      collection: 'terminals',
      id: id.trim(),
    })

    if (!terminal) {
      throw new Error(`Terminal not found with ID: ${id}`)
    }

    return terminal as Terminal
  } catch (error) {
    if (error instanceof Error && error.message.includes('not found')) {
      throw error // Re-throw our custom error
    }
    console.error(`Error finding terminal by ID ${id}:`, error)
    throw new Error(`Failed to find terminal with ID: ${id}`)
  }
}

export const findTerminalsByIds = async (
  payload: PayloadRequest['payload'],
  ids: string[],
): Promise<Terminal[]> => {
  if (!ids?.length) {
    return []
  }

  try {
    const result = await payload.find({
      collection: 'terminals',
      where: {
        id: {
          in: ids.filter((id) => id?.trim()), // Filter out empty IDs
        },
      },
      limit: ids.length,
    })

    return result.docs as Terminal[]
  } catch (error) {
    console.error('Error finding terminals by IDs:', error)
    throw new Error('Failed to find terminals by IDs')
  }
}

export const searchTerminals = async (
  payload: PayloadRequest['payload'],
  searchTerm: string,
  limit = 50,
): Promise<Terminal[]> => {
  if (!searchTerm?.trim()) {
    return []
  }

  try {
    const result = await payload.find({
      collection: 'terminals',
      where: {
        or: [
          {
            name: {
              like: searchTerm.trim(),
            },
          },
          {
            province: {
              like: searchTerm.trim(),
            },
          },
          {
            address: {
              like: searchTerm.trim(),
            },
          },
        ],
      },
      limit,
    })

    return result.docs as Terminal[]
  } catch (error) {
    console.error('Error searching terminals:', error)
    throw new Error('Failed to search terminals')
  }
}
