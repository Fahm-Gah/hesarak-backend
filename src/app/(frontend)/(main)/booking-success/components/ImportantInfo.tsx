import React, { memo } from 'react'
import type { BookingData } from './types'

interface ImportantInfoProps {
  bookingData: BookingData
  status: 'success' | 'cancelled'
}

export const ImportantInfo = memo<ImportantInfoProps>(({ bookingData, status }) => {
  const getThemeColors = () => {
    if (status === 'success') {
      return {
        bgGradient: 'bg-gradient-to-r from-green-50/80 via-white/90 to-emerald-50/80',
        border: 'border-green-200/50',
        dotColor: 'bg-green-500',
        pendingDotColor: 'bg-orange-500',
      }
    } else {
      return {
        bgGradient: 'bg-gradient-to-r from-red-50/80 via-white/90 to-orange-50/80',
        border: 'border-red-200/50',
        dotColor: 'bg-red-500',
        pendingDotColor: 'bg-orange-500',
      }
    }
  }

  const theme = getThemeColors()

  const getInfoItems = () => {
    if (status === 'cancelled') {
      return [
        'Your ticket has been cancelled and your seat(s) have been released',
        'If you paid for this ticket, a refund will be processed according to our refund policy',
        'You can book a new ticket for your desired travel date',
        'Contact customer support if you have any questions about this cancellation',
      ]
    }

    const baseItems = [
      'Please arrive at the departure terminal at least 30 minutes before departure time',
      'Bring a valid ID document for verification during boarding',
      'Keep your ticket information safe until your journey is complete',
    ]

    if (!bookingData.status.isPaid) {
      baseItems.push('Complete your payment before the deadline to secure your booking')
    }

    return baseItems
  }

  const getTitle = () => {
    if (status === 'cancelled') {
      return 'What This Means'
    }
    return 'Important Information'
  }

  const infoItems = getInfoItems()

  return (
    <div className={`${theme.bgGradient} rounded-3xl shadow-xl ${theme.border} p-8 mb-8`}>
      <h3 className="text-xl font-bold text-gray-800 mb-4">{getTitle()}</h3>
      <div className="space-y-3 text-sm text-gray-700">
        {infoItems.map((item, index) => (
          <p key={index} className="flex items-start gap-2">
            <span
              className={`w-1.5 h-1.5 ${
                item.includes('Complete your payment') ? theme.pendingDotColor : theme.dotColor
              } rounded-full flex-shrink-0 mt-2`}
            />
            {item}
          </p>
        ))}
      </div>
    </div>
  )
})

ImportantInfo.displayName = 'ImportantInfo'
