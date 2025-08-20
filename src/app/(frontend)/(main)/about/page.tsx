import React from 'react'
import { Metadata } from 'next'
import { Shield, Users, MapPin, Award, Clock, Heart } from 'lucide-react'

export const metadata: Metadata = {
  title: 'About Us | Hesaarak - Your Trusted Bus Travel Partner',
  description:
    "Learn about Hesaarak's mission to provide safe, comfortable, and reliable bus travel across Afghanistan. Discover our story, values, and commitment to passenger safety.",
}

export default function AboutPage() {
  const values = [
    {
      icon: Shield,
      title: 'Safety First',
      description:
        'Passenger safety is our top priority. All our buses undergo regular maintenance and safety inspections.',
    },
    {
      icon: Users,
      title: 'Customer Focus',
      description:
        'We put our passengers first, providing exceptional service and support throughout their journey.',
    },
    {
      icon: MapPin,
      title: 'Wide Coverage',
      description:
        'Extensive network covering major cities and towns across Afghanistan with convenient departure times.',
    },
    {
      icon: Award,
      title: 'Quality Service',
      description:
        'Committed to maintaining high standards of service with comfortable buses and professional drivers.',
    },
  ]

  const stats = [
    { number: '10,000+', label: 'Happy Passengers', sublabel: 'Monthly' },
    { number: '50+', label: 'Routes', sublabel: 'Across Afghanistan' },
    { number: '99%', label: 'On-Time', sublabel: 'Performance' },
    { number: '24/7', label: 'Support', sublabel: 'Available' },
  ]

  const milestones = [
    {
      year: '2020',
      title: 'Hesaarak Founded',
      description:
        'Started with a vision to revolutionize bus travel in Afghanistan with modern technology and customer-first approach.',
    },
    {
      year: '2021',
      title: 'First Routes Launched',
      description:
        'Began operations with key routes connecting Kabul to major cities including Mazaar, Herat, and Kandahar.',
    },
    {
      year: '2022',
      title: 'Digital Platform Launch',
      description:
        'Introduced online booking system making it easier for passengers to book tickets from anywhere.',
    },
    {
      year: '2023',
      title: 'Fleet Expansion',
      description:
        'Expanded our fleet with modern buses equipped with safety features and passenger comfort amenities.',
    },
    {
      year: '2024',
      title: 'Mobile App Launch',
      description:
        'Released mobile application for iOS and Android, providing seamless booking experience on mobile devices.',
    },
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-gray-900 to-gray-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              About <span className="text-orange-500">Hesaarak</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
              We are committed to providing safe, comfortable, and reliable bus travel services
              across Afghanistan, connecting people and communities with modern transportation
              solutions.
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Our Mission</h2>
              <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                To transform bus travel in Afghanistan by providing safe, comfortable, and
                affordable transportation services that connect communities and enable economic
                growth. We believe that reliable transportation is essential for progress and
                development.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed">
                Our mission extends beyond just transportation – we aim to contribute to the social
                and economic development of Afghanistan by facilitating safe and efficient movement
                of people across the country.
              </p>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-red-50 p-8 rounded-2xl">
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Our Vision</h2>
              <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                To be Afghanistan's leading bus travel company, recognized for our commitment to
                safety, reliability, and customer satisfaction. We envision a future where every
                Afghan has access to safe and comfortable transportation.
              </p>
              <div className="flex items-center text-orange-600">
                <Heart className="w-6 h-6 mr-2" />
                <span className="font-semibold">Serving Afghanistan with pride</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Values</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              The principles that guide everything we do
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => {
              const IconComponent = value.icon
              return (
                <div
                  key={index}
                  className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 text-center"
                >
                  <div className="bg-gradient-to-br from-orange-500 to-red-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{value.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{value.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 bg-gradient-to-br from-orange-600 to-red-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Our Impact</h2>
            <p className="text-xl opacity-90">Numbers that tell our story</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-5xl font-bold mb-2">{stat.number}</div>
                <div className="text-xl font-semibold mb-1">{stat.label}</div>
                <div className="text-sm opacity-80">{stat.sublabel}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Journey</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From a small startup to Afghanistan's trusted bus travel partner
            </p>
          </div>

          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-4 md:left-1/2 transform md:-translate-x-px h-full w-0.5 bg-orange-200"></div>

            {milestones.map((milestone, index) => (
              <div key={index} className="relative mb-12">
                <div
                  className={`flex items-center ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}
                >
                  {/* Timeline Dot */}
                  <div className="absolute left-4 md:left-1/2 transform -translate-x-1/2 w-4 h-4 bg-orange-500 rounded-full border-4 border-white shadow-lg z-10"></div>

                  {/* Content */}
                  <div
                    className={`ml-12 md:ml-0 md:w-1/2 ${index % 2 === 0 ? 'md:pr-12' : 'md:pl-12'}`}
                  >
                    <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                      <div className="text-orange-600 font-bold text-lg mb-2">{milestone.year}</div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">
                        {milestone.title}
                      </h3>
                      <p className="text-gray-600 leading-relaxed">{milestone.description}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">Our Commitment</h2>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto mb-12 leading-relaxed">
            Every day, our team of dedicated professionals works tirelessly to ensure your journey
            is safe, comfortable, and memorable. From our drivers to our customer service
            representatives, everyone at Hesaarak is committed to serving you with excellence.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <Clock className="w-12 h-12 text-orange-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Punctuality</h3>
              <p className="text-gray-600">
                We respect your time and ensure on-time departures and arrivals.
              </p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <Shield className="w-12 h-12 text-orange-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Safety</h3>
              <p className="text-gray-600">
                Regular maintenance and safety checks ensure your journey is secure.
              </p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <Users className="w-12 h-12 text-orange-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Service</h3>
              <p className="text-gray-600">
                Our friendly staff is always ready to assist you with a smile.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
