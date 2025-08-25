import React, { memo } from 'react'
import { CheckCircle2, AlertCircle } from 'lucide-react'

interface BookingHeaderProps {
  status: 'success' | 'cancelled' | 'error'
  title: string
  description: string
}

export const BookingHeader = memo<BookingHeaderProps>(({ status, title, description }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'success':
        return {
          bgColor: 'bg-gradient-to-br from-green-500 to-emerald-600',
          textColor: 'bg-gradient-to-r from-green-600 to-emerald-600',
          icon: CheckCircle2,
        }
      case 'cancelled':
        return {
          bgColor: 'bg-gradient-to-br from-red-500 to-orange-600',
          textColor: 'bg-gradient-to-r from-red-600 to-orange-600',
          icon: AlertCircle,
        }
      case 'error':
        return {
          bgColor: 'bg-red-100',
          textColor: 'text-red-800',
          icon: AlertCircle,
        }
      default:
        return {
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-800',
          icon: AlertCircle,
        }
    }
  }

  const config = getStatusConfig()
  const IconComponent = config.icon

  return (
    <div className="text-center mb-8" dir="rtl">
      <div
        className={`inline-flex items-center justify-center w-20 h-20 ${config.bgColor} rounded-full mb-6 shadow-lg`}
      >
        <IconComponent className="w-10 h-10 text-white" />
      </div>

      <h1
        className={`text-3xl font-bold ${status === 'error' ? config.textColor : `${config.textColor} bg-clip-text text-transparent`} pb-2`}
      >
        {title}
      </h1>

      <p className="text-gray-600 text-lg leading-relaxed">{description}</p>
    </div>
  )
})

BookingHeader.displayName = 'BookingHeader'
