import React from 'react'
import { Metadata } from 'next'
import { FileText, AlertTriangle, Clock, RefreshCw, CreditCard, Users } from 'lucide-react'

export const metadata: Metadata = {
  title: 'شرایط و قوانین | حصارک پنجشیر - قرارداد خدمات',
  description:
    'شرایط و قوانین استفاده از خدمات تکت بس حصارک پنجشیر، شامل سیاست لغو و راهنمای خدمات ما را بخوانید.',
}

export default function TermsPage() {
  return (
    <div className="min-h-screen" dir="rtl">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-gray-900 to-gray-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              شرایط و <span className="text-orange-500">قوانین</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
              لطفاً قبل از استفاده از خدمات ما، این شرایط را با دقت بخوانید. با تکت کردن از حصارک
              پنجشیر، شما با این شرایط موافقت می‌کنید.
            </p>
            <p className="text-sm text-gray-400 mt-4">آخرین بروزرسانی: سنبله ۱۴۰۴</p>
          </div>
        </div>
      </section>

      {/* Quick Navigation */}
      <section className="py-12 bg-gradient-to-br from-orange-50 to-red-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">دسترسی سریع</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { title: 'شرایط تکت', href: '#booking-terms', icon: FileText },
              { title: 'سیاست لغو', href: '#cancellation-policy', icon: RefreshCw },
              { title: 'شرایط پرداخت', href: '#payment-terms', icon: CreditCard },
              {
                title: 'مسئولیت‌های مسافر',
                href: '#passenger-responsibilities',
                icon: Users,
              },
              { title: 'محدودیت‌های خدمات', href: '#limitations', icon: AlertTriangle },
              { title: 'تماس با پشتیبانی', href: '#contact', icon: Clock },
            ].map((item, index) => {
              const IconComponent = item.icon
              return (
                <a
                  key={index}
                  href={item.href}
                  className="flex items-center gap-3 bg-white rounded-lg p-4 hover:shadow-md transition-shadow border border-gray-200"
                >
                  <div className="bg-gradient-to-br from-orange-500 to-red-500 w-10 h-10 rounded-lg flex items-center justify-center">
                    <IconComponent className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-medium text-gray-900">{item.title}</span>
                </a>
              )
            })}
          </div>
        </div>
      </section>

      {/* Terms Content */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-12">
            {/* General Terms */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">۱. شرایط عمومی</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  با استفاده از خدمات حصارک پنجشیر، شما موافقت می‌کنید که تحت پوشش این شرایط و ضوابط
                  قرار گیرید. این شرایط برای تمام کاربران وبسایت، برنامه موبایل، و خدمات تکت ما
                  اعمال می‌شود.
                </p>
                <p>
                  حصارک پنجشیر حق دارد که این شرایط را در هر زمان تغییر دهد. تغییرات پس از انتشار در
                  وبسایت ما فوراً موثر خواهند بود. ادامه استفاده از خدمات ما به معنی پذیرش هرگونه
                  تغییرات است.
                </p>
              </div>
            </div>

            {/* Booking Terms */}
            <div id="booking-terms">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">۲. شرایط و ضوابط تکت</h2>
              <div className="space-y-4 text-gray-700">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">فرآیند تکت</h3>
                  <ul className="list-disc list-inside space-y-2 mr-4">
                    <li>تمام تکت‌ها با توجه به در دسترس بودن چوکی می‌باشد</li>
                    <li>تایید تکت از طریق پیامک و ایمیل ارسال خواهد شد</li>
                    <li>شما باید اطلاعات شخصی دقیق ارائه دهید</li>
                    <li>هر مسافر باید تایید تکت معتبر داشته باشد</li>
                    <li>کودکان زیر ۲ سال زمانی که روی دامن بزرگسالان بنشینند رایگان سفر می‌کنند</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">اعتبار تکت</h3>
                  <ul className="list-disc list-inside space-y-2 mr-4">
                    <li>تکت‌ها فقط برای تاریخ، زمان و مسیر مشخص شده معتبر هستند</li>
                    <li>تکت‌ها بین مسافران قابل انتقال نیستند</li>
                    <li>شما باید شناسنامه معتبر مطابق با نام تکت ارائه دهید</li>
                    <li>تکت‌های دیجیتال روی دستگاه‌های موبایل پذیرفته هستند</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Cancellation Policy */}
            <div id="cancellation-policy">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">۳. سیاست لغو</h2>
              <div className="space-y-4 text-gray-700">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">
                    زمانبندی لغو و بازپرداخت
                  </h3>
                  <ul className="list-disc list-inside space-y-2 mr-4">
                    <li>
                      <strong>بیش از ۲۴ ساعت قبل از حرکت:</strong> بازپرداخت کامل به ازای ۵٪ کارمزد
                      پردازش
                    </li>
                    <li>
                      <strong>۱۲-۲۴ ساعت قبل از حرکت:</strong> ۵۰٪ بازپرداخت قیمت تکت
                    </li>
                    <li>
                      <strong>۲-۱۲ ساعت قبل از حرکت:</strong> ۲۵٪ بازپرداخت قیمت تکت
                    </li>
                    <li>
                      <strong>کمتر از ۲ ساعت قبل از حرکت:</strong> بازپرداخت وجود ندارد
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">نحوه لغو</h3>
                  <ul className="list-disc list-inside space-y-2 mr-4">
                    <li>به حساب خود لاگ ین کنید و به &ldquo;تکت‌های من&rdquo; بروید</li>
                    <li>تکتی که می‌خواهید لغو کنید را انتخاب کنید</li>
                    <li>روی &ldquo;لغو تکت&rdquo; کلیک کنید و دستورالعمل را دنبال کنید</li>
                    <li>شما ایمیل تایید لغو دریافت خواهید کرد</li>
                    <li>بازپرداخت‌ها ظرف ۵-۷ روز کاری پردازش خواهد شد</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">شرایط ویژه</h3>
                  <ul className="list-disc list-inside space-y-2 mr-4">
                    <li>
                      <strong>فوریت پزشکی:</strong> بازپرداخت کامل با گواهی پزشکی معتبر
                    </li>
                    <li>
                      <strong>لغو سفر توسط حصارک پنجشیر:</strong> بازپرداخت کامل یا تغییر زمان
                      رایگان
                    </li>
                    <li>
                      <strong>آب و هوا/بلایای طبیعی:</strong> تغییر زمان رایگان یا بازپرداخت کامل
                    </li>
                    <li>
                      <strong>محدودیت‌های دولتی:</strong> بازپرداخت کامل قابل دسترس
                    </li>
                  </ul>
                </div>
                <p>
                  <strong>مهم:</strong> کارمزدهای لغو ممکن است طبق موارد فوق اعمال شود. بازپرداخت‌ها
                  به روش پرداخت اصلی مورد استفاده برای تکت پردازش خواهد شد.
                </p>
              </div>
            </div>

            {/* Payment Terms */}
            <div id="payment-terms">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">۴. شرایط پرداخت</h2>
              <div className="space-y-4 text-gray-700">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">
                    روش‌های پرداخت پذیرفته شده
                  </h3>
                  <ul className="list-disc list-inside space-y-2 mr-4">
                    <li>کارت‌های اعتباری و نقدی (Visa, Mastercard)</li>
                    <li>خدمات پرداخت موبایل</li>
                    <li>پرداخت نقدی نزد نمایندگی‌های مجاز</li>
                    <li>انتقال بانکی (برای تکت‌های گروهی)</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">امنیت پرداخت</h3>
                  <ul className="list-disc list-inside space-y-2 mr-4">
                    <li>تمام پرداخت‌ها از طریق کانال‌های امن و رمزگذاری شده پردازش می‌شود</li>
                    <li>ما اطلاعات کامل پرداخت شما را ذخیره نمی‌کنیم</li>
                    <li>تاییدیه‌های پرداخت فوراً پس از تراکنش‌های موفق ارسال می‌شود</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Passenger Responsibilities */}
            <div id="passenger-responsibilities">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">۵. مسئولیت‌های مسافر</h2>
              <div className="space-y-4 text-gray-700">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">قبل از سفر</h3>
                  <ul className="list-disc list-inside space-y-2 mr-4">
                    <li>حداقل ۱۵ دقیقه زودتر در نقطه حرکت حاضر شوید</li>
                    <li>شناسنامه معتبر مطابق با تکت خود به همراه داشته باشید</li>
                    <li>اطمینان حاصل کنید که تایید تکت (دیجیتال یا چاپی) دارید</li>
                    <li>قبل از سفر زمان و مکان حرکت را بررسی کنید</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">حین سفر</h3>
                  <ul className="list-disc list-inside space-y-2 mr-4">
                    <li>تمام دستورالعمل‌های ایمنی کارکنان بس را دنبال کنید</li>
                    <li>وسایل شخصی خود را همیشه بطور امن نگه دارید</li>
                    <li>به مسافران دیگر احترام بگذارید و رفتار مناسب حفظ کنید</li>
                    <li>سگرت کشیدن، مصرف الکل، یا موزیک بلند ممنوع است</li>
                    <li>غذا و نوشیدنی‌های غیر الکلی مجاز است</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">سیاست بار</h3>
                  <ul className="list-disc list-inside space-y-2 mr-4">
                    <li>یک کیف دستی و یک کیف بار برای هر مسافر</li>
                    <li>حداکثر وزن بار: ۲۰ کیلوگرم برای هر مسافر</li>
                    <li>اشیای ممنوعه: اسلحه، مواد منفجره، مواد قابل اشتعال</li>
                    <li>حصارک پنجشیر مسئول گم شدن یا آسیب دیدن وسایل شخصی نیست</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Service Limitations */}
            <div id="limitations">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                ۶. محدودیت‌های خدمات و مسئولیت
              </h2>
              <div className="space-y-4 text-gray-700">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">قابلیت دسترسی خدمات</h3>
                  <ul className="list-disc list-inside space-y-2 mr-4">
                    <li>خدمات با توجه به شرایط آب و هوا و دسترسی جاده می‌باشد</li>
                    <li>تغییرات برنامه ممکن است به دلیل ترافیک یا شرایط غیر قابل پیش‌بینی</li>
                    <li>حصارک پنجشیر حق دارد به دلایل ایمنی سفرها را لغو کند</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">محدودیت‌های مسئولیت</h3>
                  <ul className="list-disc list-inside space-y-2 mr-4">
                    <li>مسئولیت حصارک پنجشیر به هزینه تکت شما محدود است</li>
                    <li>ما مسئول خسارات غیر مستقیم یا تبعی نیستیم</li>
                    <li>بیمه سفر برای پوشش جامع توصیه می‌شود</li>
                    <li>شکایات باید ظرف ۳۰ روز پس از حادثه گزارش شود</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Dispute Resolution */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">۷. حل اختلاف</h2>
              <div className="space-y-4 text-gray-700">
                <p>هرگونه اختلاف ناشی از این شرایط یا خدمات ما از طریق زیر حل خواهد شد:</p>
                <ol className="list-decimal list-inside space-y-2 mr-4">
                  <li>مذاکره مستقیم با تیم خدمات مشتریان ما</li>
                  <li>میانجیگری از طریق میانجی متفق الآرای</li>
                  <li>در صورت ضرورت، داوری طبق قانون افغانستان</li>
                </ol>
                <p>محاکم افغانستان صلاحیت انحصاری بر هرگونه روند حقوقی خواهند داشت.</p>
              </div>
            </div>

            {/* Contact Section */}
            <div
              id="contact"
              className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8"
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-6">۸. اطلاعات تماس</h2>
              <div className="space-y-4 text-gray-700">
                <p>برای سوالات در مورد این شرایط یا گزارش مسائل:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">خدمات مشتری</h4>
                    <ul className="space-y-1">
                      <li>
                        <strong>تلفن:</strong> <span dir="ltr">+93 79 900 4567</span>
                      </li>
                      <li>
                        <strong>ایمیل:</strong> hesarak.trans600@gmail.com
                      </li>
                      <li>
                        <strong>ساعات:</strong> ۲۴/۷ قابل دسترس
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">آدرس دفتر</h4>
                    <address className="not-italic">
                      لوای بابه جان
                      <br />
                      کابل، افغانستان
                    </address>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
