import React, { memo } from 'react'
import { CreditCard, Clock } from 'lucide-react'
import { convertToPersianDigits } from '@/utils/persianDigits'
import type { BookingData } from './types'

interface PaymentInfoProps {
  bookingData: BookingData
  formatPaymentDeadline: (deadline: string) => { date: string; time: string }
  status: 'success' | 'cancelled'
}

export const PaymentInfo = memo<PaymentInfoProps>(
  ({ bookingData, formatPaymentDeadline, status }) => {
    const getThemeColors = () => {
      if (status === 'success') {
        return {
          bgGradient: 'bg-gradient-to-r from-green-50/80 via-white/90 to-emerald-50/80',
          border: 'border-green-200/30',
          accentBar: 'bg-gradient-to-b from-green-500 to-emerald-500',
          textGradient: 'bg-gradient-to-r from-green-600 to-emerald-600',
          statusIconBg: 'bg-gradient-to-br from-green-100 to-emerald-100',
          statusIconColor: 'text-green-600',
          statusTextColor: 'text-green-600',
          deadlineIconBg: 'bg-gradient-to-br from-orange-100 to-red-100',
        }
      } else {
        return {
          bgGradient: 'bg-gradient-to-r from-red-50/80 via-white/90 to-orange-50/80',
          border: 'border-red-200/30',
          accentBar: 'bg-gradient-to-b from-red-500 to-orange-500',
          textGradient: 'bg-gradient-to-r from-red-600 to-orange-600',
          statusIconBg: 'bg-gradient-to-br from-red-100 to-orange-100',
          statusIconColor: 'text-red-600',
          statusTextColor: 'text-red-600',
          deadlineIconBg: 'bg-gradient-to-br from-orange-100 to-red-100',
        }
      }
    }

    const theme = getThemeColors()

    return (
      <div
        className={`${theme.bgGradient} rounded-2xl p-4 sm:p-6 ${theme.border} backdrop-blur-sm`}
        dir="rtl"
      >
        <div className="flex items-center gap-3 mb-4 sm:mb-6">
          <div className={`w-2 h-8 ${theme.accentBar} rounded-full`} />
          <h3 className={`text-xl font-bold ${theme.textGradient} bg-clip-text text-transparent`}>
            اطلاعات پرداخت
          </h3>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 ${theme.statusIconBg} rounded-xl flex items-center justify-center`}
            >
              <CreditCard className={`w-5 h-5 ${theme.statusIconColor}`} />
            </div>
            <div>
              <p className="text-sm text-gray-600">وضعیت پرداخت</p>
              <p className={`font-bold ${theme.statusTextColor}`}>
                {bookingData.status.isPaid ? 'پرداخت شده' : 'در انتظار پرداخت'}
              </p>
            </div>
          </div>

          {!bookingData.status.isPaid && bookingData.status.paymentDeadline && (
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 ${theme.deadlineIconBg} rounded-xl flex items-center justify-center`}
              >
                <Clock className="w-5 h-5 text-orange-600" />
              </div>
              <div className="sm:text-right">
                <p className="text-sm text-gray-600">مهلت پرداخت</p>
                <p className="font-bold text-orange-600">
                  {convertToPersianDigits(formatPaymentDeadline(bookingData.status.paymentDeadline).date)}
                </p>
                <p className="text-sm font-semibold text-orange-600">
                  {convertToPersianDigits(formatPaymentDeadline(bookingData.status.paymentDeadline).time)}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  },
)

PaymentInfo.displayName = 'PaymentInfo'
