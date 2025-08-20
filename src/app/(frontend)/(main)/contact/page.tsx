import React from 'react'
import { Metadata } from 'next'
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  MessageSquare,
  HeadphonesIcon,
  Users,
  Shield,
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Contact Us | Hesaarak - Get in Touch for Support',
  description:
    "Contact Hesaarak for booking assistance, customer support, or any questions about our bus travel services across Afghanistan. We're here to help 24/7.",
}

export default function ContactPage() {
  const contactMethods = [
    {
      icon: Phone,
      title: '24/7 Phone Support',
      subtitle: 'Call us anytime',
      info: '+93 70 123 4567',
      description: 'Available round the clock for all your travel needs',
    },
    {
      icon: Mail,
      title: 'Email Support',
      subtitle: 'Send us a message',
      info: 'support@hesaarak.com',
      description: 'We respond to all emails within 2 hours',
    },
    {
      icon: MapPin,
      title: 'Visit Our Office',
      subtitle: 'Come see us in person',
      info: 'Shar-e-Naw, Kabul, Afghanistan',
      description: 'Open Monday to Friday, 8:00 AM - 6:00 PM',
    },
    {
      icon: MessageSquare,
      title: 'Live Chat',
      subtitle: 'Chat with our team',
      info: 'Available on website',
      description: 'Instant support for quick questions',
    },
  ]

  const supportServices = [
    {
      icon: HeadphonesIcon,
      title: 'Customer Support',
      description: 'Get help with bookings, cancellations, and general inquiries',
    },
    {
      icon: Users,
      title: 'Group Bookings',
      description: 'Special assistance for group travel and corporate bookings',
    },
    {
      icon: Shield,
      title: 'Safety Concerns',
      description: 'Report safety issues or share feedback about your journey',
    },
  ]

  const officeHours = [
    { day: 'Monday - Friday', hours: '8:00 AM - 8:00 PM' },
    { day: 'Saturday', hours: '9:00 AM - 6:00 PM' },
    { day: 'Sunday', hours: '10:00 AM - 4:00 PM' },
    { day: 'Emergency Support', hours: '24/7 Available' },
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-gray-900 to-gray-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Contact <span className="text-orange-500">Hesaarak</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
              We're here to help! Get in touch with our friendly customer service team for any
              questions, support, or assistance with your bus travel needs.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Get In Touch</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choose the most convenient way to reach us. We're available through multiple channels.
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
                  <p className="text-lg font-semibold text-orange-600 mb-2">{method.info}</p>
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
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Send Us a Message</h3>
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                      placeholder="Enter your first name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                      placeholder="Enter your last name"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                    placeholder="your.email@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                    placeholder="+93 70 123 4567"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                  <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors">
                    <option>General Inquiry</option>
                    <option>Booking Support</option>
                    <option>Trip Cancellation</option>
                    <option>Payment Issues</option>
                    <option>Feedback</option>
                    <option>Technical Support</option>
                    <option>Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                  <textarea
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors resize-none"
                    placeholder="Please describe your inquiry or concern in detail..."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white py-4 px-6 rounded-lg font-semibold hover:from-orange-700 hover:to-red-700 transition-all duration-300 transform hover:scale-105"
                >
                  Send Message
                </button>
              </form>
            </div>

            {/* Contact Information & Hours */}
            <div className="space-y-8">
              {/* Office Hours */}
              <div className="bg-white rounded-2xl p-8 shadow-lg">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <Clock className="w-6 h-6 text-orange-500 mr-3" />
                  Office Hours
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
                <h3 className="text-2xl font-bold text-gray-900 mb-6">How We Can Help</h3>
                <div className="space-y-6">
                  {supportServices.map((service, index) => {
                    const IconComponent = service.icon
                    return (
                      <div key={index} className="flex items-start">
                        <div className="bg-orange-100 w-12 h-12 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
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
                <h3 className="text-2xl font-bold mb-4">Need Immediate Help?</h3>
                <p className="mb-6 opacity-90">
                  For urgent matters or immediate assistance, contact us directly:
                </p>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <Phone className="w-5 h-5 mr-3" />
                    <span className="font-semibold">+93 70 123 4567</span>
                  </div>
                  <div className="flex items-center">
                    <Mail className="w-5 h-5 mr-3" />
                    <span className="font-semibold">support@hesaarak.com</span>
                  </div>
                  <div className="flex items-start">
                    <MapPin className="w-5 h-5 mr-3 mt-0.5" />
                    <span className="font-semibold">Shar-e-Naw, Kabul, Afghanistan</span>
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
            Frequently Asked <span className="text-orange-600">Questions</span>
          </h2>
          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
            Find quick answers to common questions about booking, payments, schedules, and more.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-gray-50 rounded-2xl p-6 hover:bg-gray-100 transition-colors">
              <h3 className="font-semibold text-gray-900 mb-2">Booking & Reservations</h3>
              <p className="text-gray-600 text-sm mb-4">
                How to book tickets, change reservations, and cancellation policies.
              </p>
              <button className="text-orange-600 font-medium text-sm hover:text-orange-700">
                Learn More →
              </button>
            </div>

            <div className="bg-gray-50 rounded-2xl p-6 hover:bg-gray-100 transition-colors">
              <h3 className="font-semibold text-gray-900 mb-2">Payment & Refunds</h3>
              <p className="text-gray-600 text-sm mb-4">
                Accepted payment methods, refund processes, and billing questions.
              </p>
              <button className="text-orange-600 font-medium text-sm hover:text-orange-700">
                Learn More →
              </button>
            </div>

            <div className="bg-gray-50 rounded-2xl p-6 hover:bg-gray-100 transition-colors">
              <h3 className="font-semibold text-gray-900 mb-2">Travel Information</h3>
              <p className="text-gray-600 text-sm mb-4">
                Baggage policies, seat selection, and travel requirements.
              </p>
              <button className="text-orange-600 font-medium text-sm hover:text-orange-700">
                Learn More →
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
