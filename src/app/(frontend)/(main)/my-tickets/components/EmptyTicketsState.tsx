'use client'

import React from 'react'
import { useRouter } from 'next/navigation'

interface EmptyTicketsStateProps {
  filter: 'all' | 'upcoming' | 'past'
}

export const EmptyTicketsState = ({ filter }: EmptyTicketsStateProps) => {
  const router = useRouter()

  return (
    <div className="bg-white rounded-lg shadow-md p-8 text-center">
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
      <h3 className="text-lg font-semibold text-gray-800 mb-2">No tickets found</h3>
      <p className="text-gray-600 mb-4">
        {filter === 'upcoming'
          ? "You don't have any upcoming trips."
          : filter === 'past'
            ? "You don't have any past trips."
            : "You haven't booked any tickets yet."}
      </p>
      <button
        onClick={() => router.push('/')}
        className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-lg transition-colors"
      >
        Book Your First Trip
      </button>
    </div>
  )
}
