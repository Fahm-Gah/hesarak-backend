'use client'

import React, { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Filter, X, Search, ArrowUpDown, SortAsc, SortDesc } from 'lucide-react'
import { Breadcrumbs } from '@/app/(frontend)/components/Breadcrumbs'
import { Pagination } from '@/components/Pagination'
import type { User } from '@/payload-types'
import { UserTicket } from './types'
import { TicketFilters } from './components/TicketFilters'
import { TicketCard } from './components/TicketCard'
import { EmptyTicketsState } from './components/EmptyTicketsState'
import { useServerFilters } from './hooks/useServerFilters'

interface TicketsPageClientProps {
  tickets: UserTicket[]
  user: User
  pagination?: {
    currentPage: number
    totalCount: number
    totalPages: number
    hasMore: boolean
  }
}

// Function to convert numbers to Persian digits
const convertToPersianDigits = (num: number): string => {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹']
  return num.toString().replace(/\d/g, (digit) => persianDigits[parseInt(digit)])
}

export const TicketsPageClient = ({ tickets, user, pagination }: TicketsPageClientProps) => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [copiedTickets, setCopiedTickets] = useState<Set<string>>(new Set())
  const [pulseTickets, setPulseTickets] = useState<Set<string>>(new Set())

  // Sort state
  const [sortBy, setSortBy] = useState<'date' | 'price' | 'route' | 'status'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [showSortDropdown, setShowSortDropdown] = useState(false)

  // Use the server-side filter hook
  const {
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
    hasActiveFilters,
    clearAllFilters,
    singleDateFilter,
  } = useServerFilters(tickets || [])

  const breadcrumbItems = [{ label: 'خانه', href: '/' }, { label: 'تکت های من' }]

  // Sort tickets
  const sortedTickets = React.useMemo(() => {
    if (!tickets) return []

    const sorted = [...tickets].sort((a, b) => {
      let comparison = 0

      switch (sortBy) {
        case 'date':
          comparison = new Date(a.booking.date).getTime() - new Date(b.booking.date).getTime()
          break
        case 'price':
          comparison = a.booking.totalPrice - b.booking.totalPrice
          break
        case 'route':
          comparison = `${a.trip.from.name} - ${a.trip.to?.name || ''}`.localeCompare(
            `${b.trip.from.name} - ${b.trip.to?.name || ''}`,
          )
          break
        case 'status':
          // Create a status string for sorting
          const getStatusString = (ticket: any) => {
            if (ticket.status.isExpired) return 'expired'
            if (ticket.status.isCancelled) return 'cancelled'
            if (ticket.status.isPaid) return 'paid'
            return 'pending'
          }
          comparison = getStatusString(a).localeCompare(getStatusString(b))
          break
        default:
          return 0
      }

      return sortOrder === 'desc' ? -comparison : comparison
    })

    return sorted
  }, [tickets, sortBy, sortOrder])

  // Close filters and sort dropdown when clicking outside or pressing ESC
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element

      if (showFilters) {
        const filterMenu = document.querySelector('.filter-menu')
        if (filterMenu && !filterMenu.contains(target)) {
          setShowFilters(false)
        }
      }

      if (showSortDropdown) {
        const sortMenu = document.querySelector('.sort-menu')
        if (sortMenu && !sortMenu.contains(target)) {
          setShowSortDropdown(false)
        }
      }
    }

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowFilters(false)
        setShowSortDropdown(false)
      }
    }

    if (showFilters || showSortDropdown) {
      document.addEventListener('click', handleClickOutside)
      document.addEventListener('keydown', handleEscapeKey)
    }

    return () => {
      document.removeEventListener('click', handleClickOutside)
      document.removeEventListener('keydown', handleEscapeKey)
    }
  }, [showFilters, showSortDropdown])

  // Add loading/error state check
  if (!tickets) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">در حال بارگیری تکت ها...</p>
        </div>
      </div>
    )
  }

  // Pagination handlers
  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', page.toString())
    router.push(`/my-tickets?${params.toString()}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 p-4" dir="rtl">
      <div className="max-w-6xl mx-auto">
        {/* Breadcrumbs */}
        <div className="mb-4">
          <Breadcrumbs items={breadcrumbItems} />
        </div>

        {/* Header with Title and Search */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-800 mb-2">تکت های من</h1>
              <p className="text-gray-600">تکت های اتوبوس و تاریخچه سفرهای خود را مدیریت کنید</p>
            </div>

            {/* Search Bar */}
            <div className="relative w-full lg:w-80 lg:flex-shrink-0">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 transition-colors duration-200" />
              <input
                type="text"
                placeholder="جستجو بر اساس شماره تکت، مسیر، یا اتوبوس..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm transition-all duration-200 hover:border-orange-300"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-all duration-200 hover:scale-110 active:scale-95"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Main Content with Filters */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filters Sidebar - Desktop */}
          <div className="hidden lg:block lg:w-1/4">
            <div className="bg-white rounded-lg shadow-md sticky top-4">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Filter className="w-5 h-5 text-orange-600" />
                  فیلترها
                  {hasActiveFilters && (
                    <span className="bg-orange-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {
                        [
                          statusFilters.length > 0,
                          !!dateRange.from,
                          !!dateRange.to,
                          !!routeFilters.from,
                          !!routeFilters.to,
                          singleDateFilter.isDateSelected,
                        ].filter(Boolean).length
                      }
                    </span>
                  )}
                </h2>
                {hasActiveFilters && (
                  <button
                    onClick={clearAllFilters}
                    className="mt-2 text-sm text-red-600 hover:text-red-700 font-medium"
                  >
                    پاک کردن همه فیلترها
                  </button>
                )}
              </div>
              <div className="p-4">
                <TicketFilters
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                  showFilters={true}
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
                  filteredCount={sortedTickets.length}
                  totalCount={tickets.length}
                  isSidebar={true}
                  singleDateFilter={singleDateFilter}
                />
              </div>
            </div>
          </div>

          {/* Tickets List */}
          <div className="flex-1">
            {/* Mobile controls - Sort (left) and Filters (right) */}
            <div className="lg:hidden mb-4 flex justify-between gap-3">
              {/* Sort Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowSortDropdown(!showSortDropdown)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all duration-200 bg-white shadow-md border border-gray-200 hover:bg-gray-50 hover:shadow-lg hover:scale-105 active:scale-95"
                >
                  {sortOrder === 'desc' ? (
                    <SortDesc className="w-4 h-4 transition-transform duration-200" />
                  ) : (
                    <SortAsc className="w-4 h-4 transition-transform duration-200" />
                  )}
                  <span>
                    {sortBy === 'date'
                      ? 'تاریخ'
                      : sortBy === 'price'
                        ? 'قیمت'
                        : sortBy === 'route'
                          ? 'مسیر'
                          : 'وضعیت'}
                  </span>
                  <ArrowUpDown className="w-3 h-3 text-gray-400" />
                </button>

                {/* Sort Dropdown Menu */}
                {showSortDropdown && (
                  <div className="sort-menu absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50 animate-in fade-in-0 zoom-in-95 duration-200">
                    <div className="p-2">
                      {[
                        { value: 'date', label: 'تاریخ سفر', desc: 'بر اساس تاریخ حرکت' },
                        { value: 'price', label: 'قیمت', desc: 'بر اساس قیمت تکت' },
                        { value: 'route', label: 'مسیر', desc: 'بر اساس مسیر سفر' },
                        { value: 'status', label: 'وضعیت', desc: 'بر اساس وضعیت پرداخت' },
                      ].map((sort) => (
                        <button
                          key={sort.value}
                          onClick={() => {
                            if (sortBy === sort.value) {
                              setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
                            } else {
                              setSortBy(sort.value as any)
                              setSortOrder('desc')
                            }
                            setShowSortDropdown(false)
                          }}
                          className={`w-full text-right px-3 py-2 rounded-md transition-colors duration-200 hover:bg-gray-50 ${
                            sortBy === sort.value ? 'bg-orange-50 text-orange-600' : 'text-gray-700'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium">{sort.label}</div>
                              <div className="text-xs text-gray-500">{sort.desc}</div>
                            </div>
                            {sortBy === sort.value && (
                              <div className="flex items-center gap-1">
                                {sortOrder === 'desc' ? (
                                  <SortDesc className="w-4 h-4" />
                                ) : (
                                  <SortAsc className="w-4 h-4" />
                                )}
                              </div>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={() => setShowFilters(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all duration-200 bg-white shadow-md border border-gray-200 hover:bg-gray-50 hover:shadow-lg hover:scale-105 active:scale-95"
              >
                <Filter className="w-4 h-4 transition-transform duration-200" />
                <span>فیلترها</span>
                {hasActiveFilters && (
                  <span className="bg-orange-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                    {
                      [
                        statusFilters.length > 0,
                        !!dateRange.from,
                        !!dateRange.to,
                        !!routeFilters.from,
                        !!routeFilters.to,
                        singleDateFilter.isDateSelected,
                      ].filter(Boolean).length
                    }
                  </span>
                )}
              </button>
            </div>

            {sortedTickets.length === 0 ? (
              <EmptyTicketsState
                filter="all"
                hasActiveFilters={hasActiveFilters}
                clearAllFilters={clearAllFilters}
                searchTerm={searchTerm}
              />
            ) : (
              <div className="space-y-4">
                {sortedTickets.map((ticket) => (
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

            {/* Footer - Always show for consistent alignment */}
            <div className="mt-8">
              {pagination && pagination.totalPages > 1 && sortedTickets.length > 0 ? (
                <Pagination
                  currentPage={pagination.currentPage}
                  totalPages={pagination.totalPages}
                  totalCount={pagination.totalCount}
                  limit={10}
                  onPageChange={handlePageChange}
                  onLimitChange={() => {}}
                  showLimitSelector={false}
                  itemLabel="tickets"
                  isLoading={false}
                />
              ) : (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-6 py-4">
                  <div className="flex items-center justify-center">
                    <p className="text-sm text-gray-600">
                      {sortedTickets.length === 0
                        ? 'هیچ تکتی پیدا نشد'
                        : sortedTickets.length === 1
                          ? 'نمایش ۱ تکت'
                          : `نمایش ${convertToPersianDigits(sortedTickets.length)} تکت`}
                      {hasActiveFilters && tickets.length > sortedTickets.length && (
                        <span className="mr-1 text-gray-500">
                          (فیلتر شده از {convertToPersianDigits(tickets.length)} تکت کل)
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Filters Side Menu */}
        <div
          className={`lg:hidden fixed inset-0 z-50 transition-all duration-300 ease-in-out ${showFilters ? 'visible opacity-100' : 'invisible opacity-0'}`}
        >
          <div
            className="absolute inset-0 bg-black bg-opacity-50 transition-opacity duration-300"
            onClick={() => setShowFilters(false)}
          />
          <div
            className={`absolute left-0 top-0 h-full w-80 max-w-[85vw] bg-white transform transition-transform duration-300 ease-in-out ${showFilters ? 'translate-x-0' : '-translate-x-full'}`}
          >
            <div className="filter-menu h-full overflow-y-auto">
              {/* Filter Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-orange-50">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <Filter className="w-5 h-5 text-orange-600" />
                  فیلترها
                  {hasActiveFilters && (
                    <span className="bg-orange-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {
                        [
                          statusFilters.length > 0,
                          !!dateRange.from,
                          !!dateRange.to,
                          !!routeFilters.from,
                          !!routeFilters.to,
                          singleDateFilter.isDateSelected,
                        ].filter(Boolean).length
                      }
                    </span>
                  )}
                </h3>
                <button
                  onClick={() => setShowFilters(false)}
                  className="p-2 hover:bg-orange-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Filter Content */}
              <div className="p-4">
                <TicketFilters
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                  showFilters={true}
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
                  filteredCount={tickets.length}
                  totalCount={tickets.length}
                  isSidebar={true}
                  onApplyFilters={() => setShowFilters(false)}
                  singleDateFilter={singleDateFilter}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
