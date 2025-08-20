import React from 'react'
import { Star, Quote } from 'lucide-react'

export const TestimonialsSection = () => {
  const testimonials = [
    {
      name: 'Ahmad Naser',
      location: 'Kabul',
      rating: 5,
      comment:
        'Excellent service! The bus was comfortable and arrived exactly on time. The booking process was very easy and the staff was helpful.',
      route: 'Kabul to Mazaar',
    },
    {
      name: 'Fatima Khan',
      location: 'Herat',
      rating: 5,
      comment:
        'I travel frequently for business and Hesarakbus has become my go-to choice. Clean buses, professional drivers, and great customer service.',
      route: 'Herat to Kabul',
    },
    {
      name: 'Mohammad Ali',
      location: 'Jalalabad',
      rating: 5,
      comment:
        'Safe and reliable transportation. The online booking system is user-friendly and the prices are very reasonable. Highly recommended!',
      route: 'Jalalabad to Kabul',
    },
    {
      name: 'Sara Ahmadi',
      location: 'Kandahar',
      rating: 4,
      comment:
        'Good experience overall. The bus was comfortable and the journey was smooth. Will definitely book again for my future travels.',
      route: 'Kandahar to Kabul',
    },
    {
      name: 'Omar Hakim',
      location: 'Mazaar',
      rating: 5,
      comment:
        'Outstanding service from booking to arrival. The bus was modern, clean, and equipped with all necessary amenities. Great value for money.',
      route: 'Mazaar to Herat',
    },
    {
      name: 'Maryam Safi',
      location: 'Kabul',
      rating: 5,
      comment:
        'Professional and courteous service. The drivers are experienced and the buses are well-maintained. Feel safe traveling with Hesarakbus.',
      route: 'Kabul to Kandahar',
    },
  ]

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`w-4 h-4 ${index < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ))
  }

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            What Our <span className="text-orange-600">Passengers</span> Say
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Read testimonials from thousands of satisfied passengers who trust Hesarakbus for their
            travel needs
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 relative"
            >
              {/* Quote Icon */}
              <div className="absolute top-4 right-4 text-orange-200">
                <Quote className="w-6 h-6" />
              </div>

              {/* Rating */}
              <div className="flex items-center mb-4">{renderStars(testimonial.rating)}</div>

              {/* Comment */}
              <p className="text-gray-700 mb-6 leading-relaxed">"{testimonial.comment}"</p>

              {/* Route */}
              <div className="text-sm text-orange-600 font-medium mb-4">{testimonial.route}</div>

              {/* Author */}
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                  {testimonial.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </div>
                <div className="ml-3">
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-600">{testimonial.location}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Trust Stats */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-3xl font-bold text-orange-600 mb-2">4.9/5</div>
            <div className="text-gray-600">Average Rating</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-orange-600 mb-2">10,000+</div>
            <div className="text-gray-600">Happy Passengers</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-orange-600 mb-2">50+</div>
            <div className="text-gray-600">Routes Available</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-orange-600 mb-2">99%</div>
            <div className="text-gray-600">On-time Performance</div>
          </div>
        </div>
      </div>
    </section>
  )
}
