'use client'

import React, { memo, useState, useCallback, useMemo, useRef } from 'react'
import { Copy, Check } from 'lucide-react'
import type { BookingData } from './types'

interface TicketCardProps {
  bookingData: BookingData
  children?: React.ReactNode
  status: 'success' | 'cancelled'
  getTravelDate: (bookingData: BookingData) => string
}

// Constants for better performance
const COPY_TIMEOUT = 2500
const VIBRATION_DURATION = 50
const ANIMATION_DURATION = 300

// Pre-defined theme configurations to avoid recalculation
const THEME_CONFIGS = {
  success: {
    cardBg: 'bg-gradient-to-br from-white via-green-50/20 to-emerald-50/20',
    cardBorder: 'border-green-200/50',
    headerBg: 'bg-gradient-to-r from-green-500 to-emerald-600',
  },
  cancelled: {
    cardBg: 'bg-gradient-to-br from-white via-red-50/20 to-orange-50/20',
    cardBorder: 'border-red-200/50',
    headerBg: 'bg-gradient-to-r from-red-500 to-orange-600',
  },
} as const

export const TicketCard = memo<TicketCardProps>(
  ({ bookingData, children, status, getTravelDate }) => {
    const [copied, setCopied] = useState(false)
    const [showPulse, setShowPulse] = useState(false)
    const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)
    const pulseTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)
    const [isAnimating, setIsAnimating] = useState(false)

    // Memoize theme to avoid recalculation
    const theme = useMemo(() => THEME_CONFIGS[status], [status])

    // Memoize ticket number for validation
    const ticketNumber = useMemo(
      () => bookingData?.ticketNumber?.trim(),
      [bookingData?.ticketNumber],
    )

    // Optimized copy function with better error handling and performance
    const copyTicketNumber = useCallback(async () => {
      if (!ticketNumber || copied || isAnimating) return

      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      setIsAnimating(true)

      try {
        // Modern clipboard API with fallback
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(ticketNumber)
        } else {
          // Fallback for older browsers or non-secure contexts
          const textArea = document.createElement('textarea')
          textArea.value = ticketNumber
          textArea.style.cssText = 'position:fixed;left:-999px;top:-999px;opacity:0'
          document.body.appendChild(textArea)
          textArea.select()
          textArea.setSelectionRange(0, 99999) // For mobile devices

          if (!document.execCommand('copy')) {
            throw new Error('execCommand failed')
          }
          document.body.removeChild(textArea)
        }

        setCopied(true)
        setShowPulse(true)

        // Optimized haptic feedback
        if (navigator.vibrate) {
          navigator.vibrate(VIBRATION_DURATION)
        }

        // Hide pulse effect after one animation cycle (1 second for animate-ping)
        pulseTimeoutRef.current = setTimeout(() => {
          setShowPulse(false)
        }, 1000)

        // Set timeout for reset
        timeoutRef.current = setTimeout(() => {
          setCopied(false)
          setIsAnimating(false)
        }, COPY_TIMEOUT)
      } catch (error) {
        console.warn('Copy to clipboard failed:', error)
        setIsAnimating(false)
      }
    }, [ticketNumber, copied, isAnimating])

    // Cleanup timeouts on unmount
    React.useEffect(() => {
      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
        }
        if (pulseTimeoutRef.current) {
          clearTimeout(pulseTimeoutRef.current)
        }
      }
    }, [])

    // Memoized copy button content to avoid re-renders
    const copyButtonContent = useMemo(() => {
      if (copied) {
        return (
          <div className="flex items-center gap-1 animate-in slide-in-from-right-2 duration-200">
            <Check className="w-4 h-4 text-green-200" />
            <span className="text-xs font-semibold text-green-200">کپی شد!</span>
          </div>
        )
      }

      return (
        <div className="flex items-center gap-1 group-hover:animate-pulse">
          <Copy className="w-4 h-4 text-white/70 group-hover:text-white transition-colors duration-200" />
          <span className="text-xs font-semibold text-white/70 group-hover:text-white transition-colors duration-200 sm:inline">
            کپی
          </span>
        </div>
      )
    }, [copied])

    // Optimized button classes with memoization
    const buttonClasses = useMemo(() => {
      const baseClasses =
        'group relative flex items-center justify-between transition-all duration-300 transform hover:scale-105 active:scale-95 cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/20 focus:ring-offset-2 focus:ring-offset-transparent'
      const shadowClasses = copied ? 'shadow-lg shadow-green-500/30' : 'shadow-md hover:shadow-lg'

      return `${baseClasses} ${shadowClasses}`
    }, [copied])

    // Render cancelled ticket number (optimized)
    const renderCancelledTicket = useCallback(
      () => (
        <div className="text-right" role="status" aria-label="Cancelled ticket" dir="rtl">
          <h2 className="text-lg sm:text-xl font-bold mb-2">شماره تکت:</h2>
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="relative flex-1 min-w-0">
              <div className="absolute inset-0 bg-white/20 blur-sm rounded-lg" />
              <div className="relative flex items-center justify-between px-3 sm:px-4 py-2 bg-white/10 rounded-lg border border-white/20 backdrop-blur-sm">
                <span
                  className="text-sm sm:text-lg md:text-xl font-bold tracking-wider text-white font-mono line-through opacity-75 truncate pr-2 min-w-0 flex-1"
                  title={ticketNumber}
                  dir="ltr"
                >
                  {ticketNumber}
                </span>
              </div>
            </div>
            <div className="px-2 sm:px-4 py-2 bg-white/30 rounded-xl border border-white/20 backdrop-blur-sm flex-shrink-0">
              <span className="text-xs sm:text-sm font-bold text-white tracking-wide">
                لغو شده
              </span>
            </div>
          </div>
        </div>
      ),
      [ticketNumber],
    )

    // Render active ticket number (unified responsive component with pulse effect)
    const renderActiveTicket = useCallback(
      () => (
        <div className="w-full" dir="rtl">
          {/* Responsive Layout - Mobile: stacked, Desktop: side by side */}
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-4">
            <h2 className="text-lg font-bold text-center md:text-xl md:text-right md:whitespace-nowrap">
              شماره تکت:
            </h2>
            <button
              onClick={copyTicketNumber}
              className={`${buttonClasses} w-full md:flex-1 md:max-w-sm`}
              title={`Click to copy ticket number: ${ticketNumber}`}
              aria-label={`Copy ticket number ${ticketNumber}`}
              disabled={isAnimating}
            >
              <div className="absolute inset-0 bg-white/20 blur-sm rounded-lg" />
              <div className="relative flex items-center justify-between w-full px-4 py-2 bg-white/10 rounded-lg border border-white/20 backdrop-blur-sm">
                <span
                  className="text-lg font-bold tracking-wider text-white font-mono truncate pr-3 min-w-0 flex-1"
                  title={ticketNumber}
                  dir="ltr"
                >
                  {ticketNumber}
                </span>
                <div className="flex-shrink-0">{copyButtonContent}</div>
              </div>
              {/* Pulse effect that triggers once per copy */}
              {showPulse && (
                <div className="absolute inset-0 rounded-lg bg-green-400/30 animate-ping pointer-events-none" />
              )}
            </button>
          </div>
        </div>
      ),
      [
        ticketNumber,
        copyTicketNumber,
        buttonClasses,
        copyButtonContent,
        copied,
        isAnimating,
        showPulse,
      ],
    )

    // Early return for invalid ticket number
    if (!ticketNumber) {
      return (
        <div
          className={`${theme.cardBg} rounded-3xl shadow-xl ${theme.cardBorder} backdrop-blur-sm overflow-hidden mb-8`}
        >
          <div className={`${theme.headerBg} px-6 sm:px-8 py-6`}>
            <div className="flex justify-center text-white">
              <div className="text-center text-white/80">
                <span className="text-sm">اطلاعات تکت نامعتبر</span>
              </div>
            </div>
          </div>
          <div className="p-6 sm:p-8">{children}</div>
        </div>
      )
    }

    return (
      <div
        className={`${theme.cardBg} rounded-3xl shadow-xl ${theme.cardBorder} backdrop-blur-sm overflow-hidden mb-8`}
      >
        {/* Card Header */}
        <div className={`${theme.headerBg} px-6 sm:px-8 py-6`}>
          <div className="flex justify-center text-white">
            {status === 'cancelled' ? renderCancelledTicket() : renderActiveTicket()}
          </div>
        </div>

        {/* Card Content */}
        <div className="p-6 sm:p-8">{children}</div>
      </div>
    )
  },
)

TicketCard.displayName = 'TicketCard'
