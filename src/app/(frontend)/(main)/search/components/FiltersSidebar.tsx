'use client'

import React from 'react'

interface FiltersType {
  departureTime: string[]
  priceMin: string
  priceMax: string
  busTypes: string[]
  showSoldOut: boolean
  availableOnly: boolean
}

interface FiltersSidebarProps {
  filters: FiltersType
  setFilters: React.Dispatch<React.SetStateAction<FiltersType>>
  isMobile?: boolean
}

export const FiltersSidebar = ({ filters, setFilters, isMobile = false }: FiltersSidebarProps) => {
  const handleDepartureTimeChange = (value: string, checked: boolean) => {
    if (checked) {
      setFilters((f) => ({ ...f, departureTime: [...f.departureTime, value] }))
    } else {
      setFilters((f) => ({ ...f, departureTime: f.departureTime.filter((t) => t !== value) }))
    }
  }

  const handleBusTypeChange = (type: string, checked: boolean) => {
    if (checked) {
      setFilters((f) => ({ ...f, busTypes: [...f.busTypes, type] }))
    } else {
      setFilters((f) => ({ ...f, busTypes: f.busTypes.filter((t) => t !== type) }))
    }
  }

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

  const departureTimeOptions = [
    { value: 'morning', label: 'Morning (6 AM - 12 PM)' },
    { value: 'afternoon', label: 'Afternoon (12 PM - 6 PM)' },
    { value: 'evening', label: 'Evening (6 PM - 12 AM)' },
    { value: 'night', label: 'Night (12 AM - 6 AM)' },
  ]

  const busTypeOptions = ['VIP', 'Deluxe', 'Standard']

  const getTimeIcon = (timeValue: string) => {
    switch (timeValue) {
      case 'morning':
        return (
          <svg
            className="w-4 h-4 text-yellow-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
        )
      case 'afternoon':
        return (
          <svg
            className="w-4 h-4 text-orange-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
        )
      case 'evening':
        return (
          <svg
            className="w-4 h-4 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
            />
          </svg>
        )
      case 'night':
        return (
          <svg
            className="w-4 h-4 text-indigo-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
            />
          </svg>
        )
      default:
        return null
    }
  }

  const getBusTypeIcon = (type: string) => {
    switch (type) {
      case 'VIP':
        return (
          <svg
            className="w-4 h-4 text-purple-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 3l14 9-14 9V3z"
            />
          </svg>
        )
      case 'Deluxe':
        return (
          <svg
            className="w-4 h-4 text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
        )
      case 'Standard':
        return (
          <svg
            className="w-4 h-4 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        )
      default:
        return null
    }
  }

  return (
    <div
      className={
        isMobile
          ? ''
          : 'bg-gradient-to-br from-white via-orange-50/20 to-red-50/20 rounded-2xl shadow-lg border border-orange-200/50 p-6 sticky top-4 backdrop-blur-sm'
      }
    >
      {!isMobile && (
        <div className="flex items-center gap-3 mb-6">
          <div className="w-2 h-8 bg-gradient-to-b from-orange-500 to-red-500 rounded-full" />
          <h3 className="text-xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
            Filters
          </h3>
        </div>
      )}

      {/* Departure Time Filter */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <svg
            className="w-5 h-5 text-orange-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h4 className="font-semibold text-gray-800">Departure Time</h4>
        </div>
        <div className="space-y-3">
          {departureTimeOptions.map(({ value, label }) => (
            <label
              key={value}
              className={`flex items-center p-3 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${
                filters.departureTime.includes(value)
                  ? 'bg-gradient-to-r from-orange-50 to-red-50 border-orange-300 shadow-sm'
                  : 'bg-white/80 border-gray-200 hover:border-orange-200'
              }`}
            >
              <input
                type="checkbox"
                className="mr-3 w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500 focus:ring-2"
                checked={filters.departureTime.includes(value)}
                onChange={(e) => handleDepartureTimeChange(value, e.target.checked)}
              />
              <div className="flex items-center gap-3">
                {getTimeIcon(value)}
                <span className="text-sm font-medium text-gray-700">{label}</span>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range Filter */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <svg
            className="w-5 h-5 text-orange-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
            />
          </svg>
          <h4 className="font-semibold text-gray-800">Price Range</h4>
        </div>
        <div className="bg-gradient-to-r from-orange-50 to-red-50 p-4 rounded-xl border border-orange-200/50">
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-600 mb-1">Min (AF)</label>
              <input
                type="number"
                placeholder="0"
                value={filters.priceMin}
                onChange={(e) => setFilters((f) => ({ ...f, priceMin: e.target.value }))}
                className="w-full px-3 py-2 bg-white border border-orange-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-300"
              />
            </div>
            <div className="flex items-end pb-2">
              <div className="w-6 h-0.5 bg-gray-400 rounded"></div>
            </div>
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-600 mb-1">Max (AF)</label>
              <input
                type="number"
                placeholder="∞"
                value={filters.priceMax}
                onChange={(e) => setFilters((f) => ({ ...f, priceMax: e.target.value }))}
                className="w-full px-3 py-2 bg-white border border-orange-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-300"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bus Type Filter */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <svg
            className="w-5 h-5 text-orange-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"
            />
          </svg>
          <h4 className="font-semibold text-gray-800">Bus Type</h4>
        </div>
        <div className="grid grid-cols-1 gap-2">
          {busTypeOptions.map((type) => (
            <label
              key={type}
              className={`flex items-center p-3 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${
                filters.busTypes.includes(type)
                  ? 'bg-gradient-to-r from-orange-50 to-red-50 border-orange-300 shadow-sm'
                  : 'bg-white/80 border-gray-200 hover:border-orange-200'
              }`}
            >
              <input
                type="checkbox"
                className="mr-3 w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500 focus:ring-2"
                checked={filters.busTypes.includes(type)}
                onChange={(e) => handleBusTypeChange(type, e.target.checked)}
              />
              <div className="flex items-center gap-3">
                {getBusTypeIcon(type)}
                <span className="text-sm font-medium text-gray-700">{type}</span>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Availability Filter */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <svg
            className="w-5 h-5 text-orange-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h4 className="font-semibold text-gray-800">Availability</h4>
        </div>
        <div className="space-y-3">
          <label
            className={`flex items-center p-3 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${
              filters.availableOnly
                ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-300 shadow-sm'
                : 'bg-white/80 border-gray-200 hover:border-green-200'
            }`}
          >
            <input
              type="checkbox"
              className="mr-3 w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 focus:ring-2"
              checked={filters.availableOnly}
              onChange={(e) => setFilters((f) => ({ ...f, availableOnly: e.target.checked }))}
            />
            <div className="flex items-center gap-3">
              <svg
                className="w-4 h-4 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span className="text-sm font-medium text-gray-700">Available Only</span>
            </div>
          </label>
          <label
            className={`flex items-center p-3 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${
              filters.showSoldOut
                ? 'bg-gradient-to-r from-red-50 to-pink-50 border-red-300 shadow-sm'
                : 'bg-white/80 border-gray-200 hover:border-red-200'
            }`}
          >
            <input
              type="checkbox"
              className="mr-3 w-4 h-4 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500 focus:ring-2"
              checked={filters.showSoldOut}
              onChange={(e) => setFilters((f) => ({ ...f, showSoldOut: e.target.checked }))}
            />
            <div className="flex items-center gap-3">
              <svg
                className="w-4 h-4 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <span className="text-sm font-medium text-gray-700">Show Sold Out</span>
            </div>
          </label>
        </div>
      </div>

      <button
        onClick={handleClearFilters}
        className="w-full px-4 py-3 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 rounded-xl transition-all duration-200 font-medium shadow-sm hover:shadow-md flex items-center justify-center gap-2"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
        Clear Filters
      </button>
    </div>
  )
}
