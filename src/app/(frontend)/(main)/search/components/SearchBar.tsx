'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { JalaaliDatePicker } from '@/app/(frontend)/components/JalaaliDatePicker'
import moment from 'moment-jalaali'

interface SearchBarProps {
  initialFrom: string
  initialTo: string
  initialDate: string
}

export const SearchBar = ({ initialFrom, initialTo, initialDate }: SearchBarProps) => {
  const router = useRouter()
  const [searchFrom, setSearchFrom] = useState(initialFrom)
  const [searchTo, setSearchTo] = useState(initialTo)
  const [showFromDropdown, setShowFromDropdown] = useState(false)
  const [showToDropdown, setShowToDropdown] = useState(false)
  const [provinces, setProvinces] = useState<string[]>([])
  const [isLoadingProvinces, setIsLoadingProvinces] = useState(false)
  const [isSearching, setIsSearching] = useState(false)

  // Parse Jalaali date
  const parseJalaaliDate = (dateStr: string) => {
    const jalaaliMoment = moment(dateStr, 'jYYYY-jMM-jDD')
    if (jalaaliMoment.isValid()) {
      return {
        year: jalaaliMoment.jYear(),
        month: jalaaliMoment.jMonth() + 1,
        day: jalaaliMoment.jDate(),
      }
    }

    const today = moment()
    return {
      year: today.jYear(),
      month: today.jMonth() + 1,
      day: today.jDate(),
    }
  }

  const [searchDate, setSearchDate] = useState(parseJalaaliDate(initialDate))

  // Reset search state when component mounts
  useEffect(() => {
    setIsSearching(false)
  }, [initialFrom, initialTo, initialDate])

  // Load provinces
  useEffect(() => {
    const loadProvinces = async () => {
      setIsLoadingProvinces(true)
      try {
        const response = await fetch('/api/provinces')
        if (response.ok) {
          const data = await response.json()
          if (data.success && Array.isArray(data.data)) {
            setProvinces(data.data)
          } else if (data.data?.provinces && Array.isArray(data.data.provinces)) {
            setProvinces(data.data.provinces)
          }
        }
      } catch (error) {
        console.error('Failed to load provinces:', error)
      } finally {
        setIsLoadingProvinces(false)
      }
    }

    loadProvinces()
  }, [])

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowFromDropdown(false)
      setShowToDropdown(false)
    }

    if (showFromDropdown || showToDropdown) {
      document.addEventListener('click', handleClickOutside)
    }

    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  }, [showFromDropdown, showToDropdown])

  const handleProvinceSelect = (field: 'from' | 'to', province: string) => {
    // If selecting the same province as the other field, swap them
    if (field === 'from' && province === searchTo) {
      setSearchTo(searchFrom)
    } else if (field === 'to' && province === searchFrom) {
      setSearchFrom(searchTo)
    }

    if (field === 'from') {
      setSearchFrom(province)
      setShowFromDropdown(false)
    } else {
      setSearchTo(province)
      setShowToDropdown(false)
    }
  }

  // Get filtered provinces for each dropdown
  const getAvailableProvinces = (excludeField: 'from' | 'to') => {
    const excludeValue = excludeField === 'from' ? searchFrom : searchTo
    return provinces.filter((province) => province !== excludeValue)
  }

  const handleSearch = () => {
    setIsSearching(true)

    // Convert Jalaali date to string format
    const jalaaliDateStr = `${searchDate.year.toString().padStart(4, '0')}-${searchDate.month.toString().padStart(2, '0')}-${searchDate.day.toString().padStart(2, '0')}`

    // Navigate to new search
    const params = new URLSearchParams()
    params.set('from', searchFrom)
    params.set('to', searchTo)
    params.set('date', jalaaliDateStr)

    router.push(`/search?${params.toString()}`)
  }

  const handleSwap = () => {
    const temp = searchFrom
    setSearchFrom(searchTo)
    setSearchTo(temp)
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      <div className="flex flex-col lg:flex-row items-stretch lg:items-end gap-3 w-full">
        {/* From Field */}
        <div className="flex-1 min-w-0">
          <label className="block text-xs font-bold text-gray-600 mb-1 uppercase tracking-wide">
            FROM
          </label>
          <div className="relative">
            <div
              onClick={(e) => {
                e.stopPropagation()
                setShowFromDropdown(!showFromDropdown)
                setShowToDropdown(false)
              }}
              className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2.5 lg:px-4 lg:py-3.5 text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 pr-8 lg:pr-10 flex items-center justify-between"
            >
              <span className={searchFrom ? 'text-gray-900' : 'text-gray-500'}>
                {isLoadingProvinces ? 'Loading provinces...' : searchFrom || 'Select Province'}
              </span>
              <svg
                className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${showFromDropdown ? 'rotate-180' : ''}`}
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

            {showFromDropdown && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-60 overflow-y-auto">
                {isLoadingProvinces ? (
                  <div className="px-4 py-3 text-center text-gray-500 flex items-center justify-center">
                    <svg className="animate-spin h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Loading provinces...
                  </div>
                ) : getAvailableProvinces('to').length > 0 ? (
                  <>
                    {getAvailableProvinces('to').map((province) => (
                      <div
                        key={province}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleProvinceSelect('from', province)
                        }}
                        className="px-4 py-3 hover:bg-orange-50 hover:text-orange-700 cursor-pointer transition-colors duration-150 first:rounded-t-lg last:rounded-b-lg border-b border-gray-100 last:border-b-0"
                      >
                        {province}
                      </div>
                    ))}
                    {searchTo && (
                      <div className="px-4 py-2 text-sm text-gray-500 italic border-t border-gray-100">
                        {searchTo} is already selected as destination
                      </div>
                    )}
                  </>
                ) : (
                  <div className="px-4 py-3 text-center text-gray-500">No provinces available</div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* To Field */}
        <div className="flex-1 min-w-0">
          <label className="block text-xs font-bold text-gray-600 mb-1 uppercase tracking-wide">
            TO
          </label>
          <div className="relative">
            <div
              onClick={(e) => {
                e.stopPropagation()
                setShowToDropdown(!showToDropdown)
                setShowFromDropdown(false)
              }}
              className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2.5 lg:px-4 lg:py-3.5 text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 pr-8 lg:pr-10 flex items-center justify-between"
            >
              <span className={searchTo ? 'text-gray-900' : 'text-gray-500'}>
                {isLoadingProvinces ? 'Loading provinces...' : searchTo || 'Select Province'}
              </span>
              <svg
                className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${showToDropdown ? 'rotate-180' : ''}`}
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

            {showToDropdown && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-60 overflow-y-auto">
                {isLoadingProvinces ? (
                  <div className="px-4 py-3 text-center text-gray-500 flex items-center justify-center">
                    <svg className="animate-spin h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Loading provinces...
                  </div>
                ) : getAvailableProvinces('from').length > 0 ? (
                  <>
                    {getAvailableProvinces('from').map((province) => (
                      <div
                        key={province}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleProvinceSelect('to', province)
                        }}
                        className="px-4 py-3 hover:bg-orange-50 hover:text-orange-700 cursor-pointer transition-colors duration-150 first:rounded-t-lg last:rounded-b-lg border-b border-gray-100 last:border-b-0"
                      >
                        {province}
                      </div>
                    ))}
                    {searchFrom && (
                      <div className="px-4 py-2 text-sm text-gray-500 italic border-t border-gray-100">
                        {searchFrom} is already selected as departure
                      </div>
                    )}
                  </>
                ) : (
                  <div className="px-4 py-3 text-center text-gray-500">No provinces available</div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Date Field */}
        <div className="flex-1 min-w-0">
          <JalaaliDatePicker
            value={searchDate}
            onChange={setSearchDate}
            label="DATE"
            size="sm"
            variant="compact"
            className="w-full lg:hidden"
          />
          <JalaaliDatePicker
            value={searchDate}
            onChange={setSearchDate}
            label="DATE"
            className="w-full hidden lg:block"
          />
        </div>

        {/* Search Button */}
        <button
          onClick={handleSearch}
          disabled={!searchFrom || !searchTo || isLoadingProvinces || isSearching}
          className="px-4 py-2.5 lg:px-6 lg:py-3.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors whitespace-nowrap flex items-center justify-center gap-2"
        >
          {isSearching && (
            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          )}
          {isSearching ? 'Searching...' : 'Search'}
        </button>
      </div>
    </div>
  )
}
