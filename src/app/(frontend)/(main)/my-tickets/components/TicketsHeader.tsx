'use client'

import React from 'react'
import { UserTicket } from '../types'

// Function to check if trip is upcoming
const isUpcoming = (dateString: string): boolean => {
  try {
    const tripDate = new Date(dateString)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    tripDate.setHours(0, 0, 0, 0)
    return tripDate >= today
  } catch {
    return false
  }
}

interface TicketsHeaderProps {
  tickets: UserTicket[]
  filter: 'all' | 'upcoming' | 'past'
  setFilter: (filter: 'all' | 'upcoming' | 'past') => void
}

export const TicketsHeader = ({ tickets, filter, setFilter }: TicketsHeaderProps) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">My Tickets</h1>
          <p className="text-gray-600">Manage your bus tickets and travel history</p>
        </div>
        <div className="mt-4 md:mt-0">
          <div className="flex space-x-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-orange-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All ({tickets.length})
            </button>
            <button
              onClick={() => setFilter('upcoming')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'upcoming'
                  ? 'bg-orange-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Upcoming (
              {tickets.filter((t) => isUpcoming(t.booking.date) && !t.status.isCancelled).length})
            </button>
            <button
              onClick={() => setFilter('past')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'past'
                  ? 'bg-orange-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Past (
              {tickets.filter((t) => !isUpcoming(t.booking.date) || t.status.isCancelled).length})
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
