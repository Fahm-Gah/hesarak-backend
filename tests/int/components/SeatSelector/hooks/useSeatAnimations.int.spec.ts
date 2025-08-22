import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useSeatAnimations } from '@/components/SeatSelector/hooks/useSeatAnimations'

describe('useSeatAnimations', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.runOnlyPendingTimers()
    vi.useRealTimers()
  })

  it('should initialize with empty state', () => {
    const { result } = renderHook(() => useSeatAnimations())

    expect(result.current.getJustUpdated('seat-1')).toBe(false)
  })

  it('should mark seat as updated', () => {
    const { result } = renderHook(() => useSeatAnimations())

    act(() => {
      result.current.markSeatAsUpdated('seat-1')
    })

    expect(result.current.getJustUpdated('seat-1')).toBe(true)
  })

  it('should clear animation after timeout', () => {
    const { result } = renderHook(() => useSeatAnimations())

    act(() => {
      result.current.markSeatAsUpdated('seat-1')
    })

    expect(result.current.getJustUpdated('seat-1')).toBe(true)

    act(() => {
      vi.advanceTimersByTime(600) // SEAT_UPDATE_ANIMATION_DURATION
    })

    expect(result.current.getJustUpdated('seat-1')).toBe(false)
  })

  it('should handle multiple seats independently', () => {
    const { result } = renderHook(() => useSeatAnimations())

    act(() => {
      result.current.markSeatAsUpdated('seat-1')
      result.current.markSeatAsUpdated('seat-2')
    })

    expect(result.current.getJustUpdated('seat-1')).toBe(true)
    expect(result.current.getJustUpdated('seat-2')).toBe(true)

    act(() => {
      vi.advanceTimersByTime(300)
    })

    // Both should still be animated
    expect(result.current.getJustUpdated('seat-1')).toBe(true)
    expect(result.current.getJustUpdated('seat-2')).toBe(true)

    act(() => {
      vi.advanceTimersByTime(300) // Total 600ms
    })

    // Both should be cleared
    expect(result.current.getJustUpdated('seat-1')).toBe(false)
    expect(result.current.getJustUpdated('seat-2')).toBe(false)
  })

  it('should reset timeout when seat is marked again', () => {
    const { result } = renderHook(() => useSeatAnimations())

    act(() => {
      result.current.markSeatAsUpdated('seat-1')
    })

    act(() => {
      vi.advanceTimersByTime(300) // Half the timeout
    })

    expect(result.current.getJustUpdated('seat-1')).toBe(true)

    // Mark again, should reset timeout
    act(() => {
      result.current.markSeatAsUpdated('seat-1')
    })

    act(() => {
      vi.advanceTimersByTime(300) // Another 300ms, total 600ms from first call
    })

    // Should still be animated because timeout was reset
    expect(result.current.getJustUpdated('seat-1')).toBe(true)

    act(() => {
      vi.advanceTimersByTime(300) // Total 600ms from second call
    })

    // Now should be cleared
    expect(result.current.getJustUpdated('seat-1')).toBe(false)
  })

  it('should clear all animations', () => {
    const { result } = renderHook(() => useSeatAnimations())

    act(() => {
      result.current.markSeatAsUpdated('seat-1')
      result.current.markSeatAsUpdated('seat-2')
      result.current.markSeatAsUpdated('seat-3')
    })

    expect(result.current.getJustUpdated('seat-1')).toBe(true)
    expect(result.current.getJustUpdated('seat-2')).toBe(true)
    expect(result.current.getJustUpdated('seat-3')).toBe(true)

    act(() => {
      result.current.clearAnimations()
    })

    expect(result.current.getJustUpdated('seat-1')).toBe(false)
    expect(result.current.getJustUpdated('seat-2')).toBe(false)
    expect(result.current.getJustUpdated('seat-3')).toBe(false)
  })

  it('should clean up timeouts on unmount', () => {
    const { result, unmount } = renderHook(() => useSeatAnimations())

    act(() => {
      result.current.markSeatAsUpdated('seat-1')
      result.current.markSeatAsUpdated('seat-2')
    })

    // The hook should clean up automatically, but we can't easily test internal cleanup
    // This test verifies the unmount doesn't cause errors
    expect(() => unmount()).not.toThrow()
  })

  it('should not update state if component is unmounted', () => {
    const { result, unmount } = renderHook(() => useSeatAnimations())

    act(() => {
      result.current.markSeatAsUpdated('seat-1')
    })

    unmount()

    // Advance timers after unmount
    act(() => {
      vi.advanceTimersByTime(600)
    })

    // Should not throw or cause issues
    expect(vi.getTimerCount()).toBe(0)
  })

  it('should handle edge cases', () => {
    const { result } = renderHook(() => useSeatAnimations())

    // Test with empty string
    act(() => {
      result.current.markSeatAsUpdated('')
    })

    expect(result.current.getJustUpdated('')).toBe(true)

    // Test with special characters
    act(() => {
      result.current.markSeatAsUpdated('seat-with-special-chars-123!@#')
    })

    expect(result.current.getJustUpdated('seat-with-special-chars-123!@#')).toBe(true)
  })

  it('should maintain consistent behavior under rapid updates', () => {
    const { result } = renderHook(() => useSeatAnimations())

    // Rapidly mark the same seat multiple times
    act(() => {
      for (let i = 0; i < 10; i++) {
        result.current.markSeatAsUpdated('rapid-seat')
      }
    })

    expect(result.current.getJustUpdated('rapid-seat')).toBe(true)

    // Should still clear after timeout
    act(() => {
      vi.advanceTimersByTime(600)
    })

    expect(result.current.getJustUpdated('rapid-seat')).toBe(false)
  })

  it('should handle large number of seats efficiently', () => {
    const { result } = renderHook(() => useSeatAnimations())

    // Mark many seats
    act(() => {
      for (let i = 0; i < 100; i++) {
        result.current.markSeatAsUpdated(`seat-${i}`)
      }
    })

    // Check all are marked
    for (let i = 0; i < 100; i++) {
      expect(result.current.getJustUpdated(`seat-${i}`)).toBe(true)
    }

    // Clear all at once
    act(() => {
      result.current.clearAnimations()
    })

    // Check all are cleared
    for (let i = 0; i < 100; i++) {
      expect(result.current.getJustUpdated(`seat-${i}`)).toBe(false)
    }
  })
})