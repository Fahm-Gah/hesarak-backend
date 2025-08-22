'use client'

import { useState, useMemo, useEffect } from 'react'
import { UserTicket } from '../types'

interface Route {
  name: string
  province: string
}

// Function to check if trip is upcoming
const isUpcoming = (dateString: string): boolean => {
  try {
    const tripDate = new Date(dateString)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    tripDate.setHours(0, 0, 0, 0)
    return tripDate >= today
  } catch {
    return false
  }
}

export const useTicketFilters = (tickets: UserTicket[]) => {
  // Basic filter state
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('all')

  // Advanced filters state
  const [showFilters, setShowFilters] = useState(false)
  const [statusFilters, setStatusFilters] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [dateRange, setDateRange] = useState({ from: '', to: '' })
  const [routeFilters, setRouteFilters] = useState({ from: '', to: '' })
  const [showStatusDropdown, setShowStatusDropdown] = useState(false)
  const [showRouteFromDropdown, setShowRouteFromDropdown] = useState(false)
  const [showRouteToDropdown, setShowRouteToDropdown] = useState(false)

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

  // Get unique routes for filter dropdowns
  const uniqueRoutes = useMemo(() => {
    const fromRoutes = [
      ...new Set(tickets.map((t) => ({ name: t.trip.from.name, province: t.trip.from.province }))),
    ] as Route[]
    const toRoutes = [
      ...new Set(
        tickets
          .map((t) => (t.trip.to ? { name: t.trip.to.name, province: t.trip.to.province } : null))
          .filter(Boolean),
      ),
    ] as Route[]
    return { from: fromRoutes, to: toRoutes }
  }, [tickets])

  // Apply all filters
  const filteredTickets = useMemo(() => {
    let filtered = tickets

    // Basic time filter
    if (filter === 'upcoming') {
      filtered = filtered.filter(
        (ticket) =>
          isUpcoming(ticket.booking.date) && !ticket.status.isCancelled && !ticket.status.isExpired,
      )
    } else if (filter === 'past') {
      filtered = filtered.filter(
        (ticket) =>
          !isUpcoming(ticket.booking.date) || ticket.status.isCancelled || ticket.status.isExpired,
      )
    }

    // Status filters
    if (statusFilters.length > 0) {
      filtered = filtered.filter((ticket) => {
        // Debug logging for filter issues (uncomment for debugging)
        // if (process.env.NODE_ENV === 'development' && ticket.ticketNumber) {
        //   console.log('🔍 Filter debug for ticket', ticket.ticketNumber, {
        //     statusFilters,
        //     isPaid: ticket.status.isPaid,
        //     isCancelled: ticket.status.isCancelled,
        //     isExpired: ticket.status.isExpired,
        //     expiredAt: ticket.status.expiredAt,
        //     paymentDeadline: ticket.status.paymentDeadline
        //   })
        // }

        if (statusFilters.includes('paid') && ticket.status.isPaid) return true
        if (
          statusFilters.includes('pending') &&
          !ticket.status.isPaid &&
          !ticket.status.isCancelled &&
          !ticket.status.isExpired
        )
          return true
        if (
          statusFilters.includes('cancelled') &&
          ticket.status.isCancelled &&
          !ticket.status.isExpired
        )
          return true
        if (statusFilters.includes('expired') && ticket.status.isExpired) return true
        return false
      })
    }

    // Search term filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (ticket) =>
          ticket.ticketNumber.toLowerCase().includes(term) ||
          ticket.trip.from.name.toLowerCase().includes(term) ||
          (ticket.trip.to?.name || '').toLowerCase().includes(term) ||
          ticket.trip.bus.number.toLowerCase().includes(term),
      )
    }

    // Date range filter
    if (dateRange.from) {
      filtered = filtered.filter((ticket) => {
        const ticketDate = new Date(ticket.booking.date)
        const fromDate = new Date(dateRange.from)
        return ticketDate >= fromDate
      })
    }
    if (dateRange.to) {
      filtered = filtered.filter((ticket) => {
        const ticketDate = new Date(ticket.booking.date)
        const toDate = new Date(dateRange.to)
        return ticketDate <= toDate
      })
    }

    // Route filters
    if (routeFilters.from) {
      filtered = filtered.filter((ticket) =>
        ticket.trip.from.name.toLowerCase().includes(routeFilters.from.toLowerCase()),
      )
    }
    if (routeFilters.to) {
      filtered = filtered.filter((ticket) =>
        ticket.trip.to?.name?.toLowerCase().includes(routeFilters.to.toLowerCase()),
      )
    }

    return filtered
  }, [tickets, filter, statusFilters, searchTerm, dateRange, routeFilters])

  const clearAllFilters = () => {
    setStatusFilters([])
    setSearchTerm('')
    setDateRange({ from: '', to: '' })
    setRouteFilters({ from: '', to: '' })
    setFilter('all')
  }

  const hasActiveFilters =
    statusFilters.length > 0 ||
    !!searchTerm ||
    !!dateRange.from ||
    !!dateRange.to ||
    !!routeFilters.from ||
    !!routeFilters.to ||
    filter !== 'all'

  return {
    // Basic filter
    filter,
    setFilter,

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
    filteredTickets,
    hasActiveFilters,
    clearAllFilters,
  }
}
