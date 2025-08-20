import React from 'react'
import { TripSearchForm } from '../TripSearchForm'

export const HeroSection = () => {
  return (
    <section className="min-h-screen relative overflow-hidden bg-slate-900">
      {/* Dark masculine background with subtle texture */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-orange-900/20 via-transparent to-transparent"></div>

        {/* Animated Stars */}
        <div className="absolute inset-0">
          {/* Large twinkling stars */}
          <div className="absolute top-16 left-[10%] w-2 h-2 bg-white rounded-full animate-pulse opacity-80"></div>
          <div className="absolute top-24 right-[15%] w-1.5 h-1.5 bg-blue-200 rounded-full animate-ping opacity-60"></div>
          <div className="absolute top-32 left-[25%] w-1 h-1 bg-yellow-200 rounded-full animate-pulse opacity-90"></div>
          <div className="absolute top-40 right-[30%] w-2 h-2 bg-white rounded-full animate-ping opacity-70"></div>
          <div className="absolute top-20 left-[60%] w-1.5 h-1.5 bg-blue-100 rounded-full animate-pulse opacity-80"></div>
          <div className="absolute top-36 right-[45%] w-1 h-1 bg-white rounded-full animate-ping opacity-60"></div>
          <div className="absolute top-28 left-[80%] w-2 h-2 bg-yellow-100 rounded-full animate-pulse opacity-75"></div>

          {/* Medium stars */}
          <div className="absolute top-44 left-[5%] w-1 h-1 bg-white rounded-full animate-pulse opacity-60 delay-300"></div>
          <div className="absolute top-52 right-[20%] w-1 h-1 bg-blue-200 rounded-full animate-ping opacity-50 delay-500"></div>
          <div className="absolute top-48 left-[35%] w-1.5 h-1.5 bg-white rounded-full animate-pulse opacity-70 delay-700"></div>
          <div className="absolute top-56 right-[55%] w-1 h-1 bg-yellow-200 rounded-full animate-ping opacity-40 delay-200"></div>
          <div className="absolute top-60 left-[70%] w-1 h-1 bg-blue-100 rounded-full animate-pulse opacity-65 delay-400"></div>
          <div className="absolute top-44 right-[85%] w-1.5 h-1.5 bg-white rounded-full animate-ping opacity-55 delay-600"></div>

          {/* Small scattered stars */}
          <div className="absolute top-64 left-[12%] w-0.5 h-0.5 bg-white rounded-full animate-pulse opacity-40 delay-100"></div>
          <div className="absolute top-68 right-[8%] w-0.5 h-0.5 bg-blue-200 rounded-full animate-ping opacity-30 delay-800"></div>
          <div className="absolute top-72 left-[40%] w-0.5 h-0.5 bg-yellow-200 rounded-full animate-pulse opacity-50 delay-900"></div>
          <div className="absolute top-76 right-[65%] w-0.5 h-0.5 bg-white rounded-full animate-ping opacity-35 delay-150"></div>
          <div className="absolute top-80 left-[85%] w-0.5 h-0.5 bg-blue-100 rounded-full animate-pulse opacity-45 delay-450"></div>

          {/* More distant stars */}
          <div className="absolute top-84 left-[18%] w-0.5 h-0.5 bg-white rounded-full animate-pulse opacity-30 delay-600"></div>
          <div className="absolute top-88 right-[38%] w-0.5 h-0.5 bg-yellow-100 rounded-full animate-ping opacity-25 delay-750"></div>
          <div className="absolute top-92 left-[55%] w-0.5 h-0.5 bg-blue-200 rounded-full animate-pulse opacity-40 delay-350"></div>
          <div className="absolute top-96 right-[75%] w-0.5 h-0.5 bg-white rounded-full animate-ping opacity-20 delay-950"></div>
        </div>

        {/* Geometric pattern overlay */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-96 h-96 border border-orange-500 rotate-45 rounded-lg"></div>
          <div className="absolute bottom-32 right-32 w-64 h-64 border border-orange-400 rotate-12 rounded-lg"></div>
          <div className="absolute top-1/2 left-1/4 w-32 h-32 border border-orange-300 -rotate-12 rounded-lg"></div>
        </div>
      </div>

      {/* Mountain silhouettes */}
      <div className="absolute bottom-0 left-0 right-0 h-[40%]">
        {/* Back mountains */}
        <div className="absolute bottom-0 left-0 right-0 h-[300px]">
          <svg
            viewBox="0 0 1440 300"
            className="absolute bottom-0 w-full h-full"
            preserveAspectRatio="none"
          >
            <path
              d="M0,150 L200,80 L400,120 L600,60 L800,100 L1000,40 L1200,90 L1440,70 L1440,300 L0,300 Z"
              fill="rgba(51, 65, 85, 0.8)"
            />
          </svg>
        </div>

        {/* Front mountains */}
        <div className="absolute bottom-0 left-0 right-0 h-[200px]">
          <svg
            viewBox="0 0 1440 200"
            className="absolute bottom-0 w-full h-full"
            preserveAspectRatio="none"
          >
            <path
              d="M0,100 L300,40 L500,80 L700,30 L900,70 L1100,20 L1300,60 L1440,45 L1440,200 L0,200 Z"
              fill="rgba(30, 41, 59, 0.9)"
            />
          </svg>
        </div>
      </div>

      {/* Highway/road */}
      <div className="absolute bottom-0 left-0 right-0 h-[100px]">
        <div className="w-full h-full bg-gradient-to-t from-gray-800 to-transparent opacity-60"></div>
        {/* Road lines */}
        <div className="absolute bottom-8 left-0 right-0 flex justify-center space-x-8">
          <div className="w-16 h-1 bg-yellow-400 opacity-80"></div>
          <div className="w-16 h-1 bg-yellow-400 opacity-80"></div>
          <div className="w-16 h-1 bg-yellow-400 opacity-80"></div>
          <div className="w-16 h-1 bg-yellow-400 opacity-80"></div>
          <div className="w-16 h-1 bg-yellow-400 opacity-80"></div>
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-20 flex flex-col justify-center items-center min-h-screen px-4 sm:px-6 lg:px-8 py-12">
        {/* Bold masculine header */}
        <div className="text-center mb-16 max-w-5xl">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-white mb-6 tracking-tight leading-tight">
            BOOK YOUR
            <span className="block bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent">
              BUS JOURNEY
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 font-medium max-w-3xl mx-auto leading-relaxed">
            Fast, reliable, and comfortable bus travel across Afghanistan.
          </p>
        </div>

        {/* Search form */}
        <div className="w-full max-w-6xl">
          <TripSearchForm />
        </div>

        {/* Trust indicators - masculine style */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl text-center">
          <div className="text-white">
            <div className="text-3xl font-black text-orange-400 mb-2">10K+</div>
            <div className="text-gray-300 font-medium">Monthly Passengers</div>
          </div>
          <div className="text-white">
            <div className="text-3xl font-black text-orange-400 mb-2">50+</div>
            <div className="text-gray-300 font-medium">Bus Routes</div>
          </div>
          <div className="text-white">
            <div className="text-3xl font-black text-orange-400 mb-2">24/7</div>
            <div className="text-gray-300 font-medium">Customer Support</div>
          </div>
        </div>
      </div>
    </section>
  )
}
