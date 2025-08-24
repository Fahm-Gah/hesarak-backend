import React, { useMemo, memo } from 'react'
import { MapPin, Clock, Bus, CalendarDays } from 'lucide-react'
import type { Trip } from '../../types'
import './index.scss'
import { formatDepartureTime } from '@/utils/dateUtils'

interface TripHeaderProps {
  trip: Trip
}

const DAY_FULL_NAME: Record<string, string> = {
  sat: 'Saturday',
  sun: 'Sunday',
  mon: 'Monday',
  tue: 'Tuesday',
  wed: 'Wednesday',
  thu: 'Thursday',
  fri: 'Friday',
}

const DAY_SHORT: Record<string, string> = {
  sat: 'Sat',
  sun: 'Sun',
  mon: 'Mon',
  tue: 'Tue',
  wed: 'Wed',
  thu: 'Thu',
  fri: 'Fri',
}

const ALL_DAYS = ['sat', 'sun', 'mon', 'tue', 'wed', 'thu', 'fri']

/** Normalizes different shapes of `days` into array of short day keys like ['sat','mon'] */
const normalizeDays = (raw: any): string[] => {
  if (!raw) return []
  // already ['sat','mon']
  if (Array.isArray(raw) && raw.every((r) => typeof r === 'string')) {
    return raw as string[]
  }
  // [{ day: 'sat' }, { value: 'mon' }] or mixed
  if (Array.isArray(raw) && raw.every((r) => r && (r.day || r.value || r.id))) {
    return raw.map((r) => r.day || r.value || r.id || '').filter(Boolean)
  }
  return []
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

  const frequencyLabel = useMemo(() => {
    // do not modify global types — local cast only
    const freq = (trip as any)?.frequency as string | undefined
    if (!freq) return null
    if (freq === 'daily') return 'Daily'

    if (freq === 'specific-days') {
      const rawDays = (trip as any)?.days
      const days = normalizeDays(rawDays)
      const uniqueDays = Array.from(new Set(days))
      // if admin selected every day, treat it as daily
      if (ALL_DAYS.every((d) => uniqueDays.includes(d))) return 'Daily'

      const readable = uniqueDays.map((d) => DAY_SHORT[d] || d).join(', ')
      return readable ? `${readable}` : 'Specific days'
    }

    // fallback for unexpected values
    return String(freq)
  }, [trip])

  return (
    <div className="trip-header">
      <div className="trip-header__title-row">
        <h3 className="trip-header__title">{trip.tripName}</h3>
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

        {frequencyLabel && (
          <div className="trip-header__metadata-item">
            <CalendarDays size={16} />
            <span title={frequencyLabel}>{frequencyLabel}</span>
          </div>
        )}

        <div className="trip-header__metadata-item">
          <Bus size={16} />
          <span>
            {trip.bus.number} ({trip.bus.type.name})
          </span>
        </div>
      </div>

      {trip.bus.type.amenities && trip.bus.type.amenities.length > 0 && (
        <div className="trip-header__metadata-item trip-header__amenities">
          <span className="trip-header__amenities-label">Amenities:</span>
          <div className="trip-header__amenities-list">
            {trip.bus.type.amenities.map((amenityItem, index) => {
              // Handle both old format (string[]) and new format ({ amenity: string }[])
              const amenityName = typeof amenityItem === 'string' 
                ? amenityItem 
                : amenityItem?.amenity || ''
              
              return (
                <span key={amenityItem?.id || `${amenityName}-${index}`} className="trip-header__amenity">
                  {amenityName}
                </span>
              )
            })}
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
