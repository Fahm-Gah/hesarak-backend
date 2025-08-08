import React, { useMemo, memo } from 'react'
import { MapPin, Clock, Bus } from 'lucide-react'
import type { Trip } from '../../types'
import './index.scss'
import { formatDepartureTime } from '@/utils/dateUtils'

interface TripHeaderProps {
  trip: Trip
}

export const TripHeader = memo<TripHeaderProps>(({ trip }) => {
  const formattedRoute = useMemo(() => {
    const origin = trip.from.name
    const stops = trip.stops || []

    if (stops.length === 0) return origin

    const destination = stops[stops.length - 1]?.terminal.name || origin
    const intermediateStops = stops
      .slice(0, -1)
      .map((stop) => stop.terminal.name)
      .filter((name) => name !== origin && name !== destination)

    if (intermediateStops.length === 0) {
      return `${origin} → ${destination}`
    }

    return `${origin} → ${intermediateStops.join(', ')} → ${destination}`
  }, [trip])

  return (
    <div className="trip-header">
      <div className="trip-header__title-row">
        <h3 className="trip-header__title">{trip.name}</h3>
      </div>

      <div className="trip-header__metadata">
        <div className="trip-header__metadata-item">
          <MapPin size={16} />
          <span title={formattedRoute}>{formattedRoute}</span>
        </div>

        <div className="trip-header__metadata-item">
          <Clock size={16} />
          <span>{formatDepartureTime(trip.departureTime)}</span>
        </div>

        <div className="trip-header__metadata-item">
          <Bus size={16} />
          <span>
            {trip.bus.number} ({trip.bus.type.name})
          </span>
        </div>
      </div>

      {trip.bus.type.amenities.length > 0 && (
        <div className="trip-header__metadata-item trip-header__amenities">
          <span className="trip-header__amenities-label">Amenities:</span>
          <div className="trip-header__amenities-list">
            {trip.bus.type.amenities.map((amenity, index) => (
              <span key={`${amenity}-${index}`} className="trip-header__amenity">
                {amenity}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="trip-header__trip-status">
        <span
          className={`trip-header__status-badge trip-header__status-badge--${
            trip.isActive ? 'active' : 'inactive'
          }`}
        >
          {trip.isActive ? 'Active' : 'Inactive'}
        </span>
        <span className="trip-header__price">
          Price per seat: <strong>AFN {trip.price.toLocaleString()}</strong>
        </span>
      </div>
    </div>
  )
})

TripHeader.displayName = 'TripHeader'
