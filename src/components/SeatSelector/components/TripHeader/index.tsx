import React, { useMemo } from 'react'
import { MapPin, Clock, Bus } from 'lucide-react'
import type { Trip } from '../../types'
import { formatDepartureTime } from '@/utils/dateUtils' // Assuming '@/utils/dateUtils' is your alias

interface TripHeaderProps {
  trip: Trip
}

/**
 * Displays comprehensive trip information including route, timing, bus details,
 * and amenities. This component is designed to be highly readable and informative at a glance.
 */
export const TripHeader: React.FC<TripHeaderProps> = ({ trip }) => {
  // Memoize the formatted route string to prevent unnecessary recalculations
  const formattedRoute = useMemo(() => {
    const origin = trip.from.name
    const destination = trip.stops[trip.stops.length - 1]?.terminal.name || origin

    const intermediateStops = trip.stops
      .slice(0, -1)
      .filter(
        (stop) =>
          stop.terminal.name !== origin &&
          (destination === origin || stop.terminal.name !== destination),
      )
      .map((stop) => stop.terminal.name)

    if (intermediateStops.length === 0) {
      return `${origin} → ${destination}`
    }

    return `${origin} → ${intermediateStops.join(', ')} → ${destination}`
  }, [trip.from.name, trip.stops])

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
          <span>{formatDepartureTime(trip.timeOfDay)}</span> {/* Using the improved function */}
        </div>

        <div className="trip-header__metadata-item">
          <Bus size={16} />
          <span>
            {trip.bus.number} ({trip.bus.type.name})
          </span>
        </div>
      </div>

      {/* Moved amenities section below trip-status */}
      <div className="trip-header__metadata-item trip-header__amenities">
        <span className="trip-header__amenities-label">Amenities:</span>
        <div className="trip-header__amenities-list">
          {trip.bus.type.amenities.map((amenity, index) => (
            <span key={amenity.name || index} className="trip-header__amenity">
              {amenity.name}
            </span>
          ))}
        </div>
      </div>

      <div className="trip-header__trip-status">
        <span
          className={`trip-header__status-badge trip-header__status-badge--${trip.isActive ? 'active' : 'inactive'}`}
        >
          {trip.isActive ? 'Active' : 'Inactive'}
        </span>
        <span className="trip-header__price">
          <strong>AFN {trip.price.toLocaleString()} per seat</strong>
        </span>
      </div>
    </div>
  )
}
