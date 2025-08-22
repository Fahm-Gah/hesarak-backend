'use client'

import { useState, useCallback, useRef } from 'react'
import { PERFORMANCE_CONFIG } from '../constants'

export const useSeatAnimations = () => {
  const [recentlyUpdatedSeats, setRecentlyUpdatedSeats] = useState<Set<string>>(new Set())
  const updateTimeoutRef = useRef<Map<string, NodeJS.Timeout>>(new Map())
  const isMountedRef = useRef(true)

  const markSeatAsUpdated = useCallback((seatId: string) => {
    if (!isMountedRef.current) return

    setRecentlyUpdatedSeats((prev) => new Set(prev).add(seatId))

    const existingTimeout = updateTimeoutRef.current.get(seatId)
    if (existingTimeout) {
      clearTimeout(existingTimeout)
    }

    const newTimeout = setTimeout(() => {
      if (isMountedRef.current) {
        setRecentlyUpdatedSeats((prev) => {
          const newSet = new Set(prev)
          newSet.delete(seatId)
          return newSet
        })
      }
      updateTimeoutRef.current.delete(seatId)
    }, PERFORMANCE_CONFIG.SEAT_UPDATE_ANIMATION_DURATION)

    updateTimeoutRef.current.set(seatId, newTimeout)
  }, [])

  const getJustUpdated = useCallback(
    (seatId: string): boolean => {
      return recentlyUpdatedSeats.has(seatId)
    },
    [recentlyUpdatedSeats],
  )

  const clearAnimations = useCallback(() => {
    setRecentlyUpdatedSeats(new Set())
    updateTimeoutRef.current.forEach((timeout) => clearTimeout(timeout))
    updateTimeoutRef.current.clear()
  }, [])

  return {
    getJustUpdated,
    markSeatAsUpdated,
    clearAnimations,
  }
}
