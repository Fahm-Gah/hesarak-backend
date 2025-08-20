import React from 'react'
import { Shield, Clock, MapPin, CreditCard, HeadphonesIcon, Star } from 'lucide-react'

export const FeaturesSection = () => {
  const features = [
    {
      icon: Shield,
      title: 'Safe & Secure',
      description:
        'All our buses are regularly maintained and inspected for your safety and comfort.',
    },
    {
      icon: Clock,
      title: '24/7 Service',
      description: 'Round-the-clock customer support and bus services to fit your schedule.',
    },
    {
      icon: MapPin,
      title: 'Wide Coverage',
      description: 'Extensive network covering major cities and towns across Afghanistan.',
    },
    {
      icon: CreditCard,
      title: 'Easy Payment',
      description: 'Multiple payment options including cash, card, and mobile payments.',
    },
    {
      icon: HeadphonesIcon,
      title: 'Customer Support',
      description: 'Dedicated support team to help you with bookings and travel queries.',
    },
    {
      icon: Star,
      title: 'Quality Service',
      description: 'Premium quality buses with comfortable seating and modern amenities.',
    },
  ]

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Why Choose <span className="text-orange-600">Hesarakbus</span>?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Experience the best in bus travel with our commitment to safety, comfort, and
            reliability
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const IconComponent = feature.icon
            return (
              <div
                key={index}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-orange-200 group"
              >
                <div className="bg-gradient-to-br from-orange-500 to-red-500 w-16 h-16 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <IconComponent className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
