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
        'تکت شما لغو شده و چوکی(ها)ی شما آزاد شده است',
        'اگر برای این تکت پرداخت کرده بودید، بازپرداخت طبق قوانین بازپرداخت ما پردازش خواهد شد',
        'می‌توانید برای تاریخ سفر مورد نظر خود تکت جدیدی قید کنید',
        'اگر سوالی درباره این لغو دارید، با پشتیبانی مشتریان تماس بگیرید',
      ]
    }

    const baseItems = [
      'لطفاً حداقل ۳۰ دقیقه قبل از زمان حرکت در ترمینال حضور یابید',
      'برای تأیید هویت هنگام سواری، مدرک شناسایی معتبر به همراه داشته باشید',
      'اطلاعات تکت خود را تا پایان سفر به طور ایمن نگه دارید',
    ]

    if (!bookingData.status.isPaid) {
      baseItems.push('برای تضمین قید خود، پرداخت را قبل از مهلت تکمیل کنید')
    }

    return baseItems
  }

  const getTitle = () => {
    if (status === 'cancelled') {
      return 'این به چه معناست'
    }
    return 'اطلاعات مهم'
  }

  const infoItems = getInfoItems()

  return (
    <div className={`${theme.bgGradient} rounded-3xl shadow-xl ${theme.border} p-8 mb-8`} dir="rtl">
      <h3 className="text-xl font-bold text-gray-800 mb-4">{getTitle()}</h3>
      <div className="space-y-3 text-sm text-gray-700">
        {infoItems.map((item, index) => (
          <p key={index} className="flex items-start gap-2">
            <span
              className={`w-1.5 h-1.5 ${
                item.includes('برای تضمین') ? theme.pendingDotColor : theme.dotColor
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
