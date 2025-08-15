'use client'

import React, { useEffect, useState, useCallback, useMemo } from 'react'
import { useFormFields, useField, useTranslation } from '@payloadcms/ui'
import type { DateFieldClientComponent } from 'payload'
import { PersianDatePicker } from '../PersianDatePickerField'

interface TripSchedule {
  id: string
  frequency: 'daily' | 'specific-days'
  days?: string[]
  isActive: boolean
}

const TripDateFieldClient: DateFieldClientComponent = (props) => {
  const { path, field, readOnly = false } = props
  const tripField = useFormFields(([fields]) => fields.trip)
  const { value, setValue } = useField<string | null>({ path })
  const { i18n } = useTranslation()
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
          signal: abortController.signal,
        })

        if (response.ok) {
          const data = await response.json()

          if (isMounted && !abortController.signal.aborted) {
            setTripSchedule(data)
          }
        }
      } catch (error) {
        if (error instanceof Error && error.name !== 'AbortError') {
          console.error('Error fetching trip schedule:', error)
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchTripSchedule()

    return () => {
      isMounted = false
      abortController.abort()
    }
  }, [tripId])

  const filterDate = useCallback(
    (date: Date): boolean => {
      if (!tripSchedule) return true
      if (!tripSchedule.isActive) return false

      if (tripSchedule.frequency === 'daily') return true

      if (tripSchedule.frequency === 'specific-days' && tripSchedule.days) {
        const dayOfWeek = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][date.getDay()]
        return tripSchedule.days.includes(dayOfWeek)
      }

      return false
    },
    [tripSchedule],
  )

  const handleDateChange = useCallback(
    (date: Date | null) => {
      if (date) {
        setValue(date.toISOString())
      } else {
        setValue(null)
      }
    },
    [setValue],
  )

  const dateValue = useMemo(() => {
    return value ? new Date(value) : null
  }, [value])

  return (
    <PersianDatePicker
      path={path}
      field={field as any}
      value={dateValue}
      onChange={handleDateChange}
      filterDate={filterDate}
      minDate={new Date()}
      disabled={!tripId || loading}
      readOnly={readOnly}
      placeholderText={
        loading
          ? i18n.language === 'fa'
            ? 'در حال بارگذاری برنامه...'
            : 'Loading schedule...'
          : !tripId
            ? i18n.language === 'fa'
              ? 'ابتدا سفری را انتخاب کنید'
              : 'Select a trip first'
            : i18n.language === 'fa'
              ? 'تاریخ را انتخاب کنید'
              : 'Select date'
      }
      pickerAppearance={(field?.admin as any)?.date?.pickerAppearance || 'dayOnly'}
    />
  )
}

export default TripDateFieldClient
