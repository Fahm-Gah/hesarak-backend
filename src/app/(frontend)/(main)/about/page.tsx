import React from 'react'
import { Metadata } from 'next'
import { Shield, Users, MapPin, Award, Clock, Heart } from 'lucide-react'

export const metadata: Metadata = {
  title: 'درباره ما | حصارک‌بس - شریک مطمئن سفر شما',
  description:
    'در مورد ماموریت حصارک‌بس برای ارائه سفر امن، راحت و قابل اعتماد اتوبوس در سراسر افغانستان بیاموزید. داستان، ارزش‌ها و تعهد ما به ایمنی مسافران را کشف کنید.',
}

export default function AboutPage() {
  const values = [
    {
      icon: Shield,
      title: 'ایمنی در اولویت',
      description:
        'ایمنی مسافران اولویت اصلی ما است. همه اتوبوس‌های ما تحت تعمیرات منظم و بازرسی‌های ایمنی قرار می‌گیرند.',
    },
    {
      icon: Users,
      title: 'تمرکز بر مشتری',
      description:
        'ما مسافران خود را در اولویت قرار می‌دهیم و خدمات و پشتیبانی فوق‌العاده در طول سفرشان ارائه می‌دهیم.',
    },
    {
      icon: MapPin,
      title: 'پوشش گسترده',
      description: 'شبکه گسترده پوشش شهرهای بزرگ و ولایات سراسر افغانستان با زمان‌های حرکت مناسب.',
    },
    {
      icon: Award,
      title: 'خدمات باکیفیت',
      description: 'متعهد به حفظ استانداردهای بالای خدمات با اتوبوس‌های راحت و رانندگان حرفه‌ای.',
    },
  ]

  const stats = [
    { number: '10,000+', label: 'مسافران راضی', sublabel: 'ماهانه' },
    { number: '50+', label: 'مسیرها', sublabel: 'در سراسر افغانستان' },
    { number: '99%', label: 'به موقع', sublabel: 'عملکرد' },
    { number: '24/7', label: 'خدمات مشتریان', sublabel: 'در دسترس' },
  ]

  const milestones = [
    {
      year: '۱۳۹۰',
      title: 'تأسیس حصارک‌بس',
      description:
        'با چشم‌اندازی برای انقلاب در سفرهای اتوبوس در افغانستان با فناوری مدرن و رویکرد مشتری محور آغاز شد.',
    },
    {
      year: '۱۳۹۱',
      title: 'راه‌اندازی اولین مسیرها',
      description:
        'عملیات را با مسیرهای کلیدی که کابل را به شهرهای بزرگ از جمله مزار، هرات و قندهار متصل می‌کند، آغاز کرد.',
    },
    {
      year: '۱۴۰۴',
      title: 'راه‌اندازی پلتفرم دیجیتال',
      description:
        'سیستم رزرو آنلاین را معرفی کرد که برای مسافران آسان‌تر شد تا از هر کجا تکت اخذ کنند.',
    },
    {
      year: '۱۴۰۴',
      title: 'توسعه ناوگان',
      description:
        'ناوگان خود را با اتوبوس‌های مدرن مجهز به ویژگی‌های ایمنی و امکانات راحتی مسافران گسترش داد.',
    },
    {
      year: '۱۴۰۵',
      title: 'راه‌اندازی اپلیکیشن موبایل',
      description:
        'اپلیکیشن موبایل برای iOS و Android را منتشر کرد و تجربه رزرو یکپارچه روی دستگاه‌های موبایل فراهم آورد.',
    },
  ]

  return (
    <div className="min-h-screen" dir="rtl">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-gray-900 to-gray-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              درباره <span className="text-orange-500">حصارک‌بس</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
              ما متعهد به ارائه خدمات سفر امن، راحت و قابل اعتماد اتوبوس در سراسر افغانستان هستیم و
              مردم و جوامع را با راه‌حل‌های حمل و نقل مدرن متصل می‌کنیم.
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">ماموریت ما</h2>
              <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                تغییر سفرهای اتوبوس در افغانستان از طریق ارائه خدمات ترانسپورتی امن، راحت و مقرون به
                صرفه که جوامع را متصل کرده و رشد اقتصادی را امکان‌پذیر می‌سازد. ما معتقدیم که حمل و
                نقل قابل اعتماد برای پیشرفت و توسعه ضروری است.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed">
                ماموریت ما فراتر از حمل و نقل است - هدف ما کمک به توسعه اجتماعی و اقتصادی افغانستان
                از طریق تسهیل ترانسپورت امن در سراسر کشور است.
              </p>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-red-50 p-8 rounded-2xl">
              <h2 className="text-4xl font-bold text-gray-900 mb-6">چشم‌انداز ما</h2>
              <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                پیشرو در خدمات ترانسپورتی افغانستان باشیم که به دلیل تعهدمان به ایمنی، قابلیت اعتماد
                و رضایت مشتری شناخته شویم. ما آینده‌ای را متصور می‌کنیم که در آن هر افغان به حمل و
                نقل امن و راحت دسترسی داشته باشد.
              </p>
              <div className="flex items-center text-orange-600">
                <Heart className="w-6 h-6 mr-2" />
                <span className="font-semibold">خدمت به افغانستان با افتخار</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">ارزش‌های ما</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              اصولی که همه کارهای ما را راهنمایی می‌کند
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => {
              const IconComponent = value.icon
              return (
                <div
                  key={index}
                  className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 text-center"
                >
                  <div className="bg-gradient-to-br from-orange-500 to-red-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{value.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{value.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 bg-gradient-to-br from-orange-600 to-red-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">تأثیر ما</h2>
            <p className="text-xl opacity-90">ارقامی که داستان ما را می‌گویند</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-5xl font-bold mb-2">{stat.number}</div>
                <div className="text-xl font-semibold mb-1">{stat.label}</div>
                <div className="text-sm opacity-80">{stat.sublabel}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">سفر ما</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              از یک شرکت کوچک تا بزرگترین شرکت ترانسپورتی افغانستان
            </p>
          </div>

          {/* Production-grade Timeline */}
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute right-8 md:right-auto md:left-1/2 md:-translate-x-px top-0 h-full w-0.5 bg-gradient-to-b from-orange-200 via-orange-300 to-orange-200"></div>

            {/* Timeline Items */}
            {milestones.map((milestone, index) => (
              <div key={index} className="relative mb-12 last:mb-0">
                {/* Mobile Layout */}
                <div className="md:hidden">
                  {/* Timeline Dot */}
                  <div className="absolute right-8 top-8 w-4 h-4 -translate-x-1/2">
                    <div className="w-4 h-4 bg-orange-500 rounded-full border-4 border-white shadow-md"></div>
                    <div className="absolute inset-0 w-4 h-4 bg-orange-400 rounded-full animate-ping"></div>
                  </div>

                  {/* Content Card */}
                  <div className="mr-16 bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-orange-600 font-bold text-lg">{milestone.year}</span>
                      <div className="h-px flex-1 bg-gradient-to-l from-orange-200"></div>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{milestone.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{milestone.description}</p>
                  </div>
                </div>

                {/* Desktop Layout */}
                <div className="hidden md:block">
                  <div className="grid grid-cols-2 gap-12">
                    {/* Left Content */}
                    <div className={`${index % 2 === 0 ? 'text-left' : 'text-right'}`}>
                      {index % 2 === 0 && (
                        <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 group">
                          <div className="flex items-center gap-4 mb-4">
                            <span className="text-orange-600 font-bold text-xl group-hover:text-orange-700 transition-colors">
                              {milestone.year}
                            </span>
                            <div className="h-px flex-1 bg-gradient-to-l from-orange-200 group-hover:from-orange-300 transition-all"></div>
                          </div>
                          <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-orange-600 transition-colors">
                            {milestone.title}
                          </h3>
                          <p className="text-gray-600 leading-relaxed text-lg">
                            {milestone.description}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Center Dot */}
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                      <div className="relative">
                        <div className="w-5 h-5 bg-orange-500 rounded-full border-4 border-white shadow-lg"></div>
                        {index === 0 && (
                          <div className="absolute inset-0 w-5 h-5 bg-orange-400 rounded-full animate-ping"></div>
                        )}
                      </div>
                    </div>

                    {/* Right Content */}
                    <div className={`${index % 2 === 1 ? 'text-right' : 'text-left'}`}>
                      {index % 2 === 1 && (
                        <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 group">
                          <div className="flex items-center gap-4 mb-4">
                            <div className="h-px flex-1 bg-gradient-to-r from-orange-200 group-hover:from-orange-300 transition-all"></div>
                            <span className="text-orange-600 font-bold text-xl group-hover:text-orange-700 transition-colors">
                              {milestone.year}
                            </span>
                          </div>
                          <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-orange-600 transition-colors">
                            {milestone.title}
                          </h3>
                          <p className="text-gray-600 leading-relaxed text-lg">
                            {milestone.description}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">تعهد ما</h2>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto mb-12 leading-relaxed">
            هر روز، تیم متخصصان فداکار ما بی‌وقفه تلاش می‌کنند تا اطمینان حاصل کنند که سفر شما امن،
            راحت و به‌یادماندنی باشد. از رانندگان ما گرفته تا نمایندگان خدمات مشتری، همه در حصارک‌بس
            متعهد به خدمت‌رسانی به شما به بهترین وجه هستند.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <Clock className="w-12 h-12 text-orange-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-3">دقت در زمان</h3>
              <p className="text-gray-600">
                ما به وقت شما احترام می‌گذاریم و حرکت و رسیدن به موقع را تضمین می‌کنیم.
              </p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <Shield className="w-12 h-12 text-orange-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-3">ایمنی</h3>
              <p className="text-gray-600">
                تعمیرات منظم و بررسی‌های ایمنی اطمینان می‌دهد که سفر شما امن باشد.
              </p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <Users className="w-12 h-12 text-orange-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-3">خدمات</h3>
              <p className="text-gray-600">
                کارکنان ما همیشه آماده کمک به شما با لبخند صمیمانه هستند.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
