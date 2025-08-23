import React from 'react'
import { Metadata } from 'next'
import { Shield, Eye, Lock, UserCheck, Database, Globe } from 'lucide-react'

export const metadata: Metadata = {
  title: 'سیاست حریم خصوصی | حصارک‌بس - حفاظت از اطلاعات شما',
  description:
    'بیاموزید که حصارک‌بس چگونه از اطلاعات شخصی شما محافظت می‌کند و اطلاعات شما را با شفافیت و امنیت مدیریت می‌کند.',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen" dir="rtl">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-gray-900 to-gray-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              سیاست <span className="text-orange-500">حریم خصوصی</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
              حریم خصوصی شما برای ما مهم است. این صفحه توضیح می‌دهد که ما چگونه اطلاعات شخصی شما را
              جمع‌آوری، استفاده و محافظت می‌کنیم.
            </p>
            <p className="text-sm text-gray-400 mt-4">آخرین بروزرسانی: سنبله ۱۴۰۴</p>
          </div>
        </div>
      </section>

      {/* Privacy Principles */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">اصول حریم خصوصی ما</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              ما متعهد هستیم که از حریم خصوصی شما محافظت کنیم و در مورد نحوه مدیریت اطلاعات شما شفاف
              باشیم
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: 'حفاظت از اطلاعات',
                description:
                  'ما از اقدامات امنیتی استاندارد صنعت برای محافظت از اطلاعات شخصی شما استفاده می‌کنیم.',
              },
              {
                icon: Eye,
                title: 'شفافیت',
                description:
                  'ما در مورد اطلاعاتی که جمع‌آوری می‌کنیم و نحوه استفاده از آن شفاف هستیم.',
              },
              {
                icon: Lock,
                title: 'ذخیره‌سازی امن',
                description: 'اطلاعات شما رمزگذاری و بطور امن در سرورهای محافظت شده ذخیره می‌شود.',
              },
              {
                icon: UserCheck,
                title: 'کنترل کاربر',
                description:
                  'شما بر اطلاعات شخصی خود کنترل دارید و می‌توانید تغییر یا حذف آن را درخواست کنید.',
              },
              {
                icon: Database,
                title: 'جمع‌آوری حداقل',
                description:
                  'ما فقط اطلاعاتی را جمع‌آوری می‌کنیم که برای ارائه خدماتمان ضروری است.',
              },
              {
                icon: Globe,
                title: 'عدم فروش به اشخاص ثالث',
                description: 'ما هرگز اطلاعات شخصی شما را به اشخاص ثالث نمی‌فروشیم.',
              },
            ].map((principle, index) => {
              const IconComponent = principle.icon
              return (
                <div
                  key={index}
                  className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-6 text-center"
                >
                  <div className="bg-gradient-to-br from-orange-500 to-red-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{principle.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{principle.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Privacy Policy Content */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">سیاست کامل حریم خصوصی</h2>

            <div className="space-y-8">
              {/* Information We Collect */}
              <div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                  ۱. اطلاعاتی که جمع‌آوری می‌کنیم
                </h3>
                <div className="space-y-4 text-gray-700">
                  <div>
                    <h4 className="text-lg font-medium text-gray-800 mb-2">اطلاعات شخصی</h4>
                    <ul className="list-disc list-inside space-y-1 mr-4">
                      <li>نام کامل و جزئیات تماس</li>
                      <li>شماره تلفن برای ایجاد حساب و تایید تکت</li>
                      <li>آدرس ایمیل برای ارتباطات</li>
                      <li>اطلاعات مکان (اگر اجازه دهید) برای بهبود خدمات ما</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-lg font-medium text-gray-800 mb-2">اطلاعات تکت</h4>
                    <ul className="list-disc list-inside space-y-1 mr-4">
                      <li>جزئیات سفر و ترجیحات چوکی</li>
                      <li>اطلاعات پرداخت (بطور امن از طریق پردازنده‌های شخص ثالث پردازش می‌شود)</li>
                      <li>تاریخچه سفر و الگوهای تکت</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-lg font-medium text-gray-800 mb-2">اطلاعات فنی</h4>
                    <ul className="list-disc list-inside space-y-1 mr-4">
                      <li>اطلاعات دستگاه و نوع مرورگر</li>
                      <li>آدرس IP و مکان تقریبی</li>
                      <li>الگوهای استفاده و ترجیحات</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* How We Use Your Information */}
              <div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                  ۲. نحوه استفاده از اطلاعات شما
                </h3>
                <div className="space-y-2 text-gray-700">
                  <p>ما از اطلاعات شخصی شما برای اهداف زیر استفاده می‌کنیم:</p>
                  <ul className="list-disc list-inside space-y-1 mr-4">
                    <li>
                      <strong>ارائه خدمات:</strong> برای پردازش تکت‌ها، مدیریت رزروها، و ارائه
                      پشتیبانی مشتری
                    </li>
                    <li>
                      <strong>ارتباطات:</strong> برای ارسال تاییدیه‌های تکت، بروزرسانی‌های سفر، و
                      اطلاعات مهم
                    </li>
                    <li>
                      <strong>بهبود:</strong> برای تحلیل الگوهای استفاده و بهبود خدماتمان
                    </li>
                    <li>
                      <strong>ایمنی:</strong> برای تضمین ایمنی و امنیت مسافران حین سفر
                    </li>
                    <li>
                      <strong>تبعیت از قانون:</strong> برای تبعیت از قوانین و مقررات قابل اجرا
                    </li>
                  </ul>
                </div>
              </div>

              {/* Information Sharing */}
              <div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                  ۳. اشتراک‌گذاری و افشای اطلاعات
                </h3>
                <div className="space-y-4 text-gray-700">
                  <p>ما ممکن است اطلاعات شما را در شرایط محدود زیر به اشتراک بگذاریم:</p>
                  <ul className="list-disc list-inside space-y-1 mr-4">
                    <li>
                      <strong>ارائه‌دهندگان خدمات:</strong> با ارائه‌دهندگان قابل اعتماد شخص ثالث که
                      به ما در مدیریت پلتفرممان کمک می‌کنند
                    </li>
                    <li>
                      <strong>الزامات قانونی:</strong> زمانی که طبق قانون، حکم دادگاه، یا مقررات
                      دولتی الزامی باشد
                    </li>
                    <li>
                      <strong>ایمنی و امنیت:</strong> برای محافظت از حقوق، دارایی، یا ایمنی
                      حصارک‌بس، کاربران ما، یا سایرین
                    </li>
                    <li>
                      <strong>انتقال کسب و کار:</strong> در رابطه با ادغام، خرید، یا فروش دارایی‌ها
                    </li>
                  </ul>
                  <p>
                    <strong>
                      ما هرگز اطلاعات شخصی شما را برای اهداف بازاریابی به اشخاص ثالث نمی‌فروشیم.
                    </strong>
                  </p>
                </div>
              </div>

              {/* Data Security */}
              <div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">۴. امنیت اطلاعات</h3>
                <div className="space-y-2 text-gray-700">
                  <p>ما اقدامات امنیتی قوی را برای محافظت از اطلاعات شخصی شما اجرا می‌کنیم:</p>
                  <ul className="list-disc list-inside space-y-1 mr-4">
                    <li>رمزگذاری اطلاعات حساس هم در انتقال و هم در ذخیره</li>
                    <li>بررسی‌ها و بروزرسانی‌های منظم امنیتی</li>
                    <li>کنترل‌های دسترسی و اقدامات احراز هویت</li>
                    <li>پردازش امن پرداخت از طریق ارائه‌دهندگان مجاز</li>
                    <li>آموزش منظم کارمندان در زمینه حفاظت از اطلاعات</li>
                  </ul>
                </div>
              </div>

              {/* Your Rights */}
              <div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                  ۵. حقوق و انتخاب‌های شما
                </h3>
                <div className="space-y-2 text-gray-700">
                  <p>شما در مورد اطلاعات شخصی خود حقوق زیر را دارید:</p>
                  <ul className="list-disc list-inside space-y-1 mr-4">
                    <li>
                      <strong>دسترسی:</strong> درخواست کپی از اطلاعات شخصی که راجع به شما نگه
                      می‌داریم
                    </li>
                    <li>
                      <strong>تصحیح:</strong> درخواست تصحیح اطلاعات نادقیق یا ناکامل
                    </li>
                    <li>
                      <strong>حذف:</strong> درخواست حذف اطلاعات شخصی خود (با در نظر گرفتن الزامات
                      قانونی)
                    </li>
                    <li>
                      <strong>قابلیت انتقال:</strong> درخواست انتقال اطلاعات شما به ارائه‌دهنده
                      خدمات دیگر
                    </li>
                    <li>
                      <strong>انصراف:</strong> لغو عضویت از ارتباطات بازاریابی در هر زمان
                    </li>
                  </ul>
                  <p>
                    برای اعمال این حقوق، لطفاً با ما تماس بگیرید{' '}
                    <a
                      href="mailto:privacy@hesarakbus.com"
                      className="text-orange-600 hover:text-orange-700 font-medium"
                    >
                      privacy@hesarakbus.com
                    </a>
                  </p>
                </div>
              </div>

              {/* Cookies and Tracking */}
              <div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                  ۶. کوکی‌ها و تکنولوژی‌های ردیابی
                </h3>
                <div className="space-y-2 text-gray-700">
                  <p>ما از کوکی‌ها و تکنولوژی‌های مشابه برای موارد زیر استفاده می‌کنیم:</p>
                  <ul className="list-disc list-inside space-y-1 mr-4">
                    <li>به خاطر سپردن ترجیحات و تنظیمات شما</li>
                    <li>تحلیل ترافیک وبسایت و الگوهای استفاده</li>
                    <li>بهبود عملکرد وبسایت و تجربه کاربر</li>
                    <li>ارائه محتوای شخصی و تبلیغات</li>
                  </ul>
                  <p>شما می‌توانید تنظیمات کوکی را از طریق ترجیحات مرورگر خود کنترل کنید.</p>
                </div>
              </div>

              {/* Data Retention */}
              <div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">۷. نگهداری اطلاعات</h3>
                <div className="space-y-2 text-gray-700">
                  <p>ما اطلاعات شخصی شما را تا زمان لزوم برای موارد زیر نگه می‌داریم:</p>
                  <ul className="list-disc list-inside space-y-1 mr-4">
                    <li>ارائه خدمات و پشتیبانی از حساب شما</li>
                    <li>تبعیت از تعهدات قانونی و حل اختلافات</li>
                    <li>جلوگیری از کلاهبرداری و تضمین امنیت پلتفرم</li>
                  </ul>
                  <p>
                    ما اطلاعات شما را زمانی که دیگر نیاز نباشد بطور امن حذف یا نامشخص خواهیم کرد.
                  </p>
                </div>
              </div>

              {/* Updates to Policy */}
              <div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                  ۸. بروزرسانی این سیاست
                </h3>
                <div className="space-y-2 text-gray-700">
                  <p>
                    ما ممکن است این سیاست حریم خصوصی را گاه به گاه بروزرسانی کنیم. زمانی که تغییرات
                    اعمال می‌کنیم:
                  </p>
                  <ul className="list-disc list-inside space-y-1 mr-4">
                    <li>سیاست بروزرسانی شده را در وبسایت ما منتشر خواهیم کرد</li>
                    <li>تاریخ "آخرین تغییر" را بروزرسانی خواهیم کرد</li>
                    <li>برای تغییرات مهم، از طریق ایمیل یا اعلان برنامه به شما اطلاع خواهیم داد</li>
                  </ul>
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">۹. با ما تماس بگیرید</h3>
                <div className="space-y-2 text-gray-700">
                  <p>
                    اگر در مورد این سیاست حریم خصوصی یا رویه‌های اطلاعاتی ما سوالی دارید، لطفاً با
                    ما تماس بگیرید:
                  </p>
                  <div className="bg-gray-50 rounded-lg p-4 mt-4">
                    <ul className="space-y-2">
                      <li>
                        <strong>ایمیل:</strong>{' '}
                        <a
                          href="mailto:privacy@hesarakbus.com"
                          className="text-orange-600 hover:text-orange-700"
                        >
                          privacy@hesarakbus.com
                        </a>
                      </li>
                      <li>
                        <strong>تلفن:</strong> <span dir="ltr">+93 79 900 4567</span>
                      </li>
                      <li>
                        <strong>آدرس:</strong> لوای بابه جان، کابل، افغانستان
                      </li>
                    </ul>
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
