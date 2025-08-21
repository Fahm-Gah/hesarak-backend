'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { JalaaliDatePicker } from '@/app/(frontend)/components/JalaaliDatePicker'
import { Search, ArrowLeftRight, Loader2, ChevronDown } from 'lucide-react'
import moment from 'moment-jalaali'

interface SearchBarProps {
  initialFrom: string
  initialTo: string
  initialDate: string
  provinces?: string[]
}

export const SearchBar = ({
  initialFrom,
  initialTo,
  initialDate,
  provinces = [],
}: SearchBarProps) => {
  const router = useRouter()
  const [searchFrom, setSearchFrom] = useState(initialFrom)
  const [searchTo, setSearchTo] = useState(initialTo)
  const [fromInput, setFromInput] = useState(initialFrom)
  const [toInput, setToInput] = useState(initialTo)
  const [showFromDropdown, setShowFromDropdown] = useState(false)
  const [showToDropdown, setShowToDropdown] = useState(false)
  const [isSearching, setIsSearching] = useState(false)

  const fromDropdownRef = useRef<HTMLDivElement>(null)
  const toDropdownRef = useRef<HTMLDivElement>(null)

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

  // Reset search state when component mounts or search params change
  useEffect(() => {
    setIsSearching(false)
  }, [initialFrom, initialTo, initialDate])

  // Reset searching state after a timeout to prevent stuck button
  useEffect(() => {
    if (isSearching) {
      const timeout = setTimeout(() => {
        setIsSearching(false)
      }, 5000) // Reset after 5 seconds maximum

      return () => clearTimeout(timeout)
    }
  }, [isSearching])

  // Get available provinces for each dropdown (excluding the other field's selection)
  const getAvailableProvinces = (excludeField: 'from' | 'to') => {
    if (!provinces || !Array.isArray(provinces)) {
      return []
    }
    const excludeValue = excludeField === 'from' ? searchFrom : searchTo
    return provinces.filter((province) => province !== excludeValue)
  }

  // Handle province selection
  const handleProvinceSelect = (province: string, field: 'from' | 'to') => {
    if (field === 'from') {
      // If selecting the same city as the TO field, swap them
      if (province === searchTo) {
        setSearchTo(searchFrom)
        setToInput(fromInput)
      }

      setSearchFrom(province)
      setFromInput(province)
      setShowFromDropdown(false)
    } else {
      // If selecting the same city as the FROM field, swap them
      if (province === searchFrom) {
        setSearchFrom(searchTo)
        setFromInput(toInput)
      }

      setSearchTo(province)
      setToInput(province)
      setShowToDropdown(false)
    }
  }

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element

      // Check if click is outside FROM dropdown
      if (fromDropdownRef.current && !fromDropdownRef.current.contains(target)) {
        const fromField = fromDropdownRef.current.previousElementSibling
        if (!fromField?.contains(target)) {
          setShowFromDropdown(false)
        }
      }

      // Check if click is outside TO dropdown
      if (toDropdownRef.current && !toDropdownRef.current.contains(target)) {
        const toField = toDropdownRef.current.previousElementSibling
        if (!toField?.contains(target)) {
          setShowToDropdown(false)
        }
      }
    }

    if (showFromDropdown || showToDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showFromDropdown, showToDropdown])

  const handleSearch = () => {
    if (!searchFrom || !searchTo) return

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
    const tempFrom = searchFrom
    const tempFromInput = fromInput

    setSearchFrom(searchTo)
    setFromInput(toInput)
    setSearchTo(tempFrom)
    setToInput(tempFromInput)
  }

  const isFormValid = searchFrom && searchTo && searchFrom !== searchTo

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 lg:p-6 mb-6">
      <div className="flex flex-col lg:flex-row items-stretch lg:items-end gap-4 w-full">
        {/* From Field */}
        <div className="flex-1 min-w-0 w-full lg:flex-1">
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
              className="w-full bg-gradient-to-br from-white to-gray-50/80 border border-gray-200 rounded-2xl px-4 py-3.5 text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-orange-400/60 focus:border-orange-300 focus:bg-white focus:shadow-lg cursor-pointer hover:bg-gray-50/80 hover:border-gray-300 hover:shadow-md transition-all duration-300 shadow-sm flex items-center justify-between"
            >
              <span className={fromInput ? 'text-gray-900' : 'text-gray-500'}>
                {fromInput || 'Select city'}
              </span>
              <ChevronDown
                className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${showFromDropdown ? 'rotate-180' : ''}`}
              />
            </div>

            {showFromDropdown && (
              <div
                ref={fromDropdownRef}
                className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 max-h-60 overflow-y-auto"
              >
                {getAvailableProvinces('to').length > 0 ? (
                  <>
                    {getAvailableProvinces('to').map((province, index) => (
                      <div
                        key={`from-${province}-${index}`}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleProvinceSelect(province, 'from')
                        }}
                        className="px-4 py-3 hover:bg-orange-50 hover:text-orange-700 cursor-pointer transition-colors duration-150 first:rounded-t-2xl last:rounded-b-2xl border-b border-gray-100 last:border-b-0"
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
                  <div className="px-4 py-3 text-center text-gray-500">No cities available</div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Swap Button - Desktop */}
        <div className="hidden lg:flex justify-center items-end pb-2">
          <button
            onClick={handleSwap}
            className="p-2 rounded-full bg-gray-100 hover:bg-orange-100 text-gray-600 hover:text-orange-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500 group"
            title="Swap departure and destination"
          >
            <ArrowLeftRight className="w-5 h-5 transform group-hover:rotate-180 transition-transform duration-500" />
          </button>
        </div>

        {/* To Field */}
        <div className="flex-1 min-w-0 w-full lg:flex-1">
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
              className="w-full bg-gradient-to-br from-white to-gray-50/80 border border-gray-200 rounded-2xl px-4 py-3.5 text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-orange-400/60 focus:border-orange-300 focus:bg-white focus:shadow-lg cursor-pointer hover:bg-gray-50/80 hover:border-gray-300 hover:shadow-md transition-all duration-300 shadow-sm flex items-center justify-between"
            >
              <span className={toInput ? 'text-gray-900' : 'text-gray-500'}>
                {toInput || 'Select city'}
              </span>
              <ChevronDown
                className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${showToDropdown ? 'rotate-180' : ''}`}
              />
            </div>

            {showToDropdown && (
              <div
                ref={toDropdownRef}
                className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 max-h-60 overflow-y-auto"
              >
                {getAvailableProvinces('from').length > 0 ? (
                  <>
                    {getAvailableProvinces('from').map((province, index) => (
                      <div
                        key={`to-${province}-${index}`}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleProvinceSelect(province, 'to')
                        }}
                        className="px-4 py-3 hover:bg-orange-50 hover:text-orange-700 cursor-pointer transition-colors duration-150 first:rounded-t-2xl last:rounded-b-2xl border-b border-gray-100 last:border-b-0"
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
                  <div className="px-4 py-3 text-center text-gray-500">No cities available</div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Swap Button - Mobile */}
        <div className="lg:hidden flex justify-center">
          <button
            onClick={handleSwap}
            className="p-2 rounded-full bg-gray-100 hover:bg-orange-100 text-gray-600 hover:text-orange-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500 group"
            title="Swap departure and destination"
          >
            <ArrowLeftRight className="w-5 h-5 transform group-hover:rotate-180 transition-transform duration-500" />
          </button>
        </div>

        {/* Date Field */}
        <div className="flex-1 min-w-0 lg:max-w-xs">
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
          disabled={!isFormValid || isSearching}
          className="px-6 py-3 lg:px-8 lg:py-4 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl hover:from-orange-700 hover:to-red-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-200 whitespace-nowrap flex items-center justify-center gap-2 font-semibold shadow-lg hover:shadow-xl disabled:shadow-none"
        >
          {isSearching ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Search className="w-4 h-4" />
          )}
          {isSearching ? 'Searching...' : 'Search'}
        </button>
      </div>

      {/* Quick validation feedback */}
      {searchFrom && searchTo && searchFrom === searchTo && (
        <div className="mt-3 text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          Please select different departure and destination locations.
        </div>
      )}
    </div>
  )
}
