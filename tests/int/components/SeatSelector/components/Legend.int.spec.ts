import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'
import { Legend } from '@/components/SeatSelector/components/Legend'
import { useLanguage } from '@/hooks/useLanguage'

vi.mock('@/hooks/useLanguage')
vi.mock('@/components/SeatSelector/utils')

describe('Legend', () => {
  const mockUseLanguage = vi.mocked(useLanguage)
  let mockUtils: any

  const mockTranslations = {
    labels: {
      seatStatusLegend: 'Seat Status Legend',
    },
    statuses: {
      available: 'Available',
      selected: 'Selected',
      booked: 'Booked',
      unpaid: 'Reserved',
    },
  }

  const mockTranslationsFa = {
    labels: {
      seatStatusLegend: 'راهنمای وضعیت صندلی',
    },
    statuses: {
      available: 'خالی',
      selected: 'انتخاب شده',
      booked: 'بوک شده',
      unpaid: 'قید شده',
    },
  }

  beforeEach(async () => {
    vi.clearAllMocks()
    mockUseLanguage.mockReturnValue('en')

    // Mock getOptimizedTranslations
    mockUtils = vi.mocked(await import('@/components/SeatSelector/utils'))
    mockUtils.getOptimizedTranslations.mockReturnValue(mockTranslations)
  })

  describe('Rendering', () => {
    it('should render legend with all status items', () => {
      render(<Legend />)

      expect(screen.getByRole('list')).toHaveAttribute('aria-label', 'Seat Status Legend')
      
      // Check all status items are present
      expect(screen.getByText('Available')).toBeInTheDocument()
      expect(screen.getByText('Selected')).toBeInTheDocument()
      expect(screen.getByText('Booked')).toBeInTheDocument()
      expect(screen.getByText('Reserved')).toBeInTheDocument()

      // Check all legend boxes are present
      const legendBoxes = document.querySelectorAll('.legend__box')
      expect(legendBoxes).toHaveLength(4)
      
      // Check each status has its corresponding CSS class
      expect(document.querySelector('.legend__box--available')).toBeInTheDocument()
      expect(document.querySelector('.legend__box--selected')).toBeInTheDocument()
      expect(document.querySelector('.legend__box--booked')).toBeInTheDocument()
      expect(document.querySelector('.legend__box--unpaid')).toBeInTheDocument()
    })

    it('should render correct structure with proper ARIA roles', () => {
      render(<Legend />)

      const list = screen.getByRole('list')
      const listItems = screen.getAllByRole('listitem')

      expect(list).toBeInTheDocument()
      expect(listItems).toHaveLength(4)

      listItems.forEach((item, index) => {
        const legendBox = item.querySelector('.legend__box')
        expect(legendBox).toHaveAttribute('aria-hidden', 'true')
      })
    })
  })

  describe('Internationalization', () => {
    it('should display Farsi text when language is set to fa', () => {
      mockUseLanguage.mockReturnValue('fa')
      mockUtils.getOptimizedTranslations.mockReturnValue(mockTranslationsFa)

      render(<Legend />)

      expect(screen.getByRole('list')).toHaveAttribute('aria-label', 'راهنمای وضعیت صندلی')
      
      expect(screen.getByText('خالی')).toBeInTheDocument()
      expect(screen.getByText('انتخاب شده')).toBeInTheDocument()
      expect(screen.getByText('بوک شده')).toBeInTheDocument()
      expect(screen.getByText('قید شده')).toBeInTheDocument()
    })

    it('should use memoized translations for performance', () => {
      const { rerender } = render(<Legend />)

      expect(mockUtils.getOptimizedTranslations).toHaveBeenCalledTimes(1)
      expect(mockUtils.getOptimizedTranslations).toHaveBeenCalledWith('en')

      // Rerender with same language - should use memoized result
      rerender(<Legend />)
      
      // Should not call again due to useMemo
      expect(mockUtils.getOptimizedTranslations).toHaveBeenCalledTimes(1)
    })

    it('should call getOptimizedTranslations again when language changes', () => {
      const { rerender } = render(<Legend />)

      expect(mockUtils.getOptimizedTranslations).toHaveBeenCalledWith('en')

      // Change language
      mockUseLanguage.mockReturnValue('fa')
      mockUtils.getOptimizedTranslations.mockReturnValue(mockTranslationsFa)

      rerender(<Legend />)

      expect(mockUtils.getOptimizedTranslations).toHaveBeenCalledTimes(2)
      expect(mockUtils.getOptimizedTranslations).toHaveBeenNthCalledWith(2, 'fa')
    })
  })

  describe('Status Items Order', () => {
    it('should render status items in correct order', () => {
      render(<Legend />)

      const listItems = screen.getAllByRole('listitem')
      const statusTexts = listItems.map(item => item.textContent)

      expect(statusTexts).toEqual(['Available', 'Selected', 'Booked', 'Reserved'])
    })

    it('should maintain order consistency across language changes', () => {
      const { rerender } = render(<Legend />)

      let listItems = screen.getAllByRole('listitem')
      let englishOrder = listItems.map(item => 
        item.querySelector('.legend__box')?.className.split(' ').find(cls => cls.startsWith('legend__box--'))
      )

      // Change to Farsi
      mockUseLanguage.mockReturnValue('fa')
      mockUtils.getOptimizedTranslations.mockReturnValue(mockTranslationsFa)

      rerender(<Legend />)

      listItems = screen.getAllByRole('listitem')
      let farsiOrder = listItems.map(item => 
        item.querySelector('.legend__box')?.className.split(' ').find(cls => cls.startsWith('legend__box--'))
      )

      // Order of CSS classes should remain the same
      expect(farsiOrder).toEqual(englishOrder)
    })
  })

  describe('CSS Classes and Styling', () => {
    it('should apply correct CSS classes to legend elements', () => {
      render(<Legend />)

      const legendContainer = document.querySelector('.legend')
      expect(legendContainer).toBeInTheDocument()

      const legendItems = document.querySelectorAll('.legend__item')
      expect(legendItems).toHaveLength(4)

      const legendBoxes = document.querySelectorAll('.legend__box')
      expect(legendBoxes).toHaveLength(4)

      // Test that each box has both base class and status-specific class
      const statuses = ['available', 'selected', 'booked', 'unpaid']
      statuses.forEach(status => {
        const box = document.querySelector(`.legend__box--${status}`)
        expect(box).toHaveClass('legend__box', `legend__box--${status}`)
      })
    })
  })

  describe('Accessibility', () => {
    it('should have proper accessibility attributes', () => {
      render(<Legend />)

      const list = screen.getByRole('list')
      expect(list).toHaveAttribute('aria-label', 'Seat Status Legend')

      const listItems = screen.getAllByRole('listitem')
      expect(listItems).toHaveLength(4)

      // All legend boxes should be hidden from screen readers
      const legendBoxes = document.querySelectorAll('.legend__box')
      legendBoxes.forEach(box => {
        expect(box).toHaveAttribute('aria-hidden', 'true')
      })
    })

    it('should be keyboard navigable', () => {
      render(<Legend />)

      const list = screen.getByRole('list')
      expect(list).not.toHaveAttribute('tabindex') // List itself not focusable
      
      // Individual items should not be focusable as they're informational
      const listItems = screen.getAllByRole('listitem')
      listItems.forEach(item => {
        expect(item).not.toHaveAttribute('tabindex')
      })
    })
  })

  describe('Component Behavior', () => {
    it('should re-render when language changes', () => {
      const { rerender } = render(<Legend />)

      expect(screen.getByText('Available')).toBeInTheDocument()

      // Change language and translations
      mockUseLanguage.mockReturnValue('fa')
      mockUtils.getOptimizedTranslations.mockReturnValue(mockTranslationsFa)

      rerender(<Legend />)

      expect(screen.getByText('خالی')).toBeInTheDocument()
      expect(screen.queryByText('Available')).not.toBeInTheDocument()
    })

    it('should handle missing translation gracefully', () => {
      const incompleteTranslations = {
        labels: {
          seatStatusLegend: 'Legend',
        },
        statuses: {
          available: 'Available',
          selected: 'Selected',
          // Missing booked and unpaid
        },
      }

      mockUtils.getOptimizedTranslations.mockReturnValue(incompleteTranslations as any)

      render(<Legend />)

      // Should still render the items, even if translations are missing
      expect(screen.getByText('Available')).toBeInTheDocument()
      expect(screen.getByText('Selected')).toBeInTheDocument()
      
      // Missing translations might show as undefined or fallback
      const listItems = screen.getAllByRole('listitem')
      expect(listItems).toHaveLength(4) // Should still create 4 items
    })
  })

  describe('Memory Performance', () => {
    it('should maintain stable references across re-renders', () => {
      const { rerender } = render(<Legend />)

      const firstRenderList = screen.getByRole('list')
      
      // Re-render without changing props
      rerender(<Legend />)

      const secondRenderList = screen.getByRole('list')
      
      // Components should be stable (using memo)
      expect(firstRenderList).toBe(secondRenderList)
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty translations object', () => {
      mockUtils.getOptimizedTranslations.mockReturnValue({} as any)

      expect(() => render(<Legend />)).not.toThrow()
    })

    it('should handle null/undefined translations', () => {
      mockUtils.getOptimizedTranslations.mockReturnValue(null as any)

      expect(() => render(<Legend />)).not.toThrow()
    })
  })
})