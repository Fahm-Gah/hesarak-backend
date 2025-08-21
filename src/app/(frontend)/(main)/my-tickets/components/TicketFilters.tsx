'use client'

import React from 'react'
import { Calendar, X } from 'lucide-react'
import { JalaaliDatePicker } from '@/app/(frontend)/components/JalaaliDatePicker'
import moment from 'moment-jalaali'

interface Route {
  name: string
  province: string
}

interface DateFilter {
  year: number
  month: number
  day: number
}

interface SingleDateFilter {
  dateFilter: DateFilter | null
  setDateFilter: (date: DateFilter | null) => void
  getDateRangeForQuery: () => { from: string; to: string } | null
  clearDateFilter: () => void
  isDateSelected: boolean
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

  // Date range (legacy)
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

  // New props for sidebar functionality
  isSidebar?: boolean
  onApplyFilters?: () => void

  // Single date filter
  singleDateFilter: SingleDateFilter
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
  isSidebar = false,
  onApplyFilters,
  singleDateFilter,
}: TicketFiltersProps) => {
  // Helper function to get current Jalaali date
  const getCurrentJalaaliDate = () => {
    const today = moment()
    return {
      year: today.jYear(),
      month: today.jMonth() + 1, // moment uses 0-based months
      day: today.jDate(),
    }
  }

  // Helper function to format Jalaali date for display
  const formatJalaaliDate = (dateFilter: DateFilter | null) => {
    if (!dateFilter) return ''

    const afghaniMonths = [
      'حمل',
      'ثور',
      'جوزا',
      'سرطان',
      'اسد',
      'سنبله',
      'میزان',
      'عقرب',
      'قوس',
      'جدی',
      'دلو',
      'حوت',
    ]

    const toPersianNumbers = (num: number) => {
      const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹']
      return num.toString().replace(/\d/g, (digit) => persianDigits[parseInt(digit)])
    }

    return `${toPersianNumbers(dateFilter.day)} ${afghaniMonths[dateFilter.month - 1]} ${toPersianNumbers(dateFilter.year)}`
  }
  if (isSidebar) {
    return (
      <div className="space-y-6 animate-in fade-in-50 duration-300">
        {/* Status Filter */}
        <div className="transition-all duration-200">
          <label className="block text-sm font-medium text-gray-700 mb-3">Status</label>
          <div className="space-y-2">
            {[
              { value: 'paid', label: 'Paid', color: 'text-green-700' },
              { value: 'pending', label: 'Pending Payment', color: 'text-yellow-700' },
              { value: 'cancelled', label: 'Cancelled', color: 'text-red-700' },
            ].map((status) => (
              <label
                key={status.value}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-all duration-200 hover:shadow-sm"
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
                  className="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500 focus:ring-2 transition-all duration-200"
                />
                <span
                  className={`text-sm font-medium ${status.color} transition-colors duration-200`}
                >
                  {status.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Date Filter */}
        <div className="transition-all duration-200">
          <label className="block text-sm font-medium text-gray-700 mb-3">Trip Date</label>
          <div className="space-y-3">
            {singleDateFilter.dateFilter ? (
              <div className="flex items-center justify-between p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-orange-600" />
                  <span className="text-sm font-medium text-orange-800" dir="rtl">
                    {formatJalaaliDate(singleDateFilter.dateFilter)}
                  </span>
                </div>
                <button
                  onClick={() => singleDateFilter.clearDateFilter()}
                  className="p-1 hover:bg-orange-100 rounded-full transition-colors"
                  title="Clear date filter"
                >
                  <X className="w-4 h-4 text-orange-600" />
                </button>
              </div>
            ) : null}

            <JalaaliDatePicker
              value={singleDateFilter.dateFilter || getCurrentJalaaliDate()}
              onChange={(date) => singleDateFilter.setDateFilter(date)}
              placeholder="انتخاب تاریخ"
              size="sm"
              variant="compact"
              className="w-full"
            />

            {singleDateFilter.dateFilter && (
              <p className="text-xs text-gray-500">Showing tickets for the selected date only</p>
            )}
          </div>
        </div>

        {/* Route Filters */}
        <div className="space-y-4 transition-all duration-200">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">From Location</label>
            <div className="space-y-2 max-h-40 overflow-y-auto transition-all duration-200">
              <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-all duration-200 hover:shadow-sm">
                <input
                  type="radio"
                  name="routeFrom"
                  checked={!routeFilters.from}
                  onChange={() => setRouteFilters({ ...routeFilters, from: '' })}
                  className="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 focus:ring-orange-500 focus:ring-2 transition-all duration-200"
                />
                <span className="text-sm text-gray-900 transition-colors duration-200">
                  All locations
                </span>
              </label>
              {uniqueRoutes.from.map((route, index) => (
                <label
                  key={index}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-all duration-200 hover:shadow-sm"
                >
                  <input
                    type="radio"
                    name="routeFrom"
                    checked={routeFilters.from === route.name}
                    onChange={() => setRouteFilters({ ...routeFilters, from: route.name })}
                    className="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 focus:ring-orange-500 focus:ring-2 transition-all duration-200"
                  />
                  <div>
                    <div className="text-sm font-medium text-gray-900 transition-colors duration-200">
                      {route.name}
                    </div>
                    <div className="text-xs text-gray-500 transition-colors duration-200">
                      {route.province}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">To Location</label>
            <div className="space-y-2 max-h-40 overflow-y-auto transition-all duration-200">
              <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-all duration-200 hover:shadow-sm">
                <input
                  type="radio"
                  name="routeTo"
                  checked={!routeFilters.to}
                  onChange={() => setRouteFilters({ ...routeFilters, to: '' })}
                  className="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 focus:ring-orange-500 focus:ring-2 transition-all duration-200"
                />
                <span className="text-sm text-gray-900 transition-colors duration-200">
                  All destinations
                </span>
              </label>
              {uniqueRoutes.to.map((route, index) => (
                <label
                  key={index}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-all duration-200 hover:shadow-sm"
                >
                  <input
                    type="radio"
                    name="routeTo"
                    checked={routeFilters.to === route.name}
                    onChange={() => setRouteFilters({ ...routeFilters, to: route.name })}
                    className="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 focus:ring-orange-500 focus:ring-2 transition-all duration-200"
                  />
                  <div>
                    <div className="text-sm font-medium text-gray-900 transition-colors duration-200">
                      {route.name}
                    </div>
                    <div className="text-xs text-gray-500 transition-colors duration-200">
                      {route.province}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Apply Button for Mobile */}
        {onApplyFilters && (
          <div className="pt-4 border-t border-gray-200 transition-all duration-200">
            <div className="flex gap-3">
              {hasActiveFilters && (
                <button
                  onClick={() => {
                    clearAllFilters()
                    onApplyFilters()
                  }}
                  className="flex-1 px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-all duration-200 hover:shadow-md hover:scale-105 active:scale-95"
                >
                  Clear All
                </button>
              )}
              <button
                onClick={onApplyFilters}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-medium hover:from-orange-600 hover:to-red-600 transition-all duration-200 hover:shadow-lg hover:scale-105 active:scale-95"
              >
                Apply Filters
              </button>
            </div>
            <div className="mt-3 text-center transition-opacity duration-200">
              <span className="text-sm text-gray-600">
                {filteredCount} of {totalCount} tickets
              </span>
            </div>
          </div>
        )}
      </div>
    )
  }

  // Legacy layout for non-sidebar usage (keeping as fallback)
  return null
}
