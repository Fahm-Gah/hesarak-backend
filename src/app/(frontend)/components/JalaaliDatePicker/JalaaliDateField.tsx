'use client'

import React from 'react'
import moment from 'moment-jalaali'
import { Calendar } from 'lucide-react'

interface JalaaliDateFieldProps {
  value: { year: number; month: number; day: number }
  onClick?: () => void
  label?: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'compact'
  showIcon?: boolean
  disabled?: boolean
  placeholder?: string
}

export const JalaaliDateField = ({
  value,
  onClick,
  label,
  className = '',
  size = 'md',
  variant = 'default',
  showIcon = true,
  disabled = false,
  placeholder,
}: JalaaliDateFieldProps) => {
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

    if (variant === 'compact') {
      return `${persianDay} ${monthName} ${persianYear}`
    }

    return `${dayOfWeek}، ${persianDay} ${monthName} ${persianYear}`
  }

  // Size-based styles
  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return 'px-4 py-3.5 text-sm'
      case 'lg':
        return 'px-4 py-3.5 text-lg'
      case 'md':
      default:
        return 'px-4 py-3.5'
    }
  }

  // Variant-based styles
  const getVariantStyles = () => {
    switch (variant) {
      case 'compact':
        return 'bg-gradient-to-br from-white to-gray-50/80 border border-gray-200 rounded-2xl'
      case 'default':
      default:
        return 'bg-gradient-to-br from-white to-gray-50/80 border border-gray-200 rounded-2xl'
    }
  }

  const displayText = value ? formatJalaaliDate(value) : placeholder || 'انتخاب تاریخ'

  return (
    <div className={`flex-1 min-w-0 w-full lg:w-auto ${className}`}>
      {label && (
        <label className="block text-xs font-bold text-gray-600 mb-1 uppercase tracking-wide">
          {label}
        </label>
      )}
      <div className="relative">
        <div
          dir="rtl"
          role="button"
          tabIndex={disabled ? -1 : 0}
          onClick={disabled ? undefined : onClick}
          className={`
            ${getSizeStyles()}
            ${getVariantStyles()}
            w-full text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-orange-400/60 focus:border-orange-300 focus:bg-white focus:shadow-lg cursor-pointer hover:bg-gray-50/80 hover:border-gray-300 hover:shadow-md transition-all duration-300 shadow-sm flex items-center justify-between
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            ${showIcon ? 'pl-12' : ''}
          `}
        >
          <span className={value ? 'text-gray-900' : 'text-gray-500'}>{displayText}</span>
          {showIcon && (
            <Calendar className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          )}
        </div>
      </div>
    </div>
  )
}
