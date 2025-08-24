'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowRight, Smartphone } from 'lucide-react'
import { AppStoreButton, GooglePlayButton } from './DownloadButtons'

export const CTASection = () => {
  return (
    <section
      className="py-20 bg-gradient-to-br from-orange-600 to-red-600 relative overflow-hidden"
      dir="rtl"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-32 h-32 border-2 border-white rounded-full"></div>
        <div className="absolute top-20 right-20 w-24 h-24 border-2 border-white rotate-45"></div>
        <div className="absolute bottom-10 left-1/4 w-16 h-16 border-2 border-white rotate-12"></div>
        <div className="absolute bottom-20 right-1/3 w-20 h-20 border-2 border-white rounded-full"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center text-white">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">آماده شروع سفرتان هستید؟</h2>
          <p className="text-xl md:text-2xl mb-12 opacity-90 max-w-3xl mx-auto">
            به هزاران مسافر راضی بپیوندید که به حصارک‌بس برای سفرهای امن، راحت و مقرون‌به‌صرفه در
            سراسر افغانستان اعتماد دارند.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
            <Link
              href="/search"
              className="bg-white text-orange-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all duration-300 flex items-center shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              سفر خود را همین حالا تکت کنید
              <ArrowRight className="w-5 h-5 mr-2 rotate-180" />
            </Link>

            <Link
              href="/about"
              className="border-2 border-white text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white hover:text-orange-600 transition-all duration-300 flex items-center transform hover:scale-105"
            >
              بیشتر در مورد ما بدانید
            </Link>
          </div>

          {/* App Download Section */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-right md:flex-1">
                <div className="flex items-center mb-3">
                  <Smartphone className="w-7 h-7 ml-3" />
                  <h3 className="text-xl font-bold">اپلیکیشن موبایل ما را دریافت کنید</h3>
                </div>
                <p className="text-base opacity-90 mb-3">
                  اپلیکیشن موبایل حصارک‌بس را برای تکت آسان‌تر و مدیریت سفر در هر کجا دانلود کنید.
                </p>
                <div className="text-sm opacity-75">
                  • فرآیند تکت سریع‌تر
                  <br />
                  • به‌روزرسانی لحظه‌ای سفر
                  <br />• ذخیره دیجیتالی تکت
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 md:flex-shrink-0" dir="ltr">
                <AppStoreButton
                  onClick={() => {
                    // Add App Store link when available
                    console.log('App Store button clicked')
                  }}
                />
                <GooglePlayButton
                  onClick={() => {
                    // Add Google Play link when available
                    console.log('Google Play button clicked')
                  }}
                />
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-2xl font-bold mb-2">پشتیبانی ۲۴ ساعته</div>
              <div className="opacity-90" dir="ltr">
                +93 79 900 4567
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold mb-2">ایمیل ما</div>
              <div className="opacity-90" dir="ltr">
                support@hesarakbus.com
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold mb-2">از ما دیدن کنید</div>
              <div className="opacity-90">لوای بابه جان، کابل، افغانستان</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
