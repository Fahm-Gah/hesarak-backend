import React from 'react'
import { TripSearchForm } from '../TripSearchForm'

export const HeroSection = () => {
  return (
    <section className="relative h-[calc(100vh-4rem)] flex flex-col overflow-hidden">
      {/* Modern gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900">
        <div className="absolute inset-0 bg-gradient-to-t from-orange-600/10 via-transparent to-blue-600/5"></div>

        {/* Subtle animated particles */}
        <div className="absolute inset-0">
          <div className="absolute top-[10%] left-[5%] w-1 h-1 bg-orange-400 rounded-full animate-pulse opacity-60"></div>
          <div className="absolute top-[15%] right-[8%] w-1.5 h-1.5 bg-blue-400 rounded-full animate-ping opacity-40 delay-300"></div>
          <div className="absolute top-[25%] left-[15%] w-0.5 h-0.5 bg-white rounded-full animate-pulse opacity-70 delay-700"></div>
          <div className="absolute top-[35%] right-[20%] w-1 h-1 bg-orange-300 rounded-full animate-ping opacity-50 delay-1000"></div>
          <div className="absolute top-[45%] left-[85%] w-0.5 h-0.5 bg-blue-300 rounded-full animate-pulse opacity-60 delay-500"></div>
          <div className="absolute top-[65%] right-[75%] w-1 h-1 bg-white rounded-full animate-ping opacity-40 delay-1200"></div>
        </div>

        {/* Modern geometric shapes */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-[20%] right-[10%] w-32 h-32 border border-orange-400 rotate-45 rounded-2xl"></div>
          <div className="absolute bottom-[30%] left-[5%] w-24 h-24 border border-blue-400 -rotate-12 rounded-xl"></div>
        </div>
      </div>

      {/* Main content container */}
      <div className="relative z-10 flex flex-col flex-1">
        {/* Hero content */}
        <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="max-w-7xl mx-auto w-full">
            {/* Main heading and description */}
            <div className="text-center mb-6 sm:mb-8 lg:mb-10">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black text-white mb-4 sm:mb-6 tracking-tight leading-[1.1]">
                <span className="block">Your Journey</span>
                <span className="block bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                  Starts Here
                </span>
              </h1>
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-300 font-medium max-w-3xl mx-auto leading-relaxed px-4">
                Experience comfortable and reliable bus travel across Afghanistan with modern
                amenities.
              </p>
            </div>

            {/* Search form */}
            <div className="w-full max-w-6xl mx-auto mb-6 sm:mb-8 lg:mb-10">
              <TripSearchForm />
            </div>

            {/* Trust indicators */}
            <div className="grid grid-cols-3 gap-4 sm:gap-6 md:gap-8 max-w-4xl mx-auto text-center">
              <div className="flex flex-col">
                <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-orange-400 mb-1 sm:mb-2">
                  10K+
                </div>
                <div className="text-xs sm:text-sm lg:text-base text-gray-300 font-medium leading-tight">
                  Happy
                  <br className="sm:hidden" /> Passengers
                </div>
              </div>
              <div className="flex flex-col">
                <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-orange-400 mb-1 sm:mb-2">
                  50+
                </div>
                <div className="text-xs sm:text-sm lg:text-base text-gray-300 font-medium leading-tight">
                  Bus
                  <br className="sm:hidden" /> Routes
                </div>
              </div>
              <div className="flex flex-col">
                <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-orange-400 mb-1 sm:mb-2">
                  24/7
                </div>
                <div className="text-xs sm:text-sm lg:text-base text-gray-300 font-medium leading-tight">
                  Customer
                  <br className="sm:hidden" /> Support
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom decorative element */}
        <div className="relative h-8 sm:h-10 lg:h-12">
          <div className="absolute inset-0 bg-gradient-to-t from-orange-600/10 via-orange-500/5 to-transparent"></div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500/20 via-orange-400/30 to-red-500/20"></div>
          <div className="absolute bottom-0 left-1/4 w-1/2 h-0.5 bg-gradient-to-r from-transparent via-orange-300/50 to-transparent"></div>
        </div>
      </div>
    </section>
  )
}
