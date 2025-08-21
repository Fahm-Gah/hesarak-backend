'use client'

import React from 'react'
import { Search, Filter } from 'lucide-react'

interface EmptyTicketsStateProps {
  filter: 'all' | 'upcoming' | 'past'
  hasActiveFilters: boolean
  clearAllFilters: () => void
  searchTerm?: string
}

export const EmptyTicketsState = ({
  filter,
  hasActiveFilters,
  clearAllFilters,
  searchTerm,
}: EmptyTicketsStateProps) => {
  const getEmptyMessage = () => {
    if (hasActiveFilters) {
      return {
        title: 'No tickets match your filters',
        description: 'Try adjusting your search criteria or clearing filters to see more results.',
        icon: <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />,
        showClearButton: true,
      }
    }

    if (filter === 'upcoming') {
      return {
        title: 'No upcoming trips',
        description: "You don't have any upcoming trips scheduled.",
        icon: <Filter className="w-16 h-16 text-gray-300 mx-auto mb-4" />,
        showClearButton: false,
      }
    }

    if (filter === 'past') {
      return {
        title: 'No past trips',
        description: "You don't have any completed trips in your history.",
        icon: <Filter className="w-16 h-16 text-gray-300 mx-auto mb-4" />,
        showClearButton: false,
      }
    }

    return {
      title: 'No tickets found',
      description:
        "You haven't booked any tickets yet. Your tickets will appear here once you make a booking.",
      icon: (
        <svg
          className="w-16 h-16 text-gray-300 mx-auto mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      ),
      showClearButton: false,
    }
  }

  const { title, description, icon, showClearButton } = getEmptyMessage()

  return (
    <div className="bg-white rounded-lg shadow-md p-8 text-center">
      {icon}
      <h3 className="text-lg font-semibold text-gray-800 mb-2">{title}</h3>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">{description}</p>

      {showClearButton && (
        <button
          onClick={clearAllFilters}
          className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors"
        >
          <Filter className="w-4 h-4" />
          Clear All Filters
        </button>
      )}
    </div>
  )
}
