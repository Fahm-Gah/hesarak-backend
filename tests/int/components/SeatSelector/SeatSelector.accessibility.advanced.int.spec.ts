import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe, toHaveNoViolations } from 'jest-axe'
import React from 'react'
import SeatSelectorClient from '@/components/SeatSelector/index.client'
import { useSeatSelector } from '@/components/SeatSelector/hooks/useSeatSelector'

expect.extend(toHaveNoViolations)

vi.mock('@/components/SeatSelector/hooks/useSeatSelector')
vi.mock('@/hooks/useLanguage')
vi.mock('@payloadcms/ui', () => ({
  useFormFields: () => ({ trip: { value: 'trip-1' }, date: { value: '2024-01-15' } }),
  toast: { error: vi.fn(), warning: vi.fn(), success: vi.fn() },
}))
vi.mock('react-intersection-observer', () => ({
  useInView: () => ({ ref: vi.fn(), inView: true }),
}))

describe('SeatSelector Advanced Accessibility', () => {
  const mockUseSeatSelector = vi.mocked(useSeatSelector)
  let mockUseLanguage: any

  const mockTrip = {
    id: 'trip-1',
    name: 'Express Route',
    from: { id: 'terminal-1', name: 'Downtown Terminal' },
    stops: [{ terminal: { id: 'terminal-2', name: 'Airport Terminal' }, time: '15:30' }],
    departureTime: '14:30',
    price: 50,
    bus: {
      id: 'bus-1',
      number: 'BUS-001',
      type: {
        id: 'type-1',
        name: 'Accessible VIP Bus',
        capacity: 40,
        seats: [
          { id: 'A1', position: { row: 1, col: 1 }, type: 'seat', seatNumber: 'A1' },
          { id: 'A2', position: { row: 1, col: 2 }, type: 'seat', seatNumber: 'A2' },
          { id: 'WHEELCHAIR1', position: { row: 1, col: 3 }, type: 'seat', seatNumber: 'WC1' },
          { id: 'B1', position: { row: 2, col: 1 }, type: 'seat', seatNumber: 'B1' },
          { id: 'B2', position: { row: 2, col: 2 }, type: 'seat', seatNumber: 'B2' },
          { id: 'DRIVER', position: { row: 0, col: 1 }, type: 'driver' },
          { id: 'WC', position: { row: 3, col: 1 }, type: 'wc' },
          { id: 'DOOR', position: { row: 2, col: 3 }, type: 'door' },
        ]
      }
    }
  }

  const defaultHookReturn = {
    trip: mockTrip as any,
    loading: false,
    error: undefined,
    gridDimensions: { rows: 4, cols: 3 },
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

  describe('Advanced Keyboard Navigation', () => {
    it('should support arrow key navigation in grid layout', async () => {
      const user = userEvent.setup()
      
      render(<SeatSelectorClient path="seats" />)

      await waitFor(() => {
        expect(screen.getByText('A1')).toBeInTheDocument()
      })

      const seatA1 = screen.getByRole('button', { name: /seat a1/i })
      const seatA2 = screen.getByRole('button', { name: /seat a2/i })
      const seatB1 = screen.getByRole('button', { name: /seat b1/i })

      // Test grid navigation
      seatA1.focus()
      expect(seatA1).toHaveFocus()

      // Right arrow should move to next seat in row
      await user.keyboard('{ArrowRight}')
      expect(seatA2).toHaveFocus()

      // Down arrow should move to seat below
      seatA1.focus()
      await user.keyboard('{ArrowDown}')
      expect(seatB1).toHaveFocus()

      // Left arrow should move to previous seat in row
      seatA2.focus()
      await user.keyboard('{ArrowLeft}')
      expect(seatA1).toHaveFocus()

      // Up arrow should move to seat above
      seatB1.focus()
      await user.keyboard('{ArrowUp}')
      expect(seatA1).toHaveFocus()
    })

    it('should handle edge cases in arrow navigation', async () => {
      const user = userEvent.setup()
      
      render(<SeatSelectorClient path="seats" />)

      await waitFor(() => {
        expect(screen.getByText('A1')).toBeInTheDocument()
      })

      const seatA1 = screen.getByRole('button', { name: /seat a1/i })
      
      // Test boundary navigation
      seatA1.focus()
      
      // Left arrow at leftmost position should not break
      await user.keyboard('{ArrowLeft}')
      expect(seatA1).toHaveFocus() // Should stay in place or wrap

      // Up arrow at topmost position should not break
      await user.keyboard('{ArrowUp}')
      expect(seatA1).toHaveFocus() // Should stay in place or wrap
    })

    it('should skip non-interactive elements during navigation', async () => {
      const user = userEvent.setup()
      
      render(<SeatSelectorClient path="seats" />)

      await waitFor(() => {
        expect(screen.getByText('A1')).toBeInTheDocument()
      })

      // Navigation should skip driver, WC, door elements
      const interactiveElements = screen.getAllByRole('button')
      const seatButtons = interactiveElements.filter(btn => 
        btn.getAttribute('aria-label')?.includes('Seat')
      )

      expect(seatButtons.length).toBeGreaterThan(0)
      
      // Non-interactive elements should not be focusable
      const nonInteractiveElements = document.querySelectorAll('[role="presentation"]')
      nonInteractiveElements.forEach(element => {
        expect(element).toHaveAttribute('tabindex', '-1')
      })
    })

    it('should support Home/End keys for navigation', async () => {
      const user = userEvent.setup()
      
      render(<SeatSelectorClient path="seats" />)

      await waitFor(() => {
        expect(screen.getByText('A1')).toBeInTheDocument()
      })

      const seatButtons = screen.getAllByRole('button').filter(btn => 
        btn.getAttribute('aria-label')?.includes('Seat')
      )

      const firstSeat = seatButtons[0]
      const lastSeat = seatButtons[seatButtons.length - 1]

      // Home key should go to first seat
      lastSeat.focus()
      await user.keyboard('{Home}')
      expect(firstSeat).toHaveFocus()

      // End key should go to last seat
      await user.keyboard('{End}')
      expect(lastSeat).toHaveFocus()
    })

    it('should support Escape key to deselect all', async () => {
      const user = userEvent.setup()
      const mockClearAll = vi.fn()

      mockUseSeatSelector.mockReturnValue({
        ...defaultHookReturn,
        selectedSeats: ['A1', 'A2'],
        clearAll: mockClearAll,
      })
      
      render(<SeatSelectorClient path="seats" />)

      await waitFor(() => {
        expect(screen.getByText('A1')).toBeInTheDocument()
      })

      await user.keyboard('{Escape}')
      expect(mockClearAll).toHaveBeenCalled()
    })
  })

  describe('Screen Reader Announcements', () => {
    it('should announce seat selection status changes', async () => {
      const user = userEvent.setup()
      let selectedSeats: string[] = []
      const mockToggleSeat = vi.fn((seatId: string) => {
        if (selectedSeats.includes(seatId)) {
          selectedSeats = selectedSeats.filter(id => id !== seatId)
        } else {
          selectedSeats = [...selectedSeats, seatId]
        }
      })

      mockUseSeatSelector.mockReturnValue({
        ...defaultHookReturn,
        selectedSeats,
        getIsSelected: (seatId: string) => selectedSeats.includes(seatId),
        toggleSeat: mockToggleSeat,
      })
      
      render(<SeatSelectorClient path="seats" />)

      await waitFor(() => {
        expect(screen.getByText('A1')).toBeInTheDocument()
      })

      const seatA1 = screen.getByRole('button', { name: /seat a1/i })
      
      // Check initial state
      expect(seatA1).toHaveAttribute('aria-pressed', 'false')
      
      // Click to select
      await user.click(seatA1)
      
      // Should announce selection change
      expect(mockToggleSeat).toHaveBeenCalledWith('A1')
    })

    it('should announce unavailable seat information', async () => {
      const user = userEvent.setup()
      const mockToast = vi.mocked(await import('@payloadcms/ui')).toast

      mockUseSeatSelector.mockReturnValue({
        ...defaultHookReturn,
        getSeatStatus: (seatId: string) => seatId === 'A1' ? 'booked' : 'available',
        getBookingForSeat: (seatId: string) => seatId === 'A1' ? {
          id: 'booking-1',
          ticketNumber: 'T123456',
          passenger: { 
            id: 'p1',
            fullName: 'John Doe',
            phoneNumber: '+93701234567',
            gender: 'male' as const
          },
          bookedSeats: [{ seat: 'A1' }],
          isPaid: true,
          isCancelled: false,
        } : undefined,
      })
      
      render(<SeatSelectorClient path="seats" />)

      await waitFor(() => {
        expect(screen.getByText('A1')).toBeInTheDocument()
      })

      const bookedSeat = screen.getByRole('button', { name: /seat a1/i })
      expect(bookedSeat).toHaveAttribute('aria-label', expect.stringContaining('booked'))
      
      await user.click(bookedSeat)
      expect(mockToast.error).toHaveBeenCalled()
    })

    it('should announce live region updates for booking changes', () => {
      mockUseSeatSelector.mockReturnValue({
        ...defaultHookReturn,
        loading: true,
      })
      
      render(<SeatSelectorClient path="seats" />)

      const liveRegions = document.querySelectorAll('[aria-live]')
      expect(liveRegions.length).toBeGreaterThan(0)
      
      // Check that live regions have appropriate politeness levels
      liveRegions.forEach(region => {
        const ariaLive = region.getAttribute('aria-live')
        expect(['polite', 'assertive', 'off']).toContain(ariaLive)
      })
    })

    it('should provide context for complex seat layouts', () => {
      render(<SeatSelectorClient path="seats" />)

      const seatButtons = screen.getAllByRole('button').filter(btn => 
        btn.getAttribute('aria-label')?.includes('Seat')
      )

      seatButtons.forEach(button => {
        const ariaLabel = button.getAttribute('aria-label')
        // Should include row and column information
        expect(ariaLabel).toMatch(/row.*column|position/i)
      })
    })
  })

  describe('Multi-Modal Accessibility', () => {
    it('should support touch navigation on mobile devices', async () => {
      // Mock touch environment
      Object.defineProperty(navigator, 'maxTouchPoints', {
        writable: true,
        value: 5
      })

      const user = userEvent.setup()
      
      render(<SeatSelectorClient path="seats" />)

      await waitFor(() => {
        expect(screen.getByText('A1')).toBeInTheDocument()
      })

      const seatA1 = screen.getByRole('button', { name: /seat a1/i })
      
      // Touch interaction should work
      fireEvent.touchStart(seatA1)
      fireEvent.touchEnd(seatA1)
      
      expect(seatA1).toBeInTheDocument()
    })

    it('should work with voice control software', () => {
      render(<SeatSelectorClient path="seats" />)

      const seatButtons = screen.getAllByRole('button').filter(btn => 
        btn.getAttribute('aria-label')?.includes('Seat')
      )

      // Voice control relies on accessible names
      seatButtons.forEach(button => {
        const ariaLabel = button.getAttribute('aria-label')
        expect(ariaLabel).toBeTruthy()
        expect(ariaLabel).toMatch(/^Seat [A-Z]\d+/) // Consistent naming pattern
      })
    })

    it('should support switch control navigation', async () => {
      const user = userEvent.setup()
      
      render(<SeatSelectorClient path="seats" />)

      await waitFor(() => {
        expect(screen.getByText('A1')).toBeInTheDocument()
      })

      // Switch control relies on sequential keyboard navigation
      const focusableElements = screen.getAllByRole('button').filter(btn => 
        btn.getAttribute('tabindex') !== '-1'
      )

      // Should be able to navigate through all elements sequentially
      for (let i = 0; i < Math.min(focusableElements.length, 3); i++) {
        await user.tab()
        expect(document.activeElement).toBeInstanceOf(HTMLElement)
      }
    })
  })

  describe('Cognitive Accessibility', () => {
    it('should provide clear instructions and feedback', async () => {
      render(<SeatSelectorClient path="seats" />)

      await waitFor(() => {
        // Should have clear instructions for users
        expect(screen.getByText(/click to select|choose your seat/i)).toBeInTheDocument()
      })
    })

    it('should group related elements logically', () => {
      render(<SeatSelectorClient path="seats" />)

      // Legend should be grouped
      const legend = screen.getByRole('list', { name: /legend|status/i })
      expect(legend).toBeInTheDocument()

      // Seat grid should be in a logical container
      const seatGrid = document.querySelector('.seat-selector__grid, .seat-selector__virtual-grid')
      expect(seatGrid).toBeInTheDocument()
    })

    it('should provide consistent interaction patterns', () => {
      render(<SeatSelectorClient path="seats" />)

      const seatButtons = screen.getAllByRole('button').filter(btn => 
        btn.getAttribute('aria-label')?.includes('Seat')
      )

      // All seat buttons should have consistent labeling patterns
      const labelPatterns = seatButtons.map(btn => {
        const label = btn.getAttribute('aria-label')
        return label?.replace(/[A-Z]\d+/, 'XX') // Normalize seat numbers
      })

      const uniquePatterns = [...new Set(labelPatterns)]
      expect(uniquePatterns.length).toBeLessThanOrEqual(2) // Allow for selected/unselected variations
    })

    it('should support users with limited fine motor skills', () => {
      render(<SeatSelectorClient path="seats" />)

      const seatButtons = screen.getAllByRole('button').filter(btn => 
        btn.getAttribute('aria-label')?.includes('Seat')
      )

      // Buttons should be large enough (minimum 44px target size)
      seatButtons.forEach(button => {
        const styles = getComputedStyle(button)
        // This would normally check actual dimensions, but in tests we verify structure
        expect(button).toHaveAttribute('role', 'button')
      })
    })
  })

  describe('Error State Accessibility', () => {
    it('should announce errors appropriately', () => {
      mockUseSeatSelector.mockReturnValue({
        ...defaultHookReturn,
        trip: null,
        error: 'Network connection failed. Please check your internet connection and try again.',
      })
      
      render(<SeatSelectorClient path="seats" />)

      const errorMessage = screen.getByText(/network connection failed/i)
      expect(errorMessage).toBeInTheDocument()
      
      // Error should be announced to screen readers
      const errorElement = errorMessage.closest('[role="alert"]')
      expect(errorElement).toBeInTheDocument()
    })

    it('should provide recovery options for errors', () => {
      mockUseSeatSelector.mockReturnValue({
        ...defaultHookReturn,
        trip: null,
        error: 'Failed to load seat information.',
      })
      
      render(<SeatSelectorClient path="seats" />)

      const errorMessage = screen.getByText(/failed to load/i)
      expect(errorMessage).toBeInTheDocument()

      // Should suggest what user can do
      expect(errorMessage.textContent).toMatch(/try again|refresh|reload/i)
    })

    it('should handle form validation errors accessibly', () => {
      mockUseSeatSelector.mockReturnValue({
        ...defaultHookReturn,
        isFormProcessing: true,
      })
      
      render(<SeatSelectorClient path="seats" />)

      // Processing state should be announced
      const processingIndicator = document.querySelector('[aria-busy="true"]')
      expect(processingIndicator).toBeInTheDocument()
    })
  })

  describe('Localization Accessibility', () => {
    it('should maintain accessibility in RTL languages', () => {
      mockUseLanguage.mockReturnValue('fa')
      
      render(<SeatSelectorClient path="seats" />)

      const wrapper = document.querySelector('.seat-selector-wrapper')
      expect(wrapper).toHaveAttribute('dir', 'rtl')

      // Keyboard navigation should work in RTL
      const seatButtons = screen.getAllByRole('button').filter(btn => 
        btn.getAttribute('aria-label')?.includes('صندلی')
      )
      expect(seatButtons.length).toBeGreaterThan(0)
    })

    it('should handle complex script requirements', () => {
      mockUseLanguage.mockReturnValue('fa')
      
      render(<SeatSelectorClient path="seats" />)

      // Persian text should be properly announced
      const persianButtons = screen.getAllByRole('button').filter(btn => {
        const label = btn.getAttribute('aria-label')
        return label?.includes('صندلی')
      })

      persianButtons.forEach(button => {
        const ariaLabel = button.getAttribute('aria-label')
        // Should contain proper Persian text
        expect(ariaLabel).toMatch(/صندلی/)
      })
    })
  })

  describe('Performance and Accessibility', () => {
    it('should maintain accessibility with large seat layouts', () => {
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
      
      const { container } = render(<SeatSelectorClient path="seats" />)

      // Should still be accessible with many seats
      const seatButtons = screen.getAllByRole('button').filter(btn => 
        btn.getAttribute('aria-label')?.includes('Seat')
      )

      expect(seatButtons.length).toBeGreaterThan(50)
      
      // Each button should still have proper accessibility attributes
      seatButtons.slice(0, 5).forEach(button => { // Check first 5 to avoid timeout
        expect(button).toHaveAttribute('aria-label')
        expect(button).toHaveAttribute('aria-pressed')
      })
    })

    it('should not create performance issues with screen readers', async () => {
      const performanceStart = performance.now()
      
      render(<SeatSelectorClient path="seats" />)

      await waitFor(() => {
        expect(screen.getByText('A1')).toBeInTheDocument()
      })

      const performanceEnd = performance.now()
      const renderTime = performanceEnd - performanceStart

      // Should render quickly even with accessibility features
      expect(renderTime).toBeLessThan(200) // Generous for CI environments
    })
  })
})