'use client'

import React, { useEffect, useState, useCallback, useMemo } from 'react'
import { DateTimeField, useFormFields } from '@payloadcms/ui'
import type { DateFieldClientComponent } from 'payload'

interface TripSchedule {
  id: string
  frequency: 'daily' | 'specific-days'
  days?: string[]
  isActive: boolean
}

const TripDateFieldClient: DateFieldClientComponent = (props) => {
  const { field, path } = props
  const tripField = useFormFields(([fields]) => fields.trip)
  const [tripSchedule, setTripSchedule] = useState<TripSchedule | null>(null)
  const [loading, setLoading] = useState(false)

  const tripId = tripField?.value

  // Fetch trip schedule when trip changes
  useEffect(() => {
    if (!tripId) {
      setTripSchedule(null)
      return
    }

    // Create an AbortController for this specific request
    const abortController = new AbortController()
    let isMounted = true

    const fetchTripSchedule = async () => {
      setLoading(true)
      try {
        const response = await fetch(`/api/trip-schedules/${tripId}?depth=0`, {
          signal: abortController.signal, // Allow request cancellation
        })

        if (response.ok) {
          const data = await response.json()

          // Only update state if component is still mounted and request wasn't aborted
          if (isMounted && !abortController.signal.aborted) {
            setTripSchedule(data)
          }
        }
      } catch (error) {
        // Don't log errors for aborted requests (normal cleanup)
        if (error instanceof Error && error.name !== 'AbortError') {
          console.error('Error fetching trip schedule:', error)
        }
      } finally {
        // Only update loading state if component is still mounted
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchTripSchedule()

    // Cleanup function - runs when effect cleans up
    return () => {
      isMounted = false
      abortController.abort() // Cancel the ongoing request
    }
  }, [tripId])

  // Create a custom filter function for react-datepicker
  const filterDate = useCallback(
    (date: Date): boolean => {
      if (!tripSchedule) return true
      if (!tripSchedule.isActive) return false

      // Allow all dates if daily
      if (tripSchedule.frequency === 'daily') return true

      // Check specific days
      if (tripSchedule.frequency === 'specific-days' && tripSchedule.days) {
        const dayOfWeek = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][date.getDay()]
        return tripSchedule.days.includes(dayOfWeek)
      }

      return false
    },
    [tripSchedule],
  )

  // Create enhanced field - cast to any to bypass TypeScript restrictions
  const enhancedField = useMemo(() => {
    const fieldCopy = { ...field } as any

    // Ensure admin object exists
    if (!fieldCopy.admin) fieldCopy.admin = {}

    // Ensure date object exists
    if (!fieldCopy.admin.date) fieldCopy.admin.date = {}

    // Ensure overrides object exists
    if (!fieldCopy.admin.date.overrides) fieldCopy.admin.date.overrides = {}

    // Add our custom overrides
    fieldCopy.admin.date.overrides = {
      ...fieldCopy.admin.date.overrides,
      filterDate,
      minDate: new Date(),
      placeholderText: loading
        ? 'Loading schedule...'
        : !tripId
          ? 'Select a trip first'
          : 'Select date',
      disabled: !tripId || loading,
    }

    return fieldCopy
  }, [field, filterDate, loading, tripId])

  return <DateTimeField {...props} field={enhancedField} />
}

export default TripDateFieldClient
