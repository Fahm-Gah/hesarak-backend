'use client'

import { useState, useCallback } from 'react'
import moment from 'moment-jalaali'

interface DateFilter {
  year: number
  month: number
  day: number
}

interface UseSingleDateFilterReturn {
  dateFilter: DateFilter | null
  setDateFilter: (date: DateFilter | null) => void
  getDateRangeForQuery: () => { from: string; to: string } | null
  clearDateFilter: () => void
  isDateSelected: boolean
  timePeriod: 'all' | 'past' | 'upcoming'
  setTimePeriod: (period: 'all' | 'past' | 'upcoming') => void
  getTimePeriodRangeForQuery: () => { from: string; to: string } | null
}

/**
 * Custom hook for handling single date filtering that converts to date range for PayloadCMS
 * Since PayloadCMS dates are normalized to midnight, we need to query for the full day range
 */
export const useSingleDateFilter = (): UseSingleDateFilterReturn => {
  const [dateFilter, setDateFilter] = useState<DateFilter | null>(null)
  const [timePeriod, setTimePeriod] = useState<'all' | 'past' | 'upcoming'>('all')

  const getDateRangeForQuery = useCallback(() => {
    if (!dateFilter) return null

    try {
      // Convert Jalaali date to Gregorian using moment-jalaali
      const selectedDate = moment(
        `${dateFilter.year}-${dateFilter.month.toString().padStart(2, '0')}-${dateFilter.day.toString().padStart(2, '0')}`,
        'jYYYY-jMM-jDD',
      )

      if (!selectedDate.isValid()) {
        console.error('Invalid date:', dateFilter)
        return null
      }

      // Start of day (midnight)
      const startOfDay = selectedDate.clone().startOf('day').toISOString()

      // End of day (23:59:59.999)
      const endOfDay = selectedDate.clone().endOf('day').toISOString()

      return {
        from: startOfDay,
        to: endOfDay,
      }
    } catch (error) {
      console.error('Error converting date for query:', error)
      return null
    }
  }, [dateFilter])

  const clearDateFilter = useCallback(() => {
    setDateFilter(null)
  }, [])

  const getTimePeriodRangeForQuery = useCallback(() => {
    if (timePeriod === 'all') return null

    const today = moment().startOf('day')

    if (timePeriod === 'past') {
      // Past trips: from beginning of time to end of yesterday
      return {
        from: '1900-01-01T00:00:00.000Z',
        to: today.clone().subtract(1, 'day').endOf('day').toISOString(),
      }
    } else if (timePeriod === 'upcoming') {
      // Upcoming trips: from today onwards
      return {
        from: today.toISOString(),
        to: '2100-12-31T23:59:59.999Z',
      }
    }

    return null
  }, [timePeriod])

  const isDateSelected = dateFilter !== null

  return {
    dateFilter,
    setDateFilter,
    getDateRangeForQuery,
    clearDateFilter,
    isDateSelected,
    timePeriod,
    setTimePeriod,
    getTimePeriodRangeForQuery,
  }
}
