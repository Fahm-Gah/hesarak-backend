'use client'

import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import {
  useDocumentInfo,
  useField,
  useFormModified,
  useFormSubmitted,
  useFormProcessing,
} from '@payloadcms/ui'
import type { SeatFieldValue } from '../types'
import { extractSeatId } from '../lib/seatCalculations'

interface UseSeatFormStateProps {
  path: string
  tripId?: string
  travelDate?: string
  onSeatSelect?: (seatIds: string[]) => void
  initialSelectedSeats?: string[]
  onFormSubmitted?: () => void
}

export const useSeatFormState = ({
  path,
  tripId,
  travelDate,
  onSeatSelect,
  initialSelectedSeats,
  onFormSubmitted,
}: UseSeatFormStateProps) => {
  const { id: currentTicketId, lastUpdateTime, savedDocumentData } = useDocumentInfo()
  const { value: fieldValue, setValue: setFieldValue } = useField<any>({ path })
  const isModified = useFormModified()
  const isSubmitted = useFormSubmitted()
  const isProcessing = useFormProcessing()

  const isMountedRef = useRef(true)
  const previousTripIdRef = useRef<string | undefined>(tripId)
  const previousNormalizedDateRef = useRef<string>('')
  const saveInProgressRef = useRef(false)
  const clearTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const lastSavedStateRef = useRef<{
    lastUpdateTime?: number
    savedSeats?: string[]
    isSubmitted?: boolean
  }>({})

  const EMPTY_ARRAY: string[] = useMemo(() => [], [])

  useEffect(() => {
    isMountedRef.current = true
  })

  const currentFormSeatIds = useMemo(() => {
    const fieldValueTyped = fieldValue as SeatFieldValue
    if (!fieldValueTyped) return EMPTY_ARRAY

    let seatsArray: any[]

    if (Array.isArray(fieldValueTyped)) {
      seatsArray = fieldValueTyped
    } else if (fieldValueTyped?.seats && Array.isArray(fieldValueTyped.seats)) {
      seatsArray = fieldValueTyped.seats
    } else if (typeof fieldValueTyped === 'object') {
      const arrayProps = Object.values(fieldValueTyped).filter(Array.isArray)
      seatsArray = arrayProps.length > 0 ? (arrayProps[0] as any[]) : EMPTY_ARRAY
    } else {
      return EMPTY_ARRAY
    }

    const result = seatsArray.map(extractSeatId).filter((id): id is string => id !== null)
    return result.length === 0 ? EMPTY_ARRAY : result
  }, [fieldValue, EMPTY_ARRAY])

  const normalizeDateForComparison = useCallback((date: string | undefined): string => {
    if (!date) return ''
    try {
      const d = new Date(date)
      if (isNaN(d.getTime())) return ''
      return d.toISOString().split('T')[0]
    } catch {
      return ''
    }
  }, [])

  const wasSubmittedRef = useRef(false)
  const wasModifiedRef = useRef(false)
  const wasProcessingRef = useRef(false)
  const processingStartTimeRef = useRef<number>(0)

  // Enhanced form submission detection using multiple PayloadCMS hooks
  useEffect(() => {
    // Track when processing starts
    if (isProcessing && !wasProcessingRef.current) {
      wasProcessingRef.current = true
      processingStartTimeRef.current = Date.now()
      saveInProgressRef.current = true
      console.log('Form processing started...')
    }

    // Track submission state
    if (isSubmitted && isModified) {
      wasSubmittedRef.current = true
      wasModifiedRef.current = true
      saveInProgressRef.current = true
    }

    // Form processing completed - most reliable detection method
    if (wasProcessingRef.current && !isProcessing) {
      const processingDuration = Date.now() - processingStartTimeRef.current
      console.log(`Form processing completed after ${processingDuration}ms`)

      setTimeout(() => {
        saveInProgressRef.current = false
        wasSubmittedRef.current = false
        wasModifiedRef.current = false
        wasProcessingRef.current = false

        // Notify parent that form submission completed
        if (onFormSubmitted) {
          console.log('Triggering onFormSubmitted callback')
          onFormSubmitted()
        }
      }, 200) // Short delay to ensure all state updates are processed
    }

    // Fallback: Form submission completed (legacy detection)
    else if (
      isSubmitted &&
      !isModified &&
      wasSubmittedRef.current &&
      wasModifiedRef.current &&
      !isProcessing
    ) {
      setTimeout(() => {
        saveInProgressRef.current = false
        wasSubmittedRef.current = false
        wasModifiedRef.current = false

        // Notify parent that form submission completed (fallback)
        if (onFormSubmitted) {
          console.log('Triggering onFormSubmitted callback (fallback)')
          onFormSubmitted()
        }
      }, 500) // Longer delay for fallback method
    }
  }, [isSubmitted, isModified, isProcessing, onFormSubmitted])

  useEffect(() => {
    if (clearTimeoutRef.current) {
      clearTimeout(clearTimeoutRef.current)
    }

    const normalizedCurrentDate = normalizeDateForComparison(travelDate)

    const tripChanged =
      tripId !== previousTripIdRef.current && previousTripIdRef.current !== undefined
    const dateChanged =
      normalizedCurrentDate !== previousNormalizedDateRef.current &&
      previousNormalizedDateRef.current !== ''

    if (
      (tripChanged || dateChanged) &&
      currentFormSeatIds.length > 0 &&
      !saveInProgressRef.current
    ) {
      clearTimeoutRef.current = setTimeout(() => {
        if (!saveInProgressRef.current && isMountedRef.current) {
          setFieldValue([])
        }
      }, 100)
    }

    previousTripIdRef.current = tripId
    previousNormalizedDateRef.current = normalizedCurrentDate
  }, [tripId, travelDate, setFieldValue, currentFormSeatIds.length, normalizeDateForComparison])

  const savedSeatIds = useMemo(() => {
    if (!savedDocumentData?.bookedSeats) return []

    const bookedSeats = savedDocumentData.bookedSeats
    if (!Array.isArray(bookedSeats)) return []

    return bookedSeats.map(extractSeatId).filter((id): id is string => id !== null)
  }, [savedDocumentData])

  // Document change detection with processing state awareness
  useEffect(() => {
    const hasDocumentChanged =
      (lastUpdateTime && lastUpdateTime !== lastSavedStateRef.current.lastUpdateTime) ||
      JSON.stringify(savedSeatIds) !== JSON.stringify(lastSavedStateRef.current.savedSeats) ||
      (isSubmitted && !lastSavedStateRef.current.isSubmitted && !isModified)

    if (hasDocumentChanged && isMountedRef.current) {
      console.log('Document changed detected:', {
        lastUpdateTime,
        savedSeatsCount: savedSeatIds.length,
        isSubmitted,
        isModified,
        isProcessing,
      })

      lastSavedStateRef.current = {
        lastUpdateTime,
        savedSeats: savedSeatIds,
        isSubmitted,
      }

      if (savedSeatIds.length > 0 && currentFormSeatIds.length === 0) {
        const restoredValue = savedSeatIds.map((id) => ({ seat: id }))
        setFieldValue(restoredValue)
      }

      // Trigger revalidation when document changes AND processing is complete
      if (hasDocumentChanged && onFormSubmitted && !isProcessing) {
        console.log('Document changed, triggering revalidation')
        setTimeout(() => {
          onFormSubmitted()
        }, 100)
      }
    }
  }, [
    lastUpdateTime,
    savedSeatIds,
    isSubmitted,
    isModified,
    isProcessing,
    currentFormSeatIds,
    setFieldValue,
    onFormSubmitted,
  ])

  const toggleSeat = useCallback(
    (seatId: string) => {
      const newSelectedSeats = new Set(currentFormSeatIds)
      if (newSelectedSeats.has(seatId)) {
        newSelectedSeats.delete(seatId)
      } else {
        newSelectedSeats.add(seatId)
      }

      const newValue = Array.from(newSelectedSeats).map((id) => ({ seat: id }))
      setFieldValue(newValue)
    },
    [currentFormSeatIds, setFieldValue],
  )

  const removeSeat = useCallback(
    (seatId: string) => {
      const newSelectedSeats = new Set(currentFormSeatIds)
      newSelectedSeats.delete(seatId)

      const newValue = Array.from(newSelectedSeats).map((id) => ({ seat: id }))
      setFieldValue(newValue)
    },
    [currentFormSeatIds, setFieldValue],
  )

  const clearAll = useCallback(() => {
    setFieldValue([])
  }, [setFieldValue])

  useEffect(() => {
    if (onSeatSelect && currentFormSeatIds.length >= 0) {
      onSeatSelect(currentFormSeatIds)
    }
  }, [currentFormSeatIds, onSeatSelect])

  useEffect(() => {
    if (
      initialSelectedSeats &&
      initialSelectedSeats.length > 0 &&
      currentFormSeatIds.length === 0
    ) {
      const initialValue = initialSelectedSeats.map((id) => ({ seat: id }))
      setFieldValue(initialValue)
    }
  }, [initialSelectedSeats, currentFormSeatIds.length, setFieldValue])

  useEffect(() => {
    return () => {
      isMountedRef.current = false

      if (clearTimeoutRef.current) {
        clearTimeout(clearTimeoutRef.current)
      }
    }
  }, [])

  return {
    currentTicketId,
    selectedSeats: currentFormSeatIds,
    isProcessing,
    toggleSeat,
    removeSeat,
    clearAll,
  }
}
