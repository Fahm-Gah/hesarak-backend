'use client'

import React, { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { getClientSideURL } from '@/utils/getURL'
import { Breadcrumbs } from '@/app/(frontend)/components/Breadcrumbs'

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

// Function to convert 24-hour time to 12-hour format
const formatTo12Hour = (time24: string): string => {
  const [hours, minutes] = time24.split(':')
  const hour = parseInt(hours, 10)
  const period = hour >= 12 ? 'PM' : 'AM'
  const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
  return `${hour12}:${minutes} ${period}`
}

export const SearchPageClient = () => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedTrips, setExpandedTrips] = useState<Set<string>>(new Set())

  const from = searchParams.get('from')
  const to = searchParams.get('to')
  const date = searchParams.get('date')

  const toggleTripDetails = (tripId: string) => {
    const newExpanded = new Set(expandedTrips)
    if (newExpanded.has(tripId)) {
      newExpanded.delete(tripId)
    } else {
      newExpanded.add(tripId)
    }
    setExpandedTrips(newExpanded)
  }

  const navigateToTripDetails = (trip: Trip) => {
    // Pass the search date to the trip details page
    const searchDate =
      date ||
      (() => {
        const tomorrow = new Date()
        tomorrow.setDate(tomorrow.getDate() + 1)
        return tomorrow.toISOString().split('T')[0] // YYYY-MM-DD format
      })()

    // Build URL with user's specific from/to terminals from search results
    const params = new URLSearchParams()
    params.append('date', searchDate)

    // Use the user's boarding and destination terminals from the search result
    if (trip.from?.id) {
      params.append('from', trip.from.id)
    }
    if (trip.to?.id) {
      params.append('to', trip.to.id)
    }

    // Also pass the original search provinces for breadcrumb navigation
    if (from) {
      params.append('fromProvince', from)
    }
    if (to) {
      params.append('toProvince', to)
    }

    router.push(`/trip/${trip.id}?${params.toString()}`)
  }

  useEffect(() => {
    const searchTrips = async () => {
      if (!from || !to || !date) {
        setError('Missing search parameters')
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setError(null)

        const searchParamsObj = new URLSearchParams({
          from,
          to,
          date,
        })

        const response = await fetch(
          `${getClientSideURL()}/api/trips/search?${searchParamsObj.toString()}`,
        )

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to search trips')
        }

        const result: SearchResult = await response.json()
        setSearchResult(result)
      } catch (err) {
        console.error('Error searching trips:', err)
        setError(err instanceof Error ? err.message : 'Failed to search trips')
      } finally {
        setIsLoading(false)
      }
    }

    searchTrips()
  }, [from, to, date])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <svg
                className="animate-spin h-12 w-12 text-orange-600 mx-auto mb-4"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <h2 className="text-xl font-semibold text-gray-700 mb-2">Searching for trips...</h2>
              <p className="text-gray-500">Please wait while we find the best routes for you</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="bg-red-100 text-red-700 p-6 rounded-lg">
                <h2 className="text-xl font-semibold mb-2">Search Error</h2>
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!searchResult?.success || !searchResult.data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 p-4">
        <div className="max-w-6xl mx-auto">
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

  const breadcrumbItems = [{ label: 'Home', href: '/' }, { label: 'Search Results' }]

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Breadcrumbs */}
        <div className="mb-4">
          <Breadcrumbs items={breadcrumbItems} />
        </div>

        {/* Search Summary */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">
                {data.searchParams.fromProvince} → {data.searchParams.toProvince}
              </h1>
              <p className="text-gray-600">Travel date: {data.searchParams.originalDate}</p>
            </div>
            <div className="mt-4 md:mt-0 text-right">
              <p className="text-sm text-gray-500">
                {data.summary.availableTrips} of {data.summary.totalTrips} trips available
              </p>
            </div>
          </div>
        </div>

        {/* Trip Results */}
        <div className="space-y-4">
          {data.trips.map((trip) => (
            <div
              key={trip.id}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                {/* Trip Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-800">
                        {formatTo12Hour(trip.departureTime)}
                      </p>
                      <p className="text-sm text-gray-500">{trip.from.name}</p>
                    </div>
                    <div className="flex-1 flex items-center">
                      <div className="flex-1 border-t-2 border-dashed border-gray-300"></div>
                      <div className="px-4 text-center">
                        <p className="text-sm text-gray-500">{trip.duration || 'Duration N/A'}</p>
                      </div>
                      <div className="flex-1 border-t-2 border-dashed border-gray-300"></div>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-800">
                        {trip.arrivalTime ? formatTo12Hour(trip.arrivalTime) : 'N/A'}
                      </p>
                      <p className="text-sm text-gray-500">{trip.to?.name || 'Destination'}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-3">
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      <span className="bg-gray-100 px-3 py-1 rounded-full">
                        Bus: {trip.bus.number}
                      </span>
                      <span className="bg-gray-100 px-3 py-1 rounded-full">
                        {trip.bus.type.name}
                      </span>
                    </div>
                    {trip.stops && trip.stops.length > 0 && (
                      <button
                        onClick={() => toggleTripDetails(trip.id)}
                        className="flex items-center gap-2 bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1 rounded-full transition-colors text-sm"
                      >
                        <span>
                          {expandedTrips.has(trip.id) ? 'Hide Route' : 'View Route'} (
                          {trip.stops.length} stops)
                        </span>
                        <svg
                          className={`w-4 h-4 transition-transform duration-200 ${
                            expandedTrips.has(trip.id) ? 'rotate-180' : ''
                          }`}
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
                      </button>
                    )}
                  </div>

                  {/* Route Details */}
                  {expandedTrips.has(trip.id) && trip.stops && trip.stops.length > 0 && (
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <h4 className="font-semibold text-gray-700 mb-3">Complete Route</h4>
                      <div className="space-y-2">
                        {/* Main Bus Departure Terminal (always shown) */}
                        {trip.mainDeparture && (
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-3 h-3 rounded-full flex-shrink-0 ${
                                trip.userBoardingIndex === -1 ? 'bg-green-500' : 'bg-blue-500'
                              }`}
                            ></div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span
                                    className={`font-medium ${
                                      trip.userBoardingIndex === -1
                                        ? 'text-green-700'
                                        : 'text-blue-700'
                                    }`}
                                  >
                                    {trip.mainDeparture.name}
                                  </span>
                                  <span className="text-sm text-gray-500">
                                    ({trip.mainDeparture.province})
                                  </span>
                                  {trip.userBoardingIndex === -1 ? (
                                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                                      Your boarding point
                                    </span>
                                  ) : (
                                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                      Bus starts here
                                    </span>
                                  )}
                                </div>
                                <span
                                  className={`text-sm font-medium ${
                                    trip.userBoardingIndex === -1
                                      ? 'text-green-600'
                                      : 'text-blue-600'
                                  }`}
                                >
                                  {formatTo12Hour(trip.mainDeparture.time)}
                                </span>
                              </div>
                              {trip.mainDeparture.address && (
                                <p className="text-xs text-gray-500">
                                  {trip.mainDeparture.address}
                                </p>
                              )}
                            </div>
                          </div>
                        )}

                        {/* All Stops */}
                        {trip.stops.map((stop, index) => {
                          let dotColor = 'bg-gray-400'
                          let textColor = 'text-gray-600'
                          let timeColor = 'text-gray-600'
                          let badge = null

                          if (stop.isUserBoardingPoint) {
                            dotColor = 'bg-green-500'
                            textColor = 'text-green-700'
                            timeColor = 'text-green-600'
                            badge = (
                              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                                Your boarding point
                              </span>
                            )
                          } else if (stop.isUserDestination) {
                            dotColor = 'bg-red-500'
                            textColor = 'text-red-700'
                            timeColor = 'text-red-600'
                            badge = (
                              <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                                Your destination
                              </span>
                            )
                          } else if (stop.isBeforeBoarding) {
                            dotColor = 'bg-gray-300'
                            textColor = 'text-gray-500'
                            timeColor = 'text-gray-500'
                          } else if (stop.isAfterDestination) {
                            dotColor = 'bg-gray-300'
                            textColor = 'text-gray-500'
                            timeColor = 'text-gray-500'
                          }

                          return (
                            <div key={index} className="flex items-center gap-3">
                              <div
                                className={`w-3 h-3 rounded-full flex-shrink-0 ${dotColor}`}
                              ></div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <span className={`font-medium ${textColor}`}>
                                      {stop.terminal.name}
                                    </span>
                                    <span className="text-sm text-gray-500">
                                      ({stop.terminal.province})
                                    </span>
                                    {badge}
                                  </div>
                                  <span className={`text-sm font-medium ${timeColor}`}>
                                    {formatTo12Hour(stop.time)}
                                  </span>
                                </div>
                                {stop.terminal.address && (
                                  <p className="text-xs text-gray-500">{stop.terminal.address}</p>
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Price and Book Button */}
                <div className="mt-4 lg:mt-0 lg:ml-6 text-center lg:text-right">
                  <div className="mb-3">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                        trip.availability.availableSeats > 0
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {trip.availability.availableSeats} seats available
                    </span>
                  </div>
                  <p className="text-3xl font-bold text-orange-600 mb-2">
                    {trip.price.toLocaleString()} AF
                  </p>
                  <button
                    onClick={() => navigateToTripDetails(trip)}
                    disabled={trip.availability.availableSeats === 0}
                    className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                      trip.availability.availableSeats > 0
                        ? 'bg-orange-600 hover:bg-orange-700 text-white'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {trip.availability.availableSeats > 0 ? 'Select Seats' : 'Sold Out'}
                  </button>
                </div>
              </div>

              {/* Amenities */}
              {trip.bus.type.amenities && trip.bus.type.amenities.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-500 mb-2">Amenities:</p>
                  <div className="flex flex-wrap gap-2">
                    {trip.bus.type.amenities.map((amenityObj, index) => (
                      <span
                        key={index}
                        className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded"
                      >
                        {amenityObj.amenity}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* No Available Trips Message */}
        {data.summary.availableTrips === 0 && data.summary.totalTrips > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
            <h3 className="text-lg font-semibold text-yellow-800 mb-2">All trips are sold out</h3>
            <p className="text-yellow-700">
              We found {data.summary.totalTrips} trips for your route, but all seats are currently
              booked. Please try a different date.
            </p>
          </div>
        )}

        {/* No Trips Found */}
        {data.summary.totalTrips === 0 && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No trips found</h3>
            <p className="text-gray-600">
              We couldn't find any trips for this route on the selected date. Please try a different
              date or route.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
