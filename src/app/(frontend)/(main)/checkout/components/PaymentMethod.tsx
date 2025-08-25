'use client'

import React, { useState, useCallback, memo } from 'react'
import {
  CreditCard,
  DollarSign,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Clock,
  Wallet,
  HandCoins,
} from 'lucide-react'
import clsx from 'clsx'
import { formatPersianNumber } from '@/utils/persianDigits'

interface PaymentMethodProps {
  totalPrice: number
  isLoading: boolean
  selectedPaymentMethod?: 'cash' | 'card' | 'mobile'
  onPaymentMethodChange?: (method: 'cash' | 'card' | 'mobile') => void
  onConfirm: () => void
  onBack: () => void
  className?: string
}

type PaymentOption = 'cash' | 'card' | 'mobile'

export const PaymentMethod = memo<PaymentMethodProps>(
  ({
    totalPrice,
    isLoading,
    selectedPaymentMethod = 'cash',
    onPaymentMethodChange,
    onConfirm,
    onBack,
    className = '',
  }) => {
    const [acceptedTerms, setAcceptedTerms] = useState(false)

    const paymentOptions = [
      {
        id: 'cash' as PaymentOption,
        name: 'پرداخت در محل',
        description: 'هنگام سوار شدن پرداخت کنید',
        icon: HandCoins,
        recommended: true,
        processingTime: 'هیچ پرداختی اکنون لازم نیست',
        features: [
          'مستقیماً به کمک پرداخت کنید',
          'نقد یا کارت در اتوبوس پذیرفته می‌شود',
          'راحت‌ترین گزینه',
        ],
      },
      {
        id: 'card' as PaymentOption,
        name: 'کارت اعتباری/بدهی',
        description: 'اکنون با کارت خود پرداخت کنید',
        icon: CreditCard,
        recommended: false,
        processingTime: 'پردازش فوری',
        features: ['پرداخت امن آنلاین', 'تأیید فوری', 'تمام کارت‌های اصلی پذیرفته'],
        disabled: true, // Disabled for now
      },
      {
        id: 'mobile' as PaymentOption,
        name: 'پرداخت موبایلی',
        description: 'با کیف پول موبایل پرداخت کنید',
        icon: Wallet,
        recommended: false,
        processingTime: 'پردازش فوری',
        features: ['پرداخت کیف پول موبایل', 'سریع و امن', 'ارائه‌دهندگان مختلف پشتیبانی می‌شوند'],
        disabled: true, // Disabled for now
      },
    ]

    const handlePaymentSelect = useCallback(
      (paymentId: PaymentOption) => {
        onPaymentMethodChange?.(paymentId)
      },
      [onPaymentMethodChange],
    )

    const handleConfirm = useCallback(() => {
      if (!acceptedTerms) {
        return
      }
      onConfirm()
    }, [acceptedTerms, onConfirm])

    const selectedOption = paymentOptions.find((option) => option.id === selectedPaymentMethod)

    return (
      <div
        className={clsx(
          'bg-gradient-to-br from-white via-orange-50/20 to-red-50/20 rounded-3xl shadow-xl border border-orange-200/50 p-6 sm:p-8 backdrop-blur-sm',
          className,
        )}
        dir="rtl"
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-6 sm:mb-8">
          <div className="w-2 h-8 bg-gradient-to-b from-orange-500 to-red-500 rounded-full" />
          <h3 className="text-xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
            روش پرداخت
          </h3>
        </div>

        {/* Total Amount Display */}
        <div className="bg-gradient-to-r from-orange-100 via-orange-50 to-red-100 rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8 border border-orange-200/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">مجموع مبلغ</p>
              <p className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                {formatPersianNumber(totalPrice)} افغانی
              </p>
            </div>
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg">
              <DollarSign className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
          </div>
        </div>

        {/* Payment Options */}
        <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
          <h4 className="font-semibold text-gray-800 mb-3 sm:mb-4 text-sm sm:text-base">
            روش پرداخت را انتخاب کنید
          </h4>

          {paymentOptions.map((option) => {
            const Icon = option.icon
            const isSelected = selectedPaymentMethod === option.id
            const isDisabled = option.disabled

            return (
              <button
                key={option.id}
                onClick={() => !isDisabled && handlePaymentSelect(option.id)}
                disabled={isDisabled}
                className={clsx(
                  'w-full text-left p-4 sm:p-6 rounded-2xl border-2 transition-all duration-200 relative cursor-pointer',
                  isSelected && !isDisabled
                    ? 'bg-gradient-to-r from-orange-50 to-red-50 border-orange-300 shadow-lg'
                    : 'bg-white/90 border-orange-200/50 hover:border-orange-300',
                  isDisabled && 'opacity-50 cursor-not-allowed bg-gray-50',
                )}
              >
                {/* Recommended Badge */}
                {option.recommended && !isDisabled && (
                  <div className="absolute top-3 sm:top-4 left-3 sm:left-4">
                    <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs px-2 py-1 rounded-lg font-semibold">
                      توصیه می‌شود
                    </div>
                  </div>
                )}

                {/* Disabled Badge */}
                {isDisabled && (
                  <div className="absolute top-3 sm:top-4 left-3 sm:left-4">
                    <div className="bg-gray-400 text-white text-xs px-2 py-1 rounded-lg font-semibold">
                      به زودی
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3 sm:gap-4">
                  {/* Icon */}
                  <div
                    className={clsx(
                      'w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0',
                      isSelected && !isDisabled
                        ? 'bg-gradient-to-br from-orange-500 to-red-500 text-white'
                        : 'bg-gray-100 text-gray-600',
                    )}
                  >
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h5 className="font-semibold text-gray-800 text-sm sm:text-base">
                        {option.name}
                      </h5>
                      {isSelected && !isDisabled && (
                        <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                      )}
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3">
                      {option.description}
                    </p>

                    {/* Processing Time */}
                    <div className="flex items-center gap-2 mb-2 sm:mb-3">
                      <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500 flex-shrink-0" />
                      <span className="text-xs text-gray-500">{option.processingTime}</span>
                    </div>

                    {/* Features */}
                    <ul className="space-y-1">
                      {option.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2 text-xs text-gray-600">
                          <div className="w-1 h-1 bg-orange-400 rounded-full flex-shrink-0 mt-1.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        {/* Selected Payment Details */}
        {selectedOption && (
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs sm:text-sm text-blue-800">
                <p className="font-semibold mb-2">دستورات پرداخت</p>
                {selectedPaymentMethod === 'cash' && (
                  <div className="space-y-2">
                    <p>• تکت خود را هنگام سوار شدن نشان دهید</p>
                    <p>• پرداخت باید حداقل ۲ ساعت قبل از حرکت تکمیل شود</p>
                  </div>
                )}
                {selectedPaymentMethod === 'card' && (
                  <div className="space-y-2">
                    <p>• پرداخت شما به صورت امن پردازش خواهد شد</p>
                    <p>• تأیید فوری دریافت خواهید کرد</p>
                    <p>• بازپرداخت مطابق با خط مشی ما ممکن است</p>
                  </div>
                )}
                {selectedPaymentMethod === 'mobile' && (
                  <div className="space-y-2">
                    <p>• کیف پول موبایل مورد نظر خود را انتخاب کنید</p>
                    <p>• تأیید پرداخت فوری</p>
                    <p>• امن و راحت</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Terms and Conditions */}
        <div className="mb-8">
          <label className="flex items-start gap-3 cursor-pointer group">
            <div className="relative flex-shrink-0 mt-1">
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="sr-only"
              />
              <div
                className={clsx(
                  'w-5 h-5 border-2 rounded-lg flex items-center justify-center transition-all duration-200',
                  acceptedTerms
                    ? 'bg-gradient-to-r from-orange-500 to-red-500 border-orange-500 shadow-lg'
                    : 'bg-white border-gray-300 group-hover:border-orange-400 shadow-sm',
                )}
              >
                {acceptedTerms && (
                  <svg
                    className="w-3 h-3 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </div>
            </div>
            <span className="text-sm text-gray-700 leading-relaxed">
              من با{' '}
              <a
                href="/terms"
                target="_blank"
                className="text-orange-600 hover:text-orange-700 font-semibold underline"
              >
                قوانین و مقررات
              </a>{' '}
              و{' '}
              <a
                href="/terms#cancellation-policy"
                target="_blank"
                className="text-orange-600 hover:text-orange-700 font-semibold underline"
              >
                سیاست لغو
              </a>{' '}
              موافقم. می‌دانم که باید حداقل ۱۵ دقیقه قبل از زمان حرکت در محل سواری حضور ڈاشته باشم.
            </span>
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-6 sm:pt-8 pb-4 border-t border-orange-200/30">
          <button
            onClick={onBack}
            disabled={isLoading}
            className={clsx(
              'flex items-center gap-2 px-6 py-3 bg-white/80 border-2 border-gray-300 text-gray-700 rounded-2xl transition-all duration-200 font-semibold',
              isLoading
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:bg-gray-50 hover:border-gray-400',
            )}
          >
            <ArrowRight className="w-4 h-4" />
            برگشت
          </button>

          <button
            onClick={handleConfirm}
            disabled={isLoading || !acceptedTerms}
            className={clsx(
              'flex items-center justify-center gap-2 px-4 sm:px-8 py-3 min-w-[160px] sm:min-w-[180px] bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-2xl font-semibold transition-all duration-200 shadow-lg',
              isLoading || !acceptedTerms
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:from-orange-600 hover:to-red-600 hover:shadow-xl active:shadow-md',
            )}
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span className="hidden sm:inline">در حال تأیید تکت...</span>
                <span className="sm:hidden">در حال تأیید...</span>
              </>
            ) : (
              <>
                <span className="hidden sm:inline">تأیید تکت</span>
                <span className="sm:hidden">تأیید</span>
                <ArrowLeft className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    )
  },
)

PaymentMethod.displayName = 'PaymentMethod'
