import React from 'react'
import { Metadata } from 'next'
import {
  HelpCircle,
  Search,
  CreditCard,
  MapPin,
  Phone,
  Mail,
  Clock,
  Ticket,
  Shield,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  MessageCircle,
  FileText,
  Calendar,
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'کمک و پشتیبانی | حصارک پنجشیر - کمک برای تکت بس',
  description:
    'پاسخ به سوالات رایج در مورد تکت بس با حصارک پنجشیر، روش‌های پرداخت، سیاست لغو و دریافت پشتیبانی پیدا کنید.',
}

export default function HelpPage() {
  return (
    <div className="min-h-screen" dir="rtl">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-gray-900 to-gray-800 text-white py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center">
                <HelpCircle className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 lg:mb-6">
              کمک و <span className="text-orange-500">پشتیبانی</span>
            </h1>
            <p className="text-lg md:text-xl lg:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              برای تکت کردن، مدیریت سفرهای خود و استفاده از پلتفرم تکت بس حصارک پنجشیر کمک دریافت
              کنید.
            </p>
          </div>
        </div>
      </section>

      {/* Quick Help Categories */}
      <section className="py-12 lg:py-16 bg-gradient-to-br from-orange-50 to-red-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 lg:mb-12">
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-3 lg:mb-4">
              با چه چیزی می‌توانیم کمکتان کنیم؟
            </h2>
            <p className="text-lg lg:text-xl text-gray-600">
              دسته‌بندی را انتخاب کنید تا به سرعت پاسخ پیدا کنید
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {[
              {
                icon: Search,
                title: 'بوک کردن تکت',
                description: 'نحوه جست‌وجو و بوک کردن تکت در بس',
                href: '#booking-help',
                color: 'from-blue-500 to-cyan-500',
              },
              {
                icon: CreditCard,
                title: 'پرداخت و قیمت‌گذاری',
                description: 'روش‌های پرداخت و قیمت‌گذاری تکت',
                href: '#payment-help',
                color: 'from-green-500 to-emerald-500',
              },
              {
                icon: RefreshCw,
                title: 'لغو و تغییرات',
                description: 'لغو یا تغییر تکت خود',
                href: '#cancellation-help',
                color: 'from-red-500 to-pink-500',
              },
              {
                icon: Ticket,
                title: 'تکت‌های من',
                description: 'مدیریت و مشاهده تکت‌های خود',
                href: '#tickets-help',
                color: 'from-purple-500 to-indigo-500',
              },
              {
                icon: Shield,
                title: 'حساب کاربری و امنیت',
                description: 'تنظیمات حساب و امنیت',
                href: '#account-help',
                color: 'from-orange-500 to-red-500',
              },
              {
                icon: MessageCircle,
                title: 'تماس با خدمات مشتریان',
                description: 'با تیم ما در تماس باشید',
                href: '#contact-help',
                color: 'from-gray-500 to-gray-700',
              },
            ].map((category, index) => {
              const IconComponent = category.icon
              return (
                <a
                  key={index}
                  href={category.href}
                  className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] border border-gray-100"
                >
                  <div
                    className={`w-12 h-12 bg-gradient-to-br ${category.color} rounded-xl flex items-center justify-center mb-4`}
                  >
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg lg:text-xl font-semibold text-gray-900 mb-2">
                    {category.title}
                  </h3>
                  <p className="text-sm lg:text-base text-gray-600">{category.description}</p>
                </a>
              )
            })}
          </div>
        </div>
      </section>

      {/* FAQ Sections */}
      <section className="py-12 lg:py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Booking Help */}
          <div id="booking-help" className="mb-12 lg:mb-16">
            <div className="flex items-center gap-3 mb-6 lg:mb-8">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                <Search className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">بوک کردن تکت</h2>
            </div>

            <div className="space-y-4 lg:space-y-6">
              <div className="bg-gray-50 rounded-xl p-4 lg:p-6">
                <h3 className="text-lg lg:text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  چگونه تکت بوک کنم؟
                </h3>
                <div className="text-sm lg:text-base text-gray-700 space-y-2">
                  <p>
                    <strong>قدم ۱:</strong> به صفحه اصلی بروید و شهر مبداء و مقصد خود را وارد کنید
                  </p>
                  <p>
                    <strong>قدم ۲:</strong> تاریخ سفر خود را با استفاده از تقویم انتخاب کنید
                  </p>
                  <p>
                    <strong>قدم ۳:</strong> روی «جست‌وجوی سفر» کلیک کنید تا بس‌های موجود را ببینید
                  </p>
                  <p>
                    <strong>قدم ۴:</strong> سفر مورد علاقه خود را انتخاب کرده و صندلی‌هایتان را
                    انتخاب کنید
                  </p>
                  <p>
                    <strong>قدم ۵:</strong> جزئیات مسافران را وارد کرده و پرداخت را تکمیل کنید
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 lg:p-6">
                <h3 className="text-lg lg:text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  آیا می‌توانم صندلی خود را انتخاب کنم؟
                </h3>
                <p className="text-sm lg:text-base text-gray-700">
                  بله! پس از انتخاب سفر، نقشه صندلی‌ها را خواهید دید که می‌توانید صندلی‌های مورد
                  علاقه خود را انتخاب کنید. صندلی‌های موجود به رنگ زرد و صندلی‌های اشغال شده به رنگ
                  سیاه نشان داده می‌شوند.
                </p>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 lg:p-6">
                <h3 className="text-lg lg:text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                  تا چه زمانی قبل از حرکت می‌توانم قید کنم؟
                </h3>
                <p className="text-sm lg:text-base text-gray-700">
                  می‌توانید تا ۲ ساعت قبل از حرکت تکت قید کنید. پس از آن، چوکی برای آن سفر بسته
                  می‌شود.
                </p>
              </div>
            </div>
          </div>

          {/* Payment Help */}
          <div id="payment-help" className="mb-12 lg:mb-16">
            <div className="flex items-center gap-3 mb-6 lg:mb-8">
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">پرداخت و قیمت‌گذاری</h2>
            </div>

            <div className="space-y-4 lg:space-y-6">
              <div className="bg-gray-50 rounded-xl p-4 lg:p-6">
                <h3 className="text-lg lg:text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  چه روش‌های پرداختی را می‌پذیرید؟
                </h3>
                <div className="text-sm lg:text-base text-gray-700 space-y-2">
                  <p>
                    <strong>پرداخت در محل:</strong> پرداخت نقدی یا کارتی مستقیماً به کندکتور (توصیه
                    می‌شود)
                  </p>
                  <p>
                    <strong>کارت‌های اعتباری/بدهی:</strong> ویزا و مستركارد (به زودی)
                  </p>
                  <p>
                    <strong>کیف پول‌های موبایل:</strong> خدمات مختلف پرداخت موبایل (به زودی)
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 lg:p-6">
                <h3 className="text-lg lg:text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  قیمت تکت چگونه محاسبه می‌شود؟
                </h3>
                <p className="text-sm lg:text-base text-gray-700">
                  قیمت تکت‌ها بر اساس فاصله مسیر، نوع بس و تقاضا محاسبه می‌شود. قبل از تکمیل بوک
                  کردن، قیمت دقیق از جمله هرگونه هزینه اضافی را خواهید دید.
                </p>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 lg:p-6">
                <h3 className="text-lg lg:text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  آیا پرداخت من امن است؟
                </h3>
                <p className="text-sm lg:text-base text-gray-700">
                  بله، همه پرداخت‌های آنلاین از طریق کانال‌های امن و رمزگذاری شده پردازش می‌شوند. ما
                  اطلاعات کامل پرداخت شما را برای امنیت ذخیره نمی‌کنیم.
                </p>
              </div>
            </div>
          </div>

          {/* Cancellation Help */}
          <div id="cancellation-help" className="mb-12 lg:mb-16">
            <div className="flex items-center gap-3 mb-6 lg:mb-8">
              <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-pink-500 rounded-lg flex items-center justify-center">
                <RefreshCw className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">لغو و تغییرات</h2>
            </div>

            <div className="space-y-4 lg:space-y-6">
              <div className="bg-gray-50 rounded-xl p-4 lg:p-6">
                <h3 className="text-lg lg:text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  سیاست لغو شما چیست؟
                </h3>
                <div className="text-sm lg:text-base text-gray-700 space-y-2">
                  <p>
                    <strong>بیشتر از ۲۴ ساعت:</strong> بازپرداخت کامل منهای ۵٪ هزینه پردازش
                  </p>
                  <p>
                    <strong>۱۲-۲۴ ساعت:</strong> ۵۰٪ بازپرداخت قیمت تکت
                  </p>
                  <p>
                    <strong>۲-۱۲ ساعت:</strong> ۲۵٪ بازپرداخت قیمت تکت
                  </p>
                  <p>
                    <strong>کمتر از ۲ ساعت:</strong> بازپرداخت در دسترس نیست
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 lg:p-6">
                <h3 className="text-lg lg:text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  چگونه تکت خود را لغو کنم؟
                </h3>
                <div className="text-sm lg:text-base text-gray-700 space-y-2">
                  <p>۱. به «تکت‌های من» در حساب کاربری خود بروید</p>
                  <p>۲. تکتی که می‌خواهید لغو کنید را پیدا کنید</p>
                  <p>۳. روی «لغو» کلیک کرده و دستورالعمل‌ها را دنبال کنید</p>
                  <p>۴. یک ایمیل تأیید لغو دریافت خواهید کرد</p>
                  <p>۵. بازپرداخت‌ها در طی ۵-۷ روز کاری پردازش خواهند شد</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tickets Help */}
          <div id="tickets-help" className="mb-12 lg:mb-16">
            <div className="flex items-center gap-3 mb-6 lg:mb-8">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-lg flex items-center justify-center">
                <Ticket className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">تکت‌های من</h2>
            </div>

            <div className="space-y-4 lg:space-y-6">
              <div className="bg-gray-50 rounded-xl p-4 lg:p-6">
                <h3 className="text-lg lg:text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  چگونه تکت‌های خود را مشاهده کنم؟
                </h3>
                <p className="text-sm lg:text-base text-gray-700">
                  وارد حساب کاربری خود شوید و به «تکت‌های من» بروید تا همه تکت‌های فعلی و گذشته خود
                  را ببینید. می‌توانید بر اساس سفرهای آینده، گذشته یا همه سفرها فیلتر کنید.
                </p>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 lg:p-6">
                <h3 className="text-lg lg:text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  هنگام سفر چه چیزی باید به همراه داشته باشم؟
                </h3>
                <div className="text-sm lg:text-base text-gray-700 space-y-2">
                  <p>• شناسنامه معتبر که با نام تکت شما مطابقت داشته باشد</p>
                  <p>• تأیید تکت شما (دیجیتال یا چاپی)</p>
                  <p>• ۱۵ دقیقه زودتر در نقطه حرکت حاضر شوید</p>
                  <p>
                    • پول نقد دقیق یا کارت را برای پرداخت آماده داشته باشید (اگر در محل پرداخت
                    می‌کنید)
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 lg:p-6">
                <h3 className="text-lg lg:text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  آیا می‌توانم چوکی خود را تغییر دهم؟
                </h3>
                <p className="text-sm lg:text-base text-gray-700">
                  در حال حاضر، تغییرات مستلزم لغو چوکی موجود و انتخاب چوکی جدید است. ما در حال کار
                  بر روی اضافه کردن قابلیت تغییر مستقیم هستیم.
                </p>
              </div>
            </div>
          </div>

          {/* Account Help */}
          <div id="account-help" className="mb-12 lg:mb-16">
            <div className="flex items-center gap-3 mb-6 lg:mb-8">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">حساب کاربری و امنیت</h2>
            </div>

            <div className="space-y-4 lg:space-y-6">
              <div className="bg-gray-50 rounded-xl p-4 lg:p-6">
                <h3 className="text-lg lg:text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  چگونه حساب کاربری ایجاد کنم؟
                </h3>
                <p className="text-sm lg:text-base text-gray-700">
                  روی «ثبت‌نام» کلیک کرده و شماره تلفن خود را وارد کنید. ما یک کد تأیید برای تکمیل
                  ثبت‌نام به شما ارسال خواهیم کرد. شماره تلفن شما به عنوان نام کاربری ورود شما عمل
                  می‌کند.
                </p>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 lg:p-6">
                <h3 className="text-lg lg:text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  چرا به موقعیت من نیاز دارید؟
                </h3>
                <p className="text-sm lg:text-base text-gray-700">
                  موقعیت به ما کمک می‌کند تا با پیشنهاد نقاط حرکت نزدیک و بهبود برنامه‌ریزی مسیر،
                  خدمات بهتری ارائه دهیم. این اطلاعات خصوصی و امن نگه داشته می‌شود.
                </p>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 lg:p-6">
                <h3 className="text-lg lg:text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  چگونه رمز عبور خود را بازنشانی کنم؟
                </h3>
                <p className="text-sm lg:text-base text-gray-700">
                  از آنجا که ما از تأیید هویت شماره تلفن استفاده می‌کنیم، کافی است شماره تلفن خود را
                  در صفحه ورود وارد کنید تا یک کد تأیید جدید برای شما ارسال کنیم.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Support */}
      <section
        id="contact-help"
        className="py-12 lg:py-20 bg-gradient-to-br from-gray-50 to-gray-100"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 lg:mb-12">
            <div className="flex justify-center mb-4 lg:mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-gray-500 to-gray-700 rounded-xl flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
            </div>
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-3 lg:mb-4">
              هنوز به کمک نیاز دارید؟
            </h2>
            <p className="text-lg lg:text-xl text-gray-600">تیم پشتیبانی ما ۲۴/۷ در خدمت شما است</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            <div className="bg-white rounded-2xl p-6 lg:p-8 shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Phone className="w-5 h-5 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">پشتیبانی تلفنی</h3>
              </div>
              <p className="text-gray-600 mb-4">برای کمک فوری با تکت خود با ما تماس بگیرید</p>
              <p className="text-right text-2xl font-bold text-gray-900" dir="ltr">
                +93 79 900 4567
              </p>
              <p className="text-sm text-gray-500 mt-2">۲۴/۷ در دسترس</p>
            </div>

            <div className="bg-white rounded-2xl p-6 lg:p-8 shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Mail className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">پشتیبانی ایمیل</h3>
              </div>
              <p className="text-gray-600 mb-4">
                برای ما ایمیل بفرستید و ما در عرض ۲ ساعت پاسخ خواهیم داد
              </p>
              <p className="text-right text-lg font-semibold text-gray-900" dir="ltr">
                hesarak.trans600@gmail.com
              </p>
              <p className="text-sm text-gray-500 mt-2">پاسخ در عرض ۲ ساعت</p>
            </div>
          </div>

          <div className="mt-8 lg:mt-12 bg-white rounded-2xl p-6 lg:p-8 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <MapPin className="w-5 h-5 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">موقعیت دفتر</h3>
            </div>
            <p className="text-gray-600 mb-2">در ساعات کاری از ما دیدن کنید</p>
            <address className="text-lg text-gray-900 not-italic">
              لوای بابه جان
              <br />
              کابل، افغانستان
            </address>
            <div className="flex items-center gap-2 mt-3 text-sm text-gray-500">
              <Clock className="w-4 h-4" />
              <span>شنبه - جمعه: ۹:۰۰ صبح - ۶:۰۰ عصر</span>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-12 lg:py-16 bg-white border-t border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-6 lg:mb-8 text-center">
            لینک‌های مفید
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
            {[
              { title: 'شرایط و ضوابط', href: '/terms', icon: FileText },
              { title: 'سیاست حفظ حریم خصوصی', href: '/privacy', icon: Shield },
              { title: 'تکت‌های من', href: '/my-tickets', icon: Ticket },
              { title: 'جستجوی سفر', href: '/', icon: Calendar },
            ].map((link, index) => {
              const IconComponent = link.icon
              return (
                <a
                  key={index}
                  href={link.href}
                  className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-orange-50 hover:text-orange-700 transition-colors"
                >
                  <IconComponent className="w-5 h-5" />
                  <span className="font-medium">{link.title}</span>
                </a>
              )
            })}
          </div>
        </div>
      </section>
    </div>
  )
}
