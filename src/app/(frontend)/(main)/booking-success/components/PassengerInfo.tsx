import React, { memo } from 'react'
import type { BookingData } from './types'

interface PassengerInfoProps {
  bookingData: BookingData
  status: 'success' | 'cancelled'
}

export const PassengerInfo = memo<PassengerInfoProps>(({ bookingData, status }) => {
  const getThemeColors = () => {
    if (status === 'success') {
      return {
        bgGradient: 'bg-gradient-to-r from-green-50/80 via-white/90 to-emerald-50/80',
        border: 'border-green-200/30',
        accentBar: 'bg-gradient-to-b from-green-500 to-emerald-500',
        textGradient: 'bg-gradient-to-r from-green-600 to-emerald-600',
        innerBg: 'bg-white/60',
        innerBorder: 'border-green-200/30',
      }
    } else {
      return {
        bgGradient: 'bg-gradient-to-r from-red-50/80 via-white/90 to-orange-50/80',
        border: 'border-red-200/30',
        accentBar: 'bg-gradient-to-b from-red-500 to-orange-500',
        textGradient: 'bg-gradient-to-r from-red-600 to-orange-600',
        innerBg: 'bg-white/60',
        innerBorder: 'border-red-200/30',
      }
    }
  }

  const theme = getThemeColors()

  return (
    <div
      className={`${theme.bgGradient} rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8 ${theme.border} backdrop-blur-sm`}
      dir="rtl"
    >
      <div className="flex items-center gap-3 mb-4 sm:mb-6">
        <div className={`w-2 h-8 ${theme.accentBar} rounded-full`} />
        <h3 className={`text-xl font-bold ${theme.textGradient} bg-clip-text text-transparent`}>
          اطلاعات مسافر
        </h3>
      </div>

      <div
        className={`${theme.innerBg} rounded-xl p-4 sm:p-6 backdrop-blur-sm ${theme.innerBorder}`}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600 mb-1">نام کامل</p>
            <p className="font-semibold text-gray-800">{bookingData.passenger.fullName}</p>
          </div>
          {bookingData.passenger.fatherName && (
            <div>
              <p className="text-sm text-gray-600 mb-1">نام پدر</p>
              <p className="font-semibold text-gray-800">{bookingData.passenger.fatherName}</p>
            </div>
          )}
          {bookingData.passenger.phoneNumber && (
            <div>
              <p className="text-sm text-gray-600 mb-1">شماره تلفن</p>
              <p className="font-semibold text-gray-800 text-right" dir="ltr">
                {bookingData.passenger.phoneNumber}
              </p>
            </div>
          )}
          {bookingData.passenger.gender && (
            <div>
              <p className="text-sm text-gray-600 mb-1">جنسیت</p>
              <p className="font-semibold text-gray-800">
                {bookingData.passenger.gender === 'male'
                  ? 'مرد'
                  : bookingData.passenger.gender === 'female'
                    ? 'زن'
                    : bookingData.passenger.gender}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
})

PassengerInfo.displayName = 'PassengerInfo'
