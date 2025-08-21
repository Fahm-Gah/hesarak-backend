'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSingleDateFilter } from './useSingleDateFilter'
import moment from 'moment-jalaali'

interface Route {
  name: string
  province: string
}

export const useServerFilters = (tickets: any[]) => {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Single date filter hook
  const singleDateFilter = useSingleDateFilter()

  // Initialize state from URL params
  const [showFilters, setShowFilters] = useState(false)
  const [statusFilters, setStatusFilters] = useState<string[]>(
    searchParams.get('status')?.split(',').filter(Boolean) || [],
  )
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '')
  const [dateRange, setDateRange] = useState({
    from: searchParams.get('fromDate') || '',
    to: searchParams.get('toDate') || '',
  })

  // Initialize date filter from URL params (only once on mount)
  useEffect(() => {
    const urlDateFilter = searchParams.get('dateFilter')
    if (urlDateFilter && !singleDateFilter.dateFilter) {
      try {
        const [year, month, day] = urlDateFilter.split('-').map(Number)
        if (year && month && day) {
          singleDateFilter.setDateFilter({ year, month, day })
        }
      } catch (error) {
        console.error('Error parsing date filter from URL:', error)
      }
    }
  }, [])
  const [routeFilters, setRouteFilters] = useState({
    from: searchParams.get('fromLocation') || '',
    to: searchParams.get('toLocation') || '',
  })

  // Dropdown states
  const [showStatusDropdown, setShowStatusDropdown] = useState(false)
  const [showRouteFromDropdown, setShowRouteFromDropdown] = useState(false)
  const [showRouteToDropdown, setShowRouteToDropdown] = useState(false)

  // Update URL with current filters
  const updateURL = useCallback(() => {
    try {
      const params = new URLSearchParams(window.location.search)

      // Remove page to reset pagination
      params.delete('page')

      // Update filter params

      if (statusFilters.length > 0) {
        params.set('status', statusFilters.join(','))
      } else {
        params.delete('status')
      }

      if (searchTerm) {
        params.set('search', searchTerm)
      } else {
        params.delete('search')
      }

      // Handle single date filter
      if (singleDateFilter.dateFilter) {
        const dateRangeQuery = singleDateFilter.getDateRangeForQuery()
        if (dateRangeQuery) {
          params.set('fromDate', dateRangeQuery.from)
          params.set('toDate', dateRangeQuery.to)
          params.set(
            'dateFilter',
            `${singleDateFilter.dateFilter.year}-${singleDateFilter.dateFilter.month}-${singleDateFilter.dateFilter.day}`,
          )
        }
      } else {
        // Use manual date range if no single date filter
        if (dateRange.from) {
          params.set('fromDate', dateRange.from)
        } else {
          params.delete('fromDate')
        }

        if (dateRange.to) {
          params.set('toDate', dateRange.to)
        } else {
          params.delete('toDate')
        }

        params.delete('dateFilter')
      }

      if (routeFilters.from) {
        params.set('fromLocation', routeFilters.from)
      } else {
        params.delete('fromLocation')
      }

      if (routeFilters.to) {
        params.set('toLocation', routeFilters.to)
      } else {
        params.delete('toLocation')
      }

      const newURL = `${window.location.pathname}?${params.toString()}`
      router.push(newURL)
    } catch (error) {
      console.error('Error updating URL:', error)
    }
  }, [
    statusFilters,
    searchTerm,
    dateRange,
    routeFilters,
    singleDateFilter.dateFilter,
    singleDateFilter.getDateRangeForQuery,
    router,
  ])

  // Track if this is the initial load
  const [isInitialized, setIsInitialized] = useState(false)

  // Initialize flag after first render
  useEffect(() => {
    setIsInitialized(true)
  }, [])

  // Debounced URL update for search term
  useEffect(() => {
    if (!isInitialized) return

    const timeoutId = setTimeout(() => {
      updateURL()
    }, 500) // 500ms debounce for search

    return () => clearTimeout(timeoutId)
  }, [searchTerm, isInitialized, updateURL])

  // Immediate URL update for other filters
  useEffect(() => {
    if (!isInitialized) return

    updateURL()
  }, [
    statusFilters,
    dateRange,
    routeFilters,
    singleDateFilter.dateFilter,
    isInitialized,
    updateURL,
  ])

  // Get unique routes for filter dropdowns
  const uniqueRoutes = {
    from: Array.from(
      new Map(
        tickets.map((t) => [
          t.trip.from.name,
          { name: t.trip.from.name, province: t.trip.from.province },
        ]),
      ).values(),
    ) as Route[],
    to: Array.from(
      new Map(
        tickets
          .filter((t) => t.trip.to)
          .map((t) => [t.trip.to.name, { name: t.trip.to.name, province: t.trip.to.province }]),
      ).values(),
    ) as Route[],
  }

  // Close dropdowns on ESC key and outside clicks
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowStatusDropdown(false)
        setShowRouteFromDropdown(false)
        setShowRouteToDropdown(false)
      }
    }

    const handleClickOutside = () => {
      setShowStatusDropdown(false)
      setShowRouteFromDropdown(false)
      setShowRouteToDropdown(false)
    }

    document.addEventListener('keydown', handleKeyDown)

    if (showStatusDropdown || showRouteFromDropdown || showRouteToDropdown) {
      document.addEventListener('click', handleClickOutside)
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('click', handleClickOutside)
    }
  }, [showStatusDropdown, showRouteFromDropdown, showRouteToDropdown])

  const clearAllFilters = () => {
    setStatusFilters([])
    setSearchTerm('')
    setDateRange({ from: '', to: '' })
    setRouteFilters({ from: '', to: '' })
    singleDateFilter.clearDateFilter()
  }

  const hasActiveFilters =
    statusFilters.length > 0 ||
    !!searchTerm ||
    !!dateRange.from ||
    !!dateRange.to ||
    !!routeFilters.from ||
    !!routeFilters.to ||
    singleDateFilter.isDateSelected

  return {
    // Advanced filters
    showFilters,
    setShowFilters,
    statusFilters,
    setStatusFilters,
    searchTerm,
    setSearchTerm,
    dateRange,
    setDateRange,
    routeFilters,
    setRouteFilters,

    // Dropdown states
    showStatusDropdown,
    setShowStatusDropdown,
    showRouteFromDropdown,
    setShowRouteFromDropdown,
    showRouteToDropdown,
    setShowRouteToDropdown,

    // Computed values
    uniqueRoutes,
    hasActiveFilters,
    clearAllFilters,

    // Single date filter
    singleDateFilter,
  }
}
