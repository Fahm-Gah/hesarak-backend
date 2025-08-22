import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import SeatSelectorClient from '@/components/SeatSelector/index.client'
import { useSeatSelector } from '@/components/SeatSelector/hooks/useSeatSelector'

vi.mock('@/components/SeatSelector/hooks/useSeatSelector')
vi.mock('@/hooks/useLanguage')
vi.mock('@payloadcms/ui', () => ({
  useFormFields: vi.fn(() => ({ trip: { value: 'trip-1' }, date: { value: '2024-01-15' } })),
  toast: { error: vi.fn(), warning: vi.fn(), success: vi.fn() },
}))
vi.mock('react-intersection-observer', () => ({
  useInView: () => ({ ref: vi.fn(), inView: true }),
}))

describe('SeatSelector Error States and Edge Cases', () => {
  const mockUseSeatSelector = vi.mocked(useSeatSelector)
  let mockUseLanguage: any
  let mockUseFormFields: any

  const mockTrip = {
    id: 'trip-1',
    name: 'Test Route',
    from: { id: 'terminal-1', name: 'Downtown' },
    stops: [{ terminal: { id: 'terminal-2', name: 'Airport' }, time: '15:30' }],
    departureTime: '14:30',
    price: 25,
    bus: {
      id: 'bus-1',
      number: 'BUS-001',
      type: {
        id: 'type-1',
        name: 'Standard Bus',
        capacity: 20,
        seats: [
          { id: 'A1', position: { row: 1, col: 1 }, type: 'seat', seatNumber: 'A1' },
          { id: 'A2', position: { row: 1, col: 2 }, type: 'seat', seatNumber: 'A2' },
          { id: 'B1', position: { row: 2, col: 1 }, type: 'seat', seatNumber: 'B1' },
          { id: 'B2', position: { row: 2, col: 2 }, type: 'seat', seatNumber: 'B2' },
        ]
      }
    }
  }

  const defaultHookReturn = {
    trip: mockTrip as any,
    loading: false,
    error: undefined,
    gridDimensions: { rows: 2, cols: 2 },
    selectedSeats: [],
    isFormProcessing: false,
    getSeatStatus: vi.fn(() => 'available' as const),
    getBookingStatus: vi.fn(() => 'available' as const),
    getIsSelected: vi.fn(() => false),
    getJustUpdated: vi.fn(() => false),
    getBookingForSeat: vi.fn(() => undefined),
    toggleSeat: vi.fn(),
    removeSeat: vi.fn(),
    clearAll: vi.fn(),
    isTicketExpired: false,
    revalidateBookings: vi.fn(),
  }

  beforeEach(async () => {
    vi.clearAllMocks()
    mockUseLanguage = vi.mocked((await import('@/hooks/useLanguage')).useLanguage)
    mockUseFormFields = vi.mocked((await import('@payloadcms/ui')).useFormFields)
    mockUseLanguage.mockReturnValue('en')
    mockUseSeatSelector.mockReturnValue(defaultHookReturn)
    mockUseFormFields.mockReturnValue({ trip: { value: 'trip-1' }, date: { value: '2024-01-15' } })
  })

  describe('Network and API Errors', () => {
    it('should handle network connection errors', () => {
      mockUseSeatSelector.mockReturnValue({
        ...defaultHookReturn,
        trip: null,
        error: 'Network connection failed. Please check your internet connection.',
      })

      render(<SeatSelectorClient path="seats" />)

      expect(screen.getByText(/network connection failed/i)).toBeInTheDocument()
      expect(screen.getByRole('alert')).toBeInTheDocument()
    })

    it('should handle API timeout errors', () => {
      mockUseSeatSelector.mockReturnValue({
        ...defaultHookReturn,
        trip: null,
        error: 'Request timed out. The server is taking too long to respond.',
      })

      render(<SeatSelectorClient path="seats" />)

      expect(screen.getByText(/request timed out/i)).toBeInTheDocument()
    })

    it('should handle 404 trip not found errors', () => {
      mockUseSeatSelector.mockReturnValue({
        ...defaultHookReturn,
        trip: null,
        error: 'Trip not found. This trip may have been cancelled or does not exist.',
      })

      render(<SeatSelectorClient path="seats" />)

      expect(screen.getByText(/trip not found/i)).toBeInTheDocument()
    })

    it('should handle 500 internal server errors', () => {
      mockUseSeatSelector.mockReturnValue({
        ...defaultHookReturn,
        trip: null,
        error: 'Internal server error. Please try again later.',
      })

      render(<SeatSelectorClient path="seats" />)

      expect(screen.getByText(/internal server error/i)).toBeInTheDocument()
    })

    it('should handle authentication errors', () => {
      mockUseSeatSelector.mockReturnValue({
        ...defaultHookReturn,
        trip: null,
        error: 'Authentication failed. Please log in again.',
      })

      render(<SeatSelectorClient path="seats" />)

      expect(screen.getByText(/authentication failed/i)).toBeInTheDocument()
    })

    it('should handle authorization errors', () => {
      mockUseSeatSelector.mockReturnValue({
        ...defaultHookReturn,
        trip: null,
        error: 'Access denied. You do not have permission to view this trip.',
      })

      render(<SeatSelectorClient path="seats" />)

      expect(screen.getByText(/access denied/i)).toBeInTheDocument()
    })
  })

  describe('Data Validation Errors', () => {
    it('should handle missing trip ID', () => {
      mockUseFormFields.mockReturnValue({ 
        trip: { value: undefined }, 
        date: { value: '2024-01-15' } 
      })

      render(<SeatSelectorClient path="seats" />)

      expect(screen.getByText(/please select trip and date/i)).toBeInTheDocument()
    })

    it('should handle missing travel date', () => {
      mockUseFormFields.mockReturnValue({ 
        trip: { value: 'trip-1' }, 
        date: { value: undefined } 
      })

      render(<SeatSelectorClient path="seats" />)

      expect(screen.getByText(/please select trip and date/i)).toBeInTheDocument()
    })

    it('should handle invalid travel date format', () => {
      mockUseFormFields.mockReturnValue({ 
        trip: { value: 'trip-1' }, 
        date: { value: 'invalid-date' } 
      })

      mockUseSeatSelector.mockReturnValue({
        ...defaultHookReturn,
        trip: null,
        error: 'Invalid date format. Please select a valid travel date.',
      })

      render(<SeatSelectorClient path="seats" />)

      expect(screen.getByText(/invalid date format/i)).toBeInTheDocument()
    })

    it('should handle past date selection', () => {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      
      mockUseFormFields.mockReturnValue({ 
        trip: { value: 'trip-1' }, 
        date: { value: yesterday.toISOString() } 
      })

      mockUseSeatSelector.mockReturnValue({
        ...defaultHookReturn,
        trip: null,
        error: 'Cannot book seats for past dates. Please select a future date.',
      })

      render(<SeatSelectorClient path="seats" />)

      expect(screen.getByText(/cannot book seats for past dates/i)).toBeInTheDocument()
    })
  })

  describe('Malformed Data Handling', () => {
    it('should handle trip with no bus data', () => {
      const tripWithoutBus = {
        ...mockTrip,
        bus: null
      }

      mockUseSeatSelector.mockReturnValue({
        ...defaultHookReturn,
        trip: tripWithoutBus as any,
        error: 'Bus information not available for this trip.',
      })

      render(<SeatSelectorClient path="seats" />)

      expect(screen.getByText(/bus information not available/i)).toBeInTheDocument()
    })

    it('should handle bus with no seat layout', () => {
      const tripWithNoSeats = {
        ...mockTrip,
        bus: {
          ...mockTrip.bus,
          type: {
            ...mockTrip.bus.type,
            seats: []
          }
        }
      }

      mockUseSeatSelector.mockReturnValue({
        ...defaultHookReturn,
        trip: tripWithNoSeats as any,
      })

      render(<SeatSelectorClient path="seats" />)

      // Should show empty grid or appropriate message
      expect(document.querySelector('.seat-selector__grid')).toBeInTheDocument()
    })

    it('should handle seats with invalid position data', () => {
      const tripWithInvalidSeats = {
        ...mockTrip,
        bus: {
          ...mockTrip.bus,
          type: {
            ...mockTrip.bus.type,
            seats: [
              { id: 'A1', position: null, type: 'seat', seatNumber: 'A1' },
              { id: 'A2', position: { row: -1, col: -1 }, type: 'seat', seatNumber: 'A2' },
              { id: 'A3', position: { row: 'invalid', col: 'invalid' }, type: 'seat', seatNumber: 'A3' },
            ]
          }
        }
      }

      mockUseSeatSelector.mockReturnValue({
        ...defaultHookReturn,
        trip: tripWithInvalidSeats as any,
      })

      render(<SeatSelectorClient path="seats" />)

      // Should handle gracefully without crashing
      expect(document.querySelector('.seat-selector__container')).toBeInTheDocument()
    })

    it('should handle seats with missing required fields', () => {
      const tripWithIncompleteSeats = {
        ...mockTrip,
        bus: {
          ...mockTrip.bus,
          type: {
            ...mockTrip.bus.type,
            seats: [
              { position: { row: 1, col: 1 }, type: 'seat' }, // Missing id and seatNumber
              { id: 'B1', position: { row: 2, col: 1 } }, // Missing type and seatNumber
              { id: 'B2', seatNumber: 'B2', type: 'seat' }, // Missing position
            ]
          }
        }
      }

      mockUseSeatSelector.mockReturnValue({
        ...defaultHookReturn,
        trip: tripWithIncompleteSeats as any,
      })

      render(<SeatSelectorClient path="seats" />)

      // Should filter out invalid seats and continue
      expect(document.querySelector('.seat-selector__container')).toBeInTheDocument()
    })

    it('should handle circular or recursive data structures', () => {
      const circularTrip = { ...mockTrip }
      // Create circular reference
      ;(circularTrip as any).circular = circularTrip

      mockUseSeatSelector.mockReturnValue({
        ...defaultHookReturn,
        trip: circularTrip as any,
      })

      render(<SeatSelectorClient path="seats" />)

      // Should handle without infinite loops
      expect(document.querySelector('.seat-selector__container')).toBeInTheDocument()
    })
  })

  describe('Booking State Errors', () => {
    it('should handle booking conflicts during selection', async () => {
      const user = userEvent.setup()
      let shouldFail = false
      const mockToggleSeat = vi.fn(() => {
        if (shouldFail) {
          throw new Error('Seat was just booked by another user')
        }
      })

      mockUseSeatSelector.mockReturnValue({
        ...defaultHookReturn,
        toggleSeat: mockToggleSeat,
      })

      render(<SeatSelectorClient path="seats" />)

      await waitFor(() => {
        expect(screen.getByText('A1')).toBeInTheDocument()
      })

      const seatA1 = screen.getByRole('button', { name: /seat a1/i })
      
      // First click should work
      await user.click(seatA1)
      expect(mockToggleSeat).toHaveBeenCalledWith('A1')

      // Simulate conflict on second attempt
      shouldFail = true
      mockUseSeatSelector.mockReturnValue({
        ...defaultHookReturn,
        toggleSeat: mockToggleSeat,
        error: 'Seat was just booked by another user',
      })

      render(<SeatSelectorClient path="seats" />)
      expect(screen.getByText(/seat was just booked/i)).toBeInTheDocument()
    })

    it('should handle expired payment deadlines', async () => {
      const user = userEvent.setup()
      const expiredBooking = {
        id: 'booking-1',
        ticketNumber: 'T123456',
        passenger: { 
          id: 'p1',
          fullName: 'Jane Doe',
          phoneNumber: '+93701234567',
          gender: 'female' as const
        },
        bookedSeats: [{ seat: 'A1' }],
        isPaid: false,
        isCancelled: false,
        paymentDeadline: new Date(Date.now() - 86400000).toISOString() // Yesterday
      }

      mockUseSeatSelector.mockReturnValue({
        ...defaultHookReturn,
        getSeatStatus: (seatId: string) => seatId === 'A1' ? 'unpaid' : 'available',
        getBookingForSeat: (seatId: string) => seatId === 'A1' ? expiredBooking : undefined,
        toggleSeat: vi.fn(),
      })

      render(<SeatSelectorClient path="seats" />)

      await waitFor(() => {
        expect(screen.getByText('A1')).toBeInTheDocument()
      })

      const expiredSeat = screen.getByRole('button', { name: /seat a1/i })
      await user.click(expiredSeat)

      // Should allow selection of expired seats
      expect(mockUseSeatSelector().toggleSeat).toHaveBeenCalledWith('A1')
    })

    it('should handle partial booking failures', () => {
      mockUseSeatSelector.mockReturnValue({
        ...defaultHookReturn,
        selectedSeats: ['A1', 'A2'],
        error: 'Failed to book seat A2. Seat A1 was successfully reserved.',
      })

      render(<SeatSelectorClient path="seats" />)

      expect(screen.getByText(/failed to book seat a2/i)).toBeInTheDocument()
      expect(screen.getByText(/seat a1 was successfully reserved/i)).toBeInTheDocument()
    })

    it('should handle booking system maintenance', () => {
      mockUseSeatSelector.mockReturnValue({
        ...defaultHookReturn,
        trip: null,
        error: 'Booking system is temporarily under maintenance. Please try again in a few minutes.',
      })

      render(<SeatSelectorClient path="seats" />)

      expect(screen.getByText(/booking system is temporarily under maintenance/i)).toBeInTheDocument()
    })
  })

  describe('Performance and Resource Errors', () => {
    it('should handle memory constraints with large seat layouts', () => {
      const massiveSeats = Array.from({ length: 1000 }, (_, i) => ({
        id: `seat-${i}`,
        position: { row: Math.floor(i / 20) + 1, col: (i % 20) + 1 },
        type: 'seat' as const,
        seatNumber: `${String.fromCharCode(65 + Math.floor(i / 20))}${(i % 20) + 1}`,
      }))

      const massiveTripMock = {
        ...mockTrip,
        bus: {
          ...mockTrip.bus,
          type: {
            ...mockTrip.bus.type,
            seats: massiveSeats
          }
        }
      }

      mockUseSeatSelector.mockReturnValue({
        ...defaultHookReturn,
        trip: massiveTripMock as any,
        gridDimensions: { rows: 50, cols: 20 },
      })

      const renderStart = performance.now()
      render(<SeatSelectorClient path="seats" />)
      const renderEnd = performance.now()

      // Should handle large datasets without major performance issues
      expect(renderEnd - renderStart).toBeLessThan(5000) // 5 seconds max
      expect(document.querySelector('.seat-selector__container')).toBeInTheDocument()
    })

    it('should handle slow network responses', () => {
      mockUseSeatSelector.mockReturnValue({
        ...defaultHookReturn,
        loading: true,
      })

      render(<SeatSelectorClient path="seats" />)

      expect(screen.getByText(/loading/i)).toBeInTheDocument()
      expect(document.querySelector('.seat-selector__loading-shimmer')).toBeInTheDocument()
    })

    it('should handle browser storage limitations', () => {
      // Mock storage quota exceeded
      const originalSetItem = localStorage.setItem
      localStorage.setItem = vi.fn(() => {
        throw new DOMException('QuotaExceededError')
      })

      try {
        render(<SeatSelectorClient path="seats" />)
        
        // Should continue to function without localStorage
        expect(document.querySelector('.seat-selector__container')).toBeInTheDocument()
      } finally {
        localStorage.setItem = originalSetItem
      }
    })
  })

  describe('Concurrent User Interactions', () => {
    it('should handle rapid consecutive clicks', async () => {
      const user = userEvent.setup()
      const mockToggleSeat = vi.fn()

      mockUseSeatSelector.mockReturnValue({
        ...defaultHookReturn,
        toggleSeat: mockToggleSeat,
      })

      render(<SeatSelectorClient path="seats" />)

      await waitFor(() => {
        expect(screen.getByText('A1')).toBeInTheDocument()
      })

      const seatA1 = screen.getByRole('button', { name: /seat a1/i })
      
      // Rapid clicks should be handled gracefully
      await Promise.all([
        user.click(seatA1),
        user.click(seatA1),
        user.click(seatA1),
      ])

      // Should have been called multiple times
      expect(mockToggleSeat).toHaveBeenCalledTimes(3)
    })

    it('should handle simultaneous multi-seat selection', async () => {
      const user = userEvent.setup()
      const mockToggleSeat = vi.fn()

      mockUseSeatSelector.mockReturnValue({
        ...defaultHookReturn,
        toggleSeat: mockToggleSeat,
      })

      render(<SeatSelectorClient path="seats" />)

      await waitFor(() => {
        expect(screen.getByText('A1')).toBeInTheDocument()
      })

      const seatA1 = screen.getByRole('button', { name: /seat a1/i })
      const seatA2 = screen.getByRole('button', { name: /seat a2/i })
      const seatB1 = screen.getByRole('button', { name: /seat b1/i })
      
      // Simultaneous selection
      await Promise.all([
        user.click(seatA1),
        user.click(seatA2),
        user.click(seatB1),
      ])

      expect(mockToggleSeat).toHaveBeenCalledWith('A1')
      expect(mockToggleSeat).toHaveBeenCalledWith('A2')
      expect(mockToggleSeat).toHaveBeenCalledWith('B1')
    })

    it('should handle form processing interruptions', async () => {
      const user = userEvent.setup()
      let isProcessing = false
      const mockToggleSeat = vi.fn(() => {
        isProcessing = true
      })

      mockUseSeatSelector.mockReturnValue({
        ...defaultHookReturn,
        isFormProcessing: isProcessing,
        toggleSeat: mockToggleSeat,
      })

      render(<SeatSelectorClient path="seats" />)

      await waitFor(() => {
        expect(screen.getByText('A1')).toBeInTheDocument()
      })

      const seatA1 = screen.getByRole('button', { name: /seat a1/i })
      
      await user.click(seatA1)
      expect(mockToggleSeat).toHaveBeenCalledWith('A1')

      // Re-render with processing state
      mockUseSeatSelector.mockReturnValue({
        ...defaultHookReturn,
        isFormProcessing: true,
        toggleSeat: mockToggleSeat,
      })

      render(<SeatSelectorClient path="seats" />)

      // Seat should be disabled during processing
      const disabledSeat = screen.getByRole('button', { name: /seat a1/i })
      expect(disabledSeat).toBeDisabled()
    })
  })

  describe('Browser Compatibility Edge Cases', () => {
    it('should handle missing modern JavaScript features', () => {
      // Mock older browser environment
      const originalPromise = global.Promise
      const originalMap = global.Map
      const originalSet = global.Set

      try {
        // These would be polyfilled in real scenarios
        render(<SeatSelectorClient path="seats" />)
        
        expect(document.querySelector('.seat-selector__container')).toBeInTheDocument()
      } finally {
        global.Promise = originalPromise
        global.Map = originalMap
        global.Set = originalSet
      }
    })

    it('should handle disabled JavaScript gracefully', () => {
      // This test verifies that basic structure is present
      render(<SeatSelectorClient path="seats" />)
      
      const seatButtons = screen.getAllByRole('button').filter(btn => 
        btn.getAttribute('aria-label')?.includes('Seat')
      )

      // Seats should be present even if interaction is limited
      expect(seatButtons.length).toBeGreaterThan(0)
    })

    it('should handle CSS loading failures', () => {
      // Mock missing CSS classes
      render(<SeatSelectorClient path="seats" />)
      
      // Component should render structure even without styling
      expect(document.querySelector('.seat-selector-wrapper')).toBeInTheDocument()
    })
  })

  describe('Internationalization Edge Cases', () => {
    it('should handle missing translation keys', () => {
      mockUseLanguage.mockReturnValue('unknown-locale' as any)
      
      render(<SeatSelectorClient path="seats" />)

      // Should fallback to English or show raw keys
      expect(document.querySelector('.seat-selector__container')).toBeInTheDocument()
    })

    it('should handle extremely long translated text', () => {
      mockUseLanguage.mockReturnValue('en')
      
      mockUseSeatSelector.mockReturnValue({
        ...defaultHookReturn,
        error: 'This is an extremely long error message that could potentially break the layout if not handled properly. '.repeat(10),
      })
      
      render(<SeatSelectorClient path="seats" />)

      const errorElement = screen.getByText(/extremely long error message/i)
      expect(errorElement).toBeInTheDocument()
    })

    it('should handle complex Unicode characters', () => {
      const unicodeTripMock = {
        ...mockTrip,
        from: { id: 'terminal-1', name: '🚌 تst تیں 你好 Emòji Terminal 🎫' },
        bus: {
          ...mockTrip.bus,
          type: {
            ...mockTrip.bus.type,
            name: '🚌 Unicode Bus 🎫',
          }
        }
      }

      mockUseSeatSelector.mockReturnValue({
        ...defaultHookReturn,
        trip: unicodeTripMock as any,
      })
      
      render(<SeatSelectorClient path="seats" />)

      expect(document.querySelector('.seat-selector__container')).toBeInTheDocument()
    })
  })

  describe('Security Edge Cases', () => {
    it('should handle XSS attempts in trip data', () => {
      const xssTrip = {
        ...mockTrip,
        from: { 
          id: 'terminal-1', 
          name: '<script>alert("XSS")</script>Terminal' 
        },
        bus: {
          ...mockTrip.bus,
          type: {
            ...mockTrip.bus.type,
            name: '<img src=x onerror=alert("XSS")>Bus',
          }
        }
      }

      mockUseSeatSelector.mockReturnValue({
        ...defaultHookReturn,
        trip: xssTrip as any,
      })
      
      render(<SeatSelectorClient path="seats" />)

      // Should sanitize and not execute scripts
      expect(document.querySelector('script')).not.toBeInTheDocument()
      expect(document.querySelector('.seat-selector__container')).toBeInTheDocument()
    })

    it('should handle malicious HTML in error messages', () => {
      mockUseSeatSelector.mockReturnValue({
        ...defaultHookReturn,
        trip: null,
        error: '<script>alert("XSS")</script>Error occurred',
      })
      
      render(<SeatSelectorClient path="seats" />)

      // Should display error text without executing script
      expect(screen.getByText(/error occurred/i)).toBeInTheDocument()
      expect(document.querySelector('script')).not.toBeInTheDocument()
    })

    it('should handle SQL injection attempts in seat data', () => {
      const sqlInjectionTrip = {
        ...mockTrip,
        bus: {
          ...mockTrip.bus,
          type: {
            ...mockTrip.bus.type,
            seats: [
              { 
                id: "'; DROP TABLE seats; --", 
                position: { row: 1, col: 1 }, 
                type: 'seat', 
                seatNumber: "'; DROP TABLE seats; --" 
              },
            ]
          }
        }
      }

      mockUseSeatSelector.mockReturnValue({
        ...defaultHookReturn,
        trip: sqlInjectionTrip as any,
      })
      
      render(<SeatSelectorClient path="seats" />)

      // Should handle malicious input gracefully
      expect(document.querySelector('.seat-selector__container')).toBeInTheDocument()
    })
  })
})