'use client'

import React from 'react'
import { Filter, Search, X, ChevronDown, ChevronUp, Calendar } from 'lucide-react'

interface Route {
  name: string
  province: string
}

interface TicketFiltersProps {
  // Search state
  searchTerm: string
  setSearchTerm: (term: string) => void

  // Filter visibility
  showFilters: boolean
  setShowFilters: (show: boolean) => void

  // Status filters
  statusFilters: string[]
  setStatusFilters: (filters: string[]) => void
  showStatusDropdown: boolean
  setShowStatusDropdown: (show: boolean) => void

  // Date range
  dateRange: { from: string; to: string }
  setDateRange: (range: { from: string; to: string }) => void

  // Route filters
  routeFilters: { from: string; to: string }
  setRouteFilters: (filters: { from: string; to: string }) => void
  showRouteFromDropdown: boolean
  setShowRouteFromDropdown: (show: boolean) => void
  showRouteToDropdown: boolean
  setShowRouteToDropdown: (show: boolean) => void
  uniqueRoutes: { from: Route[]; to: Route[] }

  // Filter management
  hasActiveFilters: boolean
  clearAllFilters: () => void

  // Results
  filteredCount: number
  totalCount: number
}

export const TicketFilters = ({
  searchTerm,
  setSearchTerm,
  showFilters,
  setShowFilters,
  statusFilters,
  setStatusFilters,
  showStatusDropdown,
  setShowStatusDropdown,
  dateRange,
  setDateRange,
  routeFilters,
  setRouteFilters,
  showRouteFromDropdown,
  setShowRouteFromDropdown,
  showRouteToDropdown,
  setShowRouteToDropdown,
  uniqueRoutes,
  hasActiveFilters,
  clearAllFilters,
  filteredCount,
  totalCount,
}: TicketFiltersProps) => {
  return (
    <>
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        {/* Search and Filter Toggle Row */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-4">
          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by ticket number, route, or bus..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filter Toggle and Clear */}
          <div className="flex items-center gap-3">
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-red-600 transition-colors"
              >
                <X className="w-4 h-4" />
                Clear Filters
              </button>
            )}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all duration-200 ${
                showFilters || hasActiveFilters
                  ? 'bg-orange-100 text-orange-700 border border-orange-200'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
              }`}
            >
              <Filter className="w-4 h-4" />
              <span className="hidden sm:inline">Filters</span>
              <span className="sm:hidden">Filter</span>
              {hasActiveFilters && (
                <span className="bg-orange-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {
                    [
                      statusFilters.length > 0,
                      !!searchTerm,
                      !!dateRange.from,
                      !!dateRange.to,
                      !!routeFilters.from,
                      !!routeFilters.to,
                    ].filter(Boolean).length
                  }
                </span>
              )}
              <ChevronDown className="w-4 h-4 sm:hidden" />
              {showFilters ? (
                <ChevronUp className="w-4 h-4 hidden sm:flex" />
              ) : (
                <ChevronDown className="w-4 h-4 hidden sm:flex" />
              )}
            </button>
          </div>
        </div>

        {/* Desktop Collapsible Filters */}
        {showFilters && (
          <div className="hidden sm:block border-t border-gray-200 pt-4 space-y-4 animate-in slide-in-from-top-2 duration-200">
            {/* Status Filter */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setShowStatusDropdown(!showStatusDropdown)
                  setShowRouteFromDropdown(false)
                  setShowRouteToDropdown(false)
                }}
                className="w-full sm:w-48 px-3 py-2.5 border border-gray-300 rounded-lg bg-white text-left text-sm hover:bg-gray-50 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors flex items-center justify-between"
              >
                <span className="text-gray-900">
                  {statusFilters.length === 0 ? 'All Status' : `${statusFilters.length} selected`}
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${showStatusDropdown ? 'rotate-180' : ''}`}
                />
              </button>

              {showStatusDropdown && (
                <div className="absolute top-full left-0 right-0 sm:right-auto sm:w-48 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-50">
                  {[
                    { value: 'paid', label: 'Paid', color: 'text-green-700' },
                    { value: 'pending', label: 'Pending Payment', color: 'text-yellow-700' },
                    { value: 'cancelled', label: 'Cancelled', color: 'text-red-700' },
                  ].map((status) => (
                    <label
                      key={status.value}
                      className="flex items-center px-3 py-2 hover:bg-orange-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={statusFilters.includes(status.value)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setStatusFilters([...statusFilters, status.value])
                          } else {
                            setStatusFilters(statusFilters.filter((s) => s !== status.value))
                          }
                        }}
                        className="mr-2 w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500 focus:ring-2"
                      />
                      <span className={`text-sm ${status.color}`}>{status.label}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Date Range Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">From Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="date"
                    value={dateRange.from}
                    onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="date"
                    value={dateRange.to}
                    onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Route Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  From Location
                </label>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowRouteFromDropdown(!showRouteFromDropdown)
                    setShowStatusDropdown(false)
                    setShowRouteToDropdown(false)
                  }}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg bg-white text-left text-sm hover:bg-gray-50 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors flex items-center justify-between"
                >
                  <span className="text-gray-900">{routeFilters.from || 'All locations'}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${showRouteFromDropdown ? 'rotate-180' : ''}`}
                  />
                </button>

                {showRouteFromDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-48 overflow-y-auto">
                    <div
                      onClick={() => {
                        setRouteFilters({ ...routeFilters, from: '' })
                        setShowRouteFromDropdown(false)
                      }}
                      className="px-3 py-2 hover:bg-orange-50 cursor-pointer text-sm text-gray-900 border-b border-gray-100"
                    >
                      All locations
                    </div>
                    {uniqueRoutes.from.map((route, index) => (
                      <div
                        key={index}
                        onClick={() => {
                          setRouteFilters({ ...routeFilters, from: route.name })
                          setShowRouteFromDropdown(false)
                        }}
                        className="px-3 py-2 hover:bg-orange-50 cursor-pointer text-sm"
                      >
                        <div className="text-gray-900">{route.name}</div>
                        <div className="text-xs text-gray-500">{route.province}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">To Location</label>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowRouteToDropdown(!showRouteToDropdown)
                    setShowStatusDropdown(false)
                    setShowRouteFromDropdown(false)
                  }}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg bg-white text-left text-sm hover:bg-gray-50 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors flex items-center justify-between"
                >
                  <span className="text-gray-900">{routeFilters.to || 'All destinations'}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${showRouteToDropdown ? 'rotate-180' : ''}`}
                  />
                </button>

                {showRouteToDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-48 overflow-y-auto">
                    <div
                      onClick={() => {
                        setRouteFilters({ ...routeFilters, to: '' })
                        setShowRouteToDropdown(false)
                      }}
                      className="px-3 py-2 hover:bg-orange-50 cursor-pointer text-sm text-gray-900 border-b border-gray-100"
                    >
                      All destinations
                    </div>
                    {uniqueRoutes.to.map((route, index) => (
                      <div
                        key={index}
                        onClick={() => {
                          setRouteFilters({ ...routeFilters, to: route.name })
                          setShowRouteToDropdown(false)
                        }}
                        className="px-3 py-2 hover:bg-orange-50 cursor-pointer text-sm"
                      >
                        <div className="text-gray-900">{route.name}</div>
                        <div className="text-xs text-gray-500">{route.province}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Results Summary */}
        <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between text-sm text-gray-600">
          <span>
            {filteredCount} of {totalCount} tickets
          </span>
          {hasActiveFilters && <span className="text-orange-600 font-medium">Filters applied</span>}
        </div>
      </div>

      {/* Mobile Side Menu Overlay */}
      {showFilters && (
        <div className="sm:hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
          <div className="w-80 max-w-[85vw] bg-white h-full overflow-y-auto transform transition-transform duration-300 ease-in-out">
            {/* Mobile Filter Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-orange-50">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Filter className="w-5 h-5 text-orange-600" />
                Filters
                {hasActiveFilters && (
                  <span className="bg-orange-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {
                      [
                        statusFilters.length > 0,
                        !!searchTerm,
                        !!dateRange.from,
                        !!dateRange.to,
                        !!routeFilters.from,
                        !!routeFilters.to,
                      ].filter(Boolean).length
                    }
                  </span>
                )}
              </h3>
              <button
                onClick={() => setShowFilters(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Mobile Filter Content */}
            <div className="p-4 space-y-6">
              {/* Status Filter */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-3">Status</label>
                <div className="space-y-2">
                  {[
                    { value: 'paid', label: 'Paid', color: 'text-green-700' },
                    { value: 'pending', label: 'Pending Payment', color: 'text-yellow-700' },
                    { value: 'cancelled', label: 'Cancelled', color: 'text-red-700' },
                  ].map((status) => (
                    <label
                      key={status.value}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50"
                    >
                      <input
                        type="checkbox"
                        checked={statusFilters.includes(status.value)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setStatusFilters([...statusFilters, status.value])
                          } else {
                            setStatusFilters(statusFilters.filter((s) => s !== status.value))
                          }
                        }}
                        className="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500 focus:ring-2"
                      />
                      <span className={`text-sm font-medium ${status.color}`}>{status.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Date Range Filters */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">From Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="date"
                      value={dateRange.from}
                      onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="date"
                      value={dateRange.to}
                      onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Route Filters */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    From Location
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                      <input
                        type="radio"
                        name="routeFrom"
                        checked={!routeFilters.from}
                        onChange={() => setRouteFilters({ ...routeFilters, from: '' })}
                        className="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 focus:ring-orange-500 focus:ring-2"
                      />
                      <span className="text-sm text-gray-900">All locations</span>
                    </label>
                    {uniqueRoutes.from.map((route, index) => (
                      <label
                        key={index}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50"
                      >
                        <input
                          type="radio"
                          name="routeFrom"
                          checked={routeFilters.from === route.name}
                          onChange={() => setRouteFilters({ ...routeFilters, from: route.name })}
                          className="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 focus:ring-orange-500 focus:ring-2"
                        />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{route.name}</div>
                          <div className="text-xs text-gray-500">{route.province}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    To Location
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                      <input
                        type="radio"
                        name="routeTo"
                        checked={!routeFilters.to}
                        onChange={() => setRouteFilters({ ...routeFilters, to: '' })}
                        className="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 focus:ring-orange-500 focus:ring-2"
                      />
                      <span className="text-sm text-gray-900">All destinations</span>
                    </label>
                    {uniqueRoutes.to.map((route, index) => (
                      <label
                        key={index}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50"
                      >
                        <input
                          type="radio"
                          name="routeTo"
                          checked={routeFilters.to === route.name}
                          onChange={() => setRouteFilters({ ...routeFilters, to: route.name })}
                          className="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 focus:ring-orange-500 focus:ring-2"
                        />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{route.name}</div>
                          <div className="text-xs text-gray-500">{route.province}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Filter Actions */}
            <div className="border-t border-gray-200 p-4 bg-gray-50">
              <div className="flex gap-3">
                {hasActiveFilters && (
                  <button
                    onClick={() => {
                      clearAllFilters()
                      setShowFilters(false)
                    }}
                    className="flex-1 px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                  >
                    Clear All
                  </button>
                )}
                <button
                  onClick={() => setShowFilters(false)}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-medium hover:from-orange-600 hover:to-red-600 transition-all"
                >
                  Apply Filters
                </button>
              </div>
              <div className="mt-3 text-center">
                <span className="text-sm text-gray-600">
                  {filteredCount} of {totalCount} tickets
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
