'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { UserTicket } from '../types'

interface Route {
  name: string
  province: string
}

interface FilterState {
  searchTerm: string
  timePeriod: 'all' | 'future' | 'before'
  routeFilters: {
    from: string
    to: string
  }
}

export const useClientFilters = (tickets: UserTicket[]) => {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Filter states - initialize from URL params
  const [showFilters, setShowFilters] = useState(false)
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '')
  const [timePeriod, setTimePeriod] = useState<'all' | 'future' | 'before'>(
    (searchParams.get('timePeriod') as 'all' | 'future' | 'before') || 'all',
  )
  const [routeFilters, setRouteFilters] = useState({
    from: searchParams.get('fromLocation') || '',
    to: searchParams.get('toLocation') || '',
  })

  // Dropdown states
  const [showRouteFromDropdown, setShowRouteFromDropdown] = useState(false)
  const [showRouteToDropdown, setShowRouteToDropdown] = useState(false)

  // Track initialization to prevent unwanted URL updates on mount
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    setIsInitialized(true)
  }, [])

  // Sync state with URL parameters when they change (e.g., browser back/forward)
  useEffect(() => {
    const search = searchParams.get('search') || ''
    const timePeriodParam = (searchParams.get('timePeriod') as 'all' | 'future' | 'before') || 'all'
    const fromLocation = searchParams.get('fromLocation') || ''
    const toLocation = searchParams.get('toLocation') || ''

    if (search !== searchTerm) setSearchTerm(search)
    if (timePeriodParam !== timePeriod) setTimePeriod(timePeriodParam)
    if (fromLocation !== routeFilters.from || toLocation !== routeFilters.to) {
      setRouteFilters({ from: fromLocation, to: toLocation })
    }
  }, [searchParams])

  // Get unique routes for filter dropdowns
  const uniqueRoutes = useMemo(
    () => ({
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
            .map((t) => [
              t.trip.to!.name,
              { name: t.trip.to!.name, province: t.trip.to!.province },
            ]),
        ).values(),
      ) as Route[],
    }),
    [tickets],
  )

  // Filter tickets based on current filter state
  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      // Search filter (ticket number only)
      if (searchTerm.trim()) {
        const searchLower = searchTerm.toLowerCase().trim()
        const ticketNumber = ticket.ticketNumber?.toLowerCase() || ''
        if (!ticketNumber.includes(searchLower)) {
          return false
        }
      }

      // Time period filter
      if (timePeriod !== 'all') {
        const bookingDate = new Date(ticket.booking.date)
        const today = new Date()
        today.setHours(0, 0, 0, 0) // Start of today

        if (timePeriod === 'future' && bookingDate < today) {
          return false
        }
        if (timePeriod === 'before' && bookingDate >= today) {
          return false
        }
      }

      // Route filters
      if (routeFilters.from && ticket.trip.from.name !== routeFilters.from) {
        return false
      }
      if (routeFilters.to && ticket.trip.to?.name !== routeFilters.to) {
        return false
      }

      return true
    })
  }, [tickets, searchTerm, timePeriod, routeFilters])

  // Close dropdowns on ESC key and outside clicks
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowRouteFromDropdown(false)
        setShowRouteToDropdown(false)
      }
    }

    const handleClickOutside = () => {
      setShowRouteFromDropdown(false)
      setShowRouteToDropdown(false)
    }

    document.addEventListener('keydown', handleKeyDown)

    if (showRouteFromDropdown || showRouteToDropdown) {
      document.addEventListener('click', handleClickOutside)
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('click', handleClickOutside)
    }
  }, [showRouteFromDropdown, showRouteToDropdown])

  // Update URL when filters change
  const updateURL = useCallback(() => {
    if (!isInitialized) return

    const params = new URLSearchParams(window.location.search)

    // Update search param
    if (searchTerm.trim()) {
      params.set('search', searchTerm.trim())
    } else {
      params.delete('search')
    }

    // Update time period param
    if (timePeriod !== 'all') {
      params.set('timePeriod', timePeriod)
    } else {
      params.delete('timePeriod')
    }

    // Update route filters
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

    // Reset page to 1 when filters change
    params.delete('page')

    const newURL = `${window.location.pathname}?${params.toString()}`
    router.push(newURL, { scroll: false })
  }, [searchTerm, timePeriod, routeFilters, router, isInitialized])

  // Debounced URL update for search term
  useEffect(() => {
    if (!isInitialized) return

    const timeoutId = setTimeout(() => {
      updateURL()
    }, 1000) // 1 second debounce for search

    return () => clearTimeout(timeoutId)
  }, [searchTerm, updateURL, isInitialized])

  // Immediate URL update for other filters
  useEffect(() => {
    if (!isInitialized) return
    updateURL()
  }, [timePeriod, routeFilters, updateURL, isInitialized])

  const clearAllFilters = () => {
    setSearchTerm('')
    setTimePeriod('all')
    setRouteFilters({ from: '', to: '' })
  }

  const hasActiveFilters = !!(
    searchTerm.trim() ||
    timePeriod !== 'all' ||
    routeFilters.from ||
    routeFilters.to
  )

  return {
    // Filter state
    showFilters,
    setShowFilters,
    searchTerm,
    setSearchTerm,
    timePeriod,
    setTimePeriod,
    routeFilters,
    setRouteFilters,

    // Dropdown states
    showRouteFromDropdown,
    setShowRouteFromDropdown,
    showRouteToDropdown,
    setShowRouteToDropdown,

    // Computed values
    filteredTickets,
    uniqueRoutes,
    hasActiveFilters,
    clearAllFilters,
  }
}
