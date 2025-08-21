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
}

/**
 * Custom hook for handling single date filtering that converts to date range for PayloadCMS
 * Since PayloadCMS dates are normalized to midnight, we need to query for the full day range
 */
export const useSingleDateFilter = (): UseSingleDateFilterReturn => {
  const [dateFilter, setDateFilter] = useState<DateFilter | null>(null)

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

  const isDateSelected = dateFilter !== null

  return {
    dateFilter,
    setDateFilter,
    getDateRangeForQuery,
    clearDateFilter,
    isDateSelected,
  }
}
