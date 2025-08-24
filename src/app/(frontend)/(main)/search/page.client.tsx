'use client'

import React, { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { X } from 'lucide-react'
import { Breadcrumbs } from '@/app/(frontend)/components/Breadcrumbs'
import { Pagination } from '@/components/Pagination'
import { SearchBar } from './components/SearchBar'
import { FiltersSidebar } from './components/FiltersSidebar'
import { TripResultsList } from './components/TripResultsList'
import { PopularRoutes } from './components/PopularRoutes'

interface Trip {
  id: string
  tripName: string
  price: number
  departureTime: string
  arrivalTime: string | null
  duration: string | null
  from: {
    id: string
    name: string
    province: string
    address?: string
  }
  to: {
    id: string
    name: string
    province: string
    address?: string
  } | null
  bus: {
    id: string
    number: string
    type: {
      id: string
      name: string
      amenities?: { amenity: string }[] | null
    }
  }
  availability: {
    totalSeats: number
    bookedSeats: number
    availableSeats: number
  }
  isBookingAllowed: boolean
  bookingBlockedReason?: string
  stops?: {
    terminal: {
      id: string
      name: string
      province: string
      address?: string
    }
    time: string
    isUserBoardingPoint?: boolean
    isUserDestination?: boolean
    isBeforeBoarding?: boolean
    isAfterDestination?: boolean
  }[]
  userBoardingIndex?: number
  userDestinationIndex?: number
  mainDeparture?: {
    id: string
    name: string
    province: string
    address?: string
    time: string
  }
}

interface SearchResult {
  success: boolean
  data?: {
    searchParams: {
      fromProvince: string
      toProvince: string
      originalDate: string
      convertedDate: string
    }
    trips: Trip[]
    pagination: {
      currentPage: number
      totalPages: number
      totalCount: number
      hasNextPage: boolean
      hasPrevPage: boolean
    }
    summary: {
      totalTrips: number
      availableTrips: number
      fullyBookedTrips: number
    }
  }
  error?: string
}

interface SearchPageClientProps {
  searchResult?: SearchResult
  searchParams: {
    from: string
    to: string
    date: string
    page?: string
  }
  provinces?: string[]
}

export const SearchPageClient = ({
  searchResult,
  searchParams: { from, to, date, page },
  provinces = [],
}: SearchPageClientProps) => {
  const router = useRouter()
  const searchParams_hook = useSearchParams()
  const [expandedTrips, setExpandedTrips] = useState<Set<string>>(new Set())
  const [showFilters, setShowFilters] = useState(false)

  // Filter and sort state
  const [filters, setFilters] = useState({
    departureTime: [] as string[],
    priceMin: '',
    priceMax: '',
    showSoldOut: true,
    availableOnly: false,
  })
  const [sortBy, setSortBy] = useState('departureTime')

  // Clear filters function
  const handleClearFilters = () => {
    setFilters({
      departureTime: [],
      priceMin: '',
      priceMax: '',
      showSoldOut: true,
      availableOnly: false,
    })
  }

  const toggleTripDetails = (tripId: string) => {
    const newExpanded = new Set(expandedTrips)
    if (newExpanded.has(tripId)) {
      newExpanded.delete(tripId)
    } else {
      newExpanded.add(tripId)
    }
    setExpandedTrips(newExpanded)
  }

  // Close filters when clicking outside or pressing ESC
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showFilters) {
        const target = event.target as Element
        const filterMenu = document.querySelector('.filter-menu')

        if (filterMenu && !filterMenu.contains(target)) {
          setShowFilters(false)
        }
      }
    }

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showFilters) {
        setShowFilters(false)
      }
    }

    if (showFilters) {
      document.addEventListener('click', handleClickOutside)
      document.addEventListener('keydown', handleEscapeKey)
    }

    return () => {
      document.removeEventListener('click', handleClickOutside)
      document.removeEventListener('keydown', handleEscapeKey)
    }
  }, [showFilters])

  const breadcrumbItems = [{ label: 'خانه', href: '/' }, { label: 'جستجوی سفرها' }]

  // Pagination handlers
  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams_hook.toString())
    params.set('page', newPage.toString())
    // Keep existing search parameters
    if (from) params.set('from', from)
    if (to) params.set('to', to)
    if (date) params.set('date', date)
    router.push(`/search?${params.toString()}`)
  }

  // Handle case when no search parameters are provided
  if (!from || !to) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 p-4" dir="rtl">
        <div className="max-w-6xl mx-auto">
          {/* Breadcrumbs */}
          <div className="mb-4">
            <Breadcrumbs items={breadcrumbItems} />
          </div>

          {/* Search Bar */}
          <SearchBar initialFrom={from} initialTo={to} initialDate={date} provinces={provinces} />

          {/* Popular Routes */}
          <PopularRoutes />
        </div>
      </div>
    )
  }

  // Handle error state when search fails
  if (!searchResult?.success || !searchResult?.data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 p-4" dir="rtl">
        <div className="max-w-6xl mx-auto">
          <div className="mb-4">
            <Breadcrumbs items={breadcrumbItems} />
          </div>

          <SearchBar initialFrom={from} initialTo={to} initialDate={date} provinces={provinces} />

          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-700 mb-2">نتیجه‌ای یافت نشد</h2>
              <p className="text-gray-500">ما نتوانستیم سفری برای معیارهای جستجوی شما پیدا کنیم</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const { data } = searchResult

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 p-4" dir="rtl">
      <div className="max-w-6xl mx-auto">
        {/* Breadcrumbs */}
        <div className="mb-4">
          <Breadcrumbs items={[{ label: 'خانه', href: '/' }, { label: 'نتایج جستجو' }]} />
        </div>

        {/* Search Bar */}
        <SearchBar initialFrom={from} initialTo={to} initialDate={date} provinces={provinces} />

        {/* Main Content with Filters */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filters Sidebar - Desktop */}
          <div className="hidden lg:block lg:w-1/4">
            <FiltersSidebar filters={filters} setFilters={setFilters} />
          </div>

          {/* Trip Results */}
          <div className="flex-1">
            <TripResultsList
              trips={data.trips || []}
              filters={filters}
              sortBy={sortBy}
              setSortBy={setSortBy}
              expandedTrips={expandedTrips}
              onToggleExpand={toggleTripDetails}
              totalTrips={data.summary?.totalTrips || 0}
              searchParams={{ from, to, date }}
              onClearFilters={handleClearFilters}
              showFilters={() => setShowFilters(true)}
            />

            {/* Pagination */}
            {data.pagination && data.trips.length > 0 && data.pagination.totalCount > 0 && (
              <div className="mt-8">
                <Pagination
                  currentPage={data.pagination.currentPage}
                  totalPages={data.pagination.totalPages}
                  totalCount={data.pagination.totalCount}
                  limit={10}
                  onPageChange={handlePageChange}
                  onLimitChange={() => {}} // No-op since limit is fixed
                  showLimitSelector={false}
                />
              </div>
            )}
          </div>
        </div>

        {/* Mobile Filters Side Menu */}
        <div
          className={`lg:hidden fixed inset-0 z-50 transition-all duration-300 ease-in-out ${showFilters ? 'visible opacity-100' : 'invisible opacity-0'}`}
        >
          <div className="absolute inset-0 bg-black bg-opacity-50 transition-opacity duration-300" />
          <div
            className={`absolute left-0 top-0 h-full w-80 max-w-[85vw] bg-white transform transition-transform duration-300 ease-in-out ${showFilters ? 'translate-x-0' : '-translate-x-full'}`}
          >
            <div className="filter-menu h-full overflow-y-auto">
              {/* Filter Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-orange-50">
                <h3 className="text-lg font-semibold text-gray-800">فیلترها</h3>
                <button
                  onClick={() => setShowFilters(false)}
                  className="p-2 hover:bg-orange-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Filter Content */}
              <div className="p-4">
                <FiltersSidebar filters={filters} setFilters={setFilters} isMobile={true} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
