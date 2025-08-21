'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import moment from 'moment-jalaali'
import { ChevronDown, ArrowLeftRight, Search, Loader2 } from 'lucide-react'
import { JalaaliDatePicker } from '../JalaaliDatePicker'

interface TripSearchFormClientProps {
  provinces: string[]
}

export const TripSearchFormClient = ({ provinces }: TripSearchFormClientProps) => {
  const router = useRouter()
  const [formData, setFormData] = useState({
    from: '',
    to: '',
    date: moment().format('jYYYY-jMM-jDD'), // Today's date in Jalaali format with dashes
  })
  const [isLoading, setIsLoading] = useState(false)
  const [showFromDropdown, setShowFromDropdown] = useState(false)
  const [showToDropdown, setShowToDropdown] = useState(false)
  const [selectedJalaaliDate, setSelectedJalaaliDate] = useState(() => {
    const today = moment()
    return {
      year: today.jYear(),
      month: today.jMonth() + 1,
      day: today.jDate(),
    }
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSwap = () => {
    setFormData((prev) => ({
      ...prev,
      from: prev.to,
      to: prev.from,
    }))
  }

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.from || !formData.to || !formData.date) {
      return
    }

    setIsLoading(true)

    // Build search URL with query parameters
    const searchParams = new URLSearchParams({
      from: formData.from,
      to: formData.to,
      date: formData.date,
    })

    router.push(`/search?${searchParams.toString()}`)
  }

  const handleDateChange = (jalaaliDate: { year: number; month: number; day: number }) => {
    setSelectedJalaaliDate(jalaaliDate)
    // Send date in Jalaali format to backend with dashes
    const jalaaliDateString = `${jalaaliDate.year}-${jalaaliDate.month.toString().padStart(2, '0')}-${jalaaliDate.day.toString().padStart(2, '0')}`
    handleInputChange('date', jalaaliDateString)
  }

  const handleCitySelect = (field: 'from' | 'to', city: string) => {
    // If selecting the same city as the other field, swap them
    if (field === 'from' && city === formData.to) {
      handleInputChange('to', formData.from)
    } else if (field === 'to' && city === formData.from) {
      handleInputChange('from', formData.to)
    }

    handleInputChange(field, city)
    if (field === 'from') {
      setShowFromDropdown(false)
    } else {
      setShowToDropdown(false)
    }
  }

  // Get filtered provinces for each dropdown
  const getAvailableProvinces = (excludeField: 'from' | 'to') => {
    const excludeValue = excludeField === 'from' ? formData.from : formData.to
    return provinces.filter((province) => province !== excludeValue)
  }

  // Close dropdowns when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
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

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-2xl border border-gray-200 p-4 max-w-4xl mx-auto shadow-2xl">
      <form onSubmit={handleSearch} className="space-y-4">
        {/* First Line: Form Controls */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-end gap-3 w-full">
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
                <span className={formData.from ? 'text-gray-900' : 'text-gray-500'}>
                  {formData.from || 'Select city'}
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${showFromDropdown ? 'rotate-180' : ''}`}
                />
              </div>

              {showFromDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 max-h-60 overflow-y-auto">
                  {getAvailableProvinces('to').map((province) => (
                    <div
                      key={province}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleCitySelect('from', province)
                      }}
                      className="px-4 py-3 hover:bg-orange-50 hover:text-orange-700 cursor-pointer transition-colors duration-150 first:rounded-t-2xl last:rounded-b-2xl border-b border-gray-100 last:border-b-0"
                    >
                      {province}
                    </div>
                  ))}
                  {formData.to && (
                    <div className="px-4 py-2 text-sm text-gray-500 italic border-t border-gray-100">
                      {formData.to} is already selected as destination
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Swap Button */}
          <div className="flex items-center justify-center">
            <button
              type="button"
              onClick={handleSwap}
              className="p-2.5 bg-orange-600 hover:bg-orange-700 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl group transform hover:scale-110 active:scale-95 flex-shrink-0 lg:mb-1"
              aria-label="Swap cities"
            >
              <ArrowLeftRight className="w-5 h-5 text-white transform group-hover:rotate-180 transition-transform duration-500" />
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
                <span className={formData.to ? 'text-gray-900' : 'text-gray-500'}>
                  {formData.to || 'Select city'}
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${showToDropdown ? 'rotate-180' : ''}`}
                />
              </div>

              {showToDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 max-h-60 overflow-y-auto">
                  {getAvailableProvinces('from').map((province) => (
                    <div
                      key={province}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleCitySelect('to', province)
                      }}
                      className="px-4 py-3 hover:bg-orange-50 hover:text-orange-700 cursor-pointer transition-colors duration-150 first:rounded-t-2xl last:rounded-b-2xl border-b border-gray-100 last:border-b-0"
                    >
                      {province}
                    </div>
                  ))}
                  {formData.from && (
                    <div className="px-4 py-2 text-sm text-gray-500 italic border-t border-gray-100">
                      {formData.from} is already selected as departure
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Date Field */}
          <div className="flex-1 min-w-0 w-full lg:flex-1">
            <JalaaliDatePicker
              value={selectedJalaaliDate}
              onChange={handleDateChange}
              label="DATE"
            />
          </div>
        </div>

        {/* Second Line: Search Button */}
        <div className="flex justify-center pt-2">
          <button
            type="submit"
            disabled={
              isLoading ||
              !formData.from ||
              !formData.to ||
              !formData.date ||
              formData.from === formData.to
            }
            className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white px-12 py-4 rounded-full font-bold text-lg transition-all duration-300 shadow-lg hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95 hover:-translate-y-1 disabled:hover:scale-100 disabled:hover:translate-y-0 group relative overflow-hidden"
          >
            {/* Button glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-red-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-full"></div>

            {isLoading ? (
              <div className="flex items-center space-x-3 relative z-10">
                <Loader2 className="animate-spin h-5 w-5 text-white" />
                <span>SEARCHING...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-3 relative z-10">
                <Search className="w-5 h-5 transform group-hover:scale-110 transition-transform duration-200" />
                <span>SEARCH BUSES</span>
              </div>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
