import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useSeatFormState } from '@/components/SeatSelector/hooks/useSeatFormState'
import { useDocumentInfo, useField, useFormModified, useFormSubmitted } from '@payloadcms/ui'

vi.mock('@payloadcms/ui')

describe('useSeatFormState', () => {
  const mockUseDocumentInfo = vi.mocked(useDocumentInfo)
  const mockUseField = vi.mocked(useField)
  const mockUseFormModified = vi.mocked(useFormModified)
  const mockUseFormSubmitted = vi.mocked(useFormSubmitted)

  const mockSetValue = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()

    mockUseDocumentInfo.mockReturnValue({
      id: 'test-ticket-id',
      lastUpdateTime: Date.now(),
      savedDocumentData: null,
    })

    mockUseField.mockReturnValue({
      value: [],
      setValue: mockSetValue,
    })

    mockUseFormModified.mockReturnValue(false)
    mockUseFormSubmitted.mockReturnValue(false)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useSeatFormState({
      path: 'seats',
      tripId: 'trip-1',
      travelDate: '2024-01-15',
    }))

    expect(result.current.currentTicketId).toBe('test-ticket-id')
    expect(result.current.selectedSeats).toEqual([])
  })

  it('should extract seat IDs from field value array', () => {
    mockUseField.mockReturnValue({
      value: [{ seat: 'A1' }, { seat: 'A2' }],
      setValue: mockSetValue,
    })

    const { result } = renderHook(() => useSeatFormState({
      path: 'seats',
      tripId: 'trip-1',
      travelDate: '2024-01-15',
    }))

    expect(result.current.selectedSeats).toEqual(['A1', 'A2'])
  })

  it('should extract seat IDs from nested seats array', () => {
    mockUseField.mockReturnValue({
      value: { seats: [{ seat: 'B1' }, { seat: 'B2' }] },
      setValue: mockSetValue,
    })

    const { result } = renderHook(() => useSeatFormState({
      path: 'seats',
      tripId: 'trip-1',
      travelDate: '2024-01-15',
    }))

    expect(result.current.selectedSeats).toEqual(['B1', 'B2'])
  })

  it('should handle complex seat objects', () => {
    mockUseField.mockReturnValue({
      value: [
        { seat: { id: 'C1' } },
        { seat: { _id: 'C2' } },
        { id: 'C3' },
        'C4'
      ],
      setValue: mockSetValue,
    })

    const { result } = renderHook(() => useSeatFormState({
      path: 'seats',
      tripId: 'trip-1',
      travelDate: '2024-01-15',
    }))

    expect(result.current.selectedSeats).toEqual(['C1', 'C2', 'C3', 'C4'])
  })

  it('should toggle seat selection', () => {
    mockUseField.mockReturnValue({
      value: [{ seat: 'A1' }],
      setValue: mockSetValue,
    })

    const { result, rerender } = renderHook(() => useSeatFormState({
      path: 'seats',
      tripId: 'trip-1',
      travelDate: '2024-01-15',
    }))

    act(() => {
      result.current.toggleSeat('A2')
    })

    expect(mockSetValue).toHaveBeenCalledWith([
      { seat: 'A1' },
      { seat: 'A2' }
    ])

    // Simulate adding the new seat to the field value
    mockUseField.mockReturnValue({
      value: [{ seat: 'A1' }, { seat: 'A2' }],
      setValue: mockSetValue,
    })

    rerender()

    act(() => {
      result.current.toggleSeat('A1') // Remove existing seat
    })

    expect(mockSetValue).toHaveBeenCalledWith([{ seat: 'A2' }])
  })

  it('should remove seat', () => {
    mockUseField.mockReturnValue({
      value: [{ seat: 'A1' }, { seat: 'A2' }],
      setValue: mockSetValue,
    })

    const { result } = renderHook(() => useSeatFormState({
      path: 'seats',
      tripId: 'trip-1',
      travelDate: '2024-01-15',
    }))

    act(() => {
      result.current.removeSeat('A1')
    })

    expect(mockSetValue).toHaveBeenCalledWith([{ seat: 'A2' }])
  })

  it('should clear all seats', () => {
    mockUseField.mockReturnValue({
      value: [{ seat: 'A1' }, { seat: 'A2' }],
      setValue: mockSetValue,
    })

    const { result } = renderHook(() => useSeatFormState({
      path: 'seats',
      tripId: 'trip-1',
      travelDate: '2024-01-15',
    }))

    act(() => {
      result.current.clearAll()
    })

    expect(mockSetValue).toHaveBeenCalledWith([])
  })

  it('should call onSeatSelect when seats change', () => {
    const onSeatSelect = vi.fn()
    
    mockUseField.mockReturnValue({
      value: [{ seat: 'A1' }],
      setValue: mockSetValue,
    })

    renderHook(() => useSeatFormState({
      path: 'seats',
      tripId: 'trip-1',
      travelDate: '2024-01-15',
      onSeatSelect,
    }))

    expect(onSeatSelect).toHaveBeenCalledWith(['A1'])
  })

  it('should set initial selected seats', () => {
    mockUseField.mockReturnValue({
      value: [],
      setValue: mockSetValue,
    })

    renderHook(() => useSeatFormState({
      path: 'seats',
      tripId: 'trip-1',
      travelDate: '2024-01-15',
      initialSelectedSeats: ['B1', 'B2'],
    }))

    expect(mockSetValue).toHaveBeenCalledWith([
      { seat: 'B1' },
      { seat: 'B2' }
    ])
  })

  it('should clear seats when trip changes', () => {
    const { rerender } = renderHook(
      (props) => useSeatFormState(props),
      {
        initialProps: {
          path: 'seats',
          tripId: 'trip-1',
          travelDate: '2024-01-15',
        }
      }
    )

    mockUseField.mockReturnValue({
      value: [{ seat: 'A1' }],
      setValue: mockSetValue,
    })

    // Change trip
    rerender({
      path: 'seats',
      tripId: 'trip-2',
      travelDate: '2024-01-15',
    })

    act(() => {
      vi.advanceTimersByTime(100)
    })

    expect(mockSetValue).toHaveBeenCalledWith([])
  })

  it('should clear seats when date changes', () => {
    const { rerender } = renderHook(
      (props) => useSeatFormState(props),
      {
        initialProps: {
          path: 'seats',
          tripId: 'trip-1',
          travelDate: '2024-01-15',
        }
      }
    )

    mockUseField.mockReturnValue({
      value: [{ seat: 'A1' }],
      setValue: mockSetValue,
    })

    // Change date
    rerender({
      path: 'seats',
      tripId: 'trip-1',
      travelDate: '2024-01-16',
    })

    act(() => {
      vi.advanceTimersByTime(100)
    })

    expect(mockSetValue).toHaveBeenCalledWith([])
  })

  it('should not clear seats when save is in progress', () => {
    mockUseFormSubmitted.mockReturnValue(true)
    mockUseFormModified.mockReturnValue(true)

    const { rerender } = renderHook(
      (props) => useSeatFormState(props),
      {
        initialProps: {
          path: 'seats',
          tripId: 'trip-1',
          travelDate: '2024-01-15',
        }
      }
    )

    mockUseField.mockReturnValue({
      value: [{ seat: 'A1' }],
      setValue: mockSetValue,
    })

    // Change trip while save is in progress
    rerender({
      path: 'seats',
      tripId: 'trip-2',
      travelDate: '2024-01-15',
    })

    act(() => {
      vi.advanceTimersByTime(100)
    })

    // Should not clear seats
    expect(mockSetValue).not.toHaveBeenCalledWith([])
  })

  it('should restore seats from saved document data', () => {
    mockUseDocumentInfo.mockReturnValue({
      id: 'test-ticket-id',
      lastUpdateTime: Date.now(),
      savedDocumentData: {
        bookedSeats: [{ seat: 'saved-1' }, { seat: 'saved-2' }]
      },
    })

    mockUseField.mockReturnValue({
      value: [],
      setValue: mockSetValue,
    })

    renderHook(() => useSeatFormState({
      path: 'seats',
      tripId: 'trip-1',
      travelDate: '2024-01-15',
    }))

    expect(mockSetValue).toHaveBeenCalledWith([
      { seat: 'saved-1' },
      { seat: 'saved-2' }
    ])
  })

  it('should handle invalid dates gracefully', () => {
    const { rerender } = renderHook(
      (props) => useSeatFormState(props),
      {
        initialProps: {
          path: 'seats',
          tripId: 'trip-1',
          travelDate: 'invalid-date',
        }
      }
    )

    // Change to another invalid date - should not cause errors
    rerender({
      path: 'seats',
      tripId: 'trip-1',
      travelDate: 'another-invalid',
    })

    act(() => {
      vi.advanceTimersByTime(100)
    })

    // Should not crash
    expect(true).toBe(true)
  })

  it('should clean up timeouts on unmount', () => {
    const { unmount } = renderHook(() => useSeatFormState({
      path: 'seats',
      tripId: 'trip-1',
      travelDate: '2024-01-15',
    }))

    const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout')
    
    unmount()

    // Should clean up any pending timeouts
    expect(clearTimeoutSpy).toHaveBeenCalled()
    clearTimeoutSpy.mockRestore()
  })
})