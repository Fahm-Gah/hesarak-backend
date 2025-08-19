'use client'

import React, { useState } from 'react'
import moment from 'moment-jalaali'

interface JalaaliDatePickerProps {
  value: { year: number; month: number; day: number }
  onChange: (date: { year: number; month: number; day: number }) => void
  label?: string
  className?: string
}

export const JalaaliDatePicker = ({
  value,
  onChange,
  label,
  className = '',
}: JalaaliDatePickerProps) => {
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [viewingDate, setViewingDate] = useState(value) // Track which month/year we're viewing
  const [dropdownPosition, setDropdownPosition] = useState<'bottom' | 'top'>('bottom')

  // Afghani month names
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

  // Afghani day names (Saturday to Friday)
  const afghaniDays = ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه']

  // Convert numbers to Persian
  const toPersianNumbers = (num: number | string): string => {
    const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹']
    return num.toString().replace(/\d/g, (digit) => persianDigits[parseInt(digit)])
  }

  const formatJalaaliDate = (jalaaliDate: { year: number; month: number; day: number }) => {
    const monthName = afghaniMonths[jalaaliDate.month - 1]
    // Create moment object to get day of week
    const momentDate = moment(
      `${jalaaliDate.year}-${jalaaliDate.month.toString().padStart(2, '0')}-${jalaaliDate.day.toString().padStart(2, '0')}`,
      'jYYYY-jMM-jDD',
    )
    const dayOfWeek = afghaniDays[momentDate.day()]
    const persianDay = toPersianNumbers(jalaaliDate.day)
    const persianYear = toPersianNumbers(jalaaliDate.year)
    return `${dayOfWeek}، ${persianDay} ${monthName} ${persianYear}`
  }

  const handleDateSelect = (year: number, month: number, day: number) => {
    onChange({ year, month, day })
    setViewingDate({ year, month, day }) // Update viewing date to match selection
    setShowDatePicker(false)
  }

  const handleCloseDatePicker = () => {
    setShowDatePicker(false)
    // Reset viewing date to the selected value when closing
    setViewingDate(value)
  }

  // Function to calculate dropdown position
  const calculateDropdownPosition = (element: HTMLElement) => {
    const rect = element.getBoundingClientRect()
    const viewportHeight = window.innerHeight
    const dropdownHeight = 400 // Approximate height of the calendar dropdown
    const spaceBelow = viewportHeight - rect.bottom
    const spaceAbove = rect.top

    // If there's not enough space below but enough space above, position it above
    if (spaceBelow < dropdownHeight && spaceAbove > dropdownHeight) {
      setDropdownPosition('top')
    } else {
      setDropdownPosition('bottom')
    }
  }

  // Handle scroll events to reposition dropdown
  React.useEffect(() => {
    const handleScroll = () => {
      if (showDatePicker) {
        const inputElement = document.querySelector('.jalaali-date-picker-input') as HTMLElement
        if (inputElement) {
          calculateDropdownPosition(inputElement)
        }
      }
    }

    if (showDatePicker) {
      window.addEventListener('scroll', handleScroll, true) // Use capture to catch all scroll events
      window.addEventListener('resize', handleScroll)
    }

    return () => {
      window.removeEventListener('scroll', handleScroll, true)
      window.removeEventListener('resize', handleScroll)
    }
  }, [showDatePicker])

  const generateCalendarDays = () => {
    const currentYear = viewingDate.year
    const currentMonth = viewingDate.month
    const today = moment()
    const todayJalaali = {
      year: today.jYear(),
      month: today.jMonth() + 1,
      day: today.jDate(),
    }

    // Use moment-jalaali to get accurate days in month
    const daysInMonth = moment.jDaysInMonth(currentYear, currentMonth - 1)
    const days = []

    // Get the day of week for the first day of the month
    const firstDayOfMonth = moment(
      `${currentYear}-${currentMonth.toString().padStart(2, '0')}-01`,
      'jYYYY-jMM-jDD',
    )
    const startDayOfWeek = firstDayOfMonth.day() // 0 = Saturday, 6 = Friday

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push({ day: null, isToday: false, isSelected: false, isPastDate: false })
    }

    // Add actual days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = moment(
        `${currentYear}-${currentMonth.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`,
        'jYYYY-jMM-jDD',
      )
      const todayMoment = moment()

      const isToday =
        currentYear === todayJalaali.year &&
        currentMonth === todayJalaali.month &&
        day === todayJalaali.day

      // Only show as selected if we're viewing the same month/year as the selected date
      const isSelected =
        currentYear === value.year && currentMonth === value.month && day === value.day

      const isPastDate = currentDate.isBefore(todayMoment, 'day')

      days.push({ day, isToday, isSelected, isPastDate })
    }

    return days
  }

  // Close date picker when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showDatePicker) {
        const target = event.target as Element
        const datePicker = document.querySelector('.jalaali-date-picker')

        // Don't close if clicking inside the date picker
        if (datePicker && datePicker.contains(target)) {
          return
        }

        handleCloseDatePicker()
      }
    }

    if (showDatePicker) {
      document.addEventListener('click', handleClickOutside)
    }

    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  }, [showDatePicker])

  // Handle escape key to close date picker
  React.useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showDatePicker) {
        handleCloseDatePicker()
      }
    }

    if (showDatePicker) {
      document.addEventListener('keydown', handleEscapeKey)
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey)
    }
  }, [showDatePicker])

  return (
    <div className={`flex-1 min-w-0 w-full lg:w-auto ${className}`} dir="rtl">
      {label && (
        <label className="block text-xs font-bold text-gray-600 mb-1 uppercase tracking-wide">
          {label}
        </label>
      )}
      <div className="relative">
        <div
          onClick={(e) => {
            e.stopPropagation()
            if (!showDatePicker) {
              calculateDropdownPosition(e.currentTarget)
            }
            setShowDatePicker(!showDatePicker)
          }}
          className="jalaali-date-picker-input w-full bg-gradient-to-br from-white to-gray-50/80 border border-gray-200 rounded-2xl px-4 py-3.5 text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-orange-400/60 focus:border-orange-300 focus:bg-white focus:shadow-lg cursor-pointer hover:bg-gray-50/80 hover:border-gray-300 hover:shadow-md transition-all duration-300 pr-10 shadow-sm flex items-center justify-between"
        >
          <span className="text-gray-900">{formatJalaaliDate(value)}</span>
          <svg
            className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${showDatePicker ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>

        {showDatePicker && (
          <div
            className={`jalaali-date-picker absolute right-0 md:w-[320px] bg-white border border-gray-200 rounded-2xl shadow-xl z-50 p-4 w-full max-w-[300px] ${
              dropdownPosition === 'top' ? 'bottom-full mb-1' : 'top-full mt-1'
            }`}
            dir="rtl"
          >
            {/* Month/Year Header */}
            <div className="flex items-center justify-between mb-4">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  const newMonth = viewingDate.month === 12 ? 1 : viewingDate.month + 1
                  const newYear = viewingDate.month === 12 ? viewingDate.year + 1 : viewingDate.year

                  setViewingDate({
                    year: newYear,
                    month: newMonth,
                    day: 1, // Reset to day 1 when navigating
                  })
                }}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg
                  className="w-5 h-5 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>

              <div className="text-center">
                <div className="text-lg font-semibold text-gray-900">
                  {afghaniMonths[viewingDate.month - 1]} {toPersianNumbers(viewingDate.year)}
                </div>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  const newMonth = viewingDate.month === 1 ? 12 : viewingDate.month - 1
                  const newYear = viewingDate.month === 1 ? viewingDate.year - 1 : viewingDate.year

                  setViewingDate({
                    year: newYear,
                    month: newMonth,
                    day: 1, // Reset to day 1 when navigating
                  })
                }}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg
                  className="w-5 h-5 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
            </div>

            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {afghaniDays.map((dayName) => (
                <div key={dayName} className="p-2 text-xs font-medium text-gray-500 text-center">
                  {dayName.slice(0, 1)}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {generateCalendarDays().map(({ day, isToday, isSelected, isPastDate }, index) => {
                // Handle empty cells for proper alignment
                if (day === null) {
                  return <div key={`empty-${index}`} className="p-2"></div>
                }

                return (
                  <button
                    key={day}
                    type="button"
                    disabled={isPastDate}
                    onClick={(e) => {
                      e.stopPropagation()
                      if (!isPastDate) {
                        handleDateSelect(viewingDate.year, viewingDate.month, day)
                      }
                    }}
                    className={`
                      p-2 text-sm rounded-lg transition-all duration-150 
                      ${
                        isPastDate
                          ? 'text-gray-300 cursor-not-allowed opacity-50'
                          : 'hover:bg-orange-50 cursor-pointer'
                      }
                      ${
                        isSelected
                          ? 'bg-orange-600 text-white font-semibold'
                          : isToday
                            ? 'bg-orange-100 text-orange-700 font-medium'
                            : isPastDate
                              ? 'text-gray-300'
                              : 'text-gray-700 hover:text-orange-700'
                      }
                    `}
                  >
                    {toPersianNumbers(day)}
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
