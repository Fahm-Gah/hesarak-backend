import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useBookingData } from '@/components/SeatSelector/hooks/useBookingData'

// Mock SWR
vi.mock('swr', () => ({
  default: vi.fn(),
}))

describe('useBookingData', () => {
  let mockUseSWR: any

  beforeEach(async () => {
    vi.clearAllMocks()
    global.fetch = vi.fn()
    mockUseSWR = (await import('swr')).default as any
  })

  it('should initialize with default state', () => {
    mockUseSWR.mockReturnValue({
      data: null,
      error: null,
      isLoading: false,
      mutate: vi.fn(),
    })

    const { result } = renderHook(() => useBookingData({
      tripId: 'trip-1',
      travelDate: '2024-01-15',
    }))

    expect(result.current.trip).toBeNull()
    expect(result.current.bookings).toEqual([])
    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBeUndefined()
  })

  it('should use server data as fallback', () => {
    const mockTrip = { id: 'trip-1', bus: { type: { seats: [] } } }
    const mockBookings = [{ id: 'booking-1' }]

    mockUseSWR.mockReturnValue({
      data: mockTrip,
      error: null,
      isLoading: false,
      mutate: vi.fn(),
    })

    const { result } = renderHook(() => useBookingData({
      tripId: 'trip-1',
      travelDate: '2024-01-15',
      serverData: {
        trip: mockTrip as any,
        bookings: mockBookings as any,
      }
    }))

    expect(result.current.trip).toEqual(mockTrip)
  })

  it('should handle loading states', () => {
    mockUseSWR
      .mockReturnValueOnce({
        data: null,
        error: null,
        isLoading: true,
        mutate: vi.fn(),
      })
      .mockReturnValueOnce({
        data: null,
        error: null,
        isLoading: true,
        mutate: vi.fn(),
      })

    const { result } = renderHook(() => useBookingData({
      tripId: 'trip-1',
      travelDate: '2024-01-15',
    }))

    expect(result.current.isLoading).toBe(true)
  })

  it('should handle errors', () => {
    mockUseSWR
      .mockReturnValueOnce({
        data: null,
        error: { message: 'Trip fetch failed' },
        isLoading: false,
        mutate: vi.fn(),
      })
      .mockReturnValueOnce({
        data: null,
        error: null,
        isLoading: false,
        mutate: vi.fn(),
      })

    const { result } = renderHook(() => useBookingData({
      tripId: 'trip-1',
      travelDate: '2024-01-15',
    }))

    expect(result.current.error).toBe('Trip fetch failed')
  })

  it('should not fetch when tripId is missing', () => {
    mockUseSWR.mockReturnValue({
      data: null,
      error: null,
      isLoading: false,
      mutate: vi.fn(),
    })

    renderHook(() => useBookingData({
      travelDate: '2024-01-15',
    }))

    expect(mockUseSWR).toHaveBeenCalledWith(null, expect.any(Function), expect.any(Object))
  })

  it('should create correct date filter query', () => {
    mockUseSWR.mockReturnValue({
      data: null,
      error: null,
      isLoading: false,
      mutate: vi.fn(),
    })

    renderHook(() => useBookingData({
      tripId: 'trip-1',
      travelDate: '2024-01-15T10:30:00Z',
    }))

    // Check that SWR was called with correct booking query
    const bookingCall = mockUseSWR.mock.calls.find(call => 
      typeof call[0] === 'string' && call[0]?.includes('tickets')
    )
    
    expect(bookingCall).toBeDefined()
    expect(bookingCall![0]).toContain('where[trip][equals]=trip-1')
    expect(bookingCall![0]).toContain('where[date][greater_than_equal]=')
    expect(bookingCall![0]).toContain('where[date][less_than_equal]=')
  })

  it('should handle invalid travel date gracefully', () => {
    mockUseSWR.mockReturnValue({
      data: null,
      error: null,
      isLoading: false,
      mutate: vi.fn(),
    })

    renderHook(() => useBookingData({
      tripId: 'trip-1',
      travelDate: 'invalid-date',
    }))

    // Should pass null as key when date is invalid
    const swrCalls = mockUseSWR.mock.calls
    const bookingCall = swrCalls.find(call => call[0] === null)
    
    expect(bookingCall).toBeDefined()
    expect(bookingCall![0]).toBeNull()
  })

  describe('fetcher function', () => {
    it('should handle successful fetch', async () => {
      const mockData = { id: 'test' }
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockData),
      })

      // Access the fetcher function
      mockUseSWR.mockReturnValue({
        data: null,
        error: null,
        isLoading: false,
        mutate: vi.fn(),
      })

      renderHook(() => useBookingData({ tripId: 'trip-1' }))
      
      const fetcher = mockUseSWR.mock.calls[0][1]
      const result = await fetcher('/test-url')

      expect(result).toEqual(mockData)
      expect(global.fetch).toHaveBeenCalledWith('/test-url', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      })
    })

    it('should handle fetch errors', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        text: () => Promise.resolve('Resource not found'),
      })
      
      global.fetch = mockFetch

      mockUseSWR.mockReturnValue({
        data: null,
        error: null,
        isLoading: false,
        mutate: vi.fn(),
      })

      renderHook(() => useBookingData({ tripId: 'trip-1' }))
      
      const fetcher = mockUseSWR.mock.calls[0][1]
      
      // Use a unique URL to avoid cache hits
      await expect(fetcher('/test-error-url')).rejects.toThrow('Resource not found')
    })

    it('should use cache for repeated requests', async () => {
      const mockData = { id: 'cached' }
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockData),
      })

      mockUseSWR.mockReturnValue({
        data: null,
        error: null,
        isLoading: false,
        mutate: vi.fn(),
      })

      renderHook(() => useBookingData({ tripId: 'trip-1' }))
      
      const fetcher = mockUseSWR.mock.calls[0][1]
      
      // First call
      await fetcher('/cached-url')
      expect(global.fetch).toHaveBeenCalledTimes(1)
      
      // Second call should use cache
      await fetcher('/cached-url')
      expect(global.fetch).toHaveBeenCalledTimes(1)
    })
  })
})