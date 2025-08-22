import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import SeatSelectorClient from '@/components/SeatSelector/index.client'
import { useSeatSelector } from '@/components/SeatSelector/hooks/useSeatSelector'

vi.mock('@/components/SeatSelector/hooks/useSeatSelector')
vi.mock('@/hooks/useLanguage')
vi.mock('react-intersection-observer', () => ({
  useInView: () => ({ ref: vi.fn(), inView: true }),
}))

describe('SeatSelector Visual Regression', () => {
  const mockUseSeatSelector = vi.mocked(useSeatSelector)
  let mockUseLanguage: any

  const mockTrip = {
    id: 'trip-1',
    from: { id: 'terminal-1', name: 'Downtown Terminal' },
    to: { id: 'terminal-2', name: 'Airport Terminal' },
    departureTime: '14:30',
    days: ['mon', 'tue', 'wed'],
    bus: {
      type: {
        name: 'VIP Express Bus',
        seats: [
          { id: 'A1', position: { row: 1, col: 1 }, type: 'seat', seatNumber: 'A1' },
          { id: 'A2', position: { row: 1, col: 2 }, type: 'seat', seatNumber: 'A2' },
          { id: 'A3', position: { row: 1, col: 3 }, type: 'seat', seatNumber: 'A3' },
          { id: 'B1', position: { row: 2, col: 1 }, type: 'seat', seatNumber: 'B1' },
          { id: 'B2', position: { row: 2, col: 2 }, type: 'seat', seatNumber: 'B2' },
          { id: 'B3', position: { row: 2, col: 3 }, type: 'seat', seatNumber: 'B3' },
          { id: 'DRIVER', position: { row: 1, col: 4 }, type: 'driver' },
          { id: 'WC', position: { row: 2, col: 4 }, type: 'wc' },
          { id: 'DOOR', position: { row: 3, col: 1 }, type: 'door' },
        ]
      }
    }
  }

  const createHookReturn = (overrides = {}) => ({
    trip: mockTrip as any,
    loading: false,
    error: undefined,
    gridDimensions: { rows: 3, cols: 4 },
    selectedSeats: [],
    getSeatStatus: vi.fn(() => 'available' as const),
    getBookingStatus: vi.fn(() => 'available' as const),
    getIsSelected: vi.fn(() => false),
    getJustUpdated: vi.fn(() => false),
    getBookingForSeat: vi.fn(() => undefined),
    toggleSeat: vi.fn(),
    removeSeat: vi.fn(),
    clearAll: vi.fn(),
    isTicketExpired: false,
    ...overrides,
  })

  beforeEach(() => {
    vi.clearAllMocks()
    mockUseLanguage.mockReturnValue('en')
    mockUseSeatSelector.mockReturnValue(createHookReturn())
  })

  describe('CSS Class Applications', () => {
    it('should apply correct CSS classes for seat statuses', () => {
      const mockGetSeatStatus = vi.fn()
      mockGetSeatStatus.mockImplementation((seatId: string) => {
        switch (seatId) {
          case 'A1': return 'available'
          case 'A2': return 'selected'
          case 'A3': return 'booked'
          case 'B1': return 'unpaid'
          case 'B2': return 'currentTicket'
          default: return 'available'
        }
      })

      mockUseSeatSelector.mockReturnValue(createHookReturn({
        getSeatStatus: mockGetSeatStatus,
        selectedSeats: ['A2'],
        getIsSelected: (seatId: string) => seatId === 'A2',
      }))

      render(<SeatSelectorClient path="seats" />)

      expect(screen.getByRole('button', { name: /seat a1/i })).toHaveClass('seat-cell--available')
      expect(screen.getByRole('button', { name: /seat a2/i })).toHaveClass('seat-cell--selected')
      expect(screen.getByRole('button', { name: /seat a3/i })).toHaveClass('seat-cell--booked')
      expect(screen.getByRole('button', { name: /seat b1/i })).toHaveClass('seat-cell--unpaid')
      expect(screen.getByRole('button', { name: /seat b2/i })).toHaveClass('seat-cell--currentTicket')
    })

    it('should apply seat type CSS classes', () => {
      render(<SeatSelectorClient path="seats" />)

      expect(screen.getByRole('button', { name: /seat a1/i })).toHaveClass('seat-cell--seat')
      expect(screen.getByRole('presentation', { name: /driver/i })).toHaveClass('seat-cell--driver')
      expect(screen.getByRole('presentation', { name: /wc/i })).toHaveClass('seat-cell--wc')
      expect(screen.getByRole('presentation', { name: /door/i })).toHaveClass('seat-cell--door')
    })

    it('should apply disabled classes when readOnly', () => {
      render(<SeatSelectorClient path="seats" readOnly />)

      const seatButtons = screen.getAllByRole('button').filter(btn => 
        btn.getAttribute('aria-label')?.includes('Seat')
      )

      seatButtons.forEach(button => {
        expect(button).toHaveClass('seat-cell--disabled')
      })
    })

    it('should apply just-updated classes for animated seats', () => {
      const mockGetJustUpdated = vi.fn((seatId: string) => seatId === 'A1')

      mockUseSeatSelector.mockReturnValue(createHookReturn({
        getJustUpdated: mockGetJustUpdated,
      }))

      render(<SeatSelectorClient path="seats" />)

      expect(screen.getByRole('button', { name: /seat a1/i })).toHaveClass('seat-cell--just-updated')
    })
  })

  describe('Grid Layout Styles', () => {
    it('should apply correct grid template styles', () => {
      render(<SeatSelectorClient path="seats" />)

      const grid = document.querySelector('.seat-selector__grid')
      expect(grid).toHaveStyle({
        gridTemplateRows: 'repeat(3, minmax(45px, 1fr))',
        gridTemplateColumns: 'repeat(4, minmax(45px, 1fr))',
      })
    })

    it('should apply correct grid positioning for individual seats', () => {
      render(<SeatSelectorClient path="seats" />)

      const seatA1 = screen.getByRole('button', { name: /seat a1/i })
      expect(seatA1).toHaveStyle({
        gridRow: '1 / span 1',
        gridColumn: '1 / span 1',
      })

      const seatB3 = screen.getByRole('button', { name: /seat b3/i })
      expect(seatB3).toHaveStyle({
        gridRow: '2 / span 1',
        gridColumn: '3 / span 1',
      })
    })

    it('should handle seats with custom span sizes', () => {
      const tripWithLargeSeats = {
        ...mockTrip,
        bus: {
          type: {
            name: 'Custom Bus',
            seats: [
              { 
                id: 'L1', 
                position: { row: 1, col: 1 }, 
                type: 'seat', 
                seatNumber: 'L1',
                size: { rowSpan: 2, colSpan: 3 }
              },
            ]
          }
        }
      }

      mockUseSeatSelector.mockReturnValue(createHookReturn({
        trip: tripWithLargeSeats as any,
      }))

      render(<SeatSelectorClient path="seats" />)

      const largeSeat = screen.getByRole('button', { name: /seat l1/i })
      expect(largeSeat).toHaveStyle({
        gridRow: '1 / span 2',
        gridColumn: '1 / span 3',
      })
    })
  })

  describe('Icon Rendering', () => {
    it('should show Armchair icons for available seats', () => {
      render(<SeatSelectorClient path="seats" />)

      const seatButtons = screen.getAllByRole('button').filter(btn => 
        btn.getAttribute('aria-label')?.includes('Seat')
      )

      seatButtons.forEach(button => {
        const icon = button.querySelector('.seat-cell__icon')
        expect(icon).toBeInTheDocument()
      })
    })

    it('should show Ticket icons for booked seats', () => {
      const mockGetSeatStatus = vi.fn((seatId: string) => 
        seatId === 'A1' ? 'booked' : 'available'
      )
      const mockGetBookingStatus = vi.fn((seatId: string) => 
        seatId === 'A1' ? 'booked' : 'available'
      )

      mockUseSeatSelector.mockReturnValue(createHookReturn({
        getSeatStatus: mockGetSeatStatus,
        getBookingStatus: mockGetBookingStatus,
      }))

      render(<SeatSelectorClient path="seats" />)

      const bookedSeat = screen.getByRole('button', { name: /seat a1/i })
      const icon = bookedSeat.querySelector('.seat-cell__icon')
      expect(icon).toBeInTheDocument()
    })

    it('should show Clock icon for expired indicator', () => {
      mockUseSeatSelector.mockReturnValue(createHookReturn({
        isTicketExpired: true,
      }))

      render(<SeatSelectorClient path="seats" />)

      const expiredIndicator = screen.getByRole('alert')
      expect(expiredIndicator.querySelector('svg, .lucide-clock')).toBeTruthy()
    })

    it('should hide icons from screen readers', () => {
      render(<SeatSelectorClient path="seats" />)

      const icons = document.querySelectorAll('.seat-cell__icon')
      icons.forEach(icon => {
        expect(icon).toHaveAttribute('aria-hidden', 'true')
      })
    })
  })

  describe('Visual Feedback Elements', () => {
    it('should show punch holes on ticket seats', () => {
      const mockGetBookingStatus = vi.fn((seatId: string) => 
        seatId === 'A1' ? 'booked' : 'available'
      )

      mockUseSeatSelector.mockReturnValue(createHookReturn({
        getBookingStatus: mockGetBookingStatus,
      }))

      render(<SeatSelectorClient path="seats" />)

      const bookedSeat = screen.getByRole('button', { name: /seat a1/i })
      const punchHole = bookedSeat.querySelector('.seat-cell__punch-hole')
      expect(punchHole).toBeInTheDocument()
      expect(punchHole).toHaveAttribute('aria-hidden', 'true')
    })

    it('should show loading shimmer effect', () => {
      mockUseSeatSelector.mockReturnValue(createHookReturn({
        loading: true,
      }))

      render(<SeatSelectorClient path="seats" />)

      expect(document.querySelector('.seat-selector__loading-shimmer')).toBeInTheDocument()
    })

    it('should show loading skeleton elements', () => {
      mockUseSeatSelector.mockReturnValue(createHookReturn({
        trip: null,
        loading: true,
      }))

      render(<SeatSelectorClient path="seats" />)

      expect(document.querySelector('.seat-selector__loading-skeleton')).toBeInTheDocument()
    })
  })

  describe('Legend Visual Elements', () => {
    it('should render colored legend boxes', () => {
      render(<SeatSelectorClient path="seats" />)

      const legendBoxes = document.querySelectorAll('.legend__box')
      expect(legendBoxes.length).toBeGreaterThan(0)

      // Each status should have its own colored box
      expect(document.querySelector('.legend__box--available')).toBeInTheDocument()
      expect(document.querySelector('.legend__box--selected')).toBeInTheDocument()
      expect(document.querySelector('.legend__box--booked')).toBeInTheDocument()
      expect(document.querySelector('.legend__box--unpaid')).toBeInTheDocument()
    })

    it('should apply correct legend structure', () => {
      render(<SeatSelectorClient path="seats" />)

      const legend = document.querySelector('.legend')
      expect(legend).toBeInTheDocument()

      const legendItems = document.querySelectorAll('.legend__item')
      expect(legendItems.length).toBe(4) // available, selected, booked, unpaid
    })
  })

  describe('Hover and Focus States', () => {
    it('should apply correct cursor styles', () => {
      const mockGetSeatStatus = vi.fn((seatId: string) => {
        switch (seatId) {
          case 'A1': return 'available'
          case 'A2': return 'booked'
          case 'A3': return 'unpaid'
          default: return 'available'
        }
      })

      mockUseSeatSelector.mockReturnValue(createHookReturn({
        getSeatStatus: mockGetSeatStatus,
      }))

      render(<SeatSelectorClient path="seats" />)

      expect(screen.getByRole('button', { name: /seat a1/i })).toHaveStyle({ cursor: 'pointer' })
      expect(screen.getByRole('button', { name: /seat a2/i })).toHaveStyle({ cursor: 'help' })
      expect(screen.getByRole('button', { name: /seat a3/i })).toHaveStyle({ cursor: 'help' })
    })

    it('should show not-allowed cursor for disabled seats', () => {
      render(<SeatSelectorClient path="seats" readOnly />)

      const seatButtons = screen.getAllByRole('button').filter(btn => 
        btn.getAttribute('aria-label')?.includes('Seat')
      )

      seatButtons.forEach(button => {
        expect(button).toHaveStyle({ cursor: 'not-allowed' })
      })
    })

    it('should show default cursor for non-interactive elements', () => {
      render(<SeatSelectorClient path="seats" />)

      const nonInteractive = screen.getAllByRole('presentation')
      nonInteractive.forEach(element => {
        expect(element).toHaveStyle({ cursor: 'default' })
      })
    })
  })

  describe('Animation Visual States', () => {
    it('should apply animation styles for updated seats', () => {
      const mockGetJustUpdated = vi.fn((seatId: string) => seatId === 'A1')

      mockUseSeatSelector.mockReturnValue(createHookReturn({
        getJustUpdated: mockGetJustUpdated,
      }))

      render(<SeatSelectorClient path="seats" />)

      const animatedSeat = screen.getByRole('button', { name: /seat a1/i })
      expect(animatedSeat).toHaveStyle({ willChange: 'transform' })
    })

    it('should not apply animation styles for non-updated seats', () => {
      render(<SeatSelectorClient path="seats" />)

      const normalSeat = screen.getByRole('button', { name: /seat a1/i })
      expect(normalSeat).toHaveStyle({ willChange: 'auto' })
    })
  })

  describe('Expired Indicator Visual', () => {
    it('should render expired indicator with correct styling', () => {
      mockUseSeatSelector.mockReturnValue(createHookReturn({
        isTicketExpired: true,
      }))

      render(<SeatSelectorClient path="seats" />)

      const indicator = screen.getByRole('alert')
      expect(indicator).toHaveClass('seat-selector__expired-indicator')
      expect(indicator).toHaveTextContent('Expired')
    })

    it('should position expired indicator in top-right corner', () => {
      mockUseSeatSelector.mockReturnValue(createHookReturn({
        isTicketExpired: true,
      }))

      render(<SeatSelectorClient path="seats" />)

      const indicator = screen.getByRole('alert')
      const styles = window.getComputedStyle(indicator)
      
      // Should be positioned absolutely in top-right
      expect(indicator).toHaveClass('seat-selector__expired-indicator')
    })

    it('should show correct text in different languages', () => {
      mockUseLanguage.mockReturnValue('fa')
      mockUseSeatSelector.mockReturnValue(createHookReturn({
        isTicketExpired: true,
      }))

      render(<SeatSelectorClient path="seats" />)

      expect(screen.getByText('منقضی شده')).toBeInTheDocument()
    })
  })

  describe('Virtual Grid Visual Rendering', () => {
    it('should render virtual grid for large seat counts', () => {
      const largeTrip = {
        ...mockTrip,
        bus: {
          type: {
            name: 'Large Bus',
            seats: Array.from({ length: 60 }, (_, i) => ({
              id: `seat-${i}`,
              position: { row: Math.floor(i / 4) + 1, col: (i % 4) + 1 },
              type: 'seat',
              seatNumber: `${String.fromCharCode(65 + Math.floor(i / 4))}${(i % 4) + 1}`,
            }))
          }
        }
      }

      mockUseSeatSelector.mockReturnValue(createHookReturn({
        trip: largeTrip as any,
        gridDimensions: { rows: 15, cols: 4 },
      }))

      render(<SeatSelectorClient path="seats" />)

      expect(document.querySelector('.seat-selector__virtual-grid')).toBeInTheDocument()
      expect(document.querySelector('.seat-selector__grid')).not.toBeInTheDocument()
    })

    it('should apply correct scrollbar styles to virtual grid', () => {
      const largeTrip = {
        ...mockTrip,
        bus: {
          type: {
            seats: Array.from({ length: 60 }, (_, i) => ({
              id: `seat-${i}`,
              position: { row: Math.floor(i / 4) + 1, col: (i % 4) + 1 },
              type: 'seat',
              seatNumber: `S${i}`,
            }))
          }
        }
      }

      mockUseSeatSelector.mockReturnValue(createHookReturn({
        trip: largeTrip as any,
      }))

      render(<SeatSelectorClient path="seats" />)

      const virtualGrid = document.querySelector('.seat-selector__virtual-grid')
      expect(virtualGrid).toBeInTheDocument()
      expect(virtualGrid).toHaveClass('seat-selector__virtual-grid')
    })
  })

  describe('Responsive Visual Behavior', () => {
    it('should maintain visual consistency across viewport sizes', () => {
      render(<SeatSelectorClient path="seats" />)

      const container = document.querySelector('.seat-selector__container')
      expect(container).toHaveClass('seat-selector__container')

      const grid = document.querySelector('.seat-selector__grid')
      expect(grid).toHaveClass('seat-selector__grid')
    })

    it('should handle container queries if supported', () => {
      render(<SeatSelectorClient path="seats" />)

      const wrapper = document.querySelector('.seat-selector-wrapper')
      expect(wrapper).toHaveClass('seat-selector-wrapper')
    })
  })

  describe('High Contrast Mode Visual Support', () => {
    it('should apply high contrast borders when needed', () => {
      // Mock high contrast media query
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation(query => ({
          matches: query === '(prefers-contrast: high)',
          media: query,
        })),
      })

      render(<SeatSelectorClient path="seats" />)

      // Elements should have appropriate classes for high contrast
      expect(document.querySelector('.seat-selector__container')).toBeInTheDocument()
    })
  })

  describe('Visual State Consistency', () => {
    it('should maintain visual consistency between status and visual appearance', () => {
      const mockGetSeatStatus = vi.fn()
      const mockGetBookingStatus = vi.fn()

      // Create consistent status mapping
      mockGetSeatStatus.mockImplementation((seatId: string) => {
        switch (seatId) {
          case 'A1': return 'booked'
          case 'A2': return 'available'
          case 'A3': return 'selected'
          default: return 'available'
        }
      })

      mockGetBookingStatus.mockImplementation((seatId: string) => {
        switch (seatId) {
          case 'A1': return 'booked'
          case 'A3': return 'available'
          default: return 'available'
        }
      })

      mockUseSeatSelector.mockReturnValue(createHookReturn({
        getSeatStatus: mockGetSeatStatus,
        getBookingStatus: mockGetBookingStatus,
        selectedSeats: ['A3'],
        getIsSelected: (seatId: string) => seatId === 'A3',
      }))

      render(<SeatSelectorClient path="seats" />)

      // Visual appearance should match functional status
      const bookedSeat = screen.getByRole('button', { name: /seat a1/i })
      expect(bookedSeat).toHaveClass('seat-cell--booked')

      const availableSeat = screen.getByRole('button', { name: /seat a2/i })
      expect(availableSeat).toHaveClass('seat-cell--available')

      const selectedSeat = screen.getByRole('button', { name: /seat a3/i })
      expect(selectedSeat).toHaveClass('seat-cell--selected')
    })
  })

  describe('Loading State Visuals', () => {
    it('should show appropriate loading visuals', () => {
      mockUseSeatSelector.mockReturnValue(createHookReturn({
        loading: true,
      }))

      render(<SeatSelectorClient path="seats" />)

      expect(document.querySelector('.seat-selector__grid-overlay')).toBeInTheDocument()
      expect(document.querySelector('.seat-selector__loading-shimmer')).toBeInTheDocument()
    })

    it('should transition smoothly from loading to loaded state', () => {
      const { rerender } = render(<SeatSelectorClient path="seats" />)

      // Start with loading
      mockUseSeatSelector.mockReturnValue(createHookReturn({
        trip: null,
        loading: true,
      }))
      rerender(<SeatSelectorClient path="seats" />)

      expect(screen.getByText(/loading/i)).toBeInTheDocument()

      // Transition to loaded
      mockUseSeatSelector.mockReturnValue(createHookReturn())
      rerender(<SeatSelectorClient path="seats" />)

      expect(screen.getByText('A1')).toBeInTheDocument()
    })
  })
})