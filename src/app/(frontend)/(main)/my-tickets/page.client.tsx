'use client'

import React, { useState } from 'react'
import { Breadcrumbs } from '@/app/(frontend)/components/Breadcrumbs'
import type { User } from '@/payload-types'
import { UserTicket } from './types'
import { TicketsHeader } from './components/TicketsHeader'
import { TicketFilters } from './components/TicketFilters'
import { TicketCard } from './components/TicketCard'
import { EmptyTicketsState } from './components/EmptyTicketsState'
import { useTicketFilters } from './hooks/useTicketFilters'

interface TicketsPageClientProps {
  tickets: UserTicket[]
  user: User
}

export const TicketsPageClient = ({ tickets, user }: TicketsPageClientProps) => {
  const [copiedTickets, setCopiedTickets] = useState<Set<string>>(new Set())
  const [pulseTickets, setPulseTickets] = useState<Set<string>>(new Set())

  // Use the custom hook for all filter logic
  const {
    filter,
    setFilter,
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
    showStatusDropdown,
    setShowStatusDropdown,
    showRouteFromDropdown,
    setShowRouteFromDropdown,
    showRouteToDropdown,
    setShowRouteToDropdown,
    uniqueRoutes,
    filteredTickets,
    hasActiveFilters,
    clearAllFilters,
  } = useTicketFilters(tickets)

  const breadcrumbItems = [{ label: 'Home', href: '/' }, { label: 'My Tickets' }]

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Breadcrumbs */}
        <div className="mb-4">
          <Breadcrumbs items={breadcrumbItems} />
        </div>

        {/* Header with filter buttons */}
        <TicketsHeader tickets={tickets} filter={filter} setFilter={setFilter} />

        {/* Search and Filters */}
        <TicketFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          showFilters={showFilters}
          setShowFilters={setShowFilters}
          statusFilters={statusFilters}
          setStatusFilters={setStatusFilters}
          showStatusDropdown={showStatusDropdown}
          setShowStatusDropdown={setShowStatusDropdown}
          dateRange={dateRange}
          setDateRange={setDateRange}
          routeFilters={routeFilters}
          setRouteFilters={setRouteFilters}
          showRouteFromDropdown={showRouteFromDropdown}
          setShowRouteFromDropdown={setShowRouteFromDropdown}
          showRouteToDropdown={showRouteToDropdown}
          setShowRouteToDropdown={setShowRouteToDropdown}
          uniqueRoutes={uniqueRoutes}
          hasActiveFilters={hasActiveFilters}
          clearAllFilters={clearAllFilters}
          filteredCount={filteredTickets.length}
          totalCount={tickets.length}
        />

        {/* Tickets List */}
        {filteredTickets.length === 0 ? (
          <EmptyTicketsState filter={filter} />
        ) : (
          <div className="space-y-4">
            {filteredTickets.map((ticket) => (
              <TicketCard
                key={ticket.id}
                ticket={ticket}
                copiedTickets={copiedTickets}
                setCopiedTickets={setCopiedTickets}
                pulseTickets={pulseTickets}
                setPulseTickets={setPulseTickets}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
