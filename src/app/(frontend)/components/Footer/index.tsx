'use client'

import React from 'react'
import Link from 'next/link'
import { Phone, Mail, MapPin, Facebook, Twitter, Instagram } from 'lucide-react'

export const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gradient-to-br from-gray-800 to-gray-900 text-white" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-xl font-bold text-orange-400 mb-4">حصارک پنجشیر</h3>
            <p className="text-gray-300 mb-4 leading-relaxed">
              شریک مطمئن شما برای سفرهای امن و راحت در سراسر افغانستان. سفر خود را با اطمینان تکت
              کنید.
            </p>
            <div className="flex gap-3">
              <a href="#" className="text-gray-400 hover:text-orange-400 transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-orange-400 transition-colors">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-orange-400 transition-colors">
                <Instagram size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">لینک‌های سریع</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-300 hover:text-orange-400 transition-colors">
                  صفحه اصلی
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-gray-300 hover:text-orange-400 transition-colors"
                >
                  درباره ما
                </Link>
              </li>
              <li>
                <Link
                  href="/search"
                  className="text-gray-300 hover:text-orange-400 transition-colors"
                >
                  جستجوی سفرها
                </Link>
              </li>
              <li>
                <Link
                  href="/my-tickets"
                  className="text-gray-300 hover:text-orange-400 transition-colors"
                >
                  تکت‌های من
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-gray-300 hover:text-orange-400 transition-colors"
                >
                  تماس با ما
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-gray-300 hover:text-orange-400 transition-colors"
                >
                  شرایط و ضوابط
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-gray-300 hover:text-orange-400 transition-colors"
                >
                  حریم خصوصی
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">خدمات</h4>
            <ul className="space-y-2 text-gray-300">
              <li>تکت بس</li>
              <li>انتخاب چوکی</li>
              <li>خدمات ۲۴ ساعته</li>
              <li>گزینه‌های متعدد پرداخت</li>
              <li>مدیریت سفر</li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">تماس با ما</h4>
            <div className="space-y-3">
              <div className="flex items-center text-gray-300">
                <Phone size={16} className="ml-3 text-orange-400" />
                <span dir="ltr">+93 79 900 4567</span>
              </div>
              <div className="flex items-center text-gray-300">
                <Mail size={16} className="ml-3 text-orange-400" />
                <span dir="ltr">hesarak.trans600@gmail.com</span>
              </div>
              <div className="flex items-start text-gray-300">
                <MapPin size={16} className="ml-3 text-orange-400 mt-1" />
                <span>لوای بابه جان، کابل، افغانستان</span>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-700 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © {currentYear} حصارک پنجشیر. تمام حقوق محفوظ است.
            </p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <Link
                href="/privacy"
                className="text-gray-400 hover:text-orange-400 text-sm transition-colors"
              >
                حریم خصوصی
              </Link>
              <Link
                href="/terms"
                className="text-gray-400 hover:text-orange-400 text-sm transition-colors"
              >
                شرایط خدمات
              </Link>
              <Link
                href="/help"
                className="text-gray-400 hover:text-orange-400 text-sm transition-colors"
              >
                کمک
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
