import React from 'react'
import { Shield, Clock, MapPin, CreditCard, HeadphonesIcon, Star } from 'lucide-react'

export const FeaturesSection = () => {
  const features = [
    {
      icon: Shield,
      title: 'امن و مطمئن',
      description:
        'تمام اتوبوس‌های ما به طور منظم نگهداری و بازرسی می‌شوند تا ایمنی و راحتی شما تضمین شود.',
    },
    {
      icon: Clock,
      title: 'خدمات ۲۴ ساعته',
      description: 'خدمات مشتریان و خدمات اتوبوسرانی شبانه‌روزی مطابق با برنامه شما.',
    },
    {
      icon: MapPin,
      title: 'پوشش گسترده',
      description: 'شبکه گسترده‌ای که شهرهای بزرگ و کوچک در سراسر افغانستان را پوشش می‌دهد.',
    },
    {
      icon: CreditCard,
      title: 'پرداخت آسان',
      description: 'گزینه‌های متنوع پرداخت شامل نقدی، کارت و پرداخت‌های موبایلی.',
    },
    {
      icon: HeadphonesIcon,
      title: 'خدمات مشتریان',
      description: 'تیم پشتیبانی اختصاصی برای کمک به شما در تکت کردن و معلومات در مورد سفر.',
    },
    {
      icon: Star,
      title: 'خدمات باکیفیت',
      description: 'اتوبوس‌های با کیفیت ممتاز با چوکی‌های راحت و امکانات مدرن.',
    },
  ]

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-white" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            چرا <span className="text-orange-600">حصارک‌بس</span> را انتخاب کنید؟
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            بهترین تجربه سفر با اتوبوس را با تعهد ما به ایمنی، راحتی و قابلیت اعتماد تجربه کنید
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const IconComponent = feature.icon
            return (
              <div
                key={index}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-orange-200 group"
              >
                <div className="bg-gradient-to-br from-orange-500 to-red-500 w-16 h-16 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <IconComponent className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
