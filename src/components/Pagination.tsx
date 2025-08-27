'use client'

import React, { useMemo, useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ChevronDown, Check } from 'lucide-react'

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
  const [showLimitDropdown, setShowLimitDropdown] = useState(false)
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

  // Helper function to format numbers with Persian digits and commas
  const formatNumber = (num: number) => {
    const formatted = new Intl.NumberFormat('en-US').format(num)
    // Convert to Persian digits
    return formatted.replace(/[0-9]/g, (digit) => '۰۱۲۳۴۵۶۷۸۹'[parseInt(digit)])
  }

  // Persian summary text
  const getSummaryText = () => {
    if (!paginationInfo.hasResults) {
      const itemLabelPersian = itemLabel === 'tickets' ? 'تکت' : itemLabel === 'trips' ? 'سفر' : 'آیتم'
      return `هیچ ${itemLabelPersian}ی یافت نشد`
    }

    if (compactMode) {
      return `${formatNumber(paginationInfo.startItem)}-${formatNumber(paginationInfo.endItem)} از ${formatNumber(totalCount)}`
    }

    const itemLabelPersian = itemLabel === 'tickets' ? 'تکت' : itemLabel === 'trips' ? 'سفر' : 'آیتم'
    return `نمایش ${formatNumber(paginationInfo.startItem)} تا ${formatNumber(paginationInfo.endItem)} از ${formatNumber(totalCount)} ${itemLabelPersian}`
  }

  // Close dropdown when clicking outside or pressing ESC
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      const dropdown = document.querySelector('.limit-dropdown')
      if (dropdown && !dropdown.contains(target)) {
        setShowLimitDropdown(false)
      }
    }

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowLimitDropdown(false)
      }
    }

    if (showLimitDropdown) {
      document.addEventListener('click', handleClickOutside)
      document.addEventListener('keydown', handleEscapeKey)
    }

    return () => {
      document.removeEventListener('click', handleClickOutside)
      document.removeEventListener('keydown', handleEscapeKey)
    }
  }, [showLimitDropdown])

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
                aria-label="صفحه اول"
              >
                <ChevronsRight className="w-4 h-4" />
              </button>

              {/* Previous page */}
              <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1 || isLoading}
                className="p-2 rounded border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="صفحه قبل"
              >
                <ChevronRight className="w-4 h-4" />
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
                      aria-label={`رفتن به صفحه ${formatNumber(page)}`}
                      aria-current={currentPage === page ? 'page' : undefined}
                    >
                      {formatNumber(page)}
                    </button>
                  )}
                </React.Fragment>
              ))}

              {/* Next page */}
              <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages || isLoading}
                className="p-2 rounded border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="صفحه بعد"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {/* Last page */}
              <button
                onClick={() => onPageChange(totalPages)}
                disabled={currentPage === totalPages || isLoading}
                className="p-2 rounded border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="صفحه آخر"
              >
                <ChevronsLeft className="w-4 h-4" />
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
                صفحه {formatNumber(currentPage)} از {formatNumber(totalPages)}
              </div>
            )}
          </div>

          {/* Custom Limit Selector */}
          {showLimitSelector && (
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600 whitespace-nowrap">
                در هر صفحه:
              </label>
              <div className="relative limit-dropdown">
                <button
                  onClick={() => !isLoading && setShowLimitDropdown(!showLimitDropdown)}
                  disabled={isLoading}
                  className="flex items-center gap-2 border border-gray-300 rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 disabled:opacity-50 disabled:cursor-not-allowed bg-white hover:bg-gray-50 transition-colors min-w-[60px] justify-between"
                  aria-label="تغییر تعداد آیتم در هر صفحه"
                >
                  <span>{formatNumber(limit)}</span>
                  <ChevronDown className={`w-3 h-3 text-gray-400 transition-transform duration-200 ${showLimitDropdown ? 'rotate-180' : ''}`} />
                </button>
                
                {/* Custom Dropdown Menu */}
                {showLimitDropdown && (
                  <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg z-50 animate-in fade-in-0 zoom-in-95 duration-200">
                    <div className="py-1">
                      {limitOptions.map((option) => (
                        <button
                          key={option}
                          onClick={() => {
                            onLimitChange(option)
                            setShowLimitDropdown(false)
                          }}
                          className={`w-full text-right px-3 py-2 text-sm hover:bg-gray-50 transition-colors flex items-center justify-between ${
                            limit === option ? 'bg-orange-50 text-orange-600' : 'text-gray-700'
                          }`}
                        >
                          <span>{formatNumber(option)}</span>
                          {limit === option && (
                            <Check className="w-3 h-3" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-white/75 rounded-lg flex items-center justify-center">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="w-4 h-4 border-2 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
            <span>در حال بارگیری...</span>
          </div>
        </div>
      )}
    </div>
  )
}
