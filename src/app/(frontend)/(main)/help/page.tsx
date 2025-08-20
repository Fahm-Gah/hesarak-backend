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
  Users,
  Shield,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  MessageCircle,
  FileText,
  Calendar,
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Help & Support | Hesarakbus - Get Help with Bus Bookings',
  description:
    'Find answers to common questions about booking bus tickets with Hesarakbus, payment methods, cancellation policies, and get support.',
}

export default function HelpPage() {
  return (
    <div className="min-h-screen">
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
              Help & <span className="text-orange-500">Support</span>
            </h1>
            <p className="text-lg md:text-xl lg:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Get help with booking tickets, managing your trips, and using Hesarakbus's bus booking
              platform.
            </p>
          </div>
        </div>
      </section>

      {/* Quick Help Categories */}
      <section className="py-12 lg:py-16 bg-gradient-to-br from-orange-50 to-red-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 lg:mb-12">
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-3 lg:mb-4">
              What can we help you with?
            </h2>
            <p className="text-lg lg:text-xl text-gray-600">
              Choose a category to find answers quickly
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {[
              {
                icon: Search,
                title: 'Booking Tickets',
                description: 'How to search and book bus tickets',
                href: '#booking-help',
                color: 'from-blue-500 to-cyan-500',
              },
              {
                icon: CreditCard,
                title: 'Payment & Pricing',
                description: 'Payment methods and ticket pricing',
                href: '#payment-help',
                color: 'from-green-500 to-emerald-500',
              },
              {
                icon: RefreshCw,
                title: 'Cancellation & Changes',
                description: 'Cancel or modify your booking',
                href: '#cancellation-help',
                color: 'from-red-500 to-pink-500',
              },
              {
                icon: Ticket,
                title: 'My Tickets',
                description: 'Manage and view your bookings',
                href: '#tickets-help',
                color: 'from-purple-500 to-indigo-500',
              },
              {
                icon: Shield,
                title: 'Account & Security',
                description: 'Account settings and security',
                href: '#account-help',
                color: 'from-orange-500 to-red-500',
              },
              {
                icon: MessageCircle,
                title: 'Contact Support',
                description: 'Get in touch with our team',
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
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">Booking Tickets</h2>
            </div>

            <div className="space-y-4 lg:space-y-6">
              <div className="bg-gray-50 rounded-xl p-4 lg:p-6">
                <h3 className="text-lg lg:text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  How do I book a bus ticket?
                </h3>
                <div className="text-sm lg:text-base text-gray-700 space-y-2">
                  <p>
                    <strong>Step 1:</strong> Go to the home page and enter your departure and
                    destination cities
                  </p>
                  <p>
                    <strong>Step 2:</strong> Select your travel date using the calendar
                  </p>
                  <p>
                    <strong>Step 3:</strong> Click "Search Trips" to see available buses
                  </p>
                  <p>
                    <strong>Step 4:</strong> Choose your preferred trip and select your seats
                  </p>
                  <p>
                    <strong>Step 5:</strong> Enter passenger details and complete payment
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 lg:p-6">
                <h3 className="text-lg lg:text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  Can I choose my seat?
                </h3>
                <p className="text-sm lg:text-base text-gray-700">
                  Yes! After selecting a trip, you'll see a seat map where you can choose your
                  preferred seats. Available seats are shown in green, and occupied seats in red.
                </p>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 lg:p-6">
                <h3 className="text-lg lg:text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                  How close to departure can I book?
                </h3>
                <p className="text-sm lg:text-base text-gray-700">
                  You can book tickets up to 2 hours before departure. After that, booking is closed
                  for that trip.
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
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">Payment & Pricing</h2>
            </div>

            <div className="space-y-4 lg:space-y-6">
              <div className="bg-gray-50 rounded-xl p-4 lg:p-6">
                <h3 className="text-lg lg:text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  What payment methods do you accept?
                </h3>
                <div className="text-sm lg:text-base text-gray-700 space-y-2">
                  <p>
                    <strong>Pay at Pickup:</strong> Pay cash or card directly to the conductor
                    (Recommended)
                  </p>
                  <p>
                    <strong>Credit/Debit Cards:</strong> Visa and Mastercard (Coming soon)
                  </p>
                  <p>
                    <strong>Mobile Wallets:</strong> Various mobile payment services (Coming soon)
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 lg:p-6">
                <h3 className="text-lg lg:text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  How is the ticket price calculated?
                </h3>
                <p className="text-sm lg:text-base text-gray-700">
                  Ticket prices are based on the route distance, bus type, and demand. You'll see
                  the exact price before completing your booking, including any applicable fees.
                </p>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 lg:p-6">
                <h3 className="text-lg lg:text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  Is my payment secure?
                </h3>
                <p className="text-sm lg:text-base text-gray-700">
                  Yes, all online payments are processed through secure, encrypted channels. We
                  don't store your complete payment information for security.
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
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">
                Cancellation & Changes
              </h2>
            </div>

            <div className="space-y-4 lg:space-y-6">
              <div className="bg-gray-50 rounded-xl p-4 lg:p-6">
                <h3 className="text-lg lg:text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  What is your cancellation policy?
                </h3>
                <div className="text-sm lg:text-base text-gray-700 space-y-2">
                  <p>
                    <strong>More than 24 hours:</strong> Full refund minus 5% processing fee
                  </p>
                  <p>
                    <strong>12-24 hours:</strong> 50% refund of ticket price
                  </p>
                  <p>
                    <strong>2-12 hours:</strong> 25% refund of ticket price
                  </p>
                  <p>
                    <strong>Less than 2 hours:</strong> No refund available
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 lg:p-6">
                <h3 className="text-lg lg:text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  How do I cancel my booking?
                </h3>
                <div className="text-sm lg:text-base text-gray-700 space-y-2">
                  <p>1. Go to "My Tickets" in your account</p>
                  <p>2. Find the booking you want to cancel</p>
                  <p>3. Click "Cancel Booking" and follow the instructions</p>
                  <p>4. You'll receive a cancellation confirmation email</p>
                  <p>5. Refunds will be processed within 5-7 business days</p>
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
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">My Tickets</h2>
            </div>

            <div className="space-y-4 lg:space-y-6">
              <div className="bg-gray-50 rounded-xl p-4 lg:p-6">
                <h3 className="text-lg lg:text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  How do I view my bookings?
                </h3>
                <p className="text-sm lg:text-base text-gray-700">
                  Log into your account and go to "My Tickets" to see all your current and past
                  bookings. You can filter by upcoming, past, or all trips.
                </p>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 lg:p-6">
                <h3 className="text-lg lg:text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  What should I bring when traveling?
                </h3>
                <div className="text-sm lg:text-base text-gray-700 space-y-2">
                  <p>• Valid ID that matches your booking name</p>
                  <p>• Your booking confirmation (digital or printed)</p>
                  <p>• Arrive at departure point 15 minutes early</p>
                  <p>• Have exact change or card ready for payment (if paying at pickup)</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 lg:p-6">
                <h3 className="text-lg lg:text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  Can I modify my booking?
                </h3>
                <p className="text-sm lg:text-base text-gray-700">
                  Currently, modifications require canceling your existing booking and making a new
                  one. We're working on adding a direct modification feature.
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
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">Account & Security</h2>
            </div>

            <div className="space-y-4 lg:space-y-6">
              <div className="bg-gray-50 rounded-xl p-4 lg:p-6">
                <h3 className="text-lg lg:text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  How do I create an account?
                </h3>
                <p className="text-sm lg:text-base text-gray-700">
                  Click "Register" and enter your phone number. We'll send you a verification code
                  to complete your registration. Your phone number serves as your login username.
                </p>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 lg:p-6">
                <h3 className="text-lg lg:text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  Why do you need my location?
                </h3>
                <p className="text-sm lg:text-base text-gray-700">
                  Location helps us provide better service by suggesting nearby departure points and
                  improving our route planning. This information is kept private and secure.
                </p>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 lg:p-6">
                <h3 className="text-lg lg:text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  How do I reset my password?
                </h3>
                <p className="text-sm lg:text-base text-gray-700">
                  Since we use phone number authentication, simply enter your phone number on the
                  login page and we'll send you a new verification code.
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
              Still Need Help?
            </h2>
            <p className="text-lg lg:text-xl text-gray-600">
              Our support team is here to help you 24/7
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            <div className="bg-white rounded-2xl p-6 lg:p-8 shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Phone className="w-5 h-5 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Phone Support</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Call us for immediate assistance with your booking
              </p>
              <p className="text-2xl font-bold text-gray-900">+93 70 123 4567</p>
              <p className="text-sm text-gray-500 mt-2">Available 24/7</p>
            </div>

            <div className="bg-white rounded-2xl p-6 lg:p-8 shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Mail className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Email Support</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Send us an email and we'll respond within 2 hours
              </p>
              <p className="text-lg font-semibold text-gray-900">support@hesaarak.com</p>
              <p className="text-sm text-gray-500 mt-2">Response within 2 hours</p>
            </div>
          </div>

          <div className="mt-8 lg:mt-12 bg-white rounded-2xl p-6 lg:p-8 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <MapPin className="w-5 h-5 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Office Location</h3>
            </div>
            <p className="text-gray-600 mb-2">Visit us in person during business hours</p>
            <address className="text-lg text-gray-900 not-italic">
              Shar-e-Naw
              <br />
              Kabul, Afghanistan
            </address>
            <div className="flex items-center gap-2 mt-3 text-sm text-gray-500">
              <Clock className="w-4 h-4" />
              <span>Sunday - Thursday: 9:00 AM - 6:00 PM</span>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-12 lg:py-16 bg-white border-t border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-6 lg:mb-8 text-center">
            Helpful Links
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
            {[
              { title: 'Terms & Conditions', href: '/terms', icon: FileText },
              { title: 'Privacy Policy', href: '/privacy', icon: Shield },
              { title: 'My Tickets', href: '/my-tickets', icon: Ticket },
              { title: 'Book a Trip', href: '/', icon: Calendar },
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
