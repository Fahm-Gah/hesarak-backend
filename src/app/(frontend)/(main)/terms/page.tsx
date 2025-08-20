import React from 'react'
import { Metadata } from 'next'
import { FileText, AlertTriangle, Clock, RefreshCw, CreditCard, Users } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Terms and Conditions | Hesarakbus - Service Agreement',
  description:
    'Read the terms and conditions for using Hesarakbus bus booking services, including our cancellation policy and service guidelines.',
}

export default function TermsPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-gray-900 to-gray-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Terms & <span className="text-orange-500">Conditions</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
              Please read these terms carefully before using our services. By booking with
              Hesarakbus, you agree to these conditions.
            </p>
            <p className="text-sm text-gray-400 mt-4">Last updated: December 2024</p>
          </div>
        </div>
      </section>

      {/* Quick Navigation */}
      <section className="py-12 bg-gradient-to-br from-orange-50 to-red-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Quick Navigation</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { title: 'Booking Terms', href: '#booking-terms', icon: FileText },
              { title: 'Cancellation Policy', href: '#cancellation-policy', icon: RefreshCw },
              { title: 'Payment Terms', href: '#payment-terms', icon: CreditCard },
              {
                title: 'Passenger Responsibilities',
                href: '#passenger-responsibilities',
                icon: Users,
              },
              { title: 'Service Limitations', href: '#limitations', icon: AlertTriangle },
              { title: 'Contact Support', href: '#contact', icon: Clock },
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
              <h2 className="text-3xl font-bold text-gray-900 mb-6">1. General Terms</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  By using Hesarakbus's services, you agree to be bound by these terms and
                  conditions. These terms apply to all users of our website, mobile application, and
                  booking services.
                </p>
                <p>
                  Hesarakbus reserves the right to modify these terms at any time. Changes will be
                  effective immediately upon posting on our website. Continued use of our services
                  constitutes acceptance of any modifications.
                </p>
              </div>
            </div>

            {/* Booking Terms */}
            <div id="booking-terms">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                2. Booking Terms and Conditions
              </h2>
              <div className="space-y-4 text-gray-700">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">Booking Process</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>All bookings are subject to seat availability</li>
                    <li>Booking confirmation will be sent via SMS and email</li>
                    <li>You must provide accurate personal information during booking</li>
                    <li>Each passenger must have a valid booking confirmation</li>
                    <li>Children under 2 years travel free when seated on an adult's lap</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">Ticket Validity</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Tickets are valid only for the specific date, time, and route booked</li>
                    <li>Tickets are non-transferable between passengers</li>
                    <li>You must present valid ID that matches the booking name</li>
                    <li>Digital tickets on mobile devices are accepted</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Cancellation Policy */}
            <div id="cancellation-policy">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">3. Cancellation Policy</h2>
              <div className="space-y-4 text-gray-700">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">
                    Cancellation Timeline & Refunds
                  </h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>
                      <strong>More than 24 hours before departure:</strong> Full refund minus 5%
                      processing fee
                    </li>
                    <li>
                      <strong>12-24 hours before departure:</strong> 50% refund of ticket price
                    </li>
                    <li>
                      <strong>2-12 hours before departure:</strong> 25% refund of ticket price
                    </li>
                    <li>
                      <strong>Less than 2 hours before departure:</strong> No refund available
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">How to Cancel</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Log into your account and go to "My Tickets"</li>
                    <li>Select the booking you want to cancel</li>
                    <li>Click "Cancel Booking" and follow the instructions</li>
                    <li>You will receive a cancellation confirmation email</li>
                    <li>Refunds will be processed within 5-7 business days</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">
                    Special Circumstances
                  </h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>
                      <strong>Medical Emergency:</strong> Full refund with valid medical certificate
                    </li>
                    <li>
                      <strong>Trip Cancellation by Hesarakbus:</strong> Full refund or free
                      rescheduling
                    </li>
                    <li>
                      <strong>Weather/Natural Disasters:</strong> Free rescheduling or full refund
                    </li>
                    <li>
                      <strong>Government Restrictions:</strong> Full refund available
                    </li>
                  </ul>
                </div>
                <p>
                  <strong>Important:</strong> Cancellation fees may apply as outlined above. Refunds
                  will be processed to the original payment method used for booking.
                </p>
              </div>
            </div>

            {/* Payment Terms */}
            <div id="payment-terms">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">4. Payment Terms</h2>
              <div className="space-y-4 text-gray-700">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">
                    Accepted Payment Methods
                  </h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Credit and debit cards (Visa, Mastercard)</li>
                    <li>Mobile payment services</li>
                    <li>Cash payments at authorized agents</li>
                    <li>Bank transfers (for group bookings)</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">Payment Security</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>All payments are processed through secure, encrypted channels</li>
                    <li>We do not store your complete payment information</li>
                    <li>
                      Payment confirmations are sent immediately after successful transactions
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Passenger Responsibilities */}
            <div id="passenger-responsibilities">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                5. Passenger Responsibilities
              </h2>
              <div className="space-y-4 text-gray-700">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">Before Travel</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Arrive at the departure point at least 15 minutes early</li>
                    <li>Carry valid identification matching your booking</li>
                    <li>Ensure you have your booking confirmation (digital or printed)</li>
                    <li>Check departure times and locations before travel</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">During Travel</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Follow all safety instructions from bus staff</li>
                    <li>Keep your belongings secure at all times</li>
                    <li>Respect other passengers and maintain appropriate behavior</li>
                    <li>No smoking, alcohol consumption, or loud music</li>
                    <li>Food and non-alcoholic beverages are permitted</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">Baggage Policy</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>One carry-on bag and one checked bag per passenger</li>
                    <li>Maximum checked baggage weight: 20kg per passenger</li>
                    <li>Prohibited items: weapons, explosives, flammable materials</li>
                    <li>Hesarakbus is not responsible for lost or damaged personal items</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Service Limitations */}
            <div id="limitations">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                6. Service Limitations and Liability
              </h2>
              <div className="space-y-4 text-gray-700">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">Service Availability</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Services are subject to weather conditions and road accessibility</li>
                    <li>Schedule changes may occur due to traffic or unforeseen circumstances</li>
                    <li>Hesarakbus reserves the right to cancel trips for safety reasons</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">
                    Liability Limitations
                  </h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Hesarakbus's liability is limited to the cost of your ticket</li>
                    <li>We are not responsible for indirect or consequential damages</li>
                    <li>Travel insurance is recommended for comprehensive coverage</li>
                    <li>Claims must be reported within 30 days of incident</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Dispute Resolution */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">7. Dispute Resolution</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  Any disputes arising from these terms or our services will be resolved through:
                </p>
                <ol className="list-decimal list-inside space-y-2 ml-4">
                  <li>Direct negotiation with our customer service team</li>
                  <li>Mediation through a mutually agreed mediator</li>
                  <li>Arbitration under Afghan law, if necessary</li>
                </ol>
                <p>
                  The courts of Afghanistan shall have exclusive jurisdiction over any legal
                  proceedings.
                </p>
              </div>
            </div>

            {/* Contact Section */}
            <div
              id="contact"
              className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8"
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-6">8. Contact Information</h2>
              <div className="space-y-4 text-gray-700">
                <p>For questions about these terms or to report issues:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Customer Service</h4>
                    <ul className="space-y-1">
                      <li>
                        <strong>Phone:</strong> +93 70 123 4567
                      </li>
                      <li>
                        <strong>Email:</strong> support@hesaarak.com
                      </li>
                      <li>
                        <strong>Hours:</strong> 24/7 Available
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Office Address</h4>
                    <address className="not-italic">
                      Shar-e-Naw
                      <br />
                      Kabul, Afghanistan
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
