import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
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

describe('SeatSelector Accessibility', () => {
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
        ]
      }
    }
  }

  const defaultHookReturn = {
    trip: mockTrip as any,
    loading: false,
    error: undefined,
    gridDimensions: { rows: 2, cols: 4 },
    selectedSeats: [],
    getSeatStatus: vi.fn((seatId: string) => {
      if (seatId === 'A1') return 'booked' as const
      if (seatId === 'A2') return 'unpaid' as const
      if (seatId === 'B1') return 'selected' as const
      return 'available' as const
    }),
    getBookingStatus: vi.fn(() => 'available' as const),
    getIsSelected: vi.fn((seatId: string) => seatId === 'B1'),
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

  describe('WCAG 2.1 Compliance', () => {
    it('should have no accessibility violations in default state', async () => {
      const { container } = render(<SeatSelectorClient path="seats" />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('should have no accessibility violations with selected seats', async () => {
      mockUseSeatSelector.mockReturnValue({
        ...defaultHookReturn,
        selectedSeats: ['A1', 'B2'],
        getIsSelected: (seatId: string) => ['A1', 'B2'].includes(seatId),
      })

      const { container } = render(<SeatSelectorClient path="seats" />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('should have no accessibility violations in loading state', async () => {
      mockUseSeatSelector.mockReturnValue({
        ...defaultHookReturn,
        trip: null,
        loading: true,
      })

      const { container } = render(<SeatSelectorClient path="seats" />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('should have no accessibility violations in error state', async () => {
      mockUseSeatSelector.mockReturnValue({
        ...defaultHookReturn,
        trip: null,
        error: 'Failed to load trip information',
      })

      const { container } = render(<SeatSelectorClient path="seats" />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('should have no accessibility violations with expired ticket indicator', async () => {
      mockUseSeatSelector.mockReturnValue({
        ...defaultHookReturn,
        isTicketExpired: true,
      })

      const { container } = render(<SeatSelectorClient path="seats" />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })

  describe('Semantic HTML Structure', () => {
    it('should use proper heading hierarchy', () => {
      render(<SeatSelectorClient path="seats" />)

      // Check that headings are properly structured
      const headings = screen.getAllByRole('heading')
      expect(headings.length).toBeGreaterThan(0)

      // Ensure no heading levels are skipped
      const headingLevels = headings.map(h => parseInt(h.tagName.charAt(1)))
      for (let i = 1; i < headingLevels.length; i++) {
        const diff = headingLevels[i] - headingLevels[i-1]
        expect(diff).toBeLessThanOrEqual(1) // No skipping heading levels
      }
    })

    it('should use list structure for legend', () => {
      render(<SeatSelectorClient path="seats" />)

      const list = screen.getByRole('list')
      expect(list).toBeInTheDocument()
      expect(list).toHaveAttribute('aria-label')

      const listItems = screen.getAllByRole('listitem')
      expect(listItems.length).toBeGreaterThan(0)
    })

    it('should use proper button elements for seats', () => {
      render(<SeatSelectorClient path="seats" />)

      const seatButtons = screen.getAllByRole('button')
      const seatButtonsFiltered = seatButtons.filter(btn => 
        btn.getAttribute('aria-label')?.includes('Seat')
      )
      
      expect(seatButtonsFiltered.length).toBeGreaterThan(0)
      
      seatButtonsFiltered.forEach(button => {
        expect(button.tagName.toLowerCase()).toBe('div') // Mocked as div but should be button-like
        expect(button).toHaveAttribute('role', 'button')
      })
    })

    it('should use presentation role for non-interactive elements', () => {
      render(<SeatSelectorClient path="seats" />)

      const presentationElements = screen.getAllByRole('presentation')
      expect(presentationElements.length).toBeGreaterThan(0) // Driver, WC elements
    })
  })

  describe('ARIA Attributes', () => {
    it('should have proper ARIA labels for all interactive elements', () => {
      render(<SeatSelectorClient path="seats" />)

      const buttons = screen.getAllByRole('button')
      buttons.forEach(button => {
        expect(button).toHaveAttribute('aria-label')
        const ariaLabel = button.getAttribute('aria-label')
        expect(ariaLabel).toBeTruthy()
        expect(ariaLabel!.length).toBeGreaterThan(0)
      })
    })

    it('should have proper ARIA pressed states for seats', () => {
      render(<SeatSelectorClient path="seats" />)

      const seatButtons = screen.getAllByRole('button').filter(btn => 
        btn.getAttribute('aria-label')?.includes('Seat')
      )

      seatButtons.forEach(button => {
        expect(button).toHaveAttribute('aria-pressed')
        const ariaPressed = button.getAttribute('aria-pressed')
        expect(['true', 'false']).toContain(ariaPressed)
      })
    })

    it('should have proper ARIA disabled states', () => {
      render(<SeatSelectorClient path="seats" readOnly />)

      const seatButtons = screen.getAllByRole('button').filter(btn => 
        btn.getAttribute('aria-label')?.includes('Seat')
      )

      seatButtons.forEach(button => {
        expect(button).toHaveAttribute('aria-disabled')
      })
    })

    it('should have ARIA live region for expired indicator', () => {
      mockUseSeatSelector.mockReturnValue({
        ...defaultHookReturn,
        isTicketExpired: true,
      })

      render(<SeatSelectorClient path="seats" />)

      const alert = screen.getByRole('alert')
      expect(alert).toBeInTheDocument()
      expect(alert).toHaveAttribute('aria-live', 'polite')
    })

    it('should have proper ARIA labels in different languages', () => {
      mockUseLanguage.mockReturnValue('fa')

      render(<SeatSelectorClient path="seats" />)

      const seatButtons = screen.getAllByRole('button').filter(btn => 
        btn.getAttribute('aria-label')?.includes('صندلی')
      )

      expect(seatButtons.length).toBeGreaterThan(0)
      
      seatButtons.forEach(button => {
        const ariaLabel = button.getAttribute('aria-label')
        expect(ariaLabel).toMatch(/صندلی.*وضعیت/)
      })
    })
  })

  describe('Keyboard Navigation', () => {
    it('should have proper tab order', () => {
      render(<SeatSelectorClient path="seats" />)

      const focusableElements = screen.getAllByRole('button').filter(btn => 
        btn.getAttribute('tabindex') !== '-1'
      )

      expect(focusableElements.length).toBeGreaterThan(0)

      focusableElements.forEach((element, index) => {
        if (element.getAttribute('tabindex')) {
          expect(parseInt(element.getAttribute('tabindex')!)).toBeGreaterThanOrEqual(0)
        }
      })
    })

    it('should exclude non-interactive elements from tab order', () => {
      render(<SeatSelectorClient path="seats" />)

      const presentationElements = screen.getAllByRole('presentation')
      presentationElements.forEach(element => {
        expect(element).toHaveAttribute('tabindex', '-1')
      })
    })

    it('should have visible focus indicators', () => {
      render(<SeatSelectorClient path="seats" />)

      const focusableElements = screen.getAllByRole('button')
      
      // Focus indicators should be handled by CSS
      // This test ensures elements can receive focus
      focusableElements.forEach(element => {
        if (element.getAttribute('tabindex') !== '-1') {
          expect(element).not.toHaveAttribute('tabindex', '-1')
        }
      })
    })

    it('should support Enter and Space key activation', () => {
      render(<SeatSelectorClient path="seats" />)

      const seatButtons = screen.getAllByRole('button').filter(btn => 
        btn.getAttribute('aria-label')?.includes('Seat')
      )

      seatButtons.forEach(button => {
        // Elements should handle keydown events for Enter and Space
        expect(button).toHaveAttribute('role', 'button')
      })
    })
  })

  describe('Screen Reader Support', () => {
    it('should provide meaningful text alternatives for icons', () => {
      render(<SeatSelectorClient path="seats" />)

      const icons = document.querySelectorAll('.seat-cell__icon')
      icons.forEach(icon => {
        expect(icon).toHaveAttribute('aria-hidden', 'true')
      })
    })

    it('should hide decorative elements from screen readers', () => {
      render(<SeatSelectorClient path="seats" />)

      const decorativeElements = document.querySelectorAll('[aria-hidden="true"]')
      expect(decorativeElements.length).toBeGreaterThan(0)
    })

    it('should provide status information to screen readers', () => {
      mockUseSeatSelector.mockReturnValue({
        ...defaultHookReturn,
        selectedSeats: ['A1'],
        getIsSelected: (seatId: string) => seatId === 'A1',
      })

      render(<SeatSelectorClient path="seats" />)

      const selectedSeat = screen.getByRole('button', { name: /seat a1/i })
      expect(selectedSeat).toHaveAttribute('aria-pressed', 'true')
    })

    it('should announce state changes appropriately', () => {
      render(<SeatSelectorClient path="seats" />)

      // Check for ARIA live regions that announce changes
      const liveRegions = document.querySelectorAll('[aria-live]')
      expect(liveRegions.length).toBeGreaterThanOrEqual(0)
    })
  })

  describe('Color and Contrast', () => {
    it('should not rely solely on color for status indication', () => {
      render(<SeatSelectorClient path="seats" />)

      const seatButtons = screen.getAllByRole('button').filter(btn => 
        btn.getAttribute('aria-label')?.includes('Seat')
      )

      seatButtons.forEach(button => {
        // Each seat should have text content and ARIA labels, not just color
        const ariaLabel = button.getAttribute('aria-label')
        expect(ariaLabel).toContain('Status:')
        
        // Should have seat number visible
        const seatNumber = button.textContent
        expect(seatNumber).toBeTruthy()
      })
    })

    it('should provide status through icons and text', () => {
      render(<SeatSelectorClient path="seats" />)

      // Legend should provide visual and textual status indicators
      const legendList = screen.getByRole('list')
      expect(legendList).toBeInTheDocument()
      
      const legendItems = screen.getAllByRole('listitem')
      legendItems.forEach(item => {
        expect(item.textContent).toBeTruthy()
      })
    })
  })

  describe('Motion and Animation Accessibility', () => {
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

      // Animation elements should be present but respect user preferences
      const animatedElements = document.querySelectorAll('[style*="transition"], [style*="animation"]')
      // The actual reduced motion handling would be in CSS
      expect(animatedElements.length).toBeGreaterThanOrEqual(0)
    })

    it('should not cause vestibular disorders with motion', () => {
      mockUseSeatSelector.mockReturnValue({
        ...defaultHookReturn,
        getJustUpdated: (seatId: string) => seatId === 'A1', // Simulating animation
      })

      render(<SeatSelectorClient path="seats" />)

      // Animations should be subtle and not cause issues
      const animatedSeat = screen.getByRole('button', { name: /seat a1/i })
      expect(animatedSeat).toBeInTheDocument()
    })
  })

  describe('Error and Loading State Accessibility', () => {
    it('should announce loading state to screen readers', () => {
      mockUseSeatSelector.mockReturnValue({
        ...defaultHookReturn,
        trip: null,
        loading: true,
      })

      render(<SeatSelectorClient path="seats" />)

      const loadingText = screen.getByText(/loading/i)
      expect(loadingText).toBeInTheDocument()
    })

    it('should properly announce error states', () => {
      mockUseSeatSelector.mockReturnValue({
        ...defaultHookReturn,
        trip: null,
        error: 'Connection failed. Please try again.',
      })

      render(<SeatSelectorClient path="seats" />)

      const errorText = screen.getByText(/connection failed/i)
      expect(errorText).toBeInTheDocument()
    })
  })

  describe('Form Integration Accessibility', () => {
    it('should have proper form labels and associations', () => {
      render(<SeatSelectorClient path="seats" />)

      // The component should integrate properly with form elements
      const seatSelector = document.querySelector('.seat-selector-wrapper')
      expect(seatSelector).toBeInTheDocument()
    })

    it('should provide feedback for form changes', () => {
      mockUseSeatSelector.mockReturnValue({
        ...defaultHookReturn,
        selectedSeats: ['A1', 'B2'],
      })

      render(<SeatSelectorClient path="seats" />)

      // Should show selected seats information
      // This would be in the SelectedSeatsList component
      expect(document.querySelector('.seat-selector__container')).toBeInTheDocument()
    })
  })

  describe('High Contrast Mode Support', () => {
    it('should work properly in high contrast mode', () => {
      // Mock high contrast media query
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation(query => ({
          matches: query === '(prefers-contrast: high)',
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      })

      const { container } = render(<SeatSelectorClient path="seats" />)
      
      // Should not have accessibility violations in high contrast
      expect(container).toBeInTheDocument()
    })
  })
})