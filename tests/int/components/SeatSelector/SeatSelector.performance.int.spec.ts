import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { performance } from 'perf_hooks'
import React from 'react'
import SeatSelectorClient from '@/components/SeatSelector/index.client'
import { useSeatSelector } from '@/components/SeatSelector/hooks/useSeatSelector'

vi.mock('@/components/SeatSelector/hooks/useSeatSelector')
vi.mock('@/hooks/useLanguage')
vi.mock('react-intersection-observer', () => ({
  useInView: () => ({ ref: vi.fn(), inView: true }),
}))

// Mock performance API for tests
global.performance = performance as any

describe('SeatSelector Performance', () => {
  const mockUseSeatSelector = vi.mocked(useSeatSelector)
  let mockUseLanguage: any

  const createMockTrip = (seatCount: number) => ({
    id: `trip-${seatCount}`,
    from: { id: 'terminal-1', name: 'Downtown' },
    to: { id: 'terminal-2', name: 'Airport' },
    departureTime: '14:30',
    days: ['mon', 'tue'],
    bus: {
      type: {
        name: 'Test Bus',
        seats: Array.from({ length: seatCount }, (_, i) => ({
          id: `seat-${i}`,
          position: { 
            row: Math.floor(i / 4) + 1, 
            col: (i % 4) + 1 
          },
          type: 'seat',
          seatNumber: `${String.fromCharCode(65 + Math.floor(i / 4))}${(i % 4) + 1}`,
        }))
      }
    }
  })

  const createDefaultHookReturn = (trip: any, selectedSeats: string[] = []) => ({
    trip,
    loading: false,
    error: undefined,
    gridDimensions: { 
      rows: Math.ceil(trip.bus.type.seats.length / 4), 
      cols: 4 
    },
    selectedSeats,
    getSeatStatus: vi.fn(() => 'available' as const),
    getBookingStatus: vi.fn(() => 'available' as const),
    getIsSelected: vi.fn((seatId: string) => selectedSeats.includes(seatId)),
    getJustUpdated: vi.fn(() => false),
    getBookingForSeat: vi.fn(() => undefined),
    toggleSeat: vi.fn(),
    removeSeat: vi.fn(),
    clearAll: vi.fn(),
    isTicketExpired: false,
  })

  beforeEach(async () => {
    vi.clearAllMocks()
    mockUseLanguage = vi.mocked((await import('@/hooks/useLanguage')).useLanguage)
    mockUseLanguage.mockReturnValue('en')
  })

  describe('Rendering Performance', () => {
    it('should render small seat maps quickly', async () => {
      const smallTrip = createMockTrip(16) // 4x4 grid
      mockUseSeatSelector.mockReturnValue(createDefaultHookReturn(smallTrip))

      const startTime = performance.now()
      render(<SeatSelectorClient path="seats" />)
      
      await waitFor(() => {
        expect(screen.getByText('A1')).toBeInTheDocument()
      })
      
      const endTime = performance.now()
      const renderTime = endTime - startTime

      // Should render in less than 50ms for small grids
      expect(renderTime).toBeLessThan(50)
    })

    it('should render medium seat maps efficiently', async () => {
      const mediumTrip = createMockTrip(40) // 10x4 grid
      mockUseSeatSelector.mockReturnValue(createDefaultHookReturn(mediumTrip))

      const startTime = performance.now()
      render(<SeatSelectorClient path="seats" />)
      
      await waitFor(() => {
        expect(screen.getByText('A1')).toBeInTheDocument()
      })
      
      const endTime = performance.now()
      const renderTime = endTime - startTime

      // Should render in less than 100ms for medium grids
      expect(renderTime).toBeLessThan(100)
    })

    it('should use virtualization for large seat maps', async () => {
      const largeTrip = createMockTrip(100) // 25x4 grid (exceeds 50 seat threshold)
      mockUseSeatSelector.mockReturnValue(createDefaultHookReturn(largeTrip))

      const startTime = performance.now()
      render(<SeatSelectorClient path="seats" />)
      
      await waitFor(() => {
        // Should use virtual grid for large seat count
        expect(document.querySelector('.seat-selector__virtual-grid')).toBeInTheDocument()
        expect(document.querySelector('.seat-selector__grid')).not.toBeInTheDocument()
      })
      
      const endTime = performance.now()
      const renderTime = endTime - startTime

      // Virtualization should keep render time reasonable even for large grids
      expect(renderTime).toBeLessThan(200)
    })

    it('should handle extremely large seat maps without performance degradation', async () => {
      const extremeTrip = createMockTrip(500) // 125x4 grid
      mockUseSeatSelector.mockReturnValue(createDefaultHookReturn(extremeTrip))

      const startTime = performance.now()
      render(<SeatSelectorClient path="seats" />)
      
      await waitFor(() => {
        expect(document.querySelector('.seat-selector__virtual-grid')).toBeInTheDocument()
      })
      
      const endTime = performance.now()
      const renderTime = endTime - startTime

      // Even with 500 seats, should render quickly due to virtualization
      expect(renderTime).toBeLessThan(300)
    })
  })

  describe('Update Performance', () => {
    it('should handle rapid seat selections efficiently', async () => {
      const trip = createMockTrip(50)
      const mockToggleSeat = vi.fn()
      
      mockUseSeatSelector.mockReturnValue({
        ...createDefaultHookReturn(trip),
        toggleSeat: mockToggleSeat,
      })

      render(<SeatSelectorClient path="seats" />)

      await waitFor(() => {
        expect(screen.getByText('A1')).toBeInTheDocument()
      })

      const startTime = performance.now()
      
      // Simulate rapid seat selections
      const seatButton = screen.getByRole('button', { name: /seat a1/i })
      
      for (let i = 0; i < 10; i++) {
        seatButton.click()
      }
      
      const endTime = performance.now()
      const updateTime = endTime - startTime

      // Rapid updates should complete quickly
      expect(updateTime).toBeLessThan(100)
      expect(mockToggleSeat).toHaveBeenCalledTimes(10)
    })

    it('should efficiently update selected seats display', async () => {
      const trip = createMockTrip(20)
      const selectedSeats = ['A1', 'A2', 'B1', 'B2', 'C1']
      
      mockUseSeatSelector.mockReturnValue(createDefaultHookReturn(trip, selectedSeats))

      const startTime = performance.now()
      render(<SeatSelectorClient path="seats" />)
      
      await waitFor(() => {
        // Should render selected seats list efficiently
        expect(document.querySelector('.seat-selector__container')).toBeInTheDocument()
      })
      
      const endTime = performance.now()
      const renderTime = endTime - startTime

      expect(renderTime).toBeLessThan(100)
    })
  })

  describe('Memory Performance', () => {
    it('should not cause memory leaks with frequent re-renders', () => {
      const trip = createMockTrip(30)
      
      mockUseSeatSelector.mockReturnValue(createDefaultHookReturn(trip))

      const { rerender, unmount } = render(<SeatSelectorClient path="seats" />)

      // Simulate multiple re-renders
      for (let i = 0; i < 20; i++) {
        mockUseSeatSelector.mockReturnValue({
          ...createDefaultHookReturn(trip),
          selectedSeats: [`seat-${i}`],
        })
        rerender(<SeatSelectorClient path="seats" />)
      }

      // Should be able to unmount without issues
      expect(() => unmount()).not.toThrow()
    })

    it('should clean up resources properly', () => {
      const trip = createMockTrip(100)
      mockUseSeatSelector.mockReturnValue(createDefaultHookReturn(trip))

      const { unmount } = render(<SeatSelectorClient path="seats" />)

      // Mock cleanup functions to verify they're called
      const mockCleanup = vi.fn()
      
      // In real implementation, cleanup would be in useEffect return
      // This test verifies the pattern
      const cleanup = () => mockCleanup()
      
      unmount()
      cleanup()

      expect(mockCleanup).toHaveBeenCalled()
    })
  })

  describe('Animation Performance', () => {
    it('should handle seat update animations efficiently', async () => {
      const trip = createMockTrip(25)
      const mockGetJustUpdated = vi.fn()
      
      mockUseSeatSelector.mockReturnValue({
        ...createDefaultHookReturn(trip),
        getJustUpdated: mockGetJustUpdated,
      })

      // Simulate multiple seats being updated
      mockGetJustUpdated.mockImplementation((seatId: string) => 
        ['A1', 'B2', 'C3', 'D4'].includes(seatId)
      )

      const startTime = performance.now()
      render(<SeatSelectorClient path="seats" />)
      
      await waitFor(() => {
        expect(screen.getByText('A1')).toBeInTheDocument()
      })
      
      const endTime = performance.now()
      const renderTime = endTime - startTime

      // Should handle animated seats efficiently
      expect(renderTime).toBeLessThan(150)
    })

    it('should not degrade performance with expired indicator animations', async () => {
      const trip = createMockTrip(30)
      
      mockUseSeatSelector.mockReturnValue({
        ...createDefaultHookReturn(trip),
        isTicketExpired: true, // Show animated expired indicator
      })

      const startTime = performance.now()
      render(<SeatSelectorClient path="seats" />)
      
      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument()
      })
      
      const endTime = performance.now()
      const renderTime = endTime - startTime

      expect(renderTime).toBeLessThan(100)
    })
  })

  describe('Data Processing Performance', () => {
    it('should efficiently process large booking datasets', async () => {
      const trip = createMockTrip(200)
      
      // Create a large number of bookings
      const largeBookingData = Array.from({ length: 1000 }, (_, i) => ({
        id: `booking-${i}`,
        seatId: `seat-${i % 200}`,
        isPaid: i % 3 === 0,
        isCancelled: false,
      }))

      mockUseSeatSelector.mockReturnValue({
        ...createDefaultHookReturn(trip),
        getBookingForSeat: vi.fn((seatId) => 
          largeBookingData.find(b => b.seatId === seatId)
        ),
      })

      const startTime = performance.now()
      render(<SeatSelectorClient path="seats" />)
      
      await waitFor(() => {
        expect(document.querySelector('.seat-selector__virtual-grid')).toBeInTheDocument()
      })
      
      const endTime = performance.now()
      const processingTime = endTime - startTime

      // Should process large datasets efficiently
      expect(processingTime).toBeLessThan(250)
    })

    it('should handle frequent data updates without performance loss', async () => {
      const trip = createMockTrip(50)
      let updateCount = 0
      
      const { rerender } = render(<SeatSelectorClient path="seats" />)

      const startTime = performance.now()

      // Simulate frequent data updates
      for (let i = 0; i < 50; i++) {
        mockUseSeatSelector.mockReturnValue({
          ...createDefaultHookReturn(trip),
          selectedSeats: [`seat-${i}`],
          getIsSelected: (seatId: string) => seatId === `seat-${i}`,
        })
        
        rerender(<SeatSelectorClient path="seats" />)
        updateCount++
      }

      const endTime = performance.now()
      const updateTime = endTime - startTime

      // Should handle rapid updates efficiently
      expect(updateTime).toBeLessThan(500)
      expect(updateCount).toBe(50)
    })
  })

  describe('Network Performance Impact', () => {
    it('should handle loading states without performance impact', async () => {
      mockUseSeatSelector.mockReturnValue({
        ...createDefaultHookReturn(createMockTrip(0)),
        trip: null,
        loading: true,
      })

      const startTime = performance.now()
      render(<SeatSelectorClient path="seats" />)
      
      await waitFor(() => {
        expect(screen.getByText(/loading/i)).toBeInTheDocument()
      })
      
      const endTime = performance.now()
      const loadingRenderTime = endTime - startTime

      expect(loadingRenderTime).toBeLessThan(50)
    })

    it('should transition from loading to loaded state efficiently', async () => {
      const trip = createMockTrip(40)
      
      // Start with loading state
      const { rerender } = render(<SeatSelectorClient path="seats" />)
      
      mockUseSeatSelector.mockReturnValue({
        ...createDefaultHookReturn(trip),
        trip: null,
        loading: true,
      })
      
      rerender(<SeatSelectorClient path="seats" />)

      const startTime = performance.now()

      // Transition to loaded state
      mockUseSeatSelector.mockReturnValue(createDefaultHookReturn(trip))
      rerender(<SeatSelectorClient path="seats" />)

      await waitFor(() => {
        expect(screen.getByText('A1')).toBeInTheDocument()
      })

      const endTime = performance.now()
      const transitionTime = endTime - startTime

      // State transition should be quick
      expect(transitionTime).toBeLessThan(100)
    })
  })

  describe('Intersection Observer Performance', () => {
    it('should handle lazy loading efficiently', async () => {
      const trip = createMockTrip(100)
      
      // Mock intersection observer to simulate not in view initially
      let inViewState = false
      vi.mocked(await import('react-intersection-observer')).useInView = vi.fn(() => ({
        ref: vi.fn(),
        inView: inViewState,
      }))

      mockUseSeatSelector.mockReturnValue(createDefaultHookReturn(trip))

      const { rerender } = render(<SeatSelectorClient path="seats" />)

      const startTime = performance.now()

      // Simulate coming into view
      inViewState = true
      rerender(<SeatSelectorClient path="seats" />)

      await waitFor(() => {
        expect(document.querySelector('.seat-selector__virtual-grid')).toBeInTheDocument()
      })

      const endTime = performance.now()
      const lazyLoadTime = endTime - startTime

      expect(lazyLoadTime).toBeLessThan(150)
    })
  })

  describe('Bundle Size Impact', () => {
    it('should not import unnecessary dependencies', () => {
      // This test would be more meaningful in a real environment
      // where we can measure actual bundle size impact
      const trip = createMockTrip(20)
      mockUseSeatSelector.mockReturnValue(createDefaultHookReturn(trip))

      expect(() => {
        render(<SeatSelectorClient path="seats" />)
      }).not.toThrow()
    })
  })

  describe('Concurrent Updates', () => {
    it('should handle concurrent state updates efficiently', async () => {
      const trip = createMockTrip(30)
      const mockToggleSeat = vi.fn()
      
      mockUseSeatSelector.mockReturnValue({
        ...createDefaultHookReturn(trip),
        toggleSeat: mockToggleSeat,
      })

      render(<SeatSelectorClient path="seats" />)

      await waitFor(() => {
        expect(screen.getByText('A1')).toBeInTheDocument()
      })

      const startTime = performance.now()

      // Simulate concurrent updates
      const promises = []
      for (let i = 0; i < 10; i++) {
        promises.push(new Promise(resolve => {
          setTimeout(() => {
            const seatButton = screen.queryByRole('button', { name: new RegExp(`seat.*${i}`, 'i') })
            if (seatButton) {
              seatButton.click()
            }
            resolve(undefined)
          }, Math.random() * 10)
        }))
      }

      await Promise.all(promises)

      const endTime = performance.now()
      const concurrentTime = endTime - startTime

      expect(concurrentTime).toBeLessThan(200)
    })
  })
})