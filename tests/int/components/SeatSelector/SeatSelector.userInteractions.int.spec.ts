import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor, within, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import SeatSelectorClient from '@/components/SeatSelector/index.client'
import { useSeatSelector } from '@/components/SeatSelector/hooks/useSeatSelector'

// Mock all dependencies
vi.mock('@/components/SeatSelector/hooks/useSeatSelector')
vi.mock('@/hooks/useLanguage')
vi.mock('react-intersection-observer', () => ({
  useInView: () => ({ ref: vi.fn(), inView: true }),
}))
vi.mock('@payloadcms/ui', () => ({
  useFormFields: () => ({ trip: { value: 'trip-1' }, date: { value: '2024-01-15' } }),
  toast: { error: vi.fn(), warning: vi.fn(), success: vi.fn() },
}))

describe('SeatSelector Advanced User Interactions', () => {
  const mockUseSeatSelector = vi.mocked(useSeatSelector)
  let mockUseLanguage: any

  const mockTrip = {
    id: 'trip-1',
    name: 'Express Route',
    from: { id: 'terminal-1', name: 'Downtown' },
    stops: [{ terminal: { id: 'terminal-2', name: 'Airport' }, time: '15:30' }],
    departureTime: '14:30',
    bus: {
      id: 'bus-1',
      number: 'BUS-001',
      type: {
        id: 'type-1',
        name: 'VIP Bus',
        capacity: 40,
        seats: [
          { id: 'A1', position: { row: 1, col: 1 }, type: 'seat', seatNumber: 'A1' },
          { id: 'A2', position: { row: 1, col: 2 }, type: 'seat', seatNumber: 'A2' },
          { id: 'A3', position: { row: 1, col: 3 }, type: 'seat', seatNumber: 'A3' },
          { id: 'B1', position: { row: 2, col: 1 }, type: 'seat', seatNumber: 'B1' },
          { id: 'B2', position: { row: 2, col: 2 }, type: 'seat', seatNumber: 'B2' },
          { id: 'B3', position: { row: 2, col: 3 }, type: 'seat', seatNumber: 'B3' },
          { id: 'WC1', position: { row: 3, col: 1 }, type: 'wc', seatNumber: 'WC' },
        ]
      }
    }
  }

  const defaultHookReturn = {
    trip: mockTrip as any,
    loading: false,
    error: undefined,
    gridDimensions: { rows: 3, cols: 3 },
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

  describe('Multi-seat Selection Interactions', () => {
    it('should support selecting multiple seats in sequence', async () => {
      const user = userEvent.setup()
      const mockToggleSeat = vi.fn()
      let selectedSeats: string[] = []

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

      // Select first seat
      await user.click(screen.getByRole('button', { name: /seat a1/i }))
      expect(mockToggleSeat).toHaveBeenCalledWith('A1')

      // Simulate seat being selected
      selectedSeats = ['A1']
      mockUseSeatSelector.mockReturnValue({
        ...defaultHookReturn,
        selectedSeats,
        getIsSelected: (seatId: string) => selectedSeats.includes(seatId),
        toggleSeat: mockToggleSeat,
      })

      // Re-render with updated state
      render(<SeatSelectorClient path="seats" />)

      // Select second seat
      await user.click(screen.getByRole('button', { name: /seat a2/i }))
      expect(mockToggleSeat).toHaveBeenCalledWith('A2')
    })

    it('should allow deselecting seats', async () => {
      const user = userEvent.setup()
      const mockToggleSeat = vi.fn()
      let selectedSeats = ['A1', 'A2']

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

      // Deselect first seat
      await user.click(screen.getByRole('button', { name: /seat a1/i }))
      expect(mockToggleSeat).toHaveBeenCalledWith('A1')
    })

    it('should handle clear all action', async () => {
      const user = userEvent.setup()
      const mockClearAll = vi.fn()

      mockUseSeatSelector.mockReturnValue({
        ...defaultHookReturn,
        selectedSeats: ['A1', 'A2', 'B1'],
        getIsSelected: (seatId: string) => ['A1', 'A2', 'B1'].includes(seatId),
        clearAll: mockClearAll,
      })

      render(<SeatSelectorClient path="seats" />)

      await waitFor(() => {
        const clearButton = screen.getByRole('button', { name: /clear all/i })
        expect(clearButton).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: /clear all/i }))
      expect(mockClearAll).toHaveBeenCalled()
    })

    it('should handle individual seat removal from selected list', async () => {
      const user = userEvent.setup()
      const mockRemoveSeat = vi.fn()

      mockUseSeatSelector.mockReturnValue({
        ...defaultHookReturn,
        selectedSeats: ['A1', 'A2'],
        getIsSelected: (seatId: string) => ['A1', 'A2'].includes(seatId),
        removeSeat: mockRemoveSeat,
      })

      render(<SeatSelectorClient path="seats" />)

      await waitFor(() => {
        const removeButtons = screen.getAllByRole('button', { name: /remove seat/i })
        expect(removeButtons.length).toBeGreaterThan(0)
      })

      await user.click(screen.getAllByRole('button', { name: /remove seat/i })[0])
      expect(mockRemoveSeat).toHaveBeenCalled()
    })
  })

  describe('Different Seat Status Interactions', () => {
    it('should show toast for booked seats with passenger info', async () => {
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
          bookedBy: {
            id: 'user-1',
            profile: { fullName: 'Jane Smith' }
          }
        } : undefined,
      })

      render(<SeatSelectorClient path="seats" />)

      await waitFor(() => {
        expect(screen.getByText('A1')).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: /seat a1/i }))
      
      expect(mockToast.error).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'div',
          props: expect.objectContaining({
            children: expect.arrayContaining([
              expect.stringContaining('booked by'),
              expect.any(Object), // JSX for passenger name
            ])
          })
        })
      )
    })

    it('should show toast for unpaid/reserved seats', async () => {
      const user = userEvent.setup()
      const mockToast = vi.mocked(await import('@payloadcms/ui')).toast

      mockUseSeatSelector.mockReturnValue({
        ...defaultHookReturn,
        getSeatStatus: (seatId: string) => seatId === 'A1' ? 'unpaid' : 'available',
        getBookingForSeat: (seatId: string) => seatId === 'A1' ? {
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
          paymentDeadline: new Date(Date.now() + 86400000).toISOString() // Tomorrow
        } : undefined,
      })

      render(<SeatSelectorClient path="seats" />)

      await waitFor(() => {
        expect(screen.getByText('A1')).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: /seat a1/i }))
      
      expect(mockToast.warning).toHaveBeenCalled()
    })

    it('should allow selection of expired seats', async () => {
      const user = userEvent.setup()
      const mockToggleSeat = vi.fn()
      const mockRevalidateBookings = vi.fn()

      mockUseSeatSelector.mockReturnValue({
        ...defaultHookReturn,
        getSeatStatus: (seatId: string) => seatId === 'A1' ? 'unpaid' : 'available',
        getBookingForSeat: (seatId: string) => seatId === 'A1' ? {
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
          paymentDeadline: new Date(Date.now() - 86400000).toISOString() // Yesterday (expired)
        } : undefined,
        toggleSeat: mockToggleSeat,
        revalidateBookings: mockRevalidateBookings,
      })

      render(<SeatSelectorClient path="seats" />)

      await waitFor(() => {
        expect(screen.getByText('A1')).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: /seat a1/i }))
      
      expect(mockToggleSeat).toHaveBeenCalledWith('A1')
      expect(mockRevalidateBookings).toHaveBeenCalled()
    })

    it('should handle current ticket seats selection', async () => {
      const user = userEvent.setup()
      const mockToggleSeat = vi.fn()

      mockUseSeatSelector.mockReturnValue({
        ...defaultHookReturn,
        getSeatStatus: (seatId: string) => seatId === 'A1' ? 'currentTicket' : 'available',
        toggleSeat: mockToggleSeat,
      })

      render(<SeatSelectorClient path="seats" />)

      await waitFor(() => {
        expect(screen.getByText('A1')).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: /seat a1/i }))
      
      expect(mockToggleSeat).toHaveBeenCalledWith('A1')
    })
  })

  describe('Keyboard Navigation', () => {
    it('should support Tab navigation through seats', async () => {
      const user = userEvent.setup()
      
      render(<SeatSelectorClient path="seats" />)

      await waitFor(() => {
        expect(screen.getByText('A1')).toBeInTheDocument()
      })

      const seatA1 = screen.getByRole('button', { name: /seat a1/i })
      const seatA2 = screen.getByRole('button', { name: /seat a2/i })
      const seatA3 = screen.getByRole('button', { name: /seat a3/i })

      await user.tab()
      expect(seatA1).toHaveFocus()

      await user.tab()
      expect(seatA2).toHaveFocus()

      await user.tab()
      expect(seatA3).toHaveFocus()
    })

    it('should support Shift+Tab for reverse navigation', async () => {
      const user = userEvent.setup()
      
      render(<SeatSelectorClient path="seats" />)

      await waitFor(() => {
        expect(screen.getByText('A1')).toBeInTheDocument()
      })

      const seatA2 = screen.getByRole('button', { name: /seat a2/i })
      const seatA1 = screen.getByRole('button', { name: /seat a1/i })

      // Focus on A2
      seatA2.focus()
      expect(seatA2).toHaveFocus()

      await user.keyboard('{Shift>}{Tab}{/Shift}')
      expect(seatA1).toHaveFocus()
    })

    it('should support Enter key to select seats', async () => {
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
      seatA1.focus()

      await user.keyboard('{Enter}')
      expect(mockToggleSeat).toHaveBeenCalledWith('A1')
    })

    it('should support Space key to select seats', async () => {
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
      seatA1.focus()

      await user.keyboard(' ')
      expect(mockToggleSeat).toHaveBeenCalledWith('A1')
    })

    it('should support arrow key navigation in grid layout', async () => {
      const user = userEvent.setup()
      
      render(<SeatSelectorClient path="seats" />)

      await waitFor(() => {
        expect(screen.getByText('A1')).toBeInTheDocument()
      })

      const seatA1 = screen.getByRole('button', { name: /seat a1/i })
      const seatA2 = screen.getByRole('button', { name: /seat a2/i })
      const seatB1 = screen.getByRole('button', { name: /seat b1/i })

      seatA1.focus()
      expect(seatA1).toHaveFocus()

      // Right arrow should move to next seat in row
      await user.keyboard('{ArrowRight}')
      expect(seatA2).toHaveFocus()

      // Down arrow should move to seat below
      seatA1.focus()
      await user.keyboard('{ArrowDown}')
      expect(seatB1).toHaveFocus()
    })
  })

  describe('Visual State Updates and Animations', () => {
    it('should show visual feedback for just updated seats', () => {
      mockUseSeatSelector.mockReturnValue({
        ...defaultHookReturn,
        getJustUpdated: (seatId: string) => seatId === 'A1',
      })

      render(<SeatSelectorClient path="seats" />)

      const seatA1 = screen.getByRole('button', { name: /seat a1/i })
      expect(seatA1).toHaveClass('just-updated') // Assuming this class is applied
    })

    it('should apply correct visual states for different seat statuses', async () => {
      mockUseSeatSelector.mockReturnValue({
        ...defaultHookReturn,
        getSeatStatus: (seatId: string) => {
          switch (seatId) {
            case 'A1': return 'available'
            case 'A2': return 'selected'
            case 'A3': return 'booked'
            case 'B1': return 'unpaid'
            case 'B2': return 'currentTicket'
            default: return 'available'
          }
        },
        getIsSelected: (seatId: string) => seatId === 'A2',
      })

      render(<SeatSelectorClient path="seats" />)

      await waitFor(() => {
        const seatA1 = screen.getByRole('button', { name: /seat a1/i })
        const seatA2 = screen.getByRole('button', { name: /seat a2/i })
        const seatA3 = screen.getByRole('button', { name: /seat a3/i })
        const seatB1 = screen.getByRole('button', { name: /seat b1/i })
        const seatB2 = screen.getByRole('button', { name: /seat b2/i })

        expect(seatA1).toHaveAttribute('data-status', 'available')
        expect(seatA2).toHaveAttribute('data-status', 'selected')
        expect(seatA3).toHaveAttribute('data-status', 'booked')
        expect(seatB1).toHaveAttribute('data-status', 'unpaid')
        expect(seatB2).toHaveAttribute('data-status', 'currentTicket')
      })
    })

    it('should handle loading state during seat interactions', async () => {
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

      render(<SeatSelectorClient path="seats" />)

      await waitFor(() => {
        expect(screen.getByText('A1')).toBeInTheDocument()
      })

      const seatA1 = screen.getByRole('button', { name: /seat a1/i })
      
      await user.click(seatA1)
      expect(mockToggleSeat).toHaveBeenCalledWith('A1')

      // Re-render with loading state
      mockUseSeatSelector.mockReturnValue({
        ...defaultHookReturn,
        loading: true,
      })

      render(<SeatSelectorClient path="seats" />)

      // Should show loading overlay
      expect(document.querySelector('.seat-selector__grid-overlay')).toBeInTheDocument()
    })
  })

  describe('Form Processing State', () => {
    it('should disable interactions during form processing', async () => {
      const user = userEvent.setup()
      const mockToggleSeat = vi.fn()

      mockUseSeatSelector.mockReturnValue({
        ...defaultHookReturn,
        isFormProcessing: true,
        toggleSeat: mockToggleSeat,
      })

      render(<SeatSelectorClient path="seats" />)

      await waitFor(() => {
        expect(screen.getByText('A1')).toBeInTheDocument()
      })

      const seatA1 = screen.getByRole('button', { name: /seat a1/i })
      expect(seatA1).toBeDisabled()

      await user.click(seatA1)
      expect(mockToggleSeat).not.toHaveBeenCalled()
    })

    it('should show processing indicator', () => {
      mockUseSeatSelector.mockReturnValue({
        ...defaultHookReturn,
        isFormProcessing: true,
      })

      render(<SeatSelectorClient path="seats" />)

      // Should indicate processing state
      expect(document.querySelector('[aria-busy="true"]')).toBeInTheDocument()
    })
  })

  describe('Error Recovery and Retry', () => {
    it('should support retry on booking validation failure', async () => {
      const user = userEvent.setup()
      const mockRevalidateBookings = vi.fn()
      const mockToggleSeat = vi.fn()

      mockUseSeatSelector.mockReturnValue({
        ...defaultHookReturn,
        toggleSeat: mockToggleSeat,
        revalidateBookings: mockRevalidateBookings,
      })

      render(<SeatSelectorClient path="seats" />)

      await waitFor(() => {
        expect(screen.getByText('A1')).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: /seat a1/i }))
      
      expect(mockToggleSeat).toHaveBeenCalledWith('A1')
      expect(mockRevalidateBookings).toHaveBeenCalled()
    })

    it('should handle concurrent seat selection attempts', async () => {
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

      // Simulate rapid clicks
      await Promise.all([
        user.click(seatA1),
        user.click(seatA2),
      ])

      expect(mockToggleSeat).toHaveBeenCalledTimes(2)
      expect(mockToggleSeat).toHaveBeenCalledWith('A1')
      expect(mockToggleSeat).toHaveBeenCalledWith('A2')
    })
  })

  describe('Complex Seat Layout Navigation', () => {
    it('should handle non-seat elements (WC, driver, etc.)', async () => {
      render(<SeatSelectorClient path="seats" />)

      await waitFor(() => {
        expect(screen.getByText('WC')).toBeInTheDocument()
      })

      const wcElement = screen.getByText('WC')
      expect(wcElement).not.toHaveAttribute('role', 'button')
      expect(wcElement).not.toBeClickable()
    })

    it('should handle seat span sizes in grid layout', () => {
      const spanSeatTrip = {
        ...mockTrip,
        bus: {
          ...mockTrip.bus,
          type: {
            ...mockTrip.bus.type,
            seats: [
              { 
                id: 'WIDE1', 
                position: { row: 1, col: 1 }, 
                size: { rowSpan: 1, colSpan: 2 },
                type: 'seat', 
                seatNumber: 'WIDE1' 
              },
              { id: 'A3', position: { row: 1, col: 3 }, type: 'seat', seatNumber: 'A3' },
            ]
          }
        }
      }

      mockUseSeatSelector.mockReturnValue({
        ...defaultHookReturn,
        trip: spanSeatTrip as any,
        gridDimensions: { rows: 1, cols: 3 },
      })

      render(<SeatSelectorClient path="seats" />)

      const wideSeat = screen.getByRole('button', { name: /seat wide1/i })
      expect(wideSeat).toBeInTheDocument()
      
      // Should have correct grid styling for span
      expect(wideSeat.style.gridColumn).toContain('span 2')
    })
  })

  describe('Internationalization Support', () => {
    it('should display Persian/Farsi text correctly', () => {
      mockUseLanguage.mockReturnValue('fa')

      render(<SeatSelectorClient path="seats" />)

      // Should show Persian instructions
      expect(screen.getByText(/برای انتخاب کلیک کنید/)).toBeInTheDocument()
    })

    it('should handle RTL layout for Persian', () => {
      mockUseLanguage.mockReturnValue('fa')

      render(<SeatSelectorClient path="seats" />)

      const wrapper = document.querySelector('.seat-selector-wrapper')
      expect(wrapper).toHaveAttribute('dir', 'rtl')
    })

    it('should format seat numbers correctly for different languages', async () => {
      mockUseLanguage.mockReturnValue('fa')

      render(<SeatSelectorClient path="seats" />)

      await waitFor(() => {
        // Persian numbers should be displayed
        expect(screen.getByText('الف۱')).toBeInTheDocument()
      })
    })
  })
})