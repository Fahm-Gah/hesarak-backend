import React from 'react'
import { Star, Quote } from 'lucide-react'

export const TestimonialsSection = () => {
  const testimonials = [
    {
      name: 'احمد ناصر',
      location: 'کابل',
      rating: 5,
      comment:
        'خدمات عالی! بس راحت بود و درست به موقع رسید. فرآیند بوک کردن بسیار آسان و کارکنان مفید بودند.',
      route: 'کابل به مزارشریف',
    },
    {
      name: 'فاطمه خان',
      location: 'هرات',
      rating: 5,
      comment:
        'برای کار مکرراً سفر می‌کنم و حصارک پنجشیر انتخاب اول من شده است. بس‌های تمیز، رانندگان حرفه‌ای و خدمات عالی مشتری.',
      route: 'هرات به کابل',
    },
    {
      name: 'محمد علی',
      location: 'جلال‌آباد',
      rating: 5,
      comment:
        'حمل و نقل امن و قابل اعتماد. سیستم بوک کردن آنلاین آسان است و قیمت‌ها بسیار معقول. به شدت توصیه می‌کنم!',
      route: 'جلال‌آباد به کابل',
    },
    {
      name: 'سارا احمدی',
      location: 'قندهار',
      rating: 4,
      comment:
        'تجربه خوبی در کل. بس راحت بود و سفر آرام گذشت. حتماً برای سفرهای آینده‌ام دوباره بوک خواهم کرد.',
      route: 'قندهار به کابل',
    },
    {
      name: 'عمر حکیم',
      location: 'مزارشریف',
      rating: 5,
      comment:
        'خدمات فوق‌العاده از بوک کردن تا رسیدن. بس مدرن، تمیز و مجهز به تمام امکانات لازم بود. ارزش عالی در برابر پول.',
      route: 'مزارشریف به هرات',
    },
    {
      name: 'مریم صافی',
      location: 'کابل',
      rating: 5,
      comment:
        'خدمات حرفه‌ای و مهربان. رانندگان باتجربه و بس‌ها خوب نگهداری می‌شوند. احساس امنیت با حصارک پنجشیر.',
      route: 'کابل به قندهار',
    },
  ]

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`w-4 h-4 ${index < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ))
  }

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-gray-100" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            نظریات <span className="text-orange-600">مسافران</span> ما
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            نظریات هزاران مسافر راضی را بخوانید که به حصارک پنجشیر برای نیازهای سفرشان اعتماد دارند
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 relative"
            >
              {/* Quote Icon */}
              <div className="absolute top-4 left-4 text-orange-200">
                <Quote className="w-6 h-6" />
              </div>

              {/* Rating */}
              <div className="flex items-center mb-4">{renderStars(testimonial.rating)}</div>

              {/* Comment */}
              <p className="text-gray-700 mb-6 leading-relaxed text-right">
                «{testimonial.comment}»
              </p>

              {/* Route */}
              <div className="text-sm text-orange-600 font-medium mb-4">{testimonial.route}</div>

              {/* Author */}
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                  {testimonial.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </div>
                <div className="mr-3">
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-600">{testimonial.location}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Trust Stats */}
        <div dir="ltr" className="mt-16 grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-3xl font-bold text-orange-600 mb-2">۴.۹/۵</div>
            <div className="text-gray-600">میانگین امتیاز</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-orange-600 mb-2">+۱۰،۰۰۰</div>
            <div className="text-gray-600">مسافر راضی</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-orange-600 mb-2">+۵۰</div>
            <div className="text-gray-600">مسیر موجود</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-orange-600 mb-2">۹۹%</div>
            <div className="text-gray-600">عملکرد به موقع</div>
          </div>
        </div>
      </div>
    </section>
  )
}
