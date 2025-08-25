'use client'

import React, { memo } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight } from 'lucide-react'

interface ActionButtonsProps {
  status: 'success' | 'cancelled' | 'error'
}

export const ActionButtons = memo<ActionButtonsProps>(({ status }) => {
  const router = useRouter()

  const getButtonsConfig = () => {
    switch (status) {
      case 'success':
        return {
          borderColor: 'border-green-200/30',
          primaryBg: 'bg-gradient-to-r from-green-500 to-emerald-500',
          primaryHover: 'hover:from-green-600 hover:to-emerald-600',
          primaryText: 'مشاهده تکت‌های من',
          primaryTextShort: 'تکت‌های من',
          primaryAction: () => router.push('/my-tickets'),
        }
      case 'cancelled':
        return {
          borderColor: 'border-red-200/30',
          primaryBg: 'bg-gradient-to-r from-red-600 to-orange-600',
          primaryHover: 'hover:from-red-700 hover:to-orange-700',
          primaryText: 'رزرو تکت جدید',
          primaryTextShort: 'تکت جدید',
          primaryAction: () => router.push('/'),
        }
      case 'error':
      default:
        return {
          borderColor: 'border-gray-200/30',
          primaryBg: 'bg-gradient-to-r from-gray-600 to-gray-700',
          primaryHover: 'hover:from-gray-700 hover:to-gray-800',
          primaryText: 'برگشت به خانه',
          primaryTextShort: 'خانه',
          primaryAction: () => router.push('/'),
        }
    }
  }

  const config = getButtonsConfig()

  if (status === 'error') {
    return (
      <div className="flex justify-center" dir="rtl">
        <button
          onClick={config.primaryAction}
          className="flex items-center gap-2 px-6 py-3 bg-white/80 border-2 border-red-600 text-red-600 rounded-2xl transition-all duration-200 font-semibold hover:bg-red-50 hover:border-red-700"
        >
          <ArrowRight className="w-4 h-4" />
          برگشت به خانه
        </button>
      </div>
    )
  }

  return (
    <div className={`pt-6 sm:pt-8 pb-4 ${config.borderColor}`} dir="rtl">
      {/* Mobile Layout - Full width buttons */}
      <div className="flex flex-col gap-3 sm:hidden">
        <button
          onClick={config.primaryAction}
          className={`w-full flex items-center justify-center gap-2 px-6 py-4 ${config.primaryBg} text-white rounded-2xl font-semibold transition-all duration-200 shadow-lg ${config.primaryHover} hover:shadow-xl active:shadow-md`}
        >
          {config.primaryTextShort}
        </button>

        <button
          onClick={() => router.push('/')}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-white/80 border-2 border-gray-300 text-gray-700 rounded-2xl transition-all duration-200 font-semibold hover:bg-gray-50 hover:border-gray-400"
        >
          <ArrowRight className="w-4 h-4" />
          برگشت به خانه
        </button>
      </div>

      {/* Desktop Layout - Side by side buttons */}
      <div className="hidden sm:flex items-center justify-between">
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-2 px-6 py-3 bg-white/80 border-2 border-gray-300 text-gray-700 rounded-2xl transition-all duration-200 font-semibold hover:bg-gray-50 hover:border-gray-400"
        >
          <ArrowRight className="w-4 h-4" />
          برگشت به خانه
        </button>

        <button
          onClick={config.primaryAction}
          className={`flex items-center justify-center gap-2 px-8 py-3 min-w-[180px] ${config.primaryBg} text-white rounded-2xl font-semibold transition-all duration-200 shadow-lg ${config.primaryHover} hover:shadow-xl active:shadow-md`}
        >
          {config.primaryText}
        </button>
      </div>
    </div>
  )
})

ActionButtons.displayName = 'ActionButtons'
