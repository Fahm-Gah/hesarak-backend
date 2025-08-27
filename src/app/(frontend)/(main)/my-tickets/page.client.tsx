'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Filter, X, Search, ArrowUpDown, SortAsc, SortDesc } from 'lucide-react'
import { Breadcrumbs } from '@/app/(frontend)/components/Breadcrumbs'
import { Pagination } from '@/components/Pagination'
import type { User } from '@/payload-types'
import { getMeUser } from '@/utils/getMeUser.client'
import { UserTicket, TicketsResponse } from './types'
import { SimpleTicketFilters } from './components/SimpleTicketFilters'
import { TicketCard } from './components/TicketCard'
import { EmptyTicketsState } from './components/EmptyTicketsState'
import { useClientFilters } from './hooks/useClientFilters'
import { convertToPersianDigits } from '@/utils/persianDigits'

// Client-side data fetching function - fetch all tickets
async function fetchAllUserTickets(): Promise<UserTicket[]> {
  try {
    const response = await fetch('/api/user/tickets', {
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch tickets: ${response.status}`)
    }

    const result: TicketsResponse = await response.json()

    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch tickets')
    }

    return result.data?.tickets || []
  } catch (error) {
    console.error('Error fetching user tickets:', error)
    return []
  }
}

export const TicketsPageClient = () => {
  const [user, setUser] = useState<User | null>(null)
  const [allTickets, setAllTickets] = useState<UserTicket[]>([])
  const [loading, setLoading] = useState(true)
  const [authLoading, setAuthLoading] = useState(true)
  const router = useRouter()
  const searchParams = useSearchParams()
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page') || '1', 10))
  const [itemsPerPage, setItemsPerPage] = useState(parseInt(searchParams.get('limit') || '10', 10))
  const [copiedTickets, setCopiedTickets] = useState<Set<string>>(new Set())
  const [pulseTickets, setPulseTickets] = useState<Set<string>>(new Set())

  // Sort state - initialize from URL params (sortOrder not stored in URL)
  const [sortBy, setSortBy] = useState<'date' | 'price' | 'route' | 'status'>(
    (searchParams.get('sortBy') as 'date' | 'price' | 'route' | 'status') || 'date',
  )
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [showSortDropdown, setShowSortDropdown] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  // Initialize after first render
  useEffect(() => {
    setIsInitialized(true)
  }, [])

  // Sync state with URL parameters when they change (e.g., browser back/forward)
  useEffect(() => {
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '10', 10)
    const sortByParam =
      (searchParams.get('sortBy') as 'date' | 'price' | 'route' | 'status') || 'date'

    if (page !== currentPage) setCurrentPage(page)
    if (limit !== itemsPerPage) setItemsPerPage(limit)
    if (sortByParam !== sortBy) {
      setSortBy(sortByParam)
      // Reset to desc when changing sort field
      setSortOrder('desc')
    }
  }, [searchParams, currentPage, itemsPerPage, sortBy])

  // Check authentication
  useEffect(() => {
    let isMounted = true

    const checkAuth = async () => {
      try {
        const result = await getMeUser()
        if (isMounted) {
          if (!result.user) {
            router.push('/auth/login?redirect=' + encodeURIComponent('/my-tickets'))
            return
          }
          setUser(result.user)
          setAuthLoading(false)
        }
      } catch (error) {
        if (isMounted) {
          router.push('/auth/login?redirect=' + encodeURIComponent('/my-tickets'))
        }
      }
    }

    checkAuth()

    return () => {
      isMounted = false
    }
  }, [router])

  // Load all tickets after auth is confirmed
  useEffect(() => {
    let isMounted = true

    const loadTickets = async () => {
      if (!user || authLoading) return

      setLoading(true)
      try {
        const tickets = await fetchAllUserTickets()
        if (isMounted) {
          setAllTickets(tickets)
          setLoading(false)
        }
      } catch (error) {
        console.error('Error loading tickets:', error)
        if (isMounted) {
          setAllTickets([])
          setLoading(false)
        }
      }
    }

    loadTickets()

    return () => {
      isMounted = false
    }
  }, [user, authLoading])

  // Use client-side filtering
  const {
    showFilters,
    setShowFilters,
    searchTerm,
    setSearchTerm,
    timePeriod,
    setTimePeriod,
    routeFilters,
    setRouteFilters,
    showRouteFromDropdown,
    setShowRouteFromDropdown,
    showRouteToDropdown,
    setShowRouteToDropdown,
    filteredTickets,
    uniqueRoutes,
    hasActiveFilters,
    clearAllFilters,
  } = useClientFilters(allTickets)

  const breadcrumbItems = [{ label: 'صفحه اصلی', href: '/' }, { label: 'تکت های من' }]

  // Sort filtered tickets
  const sortedTickets = useMemo(() => {
    if (!filteredTickets) return []

    const sorted = [...filteredTickets].sort((a, b) => {
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
  }, [filteredTickets, sortBy, sortOrder])

  // Client-side pagination
  const totalItems = sortedTickets.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentPageTickets = sortedTickets.slice(startIndex, endIndex)

  // Update URL when sortBy changes (sortOrder not stored in URL)
  useEffect(() => {
    if (!isInitialized) return
    updateURLParams({ sortBy })
  }, [sortBy, isInitialized])

  // Close filters and sort dropdown when clicking outside or pressing ESC
  useEffect(() => {
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

  // URL update helper
  const updateURLParams = (updates: Record<string, string | number | null>) => {
    const params = new URLSearchParams(window.location.search)

    Object.entries(updates).forEach(([key, value]) => {
      if (
        value === null ||
        value === '' ||
        value === 'all' ||
        (key === 'page' && value === 1) ||
        (key === 'limit' && value === 10) ||
        (key === 'sortBy' && value === 'date')
      ) {
        params.delete(key)
      } else {
        params.set(key, value.toString())
      }
    })

    const newURL = `${window.location.pathname}?${params.toString()}`
    router.push(newURL, { scroll: false })
  }

  // Pagination handlers
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    updateURLParams({ page })
  }

  const handleLimitChange = (limit: number) => {
    setItemsPerPage(limit)
    // Reset to first page when changing items per page
    setCurrentPage(1)
    updateURLParams({ limit, page: 1 })
  }

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 p-4" dir="rtl">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-4"></div>
              <p className="text-gray-600">در حال بررسی احراز هویت...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Show loading while fetching tickets
  if (loading && !allTickets.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 p-4" dir="rtl">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-4"></div>
              <p className="text-gray-600">در حال بارگذاری تکت ها...</p>
            </div>
          </div>
        </div>
      </div>
    )
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
              <p className="text-gray-600">تکت های بس و تاریخچه سفرهای خود را مدیریت کنید</p>
            </div>

            {/* Search Bar */}
            <div className="relative w-full lg:w-80 lg:flex-shrink-0">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 transition-colors duration-200" />
              <input
                type="text"
                placeholder="جستجو بر اساس شماره تکت..."
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
                          !!searchTerm.trim(),
                          timePeriod !== 'all',
                          !!routeFilters.from,
                          !!routeFilters.to,
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
                <SimpleTicketFilters
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                  showFilters={true}
                  setShowFilters={setShowFilters}
                  timePeriod={timePeriod}
                  setTimePeriod={setTimePeriod}
                  routeFilters={routeFilters}
                  setRouteFilters={setRouteFilters}
                  showRouteFromDropdown={showRouteFromDropdown}
                  setShowRouteFromDropdown={setShowRouteFromDropdown}
                  showRouteToDropdown={showRouteToDropdown}
                  setShowRouteToDropdown={setShowRouteToDropdown}
                  uniqueRoutes={uniqueRoutes}
                  hasActiveFilters={hasActiveFilters}
                  clearAllFilters={clearAllFilters}
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
                        !!searchTerm.trim(),
                        timePeriod !== 'all',
                        !!routeFilters.from,
                        !!routeFilters.to,
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
                {currentPageTickets.map((ticket) => (
                  <TicketCard
                    key={ticket.id}
                    ticket={ticket}
                    copiedTickets={copiedTickets}
                    setCopiedTickets={setCopiedTickets}
                    pulseTickets={pulseTickets}
                    setPulseTickets={setPulseTickets}
                    passengerName={
                      typeof user?.profile === 'object' && user.profile
                        ? user.profile.fullName || undefined
                        : undefined
                    }
                    passengerPhone={
                      typeof user?.profile === 'object' && user.profile
                        ? user.profile.phoneNumber || undefined
                        : undefined
                    }
                    passengerFatherName={
                      typeof user?.profile === 'object' && user.profile
                        ? user.profile.fatherName || undefined
                        : undefined
                    }
                  />
                ))}
              </div>
            )}

            {/* Footer - Show pagination or ticket count */}
            {sortedTickets.length > 0 && (
              <div className="mt-8">
                {totalPages > 1 ? (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalCount={totalItems}
                    limit={itemsPerPage}
                    onPageChange={handlePageChange}
                    onLimitChange={handleLimitChange}
                    showLimitSelector={true}
                    itemLabel="tickets"
                    isLoading={false}
                  />
                ) : (
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-6 py-4">
                    <div className="flex items-center justify-center">
                      <p className="text-sm text-gray-600">
                        {sortedTickets.length === 1
                          ? 'نمایش ۱ تکت'
                          : `نمایش ${convertToPersianDigits(sortedTickets.length)} تکت`}
                        {hasActiveFilters && allTickets.length > sortedTickets.length && (
                          <span className="mr-1 text-gray-500">
                            (فیلتر شده از {convertToPersianDigits(allTickets.length)} تکت کل)
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
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
                          !!searchTerm.trim(),
                          timePeriod !== 'all',
                          !!routeFilters.from,
                          !!routeFilters.to,
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
                <SimpleTicketFilters
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                  showFilters={true}
                  setShowFilters={setShowFilters}
                  timePeriod={timePeriod}
                  setTimePeriod={setTimePeriod}
                  routeFilters={routeFilters}
                  setRouteFilters={setRouteFilters}
                  showRouteFromDropdown={showRouteFromDropdown}
                  setShowRouteFromDropdown={setShowRouteFromDropdown}
                  showRouteToDropdown={showRouteToDropdown}
                  setShowRouteToDropdown={setShowRouteToDropdown}
                  uniqueRoutes={uniqueRoutes}
                  hasActiveFilters={hasActiveFilters}
                  clearAllFilters={clearAllFilters}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
