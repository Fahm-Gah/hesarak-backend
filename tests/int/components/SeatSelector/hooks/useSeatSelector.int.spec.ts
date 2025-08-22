import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useSeatSelector } from '@/components/SeatSelector/hooks/useSeatSelector'

// Mock all the sub-hooks
vi.mock('@/components/SeatSelector/hooks/useBookingData')
vi.mock('@/components/SeatSelector/hooks/useSeatFormState')
vi.mock('@/components/SeatSelector/hooks/useSeatAnimations')

describe('useSeatSelector (Integration)', () => {
  let mockUseBookingData: any
  let mockUseSeatFormState: any
  let mockUseSeatAnimations: any

  const mockTrip = {
    id: 'trip-1',
    bus: {
      type: {
        seats: [
          { id: 'A1', position: { row: 1, col: 1 }, type: 'seat', seatNumber: 'A1' },
          { id: 'A2', position: { row: 1, col: 2 }, type: 'seat', seatNumber: 'A2' },
          { id: 'B1', position: { row: 2, col: 1 }, type: 'seat', seatNumber: 'B1' },
          { id: 'B2', position: { row: 2, col: 2 }, type: 'seat', seatNumber: 'B2' },
        ]
      }
    }
  }

  const mockBookings = [
    {
      id: 'booking-1',
      isPaid: true,
      isCancelled: false,
      bookedSeats: [{ seat: 'A1' }]
    },
    {
      id: 'booking-2',
      isPaid: false,
      isCancelled: false,
      paymentDeadline: new Date(Date.now() - 86400000).toISOString(), // Expired
      bookedSeats: [{ seat: 'A2' }]
    }
  ]

  beforeEach(async () => {
    vi.clearAllMocks()

    // Setup async imports
    mockUseBookingData = vi.mocked((await import('@/components/SeatSelector/hooks/useBookingData')).useBookingData)
    mockUseSeatFormState = vi.mocked((await import('@/components/SeatSelector/hooks/useSeatFormState')).useSeatFormState)
    mockUseSeatAnimations = vi.mocked((await import('@/components/SeatSelector/hooks/useSeatAnimations')).useSeatAnimations)

    mockUseBookingData.mockReturnValue({
      trip: mockTrip as any,
      bookings: mockBookings as any,
      isLoading: false,
      error: undefined,
      mutateBookings: vi.fn(),
    })

    mockUseSeatFormState.mockReturnValue({
      currentTicketId: 'current-ticket',
      selectedSeats: ['B1'],
      toggleSeat: vi.fn(),
      removeSeat: vi.fn(),
      clearAll: vi.fn(),
    })

    mockUseSeatAnimations.mockReturnValue({
      getJustUpdated: vi.fn(() => false),
      markSeatAsUpdated: vi.fn(),
    })
  })

  it('should integrate all hooks correctly', () => {
    const { result } = renderHook(() => useSeatSelector({
      path: 'seats',
      tripId: 'trip-1',
      travelDate: '2024-01-15',
    }))

    expect(result.current.trip).toEqual(mockTrip)
    expect(result.current.selectedSeats).toEqual(['B1'])
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBeUndefined()
  })

  it('should calculate grid dimensions correctly', () => {
    const { result } = renderHook(() => useSeatSelector({
      path: 'seats',
      tripId: 'trip-1',
      travelDate: '2024-01-15',
    }))

    expect(result.current.gridDimensions).toEqual({ rows: 2, cols: 2 })
  })

  it('should use server-computed grid dimensions when available', () => {
    const { result } = renderHook(() => useSeatSelector({
      path: 'seats',
      tripId: 'trip-1',
      travelDate: '2024-01-15',
      serverData: {
        trip: mockTrip as any,
        bookings: mockBookings as any,
        error: null,
        tripId: 'trip-1',
        travelDate: '2024-01-15',
        gridDimensions: { rows: 5, cols: 4 }, // Pre-computed
      }
    }))

    expect(result.current.gridDimensions).toEqual({ rows: 5, cols: 4 })
  })

  it('should return correct seat statuses', () => {
    const { result } = renderHook(() => useSeatSelector({
      path: 'seats',
      tripId: 'trip-1',
      travelDate: '2024-01-15',
    }))

    expect(result.current.getSeatStatus('A1')).toBe('booked') // Paid booking
    expect(result.current.getSeatStatus('A2')).toBe('available') // Expired booking
    expect(result.current.getSeatStatus('B1')).toBe('selected') // Selected seat
    expect(result.current.getSeatStatus('B2')).toBe('available') // Available seat
  })

  it('should return correct booking statuses', () => {
    const { result } = renderHook(() => useSeatSelector({
      path: 'seats',
      tripId: 'trip-1',
      travelDate: '2024-01-15',
    }))

    expect(result.current.getBookingStatus('A1')).toBe('booked')
    expect(result.current.getBookingStatus('A2')).toBe('available') // Expired
    expect(result.current.getBookingStatus('B1')).toBe('available')
    expect(result.current.getBookingStatus('B2')).toBe('available')
  })

  it('should handle current ticket seats', () => {
    const bookingsWithCurrentTicket = [
      ...mockBookings,
      {
        id: 'current-ticket',
        isPaid: false,
        isCancelled: false,
        bookedSeats: [{ seat: 'B2' }]
      }
    ]

    mockUseBookingData.mockReturnValue({
      trip: mockTrip as any,
      bookings: bookingsWithCurrentTicket as any,
      isLoading: false,
      error: undefined,
      mutateBookings: vi.fn(),
    })

    const { result } = renderHook(() => useSeatSelector({
      path: 'seats',
      tripId: 'trip-1',
      travelDate: '2024-01-15',
    }))

    expect(result.current.getSeatStatus('B2')).toBe('currentTicket')
    expect(result.current.getBookingStatus('B2')).toBe('currentTicket')
  })

  it('should check if seat is selected', () => {
    const { result } = renderHook(() => useSeatSelector({
      path: 'seats',
      tripId: 'trip-1',
      travelDate: '2024-01-15',
    }))

    expect(result.current.getIsSelected('B1')).toBe(true)
    expect(result.current.getIsSelected('B2')).toBe(false)
  })

  it('should check if seat is just updated', () => {
    const mockGetJustUpdated = vi.fn()
    mockUseSeatAnimations.mockReturnValue({
      getJustUpdated: mockGetJustUpdated,
      markSeatAsUpdated: vi.fn(),
    })

    mockGetJustUpdated.mockReturnValue(true)

    const { result } = renderHook(() => useSeatSelector({
      path: 'seats',
      tripId: 'trip-1',
      travelDate: '2024-01-15',
    }))

    expect(result.current.getJustUpdated('A1')).toBe(true)
    expect(mockGetJustUpdated).toHaveBeenCalledWith('A1')
  })

  it('should get booking for seat', () => {
    const { result } = renderHook(() => useSeatSelector({
      path: 'seats',
      tripId: 'trip-1',
      travelDate: '2024-01-15',
    }))

    const booking = result.current.getBookingForSeat('A1')
    expect(booking).toEqual(mockBookings[0])

    expect(result.current.getBookingForSeat('B2')).toBeUndefined()
  })

  it('should handle seat actions with animations', () => {
    const mockToggleSeat = vi.fn()
    const mockMarkSeatAsUpdated = vi.fn()

    mockUseSeatFormState.mockReturnValue({
      currentTicketId: 'current-ticket',
      selectedSeats: ['B1'],
      toggleSeat: mockToggleSeat,
      removeSeat: vi.fn(),
      clearAll: vi.fn(),
    })

    mockUseSeatAnimations.mockReturnValue({
      getJustUpdated: vi.fn(() => false),
      markSeatAsUpdated: mockMarkSeatAsUpdated,
    })

    const { result } = renderHook(() => useSeatSelector({
      path: 'seats',
      tripId: 'trip-1',
      travelDate: '2024-01-15',
    }))

    act(() => {
      result.current.toggleSeat('A2')
    })

    expect(mockToggleSeat).toHaveBeenCalledWith('A2')
    expect(mockMarkSeatAsUpdated).toHaveBeenCalledWith('A2')
  })

  it('should handle remove seat with animations', () => {
    const mockRemoveSeat = vi.fn()
    const mockMarkSeatAsUpdated = vi.fn()

    mockUseSeatFormState.mockReturnValue({
      currentTicketId: 'current-ticket',
      selectedSeats: ['B1'],
      toggleSeat: vi.fn(),
      removeSeat: mockRemoveSeat,
      clearAll: vi.fn(),
    })

    mockUseSeatAnimations.mockReturnValue({
      getJustUpdated: vi.fn(() => false),
      markSeatAsUpdated: mockMarkSeatAsUpdated,
    })

    const { result } = renderHook(() => useSeatSelector({
      path: 'seats',
      tripId: 'trip-1',
      travelDate: '2024-01-15',
    }))

    act(() => {
      result.current.removeSeat('B1')
    })

    expect(mockRemoveSeat).toHaveBeenCalledWith('B1')
    expect(mockMarkSeatAsUpdated).toHaveBeenCalledWith('B1')
  })

  it('should handle clear all with animations', () => {
    const mockClearAll = vi.fn()
    const mockMarkSeatAsUpdated = vi.fn()

    mockUseSeatFormState.mockReturnValue({
      currentTicketId: 'current-ticket',
      selectedSeats: ['B1', 'B2'],
      toggleSeat: vi.fn(),
      removeSeat: vi.fn(),
      clearAll: mockClearAll,
    })

    mockUseSeatAnimations.mockReturnValue({
      getJustUpdated: vi.fn(() => false),
      markSeatAsUpdated: mockMarkSeatAsUpdated,
    })

    const { result } = renderHook(() => useSeatSelector({
      path: 'seats',
      tripId: 'trip-1',
      travelDate: '2024-01-15',
    }))

    act(() => {
      result.current.clearAll()
    })

    expect(mockClearAll).toHaveBeenCalled()
    expect(mockMarkSeatAsUpdated).toHaveBeenCalledWith('B1')
    expect(mockMarkSeatAsUpdated).toHaveBeenCalledWith('B2')
  })

  it('should detect expired tickets', () => {
    const { result } = renderHook(() => useSeatSelector({
      path: 'seats',
      tripId: 'trip-1',
      travelDate: '2024-01-15',
    }))

    expect(result.current.isTicketExpired).toBe(true) // Has expired booking
  })

  it('should use server-computed expired tickets when available', () => {
    const { result } = renderHook(() => useSeatSelector({
      path: 'seats',
      tripId: 'trip-1',
      travelDate: '2024-01-15',
      serverData: {
        trip: mockTrip as any,
        bookings: [],
        error: null,
        tripId: 'trip-1',
        travelDate: '2024-01-15',
        hasExpiredTickets: false, // Server says no expired tickets
      }
    }))

    expect(result.current.isTicketExpired).toBe(false)
  })

  it('should handle loading state', () => {
    mockUseBookingData.mockReturnValue({
      trip: null,
      bookings: [],
      isLoading: true,
      error: undefined,
      mutateBookings: vi.fn(),
    })

    const { result } = renderHook(() => useSeatSelector({
      path: 'seats',
      tripId: 'trip-1',
      travelDate: '2024-01-15',
    }))

    expect(result.current.loading).toBe(true)
  })

  it('should handle error state', () => {
    mockUseBookingData.mockReturnValue({
      trip: null,
      bookings: [],
      isLoading: false,
      error: 'Failed to fetch trip data',
      mutateBookings: vi.fn(),
    })

    const { result } = renderHook(() => useSeatSelector({
      path: 'seats',
      tripId: 'trip-1',
      travelDate: '2024-01-15',
    }))

    expect(result.current.error).toBe('Failed to fetch trip data')
  })

  it('should prioritize server error over hook error', () => {
    mockUseBookingData.mockReturnValue({
      trip: null,
      bookings: [],
      isLoading: false,
      error: 'Hook error',
      mutateBookings: vi.fn(),
    })

    const { result } = renderHook(() => useSeatSelector({
      path: 'seats',
      tripId: 'trip-1',
      travelDate: '2024-01-15',
      serverData: {
        trip: null,
        bookings: [],
        error: 'Server error',
        tripId: 'trip-1',
        travelDate: '2024-01-15',
      }
    }))

    expect(result.current.error).toBe('Server error')
  })

  it('should handle string and number currentTicketId types', () => {
    // Test with string ID
    mockUseSeatFormState.mockReturnValue({
      currentTicketId: 'string-ticket-id',
      selectedSeats: [],
      toggleSeat: vi.fn(),
      removeSeat: vi.fn(),
      clearAll: vi.fn(),
    })

    const { result: stringResult } = renderHook(() => useSeatSelector({
      path: 'seats',
      tripId: 'trip-1',
      travelDate: '2024-01-15',
    }))

    expect(stringResult.current.getSeatStatus('A1')).toBeDefined()

    // Test with number ID
    mockUseSeatFormState.mockReturnValue({
      currentTicketId: 12345,
      selectedSeats: [],
      toggleSeat: vi.fn(),
      removeSeat: vi.fn(),
      clearAll: vi.fn(),
    })

    const { result: numberResult } = renderHook(() => useSeatSelector({
      path: 'seats',
      tripId: 'trip-1',
      travelDate: '2024-01-15',
    }))

    expect(numberResult.current.getSeatStatus('A1')).toBeDefined()
  })
})