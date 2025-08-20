'use client'

import React, { useState, useEffect } from 'react'
import moment from 'moment-jalaali'

interface JalaaliDatePickerDropdownProps {
  value: { year: number; month: number; day: number }
  onChange: (date: { year: number; month: number; day: number }) => void
  onClose: () => void
  isVisible: boolean
  position?: 'bottom' | 'top'
  className?: string
}

export const JalaaliDatePickerDropdown = ({
  value,
  onChange,
  onClose,
  isVisible,
  position = 'bottom',
  className = '',
}: JalaaliDatePickerDropdownProps) => {
  const [viewingDate, setViewingDate] = useState(value) // Track which month/year we're viewing

  // Reset viewing date when value changes from outside
  useEffect(() => {
    setViewingDate(value)
  }, [value])

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

  const handleDateSelect = (year: number, month: number, day: number) => {
    onChange({ year, month, day })
    setViewingDate({ year, month, day }) // Update viewing date to match selection
    onClose()
  }

  const handleClose = () => {
    onClose()
    // Reset viewing date to the selected value when closing
    setViewingDate(value)
  }

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
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isVisible) {
        const target = event.target as Element
        const datePicker = document.querySelector('.jalaali-date-picker-dropdown')

        // Don't close if clicking inside the date picker
        if (datePicker && datePicker.contains(target)) {
          return
        }

        handleClose()
      }
    }

    if (isVisible) {
      document.addEventListener('click', handleClickOutside)
    }

    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  }, [isVisible])

  // Handle escape key to close date picker
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isVisible) {
        handleClose()
      }
    }

    if (isVisible) {
      document.addEventListener('keydown', handleEscapeKey)
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey)
    }
  }, [isVisible])

  if (!isVisible) {
    return null
  }

  return (
    <div
      className={`jalaali-date-picker-dropdown absolute right-0 md:w-[320px] bg-white border border-gray-200 rounded-2xl shadow-xl z-50 p-4 w-full max-w-[300px] ${
        position === 'top' ? 'bottom-full mb-1' : 'top-full mt-1'
      } ${className}`}
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
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
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
  )
}
