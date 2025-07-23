import type { SearchParams, ApiResponse } from '@/types/tripTypes'

export const validateSearchParams = (query: Record<string, any>): ApiResponse<SearchParams> => {
  const { from, to, date } = query

  if (!from || !to || !date) {
    return {
      success: false,
      error: 'Missing required parameters. Please provide: from, to, and date',
      message: 'Example: /api/available-trips?from=Kabul&to=Balkh&date=2025-07-25',
    }
  }

  return {
    success: true,
    data: {
      from: from as string,
      to: to as string,
      date: date as string,
    },
  }
}
