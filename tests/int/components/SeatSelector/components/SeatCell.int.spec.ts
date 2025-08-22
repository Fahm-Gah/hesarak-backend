import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { SeatCell } from '@/components/SeatSelector/components/SeatCell'
import { useLanguage } from '@/hooks/useLanguage'

vi.mock('@/hooks/useLanguage')

describe('SeatCell', () => {
  const mockUseLanguage = vi.mocked(useLanguage)
  const mockOnClick = vi.fn()

  const defaultSeat = {
    id: 'A1',
    type: 'seat' as const,
    seatNumber: 'A1',
    position: { row: 1, col: 1 },
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockUseLanguage.mockReturnValue('en')
  })

  describe('Rendering', () => {
    it('should render seat with correct content', () => {
      render(
        <SeatCell
          seat={defaultSeat}
          status="available"
          bookingStatus="available"
          isSelected={false}
          onClick={mockOnClick}
        />
      )

      expect(screen.getByText('A1')).toBeInTheDocument()
      expect(screen.getByRole('button')).toHaveClass('seat-cell--seat', 'seat-cell--available')
    })

    it('should render non-seat elements correctly', () => {
      const driverSeat = {
        ...defaultSeat,
        type: 'driver' as const,
      }

      render(
        <SeatCell
          seat={driverSeat}
          status="available"
          bookingStatus="available"
          isSelected={false}
          onClick={mockOnClick}
        />
      )

      expect(screen.getByText('Driver')).toBeInTheDocument()
      expect(screen.getByRole('presentation')).toBeInTheDocument()
    })

    it('should show correct icons based on booking status', () => {
      const { rerender } = render(
        <SeatCell
          seat={defaultSeat}
          status="available"
          bookingStatus="available"
          isSelected={false}
          onClick={mockOnClick}
        />
      )

      // Available seat should show Armchair icon
      expect(document.querySelector('.seat-cell__icon')).toBeInTheDocument()

      rerender(
        <SeatCell
          seat={defaultSeat}
          status="booked"
          bookingStatus="booked"
          isSelected={false}
          onClick={mockOnClick}
        />
      )

      // Booked seat should show Ticket icon (mocked as div in test setup)
      expect(document.querySelector('.seat-cell__icon')).toBeInTheDocument()
    })

    it('should show punch hole for tickets', () => {
      render(
        <SeatCell
          seat={defaultSeat}
          status="booked"
          bookingStatus="booked"
          isSelected={false}
          onClick={mockOnClick}
        />
      )

      expect(document.querySelector('.seat-cell__punch-hole')).toBeInTheDocument()
    })
  })

  describe('Status Classes', () => {
    it('should apply correct CSS classes for different statuses', () => {
      const statuses = ['available', 'selected', 'booked', 'unpaid', 'currentTicket'] as const

      statuses.forEach((status) => {
        const { unmount } = render(
          <SeatCell
            seat={defaultSeat}
            status={status}
            bookingStatus="available"
            isSelected={status === 'selected'}
            onClick={mockOnClick}
          />
        )

        const seatElement = screen.getByRole('button')
        expect(seatElement).toHaveClass(`seat-cell--${status}`)
        unmount()
      })
    })

    it('should apply disabled class when disabled', () => {
      render(
        <SeatCell
          seat={defaultSeat}
          status="available"
          bookingStatus="available"
          isSelected={false}
          onClick={mockOnClick}
          isDisabled={true}
        />
      )

      expect(screen.getByRole('button')).toHaveClass('seat-cell--disabled')
    })

    it('should apply just-updated class when updated', () => {
      render(
        <SeatCell
          seat={defaultSeat}
          status="available"
          bookingStatus="available"
          isSelected={false}
          onClick={mockOnClick}
          justUpdated={true}
        />
      )

      expect(screen.getByRole('button')).toHaveClass('seat-cell--just-updated')
    })
  })

  describe('Interactions', () => {
    it('should call onClick when clicked', async () => {
      const user = userEvent.setup()

      render(
        <SeatCell
          seat={defaultSeat}
          status="available"
          bookingStatus="available"
          isSelected={false}
          onClick={mockOnClick}
        />
      )

      await user.click(screen.getByRole('button'))
      expect(mockOnClick).toHaveBeenCalledTimes(1)
    })

    it('should call onClick when Enter is pressed', async () => {
      const user = userEvent.setup()

      render(
        <SeatCell
          seat={defaultSeat}
          status="available"
          bookingStatus="available"
          isSelected={false}
          onClick={mockOnClick}
        />
      )

      const seatButton = screen.getByRole('button')
      seatButton.focus()
      await user.keyboard('{Enter}')

      expect(mockOnClick).toHaveBeenCalledTimes(1)
    })

    it('should call onClick when Space is pressed', async () => {
      const user = userEvent.setup()

      render(
        <SeatCell
          seat={defaultSeat}
          status="available"
          bookingStatus="available"
          isSelected={false}
          onClick={mockOnClick}
        />
      )

      const seatButton = screen.getByRole('button')
      seatButton.focus()
      await user.keyboard(' ')

      expect(mockOnClick).toHaveBeenCalledTimes(1)
    })

    it('should not respond to other keys', async () => {
      const user = userEvent.setup()

      render(
        <SeatCell
          seat={defaultSeat}
          status="available"
          bookingStatus="available"
          isSelected={false}
          onClick={mockOnClick}
        />
      )

      const seatButton = screen.getByRole('button')
      seatButton.focus()
      await user.keyboard('a')
      await user.keyboard('{ArrowDown}')
      await user.keyboard('{Escape}')

      expect(mockOnClick).not.toHaveBeenCalled()
    })

    it('should not be interactive when disabled', async () => {
      const user = userEvent.setup()

      render(
        <SeatCell
          seat={defaultSeat}
          status="available"
          bookingStatus="available"
          isSelected={false}
          onClick={mockOnClick}
          isDisabled={true}
        />
      )

      await user.click(screen.getByRole('button'))
      expect(mockOnClick).not.toHaveBeenCalled()
    })

    it('should not be interactive for non-seat types', async () => {
      const user = userEvent.setup()
      const driverSeat = {
        ...defaultSeat,
        type: 'driver' as const,
      }

      render(
        <SeatCell
          seat={driverSeat}
          status="available"
          bookingStatus="available"
          isSelected={false}
          onClick={mockOnClick}
        />
      )

      await user.click(screen.getByRole('presentation'))
      expect(mockOnClick).not.toHaveBeenCalled()
    })
  })

  describe('Accessibility', () => {
    it('should have correct ARIA attributes for seats', () => {
      render(
        <SeatCell
          seat={defaultSeat}
          status="available"
          bookingStatus="available"
          isSelected={false}
          onClick={mockOnClick}
        />
      )

      const seatButton = screen.getByRole('button')
      expect(seatButton).toHaveAttribute('aria-label', 'Seat A1, Status: Available')
      expect(seatButton).toHaveAttribute('aria-pressed', 'false')
      expect(seatButton).toHaveAttribute('tabindex', '0')
    })

    it('should have correct ARIA attributes when selected', () => {
      render(
        <SeatCell
          seat={defaultSeat}
          status="selected"
          bookingStatus="available"
          isSelected={true}
          onClick={mockOnClick}
        />
      )

      const seatButton = screen.getByRole('button')
      expect(seatButton).toHaveAttribute('aria-pressed', 'true')
    })

    it('should have correct ARIA attributes when disabled', () => {
      render(
        <SeatCell
          seat={defaultSeat}
          status="available"
          bookingStatus="available"
          isSelected={false}
          onClick={mockOnClick}
          isDisabled={true}
        />
      )

      const seatButton = screen.getByRole('button')
      expect(seatButton).toHaveAttribute('aria-disabled', 'true')
      expect(seatButton).toHaveAttribute('tabindex', '-1')
    })

    it('should have correct cursor styles', () => {
      const { rerender } = render(
        <SeatCell
          seat={defaultSeat}
          status="available"
          bookingStatus="available"
          isSelected={false}
          onClick={mockOnClick}
        />
      )

      let seatButton = screen.getByRole('button')
      expect(seatButton).toHaveStyle({ cursor: 'pointer' })

      rerender(
        <SeatCell
          seat={defaultSeat}
          status="booked"
          bookingStatus="booked"
          isSelected={false}
          onClick={mockOnClick}
        />
      )

      seatButton = screen.getByRole('button')
      expect(seatButton).toHaveStyle({ cursor: 'help' })

      rerender(
        <SeatCell
          seat={defaultSeat}
          status="available"
          bookingStatus="available"
          isSelected={false}
          onClick={mockOnClick}
          isDisabled={true}
        />
      )

      seatButton = screen.getByRole('button')
      expect(seatButton).toHaveStyle({ cursor: 'not-allowed' })
    })
  })

  describe('Internationalization', () => {
    it('should show Persian labels when language is Farsi', () => {
      mockUseLanguage.mockReturnValue('fa')

      render(
        <SeatCell
          seat={defaultSeat}
          status="available"
          bookingStatus="available"
          isSelected={false}
          onClick={mockOnClick}
        />
      )

      const seatButton = screen.getByRole('button')
      expect(seatButton).toHaveAttribute('aria-label', 'صندلی A1, وضعیت: خالی')
    })

    it('should handle current ticket status in different languages', () => {
      const { rerender } = render(
        <SeatCell
          seat={defaultSeat}
          status="currentTicket"
          bookingStatus="currentTicket"
          isSelected={false}
          onClick={mockOnClick}
        />
      )

      let seatButton = screen.getByRole('button')
      expect(seatButton.getAttribute('aria-label')).toContain('Your existing booking')

      mockUseLanguage.mockReturnValue('fa')

      rerender(
        <SeatCell
          seat={defaultSeat}
          status="currentTicket"
          bookingStatus="currentTicket"
          isSelected={false}
          onClick={mockOnClick}
        />
      )

      seatButton = screen.getByRole('button')
      expect(seatButton.getAttribute('aria-label')).toContain('تکت فعلی شما')
    })
  })

  describe('Grid Positioning', () => {
    it('should apply correct grid positioning styles', () => {
      const seatWithSize = {
        ...defaultSeat,
        position: { row: 3, col: 2 },
        size: { rowSpan: 2, colSpan: 3 },
      }

      render(
        <SeatCell
          seat={seatWithSize}
          status="available"
          bookingStatus="available"
          isSelected={false}
          onClick={mockOnClick}
        />
      )

      const seatButton = screen.getByRole('button')
      expect(seatButton).toHaveStyle({
        gridRow: '3 / span 2',
        gridColumn: '2 / span 3',
      })
    })

    it('should default to single cell span when size is not provided', () => {
      render(
        <SeatCell
          seat={defaultSeat}
          status="available"
          bookingStatus="available"
          isSelected={false}
          onClick={mockOnClick}
        />
      )

      const seatButton = screen.getByRole('button')
      expect(seatButton).toHaveStyle({
        gridRow: '1 / span 1',
        gridColumn: '1 / span 1',
      })
    })
  })

  describe('Animation States', () => {
    it('should apply updated animation styles when justUpdated is true', () => {
      render(
        <SeatCell
          seat={defaultSeat}
          status="available"
          bookingStatus="available"
          isSelected={false}
          onClick={mockOnClick}
          justUpdated={true}
        />
      )

      const seatButton = screen.getByRole('button')
      expect(seatButton).toHaveStyle({ willChange: 'transform' })
    })

    it('should not apply animation styles when justUpdated is false', () => {
      render(
        <SeatCell
          seat={defaultSeat}
          status="available"
          bookingStatus="available"
          isSelected={false}
          onClick={mockOnClick}
          justUpdated={false}
        />
      )

      const seatButton = screen.getByRole('button')
      expect(seatButton).toHaveStyle({ willChange: 'auto' })
    })
  })

  describe('Special Seat Types', () => {
    const seatTypes = [
      { type: 'driver', expectedLabel: 'Driver', expectedLabelFa: 'راننده' },
      { type: 'wc', expectedLabel: 'WC', expectedLabelFa: 'دستشویی' },
      { type: 'door', expectedLabel: 'Door', expectedLabelFa: 'دروازه' },
    ] as const

    seatTypes.forEach(({ type, expectedLabel, expectedLabelFa }) => {
      it(`should render ${type} seat correctly in English`, () => {
        const specialSeat = {
          ...defaultSeat,
          type,
        }

        render(
          <SeatCell
            seat={specialSeat}
            status="available"
            bookingStatus="available"
            isSelected={false}
            onClick={mockOnClick}
          />
        )

        expect(screen.getByText(expectedLabel)).toBeInTheDocument()
        expect(screen.getByRole('presentation')).toBeInTheDocument()
      })

      it(`should render ${type} seat correctly in Farsi`, () => {
        mockUseLanguage.mockReturnValue('fa')
        const specialSeat = {
          ...defaultSeat,
          type,
        }

        render(
          <SeatCell
            seat={specialSeat}
            status="available"
            bookingStatus="available"
            isSelected={false}
            onClick={mockOnClick}
          />
        )

        expect(screen.getByText(expectedLabelFa)).toBeInTheDocument()
      })
    })
  })

  describe('Tooltip and Title', () => {
    it('should have correct title attribute', () => {
      render(
        <SeatCell
          seat={defaultSeat}
          status="available"
          bookingStatus="available"
          isSelected={false}
          onClick={mockOnClick}
        />
      )

      const seatButton = screen.getByRole('button')
      expect(seatButton).toHaveAttribute('title', 'Seat A1 - Available')
    })

    it('should show current ticket status in title', () => {
      render(
        <SeatCell
          seat={defaultSeat}
          status="currentTicket"
          bookingStatus="currentTicket"
          isSelected={false}
          onClick={mockOnClick}
        />
      )

      const seatButton = screen.getByRole('button')
      expect(seatButton).toHaveAttribute('title', 'Seat A1 - Your existing booking')
    })
  })
})