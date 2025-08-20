'use client'

import React, { useState } from 'react'
import { Breadcrumbs } from '@/app/(frontend)/components/Breadcrumbs'
import { SearchBar } from './components/SearchBar'
import { FiltersSidebar } from './components/FiltersSidebar'
import { TripResultsList } from './components/TripResultsList'

interface Trip {
  id: string
  name: string
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
  }
}

export const SearchPageClient = ({
  searchResult,
  searchParams: { from, to, date },
}: SearchPageClientProps) => {
  const [expandedTrips, setExpandedTrips] = useState<Set<string>>(new Set())
  const [showFilters, setShowFilters] = useState(false)

  // Filter and sort state
  const [filters, setFilters] = useState({
    departureTime: [] as string[],
    priceMin: '',
    priceMax: '',
    busTypes: [] as string[],
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
      busTypes: [],
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

  const breadcrumbItems = [{ label: 'Home', href: '/' }, { label: 'Search Trips' }]

  // Handle case when no search parameters are provided
  if (!from || !to) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 p-4">
        <div className="max-w-6xl mx-auto">
          {/* Breadcrumbs */}
          <div className="mb-4">
            <Breadcrumbs items={breadcrumbItems} />
          </div>

          {/* Search Bar */}
          <SearchBar initialFrom={from} initialTo={to} initialDate={date} />

          {/* Welcome Message */}
          <div className="mt-8 bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="max-w-2xl mx-auto">
              <div className="w-20 h-20 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-10 h-10 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>

              <h1 className="text-3xl font-bold text-gray-900 mb-4">Find Your Perfect Bus Trip</h1>

              <p className="text-lg text-gray-600 mb-6">
                Search for bus trips between cities across Afghanistan. Simply select your departure
                and destination cities, choose your travel date, and find the best options for your
                journey.
              </p>

              <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-500">
                <div className="flex items-center justify-center gap-2">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                    <span className="text-orange-600 font-bold">1</span>
                  </div>
                  <span>Select departure city</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                    <span className="text-orange-600 font-bold">2</span>
                  </div>
                  <span>Choose destination</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                    <span className="text-orange-600 font-bold">3</span>
                  </div>
                  <span>Pick your date</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Handle error state when search fails
  if (!searchResult?.success || !searchResult?.data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="mb-4">
            <Breadcrumbs items={breadcrumbItems} />
          </div>

          <SearchBar initialFrom={from} initialTo={to} initialDate={date} />

          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-700 mb-2">No results found</h2>
              <p className="text-gray-500">We couldn't find any trips for your search criteria</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const { data } = searchResult

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Breadcrumbs */}
        <div className="mb-4">
          <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Search Results' }]} />
        </div>

        {/* Search Bar */}
        <SearchBar initialFrom={from} initialTo={to} initialDate={date} />

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
          </div>
        </div>

        {/* Mobile Filters Side Menu */}
        <div
          className={`lg:hidden fixed inset-0 z-50 transition-all duration-300 ease-in-out ${showFilters ? 'visible opacity-100' : 'invisible opacity-0'}`}
        >
          <div className="absolute inset-0 bg-black bg-opacity-50 transition-opacity duration-300" />
          <div
            className={`absolute right-0 top-0 h-full w-80 max-w-[85vw] bg-white transform transition-transform duration-300 ease-in-out ${showFilters ? 'translate-x-0' : 'translate-x-full'}`}
          >
            <div className="filter-menu h-full overflow-y-auto">
              {/* Filter Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-orange-50">
                <h3 className="text-lg font-semibold text-gray-800">Filters</h3>
                <button
                  onClick={() => setShowFilters(false)}
                  className="p-2 hover:bg-orange-100 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
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
