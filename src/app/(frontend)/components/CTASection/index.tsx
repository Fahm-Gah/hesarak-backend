import React from 'react'
import Link from 'next/link'
import { ArrowRight, Download, Smartphone } from 'lucide-react'

export const CTASection = () => {
  return (
    <section className="py-20 bg-gradient-to-br from-orange-600 to-red-600 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-32 h-32 border-2 border-white rounded-full"></div>
        <div className="absolute top-20 right-20 w-24 h-24 border-2 border-white rotate-45"></div>
        <div className="absolute bottom-10 left-1/4 w-16 h-16 border-2 border-white rotate-12"></div>
        <div className="absolute bottom-20 right-1/3 w-20 h-20 border-2 border-white rounded-full"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center text-white">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Start Your Journey?</h2>
          <p className="text-xl md:text-2xl mb-12 opacity-90 max-w-3xl mx-auto">
            Join thousands of satisfied passengers who trust Hesaarak for safe, comfortable, and
            affordable bus travel across Afghanistan.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
            <Link
              href="/search"
              className="bg-white text-orange-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all duration-300 flex items-center shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Book Your Trip Now
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>

            <Link
              href="/about"
              className="border-2 border-white text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white hover:text-orange-600 transition-all duration-300 flex items-center transform hover:scale-105"
            >
              Learn More About Us
            </Link>
          </div>

          {/* App Download Section */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="text-left mb-6 md:mb-0">
                <div className="flex items-center mb-4">
                  <Smartphone className="w-8 h-8 mr-3" />
                  <h3 className="text-2xl font-bold">Get Our Mobile App</h3>
                </div>
                <p className="text-lg opacity-90 mb-4">
                  Download the Hesaarak mobile app for easier booking and trip management on the go.
                </p>
                <div className="text-sm opacity-75">
                  • Faster booking process
                  <br />
                  • Real-time trip updates
                  <br />• Digital ticket storage
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button className="bg-black text-white px-6 py-3 rounded-xl flex items-center hover:bg-gray-800 transition-colors">
                  <Download className="w-5 h-5 mr-2" />
                  <div className="text-left">
                    <div className="text-xs">Download on the</div>
                    <div className="text-sm font-semibold">App Store</div>
                  </div>
                </button>

                <button className="bg-black text-white px-6 py-3 rounded-xl flex items-center hover:bg-gray-800 transition-colors">
                  <Download className="w-5 h-5 mr-2" />
                  <div className="text-left">
                    <div className="text-xs">Get it on</div>
                    <div className="text-sm font-semibold">Google Play</div>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-2xl font-bold mb-2">24/7 Support</div>
              <div className="opacity-90">+93 70 123 4567</div>
            </div>
            <div>
              <div className="text-2xl font-bold mb-2">Email Us</div>
              <div className="opacity-90">support@hesaarak.com</div>
            </div>
            <div>
              <div className="text-2xl font-bold mb-2">Visit Us</div>
              <div className="opacity-90">Kabul, Afghanistan</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
