'use client'

import React, { useState, useRef, useEffect } from 'react'
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  MessageSquare,
  HeadphonesIcon,
  Users,
  Shield,
  ChevronDown,
  Send,
  Check,
} from 'lucide-react'

export default function ContactPageClient() {
  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  })

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState('')

  // Custom dropdown state
  const [selectedSubject, setSelectedSubject] = useState('')
  const [showSubjectDropdown, setShowSubjectDropdown] = useState(false)
  const subjectDropdownRef = useRef<HTMLDivElement>(null)

  const subjectOptions = [
    'سوال عمومی',
    'تکت',
    'لغو سفر',
    'مسائل پرداخت',
    'بازخورد',
    'پشتیبانی فنی',
    'سایر',
  ]

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (subjectDropdownRef.current && !subjectDropdownRef.current.contains(target)) {
        const subjectField = subjectDropdownRef.current.previousElementSibling
        if (!subjectField?.contains(target)) {
          setShowSubjectDropdown(false)
        }
      }
    }

    if (showSubjectDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showSubjectDropdown])

  const handleSubjectSelect = (option: string) => {
    setSelectedSubject(option)
    setFormData((prev) => ({ ...prev, subject: option }))
    setShowSubjectDropdown(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitError('')

    try {
      const response = await fetch('/api/contact-form', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (response.ok) {
        setIsSubmitted(true)
        // Reset form
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          subject: '',
          message: '',
        })
        setSelectedSubject('')
      } else {
        setSubmitError(result.message || 'خطا در ارسال پیام. لطفاً دوباره امتحان کنید.')
      }
    } catch (error) {
      console.error('Contact form submission error:', error)
      setSubmitError('خطا در ارسال پیام. لطفاً دوباره امتحان کنید.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const contactMethods = [
    {
      icon: Phone,
      title: 'پشتیبانی تلفنی 24/7',
      subtitle: 'هر وقت با ما تماس بگیرید',
      info: '+93 79 900 4567',
      description: 'شبانه روز برای تمام نیازهای سفر شما در دسترس',
    },
    {
      icon: Mail,
      title: 'پشتیبانی ایمیل',
      subtitle: 'پیام خود را ارسال کنید',
      info: 'hesarak.trans600@gmail.com',
      description: 'ما به تمام ایمیل‌ها در عرض 2 ساعت پاسخ می‌دهیم',
    },
    {
      icon: MapPin,
      title: 'از دفتر ما دیدن کنید',
      subtitle: 'شخصاً به دیدن ما بیایید',
      info: 'لوای بابه جان، کابل، افغانستان',
      description: 'شنبه تا جمعه، ساعت 8:00 صبح - 6:00 عصر باز است',
    },
    {
      icon: MessageSquare,
      title: 'چت زنده',
      subtitle: 'با تیم ما چت کنید',
      info: 'در وبسایت در دسترس',
      description: 'پشتیبانی فوری برای سوالات سریع',
    },
  ]

  const supportServices = [
    {
      icon: HeadphonesIcon,
      title: 'پشتیبانی مشتری',
      description: 'کمک در تکت، لغو، و سوالات عمومی دریافت کنید',
    },
    {
      icon: Users,
      title: 'تکت گروهی',
      description: 'کمک ویژه برای سفرهای گروهی و تکت‌های شریکی',
    },
    {
      icon: Shield,
      title: 'نگرانی‌های امنیتی',
      description: 'مسائل امنیتی را گزارش دهید یا نظرات خود را در مورد سفرتان بگویید',
    },
  ]

  const officeHours = [
    { day: 'شنبه - جمعه', hours: '8:00 صبح - 8:00 شب' },
    { day: 'پشتیبانی اضطراری', hours: '24/7 در دسترس' },
  ]

  return (
    <div className="min-h-screen" dir="rtl">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-gray-900 to-gray-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              تماس با <span className="text-orange-500">حصارک پنجشیر</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
              ما اینجا هستیم تا کمکتان کنیم! برای هرگونه سوال، پشتیبانی، یا کمک در مورد نیازهای سفر
              بس خود با تیم دوستانه خدمات مشتری ما تماس بگیرید.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">در تماس باشید</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              راه مناسب‌ترین برای رسیدن به ما را انتخاب کنید. ما از طریق چندین کانال در دسترس هستیم.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {contactMethods.map((method, index) => {
              const IconComponent = method.icon
              return (
                <div
                  key={index}
                  className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 text-center group"
                >
                  <div className="bg-gradient-to-br from-orange-500 to-red-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{method.title}</h3>
                  <p className="text-sm text-gray-500 mb-3">{method.subtitle}</p>
                  <p className="text-lg font-semibold text-orange-600 mb-2" dir="ltr">
                    {method.info}
                  </p>
                  <p className="text-sm text-gray-600">{method.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">برای ما پیام بفرستید</h3>

              {isSubmitted ? (
                <div className="text-center py-8">
                  <div className="bg-green-100 border border-green-400 rounded-lg p-6 mb-4">
                    <Check className="w-12 h-12 text-green-600 mx-auto mb-4" />
                    <h4 className="text-lg font-semibold text-green-800 mb-2">
                      پیام شما ارسال شد!
                    </h4>
                    <p className="text-green-700">
                      ما به زودی با شما تماس خواهیم گرفت. از صبر شما متشکریم.
                    </p>
                  </div>
                  <button
                    onClick={() => setIsSubmitted(false)}
                    className="text-orange-600 hover:text-orange-700 font-medium"
                  >
                    ارسال پیام جدید
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">نام</label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                        placeholder="نام خود را وارد کنید"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">تخلص</label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                        placeholder="تخلص خود را وارد کنید"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      آدرس ایمیل
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                      placeholder="your.email@example.com"
                      required
                    />
                  </div>

                  <div dir="rtl">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      شماره تلفن
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full text-right px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                      placeholder="+93 79 900 4567"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">موضوع</label>
                    <div className="relative">
                      <div
                        onClick={(e) => {
                          e.stopPropagation()
                          setShowSubjectDropdown(!showSubjectDropdown)
                        }}
                        className="w-full bg-gradient-to-br from-white to-gray-50/80 border border-gray-300 rounded-lg px-4 py-3 text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 cursor-pointer hover:bg-gray-50/80 hover:border-gray-400 hover:shadow-md transition-all duration-300 shadow-sm flex items-center justify-between"
                      >
                        <span className={selectedSubject ? 'text-gray-900' : 'text-gray-500'}>
                          {selectedSubject || 'موضوع را انتخاب کنید'}
                        </span>
                        <ChevronDown
                          className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${showSubjectDropdown ? 'rotate-180' : ''}`}
                        />
                      </div>

                      {showSubjectDropdown && (
                        <div
                          ref={subjectDropdownRef}
                          className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-60 overflow-y-auto"
                        >
                          {subjectOptions.map((option, index) => (
                            <div
                              key={`subject-${option}-${index}`}
                              onClick={(e) => {
                                e.stopPropagation()
                                handleSubjectSelect(option)
                              }}
                              className="px-4 py-3 hover:bg-orange-50 hover:text-orange-700 cursor-pointer transition-colors duration-150 first:rounded-t-lg last:rounded-b-lg border-b border-gray-100 last:border-b-0"
                            >
                              {option}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">پیام</label>
                    <textarea
                      rows={6}
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors resize-none"
                      placeholder="لطفاً سوال یا نگرانی خود را به تفصیل توضیح دهید..."
                      required
                    />
                  </div>

                  {submitError && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
                      {submitError}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white py-4 px-6 rounded-lg font-semibold hover:from-orange-700 hover:to-red-700 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent ml-2"></div>
                        در حال ارسال...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5 ml-2" />
                        ارسال پیام
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>

            {/* Contact Information & Hours */}
            <div className="space-y-8">
              {/* Office Hours */}
              <div className="bg-white rounded-2xl p-8 shadow-lg">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <Clock className="w-6 h-6 text-orange-500 ml-3" />
                  ساعات کاری
                </h3>
                <div className="space-y-4">
                  {officeHours.map((schedule, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0"
                    >
                      <span className="text-gray-700 font-medium">{schedule.day}</span>
                      <span className="text-gray-600">{schedule.hours}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Support Services */}
              <div className="bg-white rounded-2xl p-8 shadow-lg">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">
                  چگونه می‌توانیم کمکتان کنیم
                </h3>
                <div className="space-y-6">
                  {supportServices.map((service, index) => {
                    const IconComponent = service.icon
                    return (
                      <div key={index} className="flex items-start">
                        <div className="bg-orange-100 w-12 h-12 rounded-lg flex items-center justify-center ml-4 flex-shrink-0">
                          <IconComponent className="w-6 h-6 text-orange-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-1">{service.title}</h4>
                          <p className="text-gray-600 text-sm">{service.description}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Quick Contact Info */}
              <div className="bg-gradient-to-br from-orange-600 to-red-600 text-white rounded-2xl p-8">
                <h3 className="text-2xl font-bold mb-4">به کمک فوری نیاز دارید؟</h3>
                <p className="mb-6 opacity-90">
                  برای موارد فوری یا کمک فوری، مستقیماً با ما تماس بگیرید:
                </p>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <Phone className="w-5 h-5 ml-3" />
                    <span className="font-semibold" dir="ltr">
                      +93 79 900 4567
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Mail className="w-5 h-5 ml-3" />
                    <span className="font-semibold">hesarak.trans600@gmail.com</span>
                  </div>
                  <div className="flex items-start">
                    <MapPin className="w-5 h-5 ml-3 mt-0.5" />
                    <span className="font-semibold">لوای بابه جان، کابل، افغانستان</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Quick Links */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            سوالات <span className="text-orange-600">متداول</span>
          </h2>
          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
            پاسخ‌های سریع به سوالات رایج در مورد تکت، پرداخت‌ها، برنامه‌ها و موارد بیشتر پیدا کنید.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-gray-50 rounded-2xl p-6 hover:bg-gray-100 transition-colors">
              <h3 className="font-semibold text-gray-900 mb-2">تکت و بوک کردن</h3>
              <p className="text-gray-600 text-sm mb-4">
                نحوه بوک کردن تکت، تغییر تکت، و سیاست‌های لغو.
              </p>
              <button className="text-orange-600 font-medium text-sm hover:text-orange-700">
                بیشتر یاد بگیرید ←
              </button>
            </div>

            <div className="bg-gray-50 rounded-2xl p-6 hover:bg-gray-100 transition-colors">
              <h3 className="font-semibold text-gray-900 mb-2">پرداخت و بازپرداخت</h3>
              <p className="text-gray-600 text-sm mb-4">
                روش‌های پرداخت پذیرفته شده، فرآیندهای بازپرداخت، و سوالات صورتحساب.
              </p>
              <button className="text-orange-600 font-medium text-sm hover:text-orange-700">
                بیشتر یاد بگیرید ←
              </button>
            </div>

            <div className="bg-gray-50 rounded-2xl p-6 hover:bg-gray-100 transition-colors">
              <h3 className="font-semibold text-gray-900 mb-2">اطلاعات سفر</h3>
              <p className="text-gray-600 text-sm mb-4">
                سیاست‌های بار، انتخاب چوکی، و الزامات سفر.
              </p>
              <button className="text-orange-600 font-medium text-sm hover:text-orange-700">
                بیشتر یاد بگیرید ←
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
