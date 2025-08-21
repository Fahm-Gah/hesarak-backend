'use client'

import React, { useMemo } from 'react'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'

interface PaginationProps {
  currentPage: number
  totalPages: number
  totalCount: number
  limit: number
  onPageChange: (page: number) => void
  onLimitChange: (limit: number) => void
  showLimitSelector?: boolean
  isLoading?: boolean
  className?: string
  itemLabel?: string // e.g., "tickets", "trips", "results"
  compactMode?: boolean
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalCount,
  limit,
  onPageChange,
  onLimitChange,
  showLimitSelector = true,
  isLoading = false,
  className = '',
  itemLabel = 'items',
  compactMode = false,
}) => {
  // Memoized calculations for performance
  const paginationInfo = useMemo(() => {
    const startItem = totalCount === 0 ? 0 : (currentPage - 1) * limit + 1
    const endItem = Math.min(currentPage * limit, totalCount)
    const itemsOnCurrentPage = totalCount === 0 ? 0 : endItem - startItem + 1

    return {
      startItem,
      endItem,
      itemsOnCurrentPage,
      hasResults: totalCount > 0,
    }
  }, [currentPage, limit, totalCount])

  // Generate page numbers to display (PayloadCMS style)
  const getPageNumbers = () => {
    const pages: (number | 'ellipsis')[] = []
    const maxVisible = 5 // Show max 5 page numbers like PayloadCMS

    if (totalPages <= maxVisible) {
      // Show all pages if we have few pages
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Always show first page
      pages.push(1)

      // Calculate range around current page
      const start = Math.max(2, currentPage - 1)
      const end = Math.min(totalPages - 1, currentPage + 1)

      // Add ellipsis after first page if needed
      if (start > 2) {
        pages.push('ellipsis')
      }

      // Add pages around current page
      for (let i = start; i <= end; i++) {
        if (i !== 1 && i !== totalPages) {
          pages.push(i)
        }
      }

      // Add ellipsis before last page if needed
      if (end < totalPages - 1) {
        pages.push('ellipsis')
      }

      // Always show last page (if more than 1 page)
      if (totalPages > 1) {
        pages.push(totalPages)
      }
    }

    return pages
  }

  const pageNumbers = getPageNumbers()

  // Limit options
  const limitOptions = [5, 10, 20, 50]

  // Helper function to format numbers with commas
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num)
  }

  // PayloadCMS style summary
  const getSummaryText = () => {
    if (!paginationInfo.hasResults) {
      return `No ${itemLabel} found`
    }

    if (compactMode) {
      return `${formatNumber(paginationInfo.startItem)}-${formatNumber(paginationInfo.endItem)} of ${formatNumber(totalCount)}`
    }

    return `Showing ${formatNumber(paginationInfo.startItem)} to ${formatNumber(paginationInfo.endItem)} of ${formatNumber(totalCount)} ${itemLabel}`
  }

  // Don't render if no pagination needed
  if (totalPages <= 1 && !showLimitSelector) {
    return null
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      {/* PayloadCMS Style Layout */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4 p-4">
        {/* Left: Pagination Controls */}
        <div className="flex items-center gap-1">
          {totalPages > 1 && (
            <>
              {/* First page */}
              <button
                onClick={() => onPageChange(1)}
                disabled={currentPage === 1 || isLoading}
                className="p-2 rounded border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="First page"
              >
                <ChevronsLeft className="w-4 h-4" />
              </button>

              {/* Previous page */}
              <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1 || isLoading}
                className="p-2 rounded border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Previous page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {/* Page numbers */}
              {pageNumbers.map((page, index) => (
                <React.Fragment key={index}>
                  {page === 'ellipsis' ? (
                    <div className="px-3 py-2 text-gray-400">...</div>
                  ) : (
                    <button
                      onClick={() => onPageChange(page)}
                      disabled={isLoading}
                      className={`min-w-[2.5rem] px-3 py-2 text-sm font-medium rounded border transition-colors ${
                        currentPage === page
                          ? 'bg-orange-500 text-white border-orange-500'
                          : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                      aria-label={`Go to page ${page}`}
                      aria-current={currentPage === page ? 'page' : undefined}
                    >
                      {page}
                    </button>
                  )}
                </React.Fragment>
              ))}

              {/* Next page */}
              <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages || isLoading}
                className="p-2 rounded border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Next page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              {/* Last page */}
              <button
                onClick={() => onPageChange(totalPages)}
                disabled={currentPage === totalPages || isLoading}
                className="p-2 rounded border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Last page"
              >
                <ChevronsRight className="w-4 h-4" />
              </button>
            </>
          )}
        </div>

        {/* Right: Summary and Limit Selector */}
        <div className="flex flex-col lg:flex-row items-center gap-4">
          {/* Summary Text */}
          <div className="text-sm text-gray-700 font-medium">
            {getSummaryText()}
            {totalPages > 1 && (
              <div className="text-xs text-gray-500 mt-0.5">
                Page {currentPage} of {totalPages}
              </div>
            )}
          </div>

          {/* Limit Selector (PayloadCMS style) */}
          {showLimitSelector && (
            <div className="flex items-center gap-2">
              <label htmlFor="limit-select" className="text-sm text-gray-600 whitespace-nowrap">
                Per Page:
              </label>
              <select
                id="limit-select"
                value={limit}
                onChange={(e) => onLimitChange(Number(e.target.value))}
                disabled={isLoading}
                className="border border-gray-300 rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 disabled:opacity-50 disabled:cursor-not-allowed bg-white"
              >
                {limitOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-white/75 rounded-lg flex items-center justify-center">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="w-4 h-4 border-2 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
            <span>Loading...</span>
          </div>
        </div>
      )}
    </div>
  )
}
