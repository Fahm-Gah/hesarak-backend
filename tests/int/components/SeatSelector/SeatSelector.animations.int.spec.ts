import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import SeatSelectorClient from '@/components/SeatSelector/index.client'
import { useSeatSelector } from '@/components/SeatSelector/hooks/useSeatSelector'

vi.mock('@/components/SeatSelector/hooks/useSeatSelector')
vi.mock('@/hooks/useLanguage')
vi.mock('@payloadcms/ui', () => ({
  useFormFields: () => ({ trip: { value: 'trip-1' }, date: { value: '2024-01-15' } }),
  toast: { error: vi.fn(), warning: vi.fn(), success: vi.fn() },
}))
vi.mock('react-intersection-observer', () => ({
  useInView: () => ({ ref: vi.fn(), inView: true }),
}))

describe('SeatSelector Animation and State Transitions', () => {
  const mockUseSeatSelector = vi.mocked(useSeatSelector)
  let mockUseLanguage: any

  const mockTrip = {
    id: 'trip-1',
    name: 'Animation Test Route',
    from: { id: 'terminal-1', name: 'Start Terminal' },
    stops: [{ terminal: { id: 'terminal-2', name: 'End Terminal' }, time: '15:30' }],
    departureTime: '14:30',
    price: 30,
    bus: {
      id: 'bus-1',
      number: 'BUS-ANIM',
      type: {
        id: 'type-1',
        name: 'Animation Bus',
        capacity: 16,
        seats: [
          { id: 'A1', position: { row: 1, col: 1 }, type: 'seat', seatNumber: 'A1' },
          { id: 'A2', position: { row: 1, col: 2 }, type: 'seat', seatNumber: 'A2' },
          { id: 'A3', position: { row: 1, col: 3 }, type: 'seat', seatNumber: 'A3' },
          { id: 'B1', position: { row: 2, col: 1 }, type: 'seat', seatNumber: 'B1' },
          { id: 'B2', position: { row: 2, col: 2 }, type: 'seat', seatNumber: 'B2' },
          { id: 'B3', position: { row: 2, col: 3 }, type: 'seat', seatNumber: 'B3' },
        ]
      }
    }
  }

  const defaultHookReturn = {
    trip: mockTrip as any,
    loading: false,
    error: undefined,
    gridDimensions: { rows: 2, cols: 3 },
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
    mockUseLanguage.mockReturnValue('en')
    mockUseSeatSelector.mockReturnValue(defaultHookReturn)
  })

  describe('Component Mount Animations', () => {
    it('should animate container entrance', async () => {
      render(<SeatSelectorClient path="seats" />)

      const wrapper = document.querySelector('.seat-selector-wrapper')
      expect(wrapper).toBeInTheDocument()
      
      // Should have initial animation state
      expect(wrapper).toHaveAttribute('style', expect.stringContaining('opacity'))
    })

    it('should stagger seat grid appearance', async () => {
      render(<SeatSelectorClient path="seats" />)

      await waitFor(() => {
        expect(screen.getByText('A1')).toBeInTheDocument()
      })

      const seatGrid = document.querySelector('.seat-selector__grid')
      expect(seatGrid).toBeInTheDocument()
      
      // Grid should animate in smoothly
      expect(seatGrid).toHaveClass('seat-selector__grid')
    })

    it('should handle intersection observer entrance animations', () => {
      // Mock intersection observer to trigger entrance animation
      const mockInView = vi.fn()
      vi.mocked(await import('react-intersection-observer')).useInView = vi.fn().mockReturnValue({
        ref: mockInView,
        inView: true,
      })

      render(<SeatSelectorClient path="seats" />)

      expect(mockInView).toHaveBeenCalled()
    })

    it('should delay seat rendering until in view', () => {
      // Mock intersection observer to be out of view initially
      vi.mocked(await import('react-intersection-observer')).useInView = vi.fn().mockReturnValue({
        ref: vi.fn(),
        inView: false,
      })

      render(<SeatSelectorClient path="seats" />)

      // Seats should not render when not in view
      expect(screen.queryByText('A1')).not.toBeInTheDocument()
    })
  })

  describe('Loading State Transitions', () => {
    it('should animate loading skeleton appearance', () => {
      mockUseSeatSelector.mockReturnValue({
        ...defaultHookReturn,
        trip: null,
        loading: true,
      })

      render(<SeatSelectorClient path="seats" />)

      const loadingSkeleton = document.querySelector('.seat-selector__loading-skeleton')
      expect(loadingSkeleton).toBeInTheDocument()
      
      const loadingText = screen.getByText(/loading/i)
      expect(loadingText).toBeInTheDocument()
    })

    it('should animate loading overlay during data refresh', () => {
      mockUseSeatSelector.mockReturnValue({
        ...defaultHookReturn,
        loading: true, // Data is loading while trip exists
      })

      render(<SeatSelectorClient path="seats" />)

      const loadingOverlay = document.querySelector('.seat-selector__grid-overlay')
      expect(loadingOverlay).toBeInTheDocument()
      
      const loadingShimmer = document.querySelector('.seat-selector__loading-shimmer')
      expect(loadingShimmer).toBeInTheDocument()
    })

    it('should transition from loading to loaded state smoothly', async () => {
      // Start with loading state
      mockUseSeatSelector.mockReturnValue({
        ...defaultHookReturn,
        trip: null,
        loading: true,
      })

      const { rerender } = render(<SeatSelectorClient path="seats" />)

      expect(screen.getByText(/loading/i)).toBeInTheDocument()

      // Transition to loaded state
      mockUseSeatSelector.mockReturnValue({
        ...defaultHookReturn,
        loading: false,
      })

      rerender(<SeatSelectorClient path="seats" />)

      await waitFor(() => {
        expect(screen.getByText('A1')).toBeInTheDocument()
      })
    })

    it('should handle loading state changes during user interaction', async () => {
      const user = userEvent.setup()
      let isLoading = false
      
      const mockToggleSeat = vi.fn(() => {
        isLoading = true
      })

      mockUseSeatSelector.mockReturnValue({
        ...defaultHookReturn,
        loading: isLoading,
        toggleSeat: mockToggleSeat,
      })

      const { rerender } = render(<SeatSelectorClient path="seats" />)

      await waitFor(() => {
        expect(screen.getByText('A1')).toBeInTheDocument()
      })

      const seatA1 = screen.getByRole('button', { name: /seat a1/i })
      await user.click(seatA1)

      // Re-render with loading state
      mockUseSeatSelector.mockReturnValue({
        ...defaultHookReturn,
        loading: true,
        toggleSeat: mockToggleSeat,
      })

      rerender(<SeatSelectorClient path="seats" />)

      expect(document.querySelector('.seat-selector__grid-overlay')).toBeInTheDocument()
    })
  })

  describe('Seat Selection Animations', () => {
    it('should animate seat selection state changes', async () => {
      const user = userEvent.setup()
      let selectedSeats: string[] = []
      
      const mockToggleSeat = vi.fn((seatId: string) => {
        selectedSeats = selectedSeats.includes(seatId) 
          ? selectedSeats.filter(id => id !== seatId)
          : [...selectedSeats, seatId]
      })

      mockUseSeatSelector.mockReturnValue({
        ...defaultHookReturn,
        selectedSeats,
        getIsSelected: (seatId: string) => selectedSeats.includes(seatId),
        toggleSeat: mockToggleSeat,
      })

      const { rerender } = render(<SeatSelectorClient path="seats" />)

      await waitFor(() => {
        expect(screen.getByText('A1')).toBeInTheDocument()
      })

      const seatA1 = screen.getByRole('button', { name: /seat a1/i })
      await user.click(seatA1)

      // Update state and re-render
      selectedSeats = ['A1']
      mockUseSeatSelector.mockReturnValue({
        ...defaultHookReturn,
        selectedSeats,
        getIsSelected: (seatId: string) => selectedSeats.includes(seatId),
        toggleSeat: mockToggleSeat,
      })

      rerender(<SeatSelectorClient path="seats" />)

      // Seat should show selected state
      const updatedSeat = screen.getByRole('button', { name: /seat a1/i })
      expect(updatedSeat).toHaveAttribute('aria-pressed', 'true')
    })

    it('should animate just updated seats', () => {
      mockUseSeatSelector.mockReturnValue({
        ...defaultHookReturn,
        getJustUpdated: (seatId: string) => seatId === 'A1',
      })

      render(<SeatSelectorClient path="seats" />)

      const seatA1 = screen.getByRole('button', { name: /seat a1/i })
      // Should have animation class or style for just updated state
      expect(seatA1).toBeInTheDocument()
    })

    it('should animate multiple seat selections in sequence', async () => {
      const user = userEvent.setup()
      const mockToggleSeat = vi.fn()
      const mockGetJustUpdated = vi.fn()
        .mockReturnValueOnce(false) // A1 initially
        .mockReturnValueOnce(false) // A2 initially  
        .mockReturnValueOnce(true)  // A1 after click
        .mockReturnValueOnce(false) // A2 after A1 click
        .mockReturnValueOnce(false) // A1 after A2 click
        .mockReturnValueOnce(true)  // A2 after click

      mockUseSeatSelector.mockReturnValue({
        ...defaultHookReturn,
        getJustUpdated: mockGetJustUpdated,
        toggleSeat: mockToggleSeat,
      })

      render(<SeatSelectorClient path="seats" />)

      await waitFor(() => {
        expect(screen.getByText('A1')).toBeInTheDocument()
      })

      const seatA1 = screen.getByRole('button', { name: /seat a1/i })
      const seatA2 = screen.getByRole('button', { name: /seat a2/i })

      await user.click(seatA1)
      expect(mockToggleSeat).toHaveBeenCalledWith('A1')

      await user.click(seatA2)
      expect(mockToggleSeat).toHaveBeenCalledWith('A2')
    })

    it('should animate seat deselection', async () => {
      const user = userEvent.setup()
      let selectedSeats = ['A1']
      
      const mockToggleSeat = vi.fn(() => {
        selectedSeats = []
      })

      mockUseSeatSelector.mockReturnValue({
        ...defaultHookReturn,
        selectedSeats,
        getIsSelected: (seatId: string) => selectedSeats.includes(seatId),
        toggleSeat: mockToggleSeat,
      })

      const { rerender } = render(<SeatSelectorClient path="seats" />)

      await waitFor(() => {
        expect(screen.getByText('A1')).toBeInTheDocument()
      })

      const selectedSeat = screen.getByRole('button', { name: /seat a1/i })
      expect(selectedSeat).toHaveAttribute('aria-pressed', 'true')

      await user.click(selectedSeat)

      // Update state
      selectedSeats = []
      mockUseSeatSelector.mockReturnValue({
        ...defaultHookReturn,
        selectedSeats,
        getIsSelected: () => false,
        toggleSeat: mockToggleSeat,
      })

      rerender(<SeatSelectorClient path="seats" />)

      const deselectedSeat = screen.getByRole('button', { name: /seat a1/i })
      expect(deselectedSeat).toHaveAttribute('aria-pressed', 'false')
    })
  })

  describe('Selected Seats List Animations', () => {
    it('should animate selected seats list appearance', async () => {
      const selectedSeats = ['A1', 'B2']
      
      mockUseSeatSelector.mockReturnValue({
        ...defaultHookReturn,
        selectedSeats,
        getIsSelected: (seatId: string) => selectedSeats.includes(seatId),
      })

      render(<SeatSelectorClient path="seats" />)

      await waitFor(() => {
        // Selected seats list should appear with animation
        expect(screen.getByRole('button', { name: /clear all/i })).toBeInTheDocument()
      })
    })

    it('should animate individual seat removal from list', async () => {
      const user = userEvent.setup()
      const mockRemoveSeat = vi.fn()
      
      mockUseSeatSelector.mockReturnValue({
        ...defaultHookReturn,
        selectedSeats: ['A1', 'A2'],
        removeSeat: mockRemoveSeat,
      })

      render(<SeatSelectorClient path="seats" />)

      await waitFor(() => {
        const removeButtons = screen.getAllByRole('button', { name: /remove/i })
        expect(removeButtons.length).toBeGreaterThan(0)
      })

      const removeButton = screen.getAllByRole('button', { name: /remove/i })[0]
      await user.click(removeButton)

      expect(mockRemoveSeat).toHaveBeenCalled()
    })

    it('should animate clear all action', async () => {
      const user = userEvent.setup()
      const mockClearAll = vi.fn()
      
      mockUseSeatSelector.mockReturnValue({
        ...defaultHookReturn,
        selectedSeats: ['A1', 'A2', 'B1'],
        clearAll: mockClearAll,
      })

      render(<SeatSelectorClient path="seats" />)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /clear all/i })).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: /clear all/i }))
      expect(mockClearAll).toHaveBeenCalled()
    })

    it('should transition between instructions and selected list', () => {
      // Start with no selections (should show instructions)
      const { rerender } = render(<SeatSelectorClient path="seats" />)

      expect(screen.getByText(/click to select/i)).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /clear all/i })).not.toBeInTheDocument()

      // Add selections
      mockUseSeatSelector.mockReturnValue({
        ...defaultHookReturn,
        selectedSeats: ['A1'],
        getIsSelected: (seatId: string) => seatId === 'A1',
      })

      rerender(<SeatSelectorClient path="seats" />)

      expect(screen.queryByText(/click to select/i)).not.toBeInTheDocument()
      // Selected seats list should appear
    })
  })

  describe('Error State Transitions', () => {
    it('should animate error message appearance', () => {
      mockUseSeatSelector.mockReturnValue({
        ...defaultHookReturn,
        trip: null,
        error: 'Connection failed. Please try again.',
      })

      render(<SeatSelectorClient path="seats" />)

      const errorMessage = screen.getByText(/connection failed/i)
      expect(errorMessage).toBeInTheDocument()
    })

    it('should transition from error to success state', () => {
      // Start with error
      mockUseSeatSelector.mockReturnValue({
        ...defaultHookReturn,
        trip: null,
        error: 'Loading failed',
      })

      const { rerender } = render(<SeatSelectorClient path="seats" />)

      expect(screen.getByText(/loading failed/i)).toBeInTheDocument()

      // Transition to success
      mockUseSeatSelector.mockReturnValue({
        ...defaultHookReturn,
        error: undefined,
      })

      rerender(<SeatSelectorClient path="seats" />)

      expect(screen.queryByText(/loading failed/i)).not.toBeInTheDocument()
      expect(screen.getByText('A1')).toBeInTheDocument()
    })

    it('should handle error recovery animations', () => {
      // Test transition from error back to loading then success
      mockUseSeatSelector.mockReturnValue({
        ...defaultHookReturn,
        trip: null,
        error: 'Network error',
      })

      const { rerender } = render(<SeatSelectorClient path="seats" />)

      expect(screen.getByText(/network error/i)).toBeInTheDocument()

      // Recovery attempt (loading)
      mockUseSeatSelector.mockReturnValue({
        ...defaultHookReturn,
        trip: null,
        error: undefined,
        loading: true,
      })

      rerender(<SeatSelectorClient path="seats" />)

      expect(screen.queryByText(/network error/i)).not.toBeInTheDocument()
      expect(screen.getByText(/loading/i)).toBeInTheDocument()

      // Successful recovery
      mockUseSeatSelector.mockReturnValue({
        ...defaultHookReturn,
        error: undefined,
        loading: false,
      })

      rerender(<SeatSelectorClient path="seats" />)

      expect(screen.getByText('A1')).toBeInTheDocument()
    })
  })

  describe('Expired Ticket Animations', () => {
    it('should animate expired indicator entrance', () => {
      mockUseSeatSelector.mockReturnValue({
        ...defaultHookReturn,
        isTicketExpired: true,
      })

      render(<SeatSelectorClient path="seats" />)

      const expiredIndicator = screen.getByRole('alert')
      expect(expiredIndicator).toBeInTheDocument()
      expect(expiredIndicator).toHaveClass('seat-selector__expired-indicator')
    })

    it('should handle expired state transitions', () => {
      // Start without expired state
      const { rerender } = render(<SeatSelectorClient path="seats" />)

      expect(screen.queryByRole('alert')).not.toBeInTheDocument()

      // Transition to expired
      mockUseSeatSelector.mockReturnValue({
        ...defaultHookReturn,
        isTicketExpired: true,
      })

      rerender(<SeatSelectorClient path="seats" />)

      expect(screen.getByRole('alert')).toBeInTheDocument()
      expect(screen.getByText(/expired/i)).toBeInTheDocument()
    })
  })

  describe('Form Processing Animations', () => {
    it('should animate processing state entrance', () => {
      mockUseSeatSelector.mockReturnValue({
        ...defaultHookReturn,
        isFormProcessing: true,
      })

      render(<SeatSelectorClient path="seats" />)

      const processingIndicator = document.querySelector('[aria-busy="true"]')
      expect(processingIndicator).toBeInTheDocument()
    })

    it('should disable seat interactions during processing with visual feedback', async () => {
      const user = userEvent.setup()
      
      mockUseSeatSelector.mockReturnValue({
        ...defaultHookReturn,
        isFormProcessing: true,
      })

      render(<SeatSelectorClient path="seats" />)

      await waitFor(() => {
        expect(screen.getByText('A1')).toBeInTheDocument()
      })

      const seatA1 = screen.getByRole('button', { name: /seat a1/i })
      expect(seatA1).toBeDisabled()

      // Visual indicators should be present
      expect(document.querySelector('[aria-busy="true"]')).toBeInTheDocument()
    })

    it('should transition from processing back to interactive', () => {
      // Start with processing
      mockUseSeatSelector.mockReturnValue({
        ...defaultHookReturn,
        isFormProcessing: true,
      })

      const { rerender } = render(<SeatSelectorClient path="seats" />)

      const processingIndicator = document.querySelector('[aria-busy="true"]')
      expect(processingIndicator).toBeInTheDocument()

      // End processing
      mockUseSeatSelector.mockReturnValue({
        ...defaultHookReturn,
        isFormProcessing: false,
      })

      rerender(<SeatSelectorClient path="seats" />)

      expect(document.querySelector('[aria-busy="true"]')).not.toBeInTheDocument()
      
      const seatA1 = screen.getByRole('button', { name: /seat a1/i })
      expect(seatA1).not.toBeDisabled()
    })
  })

  describe('Virtualization Animations', () => {
    it('should handle animations in virtual grid mode', () => {
      const largeSeatTrip = {
        ...mockTrip,
        bus: {
          ...mockTrip.bus,
          type: {
            ...mockTrip.bus.type,
            seats: Array.from({ length: 60 }, (_, i) => ({
              id: `seat-${i}`,
              position: { row: Math.floor(i / 4) + 1, col: (i % 4) + 1 },
              type: 'seat' as const,
              seatNumber: `${String.fromCharCode(65 + Math.floor(i / 4))}${(i % 4) + 1}`,
            }))
          }
        }
      }

      mockUseSeatSelector.mockReturnValue({
        ...defaultHookReturn,
        trip: largeSeatTrip as any,
        gridDimensions: { rows: 15, cols: 4 },
      })

      render(<SeatSelectorClient path="seats" />)

      const virtualGrid = document.querySelector('.seat-selector__virtual-grid')
      expect(virtualGrid).toBeInTheDocument()
      expect(document.querySelector('.seat-selector__grid')).not.toBeInTheDocument()
    })

    it('should maintain animations in virtual scrolling', () => {
      const largeSeatTrip = {
        ...mockTrip,
        bus: {
          ...mockTrip.bus,
          type: {
            ...mockTrip.bus.type,
            seats: Array.from({ length: 100 }, (_, i) => ({
              id: `seat-${i}`,
              position: { row: Math.floor(i / 5) + 1, col: (i % 5) + 1 },
              type: 'seat' as const,
              seatNumber: `${String.fromCharCode(65 + Math.floor(i / 5))}${(i % 5) + 1}`,
            }))
          }
        }
      }

      mockUseSeatSelector.mockReturnValue({
        ...defaultHookReturn,
        trip: largeSeatTrip as any,
        gridDimensions: { rows: 20, cols: 5 },
        getJustUpdated: (seatId: string) => seatId === 'seat-0', // First seat updated
      })

      render(<SeatSelectorClient path="seats" />)

      const virtualGrid = document.querySelector('.seat-selector__virtual-grid')
      expect(virtualGrid).toBeInTheDocument()
      
      // Should handle animations even in virtual mode
      expect(virtualGrid.children.length).toBeGreaterThan(0)
    })
  })

  describe('Performance Optimized Animations', () => {
    it('should respect reduced motion preferences', () => {
      // Mock prefers-reduced-motion
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation(query => ({
          matches: query === '(prefers-reduced-motion: reduce)',
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      })

      render(<SeatSelectorClient path="seats" />)

      // Component should render without motion
      expect(document.querySelector('.seat-selector-wrapper')).toBeInTheDocument()
    })

    it('should handle rapid state changes without performance issues', async () => {
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

      const performanceStart = performance.now()

      // Rapid interactions
      const seats = [
        screen.getByRole('button', { name: /seat a1/i }),
        screen.getByRole('button', { name: /seat a2/i }),
        screen.getByRole('button', { name: /seat a3/i }),
      ]

      for (const seat of seats) {
        await user.click(seat)
      }

      const performanceEnd = performance.now()
      const duration = performanceEnd - performanceStart

      // Should complete quickly
      expect(duration).toBeLessThan(1000) // 1 second for 3 interactions
      expect(mockToggleSeat).toHaveBeenCalledTimes(3)
    })

    it('should batch animation updates efficiently', async () => {
      const mockGetJustUpdated = vi.fn()
        .mockImplementation((seatId: string) => ['A1', 'A2', 'B1'].includes(seatId))

      mockUseSeatSelector.mockReturnValue({
        ...defaultHookReturn,
        selectedSeats: ['A1', 'A2', 'B1'],
        getIsSelected: (seatId: string) => ['A1', 'A2', 'B1'].includes(seatId),
        getJustUpdated: mockGetJustUpdated,
      })

      const renderStart = performance.now()
      render(<SeatSelectorClient path="seats" />)

      await waitFor(() => {
        expect(screen.getByText('A1')).toBeInTheDocument()
      })

      const renderEnd = performance.now()
      const renderTime = renderEnd - renderStart

      // Should render efficiently even with multiple animated elements
      expect(renderTime).toBeLessThan(200)
      expect(mockGetJustUpdated).toHaveBeenCalled()
    })
  })
})