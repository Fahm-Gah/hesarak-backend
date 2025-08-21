'use client'

import React from 'react'
import { MapPin, Calendar, Info, Star } from 'lucide-react'

interface SearchSuggestionsProps {
  onRouteSelect?: (from: string, to: string) => void
}

export const SearchSuggestions: React.FC<SearchSuggestionsProps> = ({ onRouteSelect }) => {
  const tips = [
    {
      icon: MapPin,
      title: 'Search by Province or City',
      description:
        'Type any province name (like "Kabul") or specific terminal name for accurate results',
    },
    {
      icon: Calendar,
      title: 'Book in Advance',
      description: 'Popular routes fill up quickly. Book at least 2 hours before departure',
    },
    {
      icon: Star,
      title: 'Best Times to Travel',
      description: 'Morning departures (6-9 AM) typically have more availability and better prices',
    },
  ]

  const provinces = [
    'Kabul',
    'Herat',
    'Mazar-i-Sharif',
    'Kandahar',
    'Jalalabad',
    'Kunduz',
    'Ghazni',
    'Balkh',
    'Farah',
    'Baghlan',
  ]

  return (
    <div className="space-y-6">
      {/* Search Tips */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Info className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Search Tips</h3>
        </div>

        <div className="space-y-4">
          {tips.map((tip, index) => (
            <div key={index} className="flex gap-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <tip.icon className="w-4 h-4 text-blue-600" />
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-1">{tip.title}</h4>
                <p className="text-sm text-gray-600">{tip.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Available Provinces */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="w-5 h-5 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">Available Destinations</h3>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
          {provinces.map((province) => (
            <button
              key={province}
              onClick={() => onRouteSelect?.(province, '')}
              className="text-left p-3 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 group"
            >
              <div className="text-sm font-medium text-gray-900">{province}</div>
              <div className="text-xs text-gray-500 group-hover:text-green-600">
                Click to search from
              </div>
            </button>
          ))}
        </div>

        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            Click on any destination to set as departure point
          </p>
        </div>
      </div>
    </div>
  )
}
