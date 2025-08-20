import React from 'react'
import Link from 'next/link'
import { ArrowRight, Clock, MapPin } from 'lucide-react'

export const PopularRoutesSection = () => {
  const popularRoutes = [
    {
      from: 'Kabul',
      to: 'Mazaar',
      duration: '8 hours',
      price: '1,500 AF',
      frequency: '6 trips daily',
      image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400&h=200&fit=crop',
    },
    {
      from: 'Kabul',
      to: 'Herat',
      duration: '12 hours',
      price: '2,200 AF',
      frequency: '4 trips daily',
      image: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=200&fit=crop',
    },
    {
      from: 'Kabul',
      to: 'Kandahar',
      duration: '9 hours',
      price: '1,800 AF',
      frequency: '5 trips daily',
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=200&fit=crop',
    },
    {
      from: 'Mazaar',
      to: 'Herat',
      duration: '10 hours',
      price: '2,000 AF',
      frequency: '3 trips daily',
      image: 'https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?w=400&h=200&fit=crop',
    },
    {
      from: 'Kabul',
      to: 'Jalalabad',
      duration: '3 hours',
      price: '800 AF',
      frequency: '8 trips daily',
      image: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=400&h=200&fit=crop',
    },
    {
      from: 'Herat',
      to: 'Kandahar',
      duration: '7 hours',
      price: '1,600 AF',
      frequency: '4 trips daily',
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=200&fit=crop',
    },
  ]

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Popular <span className="text-orange-600">Routes</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover our most traveled routes with frequent departures and competitive prices
          </p>
        </div>

        {/* Routes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {popularRoutes.map((route, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 group border border-gray-100"
            >
              {/* Route Image */}
              <div className="relative h-48 bg-gradient-to-br from-orange-400 to-red-500">
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="relative z-10 p-6 h-full flex flex-col justify-between">
                  <div className="flex items-center justify-between text-white">
                    <div className="flex items-center">
                      <MapPin className="w-5 h-5 mr-2" />
                      <span className="font-semibold">{route.from}</span>
                    </div>
                    <ArrowRight className="w-6 h-6" />
                    <div className="flex items-center">
                      <span className="font-semibold">{route.to}</span>
                      <MapPin className="w-5 h-5 ml-2" />
                    </div>
                  </div>
                  <div className="text-white">
                    <div className="text-3xl font-bold">{route.price}</div>
                    <div className="text-sm opacity-90">starting from</div>
                  </div>
                </div>
              </div>

              {/* Route Details */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center text-gray-600">
                    <Clock className="w-4 h-4 mr-2" />
                    <span className="text-sm">{route.duration}</span>
                  </div>
                  <div className="text-sm text-gray-600">{route.frequency}</div>
                </div>

                <Link
                  href={`/search?from=${encodeURIComponent(route.from)}&to=${encodeURIComponent(route.to)}`}
                  className="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-orange-700 hover:to-red-700 transition-all duration-300 flex items-center justify-center group-hover:scale-105"
                >
                  Book Now
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* View All Routes Button */}
        <div className="text-center mt-12">
          <Link
            href="/search"
            className="inline-flex items-center px-8 py-4 bg-white border-2 border-orange-600 text-orange-600 rounded-xl font-semibold hover:bg-orange-600 hover:text-white transition-all duration-300"
          >
            View All Routes
            <ArrowRight className="w-5 h-5 ml-2" />
          </Link>
        </div>
      </div>
    </section>
  )
}
