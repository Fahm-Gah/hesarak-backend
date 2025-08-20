'use client'

import React from 'react'
import { TripCard } from './TripCard'

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

interface FiltersType {
  departureTime: string[]
  priceMin: string
  priceMax: string
  busTypes: string[]
  showSoldOut: boolean
  availableOnly: boolean
}

interface TripResultsListProps {
  trips: Trip[]
  filters: FiltersType
  sortBy: string
  setSortBy: (sort: string) => void
  expandedTrips: Set<string>
  onToggleExpand: (tripId: string) => void
  totalTrips: number
  searchParams: {
    from: string
    to: string
    date: string
  }
  onClearFilters: () => void
  showFilters?: () => void
}

export const TripResultsList = ({
  trips,
  filters,
  sortBy,
  setSortBy,
  expandedTrips,
  onToggleExpand,
  totalTrips,
  searchParams,
  onClearFilters,
  showFilters,
}: TripResultsListProps) => {
  const [showSortDropdown, setShowSortDropdown] = React.useState(false)

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = () => {
      setShowSortDropdown(false)
    }

    if (showSortDropdown) {
      document.addEventListener('click', handleClickOutside)
    }

    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  }, [showSortDropdown])

  // Apply filters and sorting
  const filteredAndSortedTrips = React.useMemo(() => {
    let filtered = [...trips]

    // Filter by availability
    if (filters.availableOnly && !filters.showSoldOut) {
      filtered = filtered.filter(
        (trip) => trip.isBookingAllowed && trip.availability.availableSeats > 0,
      )
    } else if (!filters.showSoldOut) {
      filtered = filtered.filter((trip) => trip.availability.availableSeats > 0)
    }

    // Filter by departure time
    if (filters.departureTime.length > 0) {
      filtered = filtered.filter((trip) => {
        const hour = parseInt(trip.departureTime.split(':')[0])
        return filters.departureTime.some((timeSlot) => {
          switch (timeSlot) {
            case 'morning':
              return hour >= 6 && hour < 12
            case 'afternoon':
              return hour >= 12 && hour < 18
            case 'evening':
              return hour >= 18 && hour < 24
            case 'night':
              return hour >= 0 && hour < 6
            default:
              return false
          }
        })
      })
    }

    // Filter by price range
    const minPrice = filters.priceMin ? parseInt(filters.priceMin) : 0
    const maxPrice = filters.priceMax ? parseInt(filters.priceMax) : Infinity
    if (filters.priceMin || filters.priceMax) {
      filtered = filtered.filter((trip) => trip.price >= minPrice && trip.price <= maxPrice)
    }

    // Filter by bus type
    if (filters.busTypes.length > 0) {
      filtered = filtered.filter((trip) =>
        filters.busTypes.some((type) =>
          trip.bus.type.name.toLowerCase().includes(type.toLowerCase()),
        ),
      )
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'priceAsc':
          return a.price - b.price
        case 'priceDesc':
          return b.price - a.price
        case 'duration':
          const aDur = a.duration ? parseInt(a.duration.split(' ')[0]) : 999
          const bDur = b.duration ? parseInt(b.duration.split(' ')[0]) : 999
          return aDur - bDur
        case 'departureTime':
        default:
          return a.departureTime.localeCompare(b.departureTime)
      }
    })

    return filtered
  }, [trips, filters, sortBy])

  return (
    <div className="w-full">
      {/* Mobile Layout */}
      <div className="lg:hidden mb-4">
        <div className="flex items-center justify-between mb-2">
          {/* Mobile Filter Button */}
          {showFilters && (
            <button
              onClick={showFilters}
              className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 transition-colors text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                />
              </svg>
              Filters
            </button>
          )}

          {/* Sort Dropdown */}
          <div className="relative">
            <div
              onClick={(e) => {
                e.stopPropagation()
                setShowSortDropdown(!showSortDropdown)
              }}
              className="relative px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white cursor-pointer hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 pr-10 min-w-[160px]"
            >
              <span className="text-gray-900">
                {sortBy === 'departureTime' && 'Departure'}
                {sortBy === 'priceAsc' && 'Price ↑'}
                {sortBy === 'priceDesc' && 'Price ↓'}
                {sortBy === 'duration' && 'Duration'}
              </span>
              <svg
                className={`absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 transition-transform duration-200 ${showSortDropdown ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>

            {showSortDropdown && (
              <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-50 min-w-[200px]">
                {[
                  { value: 'departureTime', label: 'Sort by: Departure Time' },
                  { value: 'priceAsc', label: 'Sort by: Price (Low to High)' },
                  { value: 'priceDesc', label: 'Sort by: Price (High to Low)' },
                  { value: 'duration', label: 'Sort by: Duration' },
                ].map((option, index) => (
                  <div
                    key={option.value}
                    onClick={(e) => {
                      e.stopPropagation()
                      setSortBy(option.value)
                      setShowSortDropdown(false)
                    }}
                    className={`px-3 py-2 hover:bg-orange-50 hover:text-orange-700 cursor-pointer transition-colors duration-150 text-sm ${
                      index === 0 ? 'rounded-t-lg' : ''
                    } ${index === 3 ? 'rounded-b-lg' : 'border-b border-gray-100'} ${
                      sortBy === option.value ? 'bg-orange-50 text-orange-700' : 'text-gray-700'
                    }`}
                  >
                    {option.label}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <p className="text-sm text-gray-600">
          {filteredAndSortedTrips.length} of {totalTrips} trips found
        </p>
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:flex items-center justify-between mb-4">
        <p className="text-sm text-gray-600">
          {filteredAndSortedTrips.length} of {totalTrips} trips found
        </p>
        <div className="flex items-center gap-3">
          {/* Sort Dropdown */}
          <div className="relative">
            <div
              onClick={(e) => {
                e.stopPropagation()
                setShowSortDropdown(!showSortDropdown)
              }}
              className="relative px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white cursor-pointer hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 pr-10 min-w-[200px]"
            >
              <span className="text-gray-900">
                Sort by: {sortBy === 'departureTime' && 'Departure Time'}
                {sortBy === 'priceAsc' && 'Price (Low to High)'}
                {sortBy === 'priceDesc' && 'Price (High to Low)'}
                {sortBy === 'duration' && 'Duration'}
              </span>
              <svg
                className={`absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 transition-transform duration-200 ${showSortDropdown ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>

            {showSortDropdown && (
              <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-50 min-w-[200px]">
                {[
                  { value: 'departureTime', label: 'Sort by: Departure Time' },
                  { value: 'priceAsc', label: 'Sort by: Price (Low to High)' },
                  { value: 'priceDesc', label: 'Sort by: Price (High to Low)' },
                  { value: 'duration', label: 'Sort by: Duration' },
                ].map((option, index) => (
                  <div
                    key={option.value}
                    onClick={(e) => {
                      e.stopPropagation()
                      setSortBy(option.value)
                      setShowSortDropdown(false)
                    }}
                    className={`px-3 py-2 hover:bg-orange-50 hover:text-orange-700 cursor-pointer transition-colors duration-150 text-sm ${
                      index === 0 ? 'rounded-t-lg' : ''
                    } ${index === 3 ? 'rounded-b-lg' : 'border-b border-gray-100'} ${
                      sortBy === option.value ? 'bg-orange-50 text-orange-700' : 'text-gray-700'
                    }`}
                  >
                    {option.label}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {filteredAndSortedTrips.map((trip) => (
          <TripCard
            key={trip.id}
            trip={trip}
            isExpanded={expandedTrips.has(trip.id)}
            onToggleExpand={onToggleExpand}
            searchParams={searchParams}
          />
        ))}
      </div>

      {/* No Filtered Trips Message */}
      {filteredAndSortedTrips.length === 0 && totalTrips > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">
            No trips match your filters
          </h3>
          <p className="text-yellow-700 mb-4">
            We found {totalTrips} trips for this route, but none match your current filters. Try
            adjusting your filters or clearing them to see all available trips.
          </p>
          <button
            onClick={onClearFilters}
            className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
          >
            Clear All Filters
          </button>
        </div>
      )}

      {/* No Trips Found */}
      {totalTrips === 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">No trips found</h3>
          <p className="text-gray-600">
            We couldn't find any trips for this route on the selected date. Please try a different
            date or route.
          </p>
        </div>
      )}
    </div>
  )
}
