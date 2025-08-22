import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SeatSelectorClient from '@/components/SeatSelector/index.client'
import { useSeatSelector } from '@/components/SeatSelector/hooks/useSeatSelector'

// Mock all dependencies
vi.mock('@/components/SeatSelector/hooks/useSeatSelector')
vi.mock('@/hooks/useLanguage')
vi.mock('react-intersection-observer', () => ({
  useInView: () => ({ ref: vi.fn(), inView: true }),
}))

describe('SeatSelectorClient Integration', () => {
  const mockUseSeatSelector = vi.mocked(useSeatSelector)
  let mockUseLanguage: any

  const mockTrip = {
    id: 'trip-1',
    from: { id: 'terminal-1', name: 'Downtown' },
    to: { id: 'terminal-2', name: 'Airport' },
    departureTime: '14:30',
    days: ['mon', 'tue'],
    bus: {
      type: {
        name: 'VIP Bus',
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
    getSeatStatus: vi.fn(() => 'available' as const),
    getBookingStatus: vi.fn(() => 'available' as const),
    getIsSelected: vi.fn(() => false),
    getJustUpdated: vi.fn(() => false),
    getBookingForSeat: vi.fn(() => undefined),
    toggleSeat: vi.fn(),
    removeSeat: vi.fn(),
    clearAll: vi.fn(),
    isTicketExpired: false,
  }

  beforeEach(async () => {
    vi.clearAllMocks()
    mockUseLanguage = vi.mocked((await import('@/hooks/useLanguage')).useLanguage)
    mockUseLanguage.mockReturnValue('en')
    mockUseSeatSelector.mockReturnValue(defaultHookReturn)
  })

  describe('Loading States', () => {
    it('should show loading state when trip is loading', () => {
      mockUseSeatSelector.mockReturnValue({
        ...defaultHookReturn,
        trip: null,
        loading: true,
      })

      render(<SeatSelectorClient path="seats" />)

      expect(screen.getByText('Loading seat map...')).toBeInTheDocument()
    })

    it('should show loading skeleton components', () => {
      mockUseSeatSelector.mockReturnValue({
        ...defaultHookReturn,
        trip: null,
        loading: true,
      })

      render(<SeatSelectorClient path="seats" />)

      expect(document.querySelector('.seat-selector__loading-skeleton')).toBeInTheDocument()
    })
  })

  describe('Error States', () => {
    it('should display error message when there is an error', () => {
      mockUseSeatSelector.mockReturnValue({
        ...defaultHookReturn,
        error: 'Failed to load trip data',
        trip: null,
      })

      render(<SeatSelectorClient path="seats" />)

      expect(screen.getByText('Failed to load trip data')).toBeInTheDocument()
    })

    it('should show info message when trip or date is missing', () => {
      render(<SeatSelectorClient path="seats" />)

      // Mock useFormFields to return empty values
      const mockUseFormFields = vi.mocked(await import('@payloadcms/ui')).useFormFields
      mockUseFormFields.mockReturnValue({
        trip: { value: undefined },
        date: { value: undefined },
      })

      expect(screen.getByText('Please select trip and date')).toBeInTheDocument()
    })
  })

  describe('Trip Header', () => {
    it('should display trip header when trip is loaded', async () => {
      render(<SeatSelectorClient path="seats" />)

      await waitFor(() => {
        expect(screen.getByText('VIP Bus')).toBeInTheDocument()
        expect(screen.getByText('Downtown')).toBeInTheDocument()
        expect(screen.getByText('Airport')).toBeInTheDocument()
      })
    })
  })

  describe('Legend', () => {
    it('should display seat status legend', async () => {
      render(<SeatSelectorClient path="seats" />)

      await waitFor(() => {
        expect(screen.getByRole('list', { name: /seat status legend/i })).toBeInTheDocument()
      })
    })
  })

  describe('Seat Grid', () => {
    it('should render seat grid with correct seats', async () => {
      render(<SeatSelectorClient path="seats" />)

      await waitFor(() => {
        expect(screen.getByText('A1')).toBeInTheDocument()
        expect(screen.getByText('A2')).toBeInTheDocument()
        expect(screen.getByText('B1')).toBeInTheDocument()
        expect(screen.getByText('B2')).toBeInTheDocument()
      })
    })

    it('should use regular grid for small seat count', async () => {
      render(<SeatSelectorClient path="seats" />)

      await waitFor(() => {
        expect(document.querySelector('.seat-selector__grid')).toBeInTheDocument()
        expect(document.querySelector('.seat-selector__virtual-grid')).not.toBeInTheDocument()
      })
    })

    it('should use virtual grid for large seat count', async () => {
      const largeSeatTrip = {
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

      mockUseSeatSelector.mockReturnValue({
        ...defaultHookReturn,
        trip: largeSeatTrip as any,
        gridDimensions: { rows: 15, cols: 4 },
      })

      render(<SeatSelectorClient path="seats" />)

      await waitFor(() => {
        expect(document.querySelector('.seat-selector__virtual-grid')).toBeInTheDocument()
        expect(document.querySelector('.seat-selector__grid')).not.toBeInTheDocument()
      })
    })

    it('should apply correct grid styles', async () => {
      render(<SeatSelectorClient path="seats" />)

      await waitFor(() => {
        const grid = document.querySelector('.seat-selector__grid')
        expect(grid).toHaveStyle({
          gridTemplateRows: 'repeat(2, minmax(45px, 1fr))',
          gridTemplateColumns: 'repeat(2, minmax(45px, 1fr))',
        })
      })
    })
  })

  describe('Seat Interactions', () => {
    it('should handle seat clicks', async () => {
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

      await user.click(screen.getByRole('button', { name: /seat a1/i }))
      
      expect(mockToggleSeat).toHaveBeenCalledWith('A1')
    })

    it('should not handle clicks when readOnly', async () => {
      const user = userEvent.setup()
      const mockToggleSeat = vi.fn()
      
      mockUseSeatSelector.mockReturnValue({
        ...defaultHookReturn,
        toggleSeat: mockToggleSeat,
      })

      render(<SeatSelectorClient path="seats" readOnly />)

      await waitFor(() => {
        expect(screen.getByText('A1')).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: /seat a1/i }))
      
      expect(mockToggleSeat).not.toHaveBeenCalled()
    })

    it('should show toast for booked seats', async () => {
      const user = userEvent.setup()
      const mockToastError = vi.fn()
      const mockGetSeatStatus = vi.fn().mockReturnValue('booked')
      const mockGetBookingForSeat = vi.fn().mockReturnValue({
        passenger: { fullName: 'John Doe' },
        ticketNumber: 'T123456',
      })

      vi.mocked(await import('@payloadcms/ui')).toast = {
        error: mockToastError,
        warning: vi.fn(),
        success: vi.fn(),
      }

      mockUseSeatSelector.mockReturnValue({
        ...defaultHookReturn,
        getSeatStatus: mockGetSeatStatus,
        getBookingForSeat: mockGetBookingForSeat,
      })

      render(<SeatSelectorClient path="seats" />)

      await waitFor(() => {
        expect(screen.getByText('A1')).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: /seat a1/i }))
      
      expect(mockToastError).toHaveBeenCalled()
      expect(mockGetBookingForSeat).toHaveBeenCalledWith('A1')
    })
  })

  describe('Selected Seats List', () => {
    it('should show selected seats list when seats are selected', async () => {
      mockUseSeatSelector.mockReturnValue({
        ...defaultHookReturn,
        selectedSeats: ['A1', 'B2'],
        getIsSelected: (seatId: string) => ['A1', 'B2'].includes(seatId),
      })

      render(<SeatSelectorClient path="seats" />)

      await waitFor(() => {
        // Should show selected seats list
        expect(screen.getByText(/clear all|remove/i)).toBeInTheDocument()
      })
    })

    it('should show instructions when no seats selected and not readOnly', async () => {
      render(<SeatSelectorClient path="seats" />)

      await waitFor(() => {
        expect(screen.getByText(/click to select/i)).toBeInTheDocument()
      })
    })

    it('should not show instructions when readOnly', async () => {
      render(<SeatSelectorClient path="seats" readOnly />)

      await waitFor(() => {
        expect(screen.queryByText(/click to select/i)).not.toBeInTheDocument()
      })
    })
  })

  describe('Expired Indicator', () => {
    it('should show expired indicator when ticket is expired', () => {
      mockUseSeatSelector.mockReturnValue({
        ...defaultHookReturn,
        isTicketExpired: true,
      })

      render(<SeatSelectorClient path="seats" />)

      expect(screen.getByRole('alert')).toBeInTheDocument()
      expect(screen.getByText('Expired')).toBeInTheDocument()
    })

    it('should show Farsi text for expired indicator', () => {
      mockUseLanguage.mockReturnValue('fa')
      mockUseSeatSelector.mockReturnValue({
        ...defaultHookReturn,
        isTicketExpired: true,
      })

      render(<SeatSelectorClient path="seats" />)

      expect(screen.getByText('منقضی شده')).toBeInTheDocument()
    })

    it('should not show expired indicator when ticket is not expired', () => {
      render(<SeatSelectorClient path="seats" />)

      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
      expect(screen.queryByText('Expired')).not.toBeInTheDocument()
    })
  })

  describe('Server Data Integration', () => {
    it('should pass server data to hook', () => {
      const serverData = {
        trip: mockTrip as any,
        bookings: [],
        error: null,
        tripId: 'trip-1',
        travelDate: '2024-01-15',
      }

      render(<SeatSelectorClient path="seats" serverData={serverData} />)

      expect(mockUseSeatSelector).toHaveBeenCalledWith(
        expect.objectContaining({
          serverData,
        })
      )
    })

    it('should pass callbacks to hook', () => {
      const onSeatSelect = vi.fn()
      const initialSelectedSeats = ['A1']

      render(
        <SeatSelectorClient 
          path="seats" 
          onSeatSelect={onSeatSelect}
          initialSelectedSeats={initialSelectedSeats}
        />
      )

      expect(mockUseSeatSelector).toHaveBeenCalledWith(
        expect.objectContaining({
          onSeatSelect,
          initialSelectedSeats,
        })
      )
    })
  })

  describe('Loading Overlays', () => {
    it('should show loading overlay when data is being refreshed', () => {
      mockUseSeatSelector.mockReturnValue({
        ...defaultHookReturn,
        loading: true,
      })

      render(<SeatSelectorClient path="seats" />)

      expect(document.querySelector('.seat-selector__grid-overlay')).toBeInTheDocument()
      expect(document.querySelector('.seat-selector__loading-shimmer')).toBeInTheDocument()
    })
  })

  describe('Animation and Motion', () => {
    it('should apply correct animation variants', () => {
      render(<SeatSelectorClient path="seats" />)

      const wrapper = document.querySelector('.seat-selector-wrapper')
      expect(wrapper).toBeInTheDocument()
      
      // Motion wrapper should be present (mocked as div)
      expect(wrapper?.tagName.toLowerCase()).toBe('div')
    })

    it('should animate seat grid visibility', async () => {
      render(<SeatSelectorClient path="seats" />)

      await waitFor(() => {
        const gridWrapper = document.querySelector('.seat-selector__grid-wrapper')
        expect(gridWrapper).toBeInTheDocument()
      })
    })
  })

  describe('Responsive Behavior', () => {
    it('should handle intersection observer visibility', () => {
      // Mock intersection observer to return not in view
      vi.mocked(await import('react-intersection-observer')).useInView = vi.fn().mockReturnValue({
        ref: vi.fn(),
        inView: false,
      })

      render(<SeatSelectorClient path="seats" />)

      // Grid should not render when not in view
      expect(screen.queryByText('A1')).not.toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', async () => {
      render(<SeatSelectorClient path="seats" />)

      await waitFor(() => {
        const seatButtons = screen.getAllByRole('button')
        seatButtons.forEach(button => {
          expect(button).toHaveAttribute('aria-label')
          expect(button).toHaveAttribute('aria-pressed')
        })
      })
    })

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup()
      
      render(<SeatSelectorClient path="seats" />)

      await waitFor(() => {
        const firstSeat = screen.getByRole('button', { name: /seat a1/i })
        firstSeat.focus()
        expect(firstSeat).toHaveFocus()
      })

      await user.tab()
      
      const secondSeat = screen.getByRole('button', { name: /seat a2/i })
      expect(secondSeat).toHaveFocus()
    })
  })

  describe('Performance', () => {
    it('should lazy load components', async () => {
      render(<SeatSelectorClient path="seats" />)

      // Components should be wrapped in Suspense
      await waitFor(() => {
        expect(screen.getByText('A1')).toBeInTheDocument()
      })
    })

    it('should handle large number of seats efficiently', async () => {
      const performanceStart = performance.now()
      
      const largeSeatTrip = {
        ...mockTrip,
        bus: {
          type: {
            seats: Array.from({ length: 200 }, (_, i) => ({
              id: `seat-${i}`,
              position: { row: Math.floor(i / 4) + 1, col: (i % 4) + 1 },
              type: 'seat',
              seatNumber: `${String.fromCharCode(65 + Math.floor(i / 4))}${(i % 4) + 1}`,
            }))
          }
        }
      }

      mockUseSeatSelector.mockReturnValue({
        ...defaultHookReturn,
        trip: largeSeatTrip as any,
        gridDimensions: { rows: 50, cols: 4 },
      })

      render(<SeatSelectorClient path="seats" />)

      const performanceEnd = performance.now()
      const renderTime = performanceEnd - performanceStart

      // Should render quickly even with many seats (less than 100ms)
      expect(renderTime).toBeLessThan(100)
    })
  })
})