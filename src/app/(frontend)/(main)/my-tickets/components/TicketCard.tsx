'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { Copy, Clock, Check, XCircle } from 'lucide-react'
import { UserTicket } from '../types'
import { convertGregorianToPersianDisplay } from '@/utils/dateUtils'

// Function to convert 24-hour time to 12-hour format
const formatTo12Hour = (time24: string): string => {
  if (!time24) return 'N/A'
  const [hours, minutes] = time24.split(':')
  const hour = parseInt(hours, 10)
  const period = hour >= 12 ? 'PM' : 'AM'
  const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
  return `${hour12}:${minutes} ${period}`
}

// Function to format date in Jalaali format
const formatJalaaliDate = (dateString: string): string => {
  try {
    return convertGregorianToPersianDisplay(dateString)
  } catch {
    return dateString
  }
}

// Function to format date with day of the week
const formatJalaaliDateWithDay = (dateString: string): { date: string; day: string } => {
  try {
    const date = new Date(dateString)
    const jalaaliDate = convertGregorianToPersianDisplay(dateString)
    const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' })
    return { date: jalaaliDate, day: dayOfWeek }
  } catch {
    return { date: dateString, day: '' }
  }
}

// Function to format date and time together
const formatJalaaliDateTime = (dateString: string): string => {
  try {
    const date = new Date(dateString)
    const jalaaliDate = convertGregorianToPersianDisplay(dateString)
    const time = formatTo12Hour(
      date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
    )
    return `${jalaaliDate} at ${time}`
  } catch {
    return dateString
  }
}

// Production-grade copy function with enhanced UX
const copyToClipboard = async (text: string, setCopied: (value: boolean) => void) => {
  try {
    // Modern clipboard API with fallback
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
    } else {
      // Enhanced fallback for older browsers or non-secure contexts
      const textArea = document.createElement('textarea')
      textArea.value = text
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

    // Optimized haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(50)
    }

    // Reset after 2.5 seconds
    setTimeout(() => setCopied(false), 2500)
  } catch (error) {
    console.warn('Copy to clipboard failed:', error)
  }
}

// Function to get status badge
const getStatusBadge = (ticket: UserTicket) => {
  // Check expired status first (highest priority)
  if (ticket.status.isExpired) {
    return (
      <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-xs font-medium">
        Expired
      </span>
    )
  }

  if (ticket.status.isCancelled) {
    return (
      <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-medium">
        Cancelled
      </span>
    )
  }

  if (ticket.status.isPaid) {
    return (
      <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
        Paid
      </span>
    )
  }

  return (
    <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs font-medium">
      Pending Payment
    </span>
  )
}

interface TicketCardProps {
  ticket: UserTicket
  copiedTickets: Set<string>
  setCopiedTickets: React.Dispatch<React.SetStateAction<Set<string>>>
  pulseTickets: Set<string>
  setPulseTickets: React.Dispatch<React.SetStateAction<Set<string>>>
}

export const TicketCard = ({
  ticket,
  copiedTickets,
  setCopiedTickets,
  pulseTickets,
  setPulseTickets,
}: TicketCardProps) => {
  const router = useRouter()

  const jalaaliDate = formatJalaaliDate(ticket.booking.date)

  const handleCardClick = () => {
    // Use Jalaali date in URL with dashes instead of slashes
    const urlDate = jalaaliDate.replace(/\//g, '-')
    router.push(`/trip/${ticket.trip.id}?date=${urlDate}`)
  }

  const getCardTheme = () => {
    // Check expired status first (highest priority)
    if (ticket.status.isExpired) {
      return {
        cardBg: 'bg-gradient-to-br from-white via-orange-50/30 to-gray-50/30',
        cardBorder: 'border-orange-200/50',
        headerBg: 'bg-gradient-to-r from-orange-500 to-gray-600',
      }
    }

    if (ticket.status.isCancelled) {
      return {
        cardBg: 'bg-gradient-to-br from-white via-red-50/30 to-orange-50/30',
        cardBorder: 'border-red-200/50',
        headerBg: 'bg-gradient-to-r from-red-500 to-orange-600',
      }
    }

    if (ticket.status.isPaid) {
      return {
        cardBg: 'bg-gradient-to-br from-white via-green-50/30 to-emerald-50/30',
        cardBorder: 'border-green-200/50',
        headerBg: 'bg-gradient-to-r from-green-500 to-emerald-600',
      }
    }

    return {
      cardBg: 'bg-gradient-to-br from-white via-orange-50/30 to-yellow-50/30',
      cardBorder: 'border-orange-200/50',
      headerBg: 'bg-gradient-to-r from-orange-500 to-amber-600',
    }
  }

  const theme = getCardTheme()

  const handleCopyClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    const setCopied = (copied: boolean) => {
      setCopiedTickets((prev) => {
        const newSet = new Set(prev)
        if (copied) {
          newSet.add(ticket.id)
          // Add pulse effect
          setPulseTickets((prevPulse) => {
            const newPulseSet = new Set(prevPulse)
            newPulseSet.add(ticket.id)
            setTimeout(() => {
              setPulseTickets((p) => {
                const updated = new Set(p)
                updated.delete(ticket.id)
                return updated
              })
            }, 1000)
            return newPulseSet
          })
        } else {
          newSet.delete(ticket.id)
        }
        return newSet
      })
    }
    copyToClipboard(ticket.ticketNumber, setCopied)
  }

  const CopyButton = ({ isMobile = false }: { isMobile?: boolean }) => (
    <button
      onClick={handleCopyClick}
      className="group relative flex items-center justify-between transition-all duration-300 transform hover:scale-105 active:scale-95 cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/20 focus:ring-offset-2 focus:ring-offset-transparent shadow-md hover:shadow-lg"
      title={`Click to copy: ${ticket.ticketNumber}`}
    >
      <div className="absolute inset-0 bg-white/20 blur-sm rounded-lg" />
      <div className="relative flex items-center justify-between w-full px-4 py-2 bg-white/10 rounded-lg border border-white/20 backdrop-blur-sm min-w-0">
        <span className="text-lg font-bold tracking-wider text-white font-mono truncate pr-3 min-w-0 flex-1">
          {ticket.ticketNumber}
        </span>
        <div className="flex-shrink-0">
          {copiedTickets.has(ticket.id) ? (
            <div className="flex items-center gap-1 animate-in slide-in-from-right-2 duration-200">
              <Check className="w-4 h-4 text-green-200" />
              <span className="text-xs font-semibold text-green-200">Copied!</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 group-hover:animate-pulse">
              <Copy className="w-4 h-4 text-white/70 group-hover:text-white transition-colors duration-200" />
              <span className="text-xs font-semibold text-white/70 group-hover:text-white transition-colors duration-200">
                Copy
              </span>
            </div>
          )}
        </div>
      </div>
      {/* Pulse effect */}
      {pulseTickets.has(ticket.id) && (
        <div className="absolute inset-0 rounded-lg bg-green-400/30 animate-ping pointer-events-none" />
      )}
    </button>
  )

  return (
    <div
      onClick={handleCardClick}
      className={`${theme.cardBg} rounded-2xl shadow-xl ${theme.cardBorder} backdrop-blur-sm overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] cursor-pointer border`}
    >
      {/* Card Header with Ticket Number */}
      <div className={`${theme.headerBg} px-6 py-5`}>
        {/* Mobile Layout */}
        <div className="flex flex-col gap-3 md:hidden">
          {/* Top row: Ticket # and Status */}
          <div className="flex items-center justify-between">
            <span className="text-white/80 text-sm font-medium">Ticket #</span>
            {getStatusBadge(ticket)}
          </div>

          {/* Bottom row: Copy button */}
          <div className="flex justify-center">
            <CopyButton isMobile={true} />
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:flex md:items-center md:justify-between">
          {/* Left side: Ticket # and Copy button */}
          <div className="flex items-center gap-4">
            <span className="text-white/80 text-sm font-medium">Ticket #</span>
            <CopyButton />
          </div>

          {/* Right side: Status */}
          <div className="flex-shrink-0">{getStatusBadge(ticket)}</div>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-6">
        <div className="space-y-6">
          {/* Route Info - Compact for mobile */}
          <div className="bg-gray-50/50 rounded-xl p-3 sm:p-4 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div className="text-center flex-1">
                <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-green-500 mx-auto mb-1 sm:mb-2"></div>
                <p className="text-lg sm:text-2xl font-bold text-gray-900 mb-1">
                  {formatTo12Hour(ticket.trip.departureTime)}
                </p>
                <p className="text-xs sm:text-sm font-semibold text-gray-700">
                  {ticket.trip.from.name}
                </p>
                <p className="text-xs text-gray-500 hidden sm:block">{ticket.trip.from.province}</p>
              </div>
              <div className="flex-1 flex items-center px-2 sm:px-4">
                <div className="flex-1 h-0.5 bg-gradient-to-r from-green-300 via-blue-300 to-red-300 rounded-full relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-green-300 via-blue-300 to-red-300 rounded-full animate-pulse"></div>
                </div>
                <div className="mx-2 sm:mx-4 text-center bg-white rounded-lg px-2 sm:px-3 py-1 shadow-sm border">
                  <p className="text-xs font-medium text-gray-600">
                    {ticket.trip.duration || 'N/A'}
                  </p>
                </div>
                <div className="flex-1 h-0.5 bg-gradient-to-r from-green-300 via-blue-300 to-red-300 rounded-full"></div>
              </div>
              <div className="text-center flex-1">
                <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-red-500 mx-auto mb-1 sm:mb-2"></div>
                <p className="text-lg sm:text-2xl font-bold text-gray-900 mb-1">
                  {ticket.trip.arrivalTime ? formatTo12Hour(ticket.trip.arrivalTime) : 'N/A'}
                </p>
                <p className="text-xs sm:text-sm font-semibold text-gray-700">
                  {ticket.trip.to?.name || 'Destination'}
                </p>
                <p className="text-xs text-gray-500 hidden sm:block">
                  {ticket.trip.to?.province || ''}
                </p>
              </div>
            </div>
          </div>

          {/* Trip Details - 2x2 on mobile, 3 columns on larger screens */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
            {/* Travel Date with day of the week */}
            <div className="bg-white/70 rounded-xl p-2 sm:p-3 text-center border-0 backdrop-blur-sm shadow-sm">
              <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">
                Travel Date
              </p>
              <p className="text-xs sm:text-sm font-bold text-gray-900">
                {(() => {
                  const { date, day } = formatJalaaliDateWithDay(ticket.booking.date)
                  return (
                    <>
                      {date}
                      {day && <span className="block text-xs text-gray-600 mt-1">{day}</span>}
                    </>
                  )
                })()}
              </p>
            </div>

            {/* Bus */}
            <div className="bg-white/70 rounded-xl p-2 sm:p-3 text-center border-0 backdrop-blur-sm shadow-sm">
              <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">Bus</p>
              <p className="text-xs sm:text-sm font-bold text-gray-900">{ticket.trip.bus.number}</p>
            </div>

            {/* Seats - spans 2 columns on mobile, 1 on larger screens */}
            <div className="bg-white/70 rounded-xl p-2 sm:p-3 text-center border-0 backdrop-blur-sm shadow-sm col-span-2 sm:col-span-1">
              <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">
                Seats
              </p>
              <div className="flex items-center justify-center gap-1 flex-wrap">
                {ticket.booking.seats.map((seat) => (
                  <span
                    key={seat.id}
                    className="inline-flex items-center justify-center min-w-[24px] h-5 sm:h-6 px-2 bg-gradient-to-br from-blue-100 to-blue-200 text-blue-800 text-xs font-bold rounded-full border border-blue-300 shadow-sm"
                  >
                    {seat.seatNumber}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Section - Responsive layout */}
          <div
            className={`flex flex-col gap-3 sm:gap-4 ${
              ticket.status.paymentDeadline &&
              (!ticket.status.isPaid || ticket.status.isExpired) &&
              !ticket.status.isCancelled
                ? 'lg:flex-row lg:items-center lg:justify-between'
                : ''
            }`}
          >
            {/* Payment Deadline - Bottom on mobile, left on desktop */}
            {ticket.status.paymentDeadline &&
              (!ticket.status.isPaid || ticket.status.isExpired) &&
              !ticket.status.isCancelled && (
                <div
                  className={`rounded-xl p-3 sm:p-4 shadow-sm lg:flex-shrink-0 order-2 lg:order-1 ${
                    ticket.status.isExpired
                      ? 'bg-gradient-to-r from-red-50 to-orange-50 border border-red-200'
                      : 'bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200'
                  }`}
                >
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div
                      className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center ${
                        ticket.status.isExpired ? 'bg-red-100' : 'bg-yellow-100'
                      }`}
                    >
                      {ticket.status.isExpired ? (
                        <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
                      ) : (
                        <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600" />
                      )}
                    </div>
                    <div>
                      <p
                        className={`text-xs font-medium uppercase tracking-wide ${
                          ticket.status.isExpired ? 'text-red-700' : 'text-yellow-600'
                        }`}
                      >
                        {ticket.status.isExpired ? 'Expired At:' : 'Payment Deadline'}
                      </p>
                      <p
                        className={`text-xs sm:text-sm font-bold ${
                          ticket.status.isExpired ? 'text-red-800' : 'text-yellow-800'
                        }`}
                      >
                        {formatJalaaliDateTime(ticket.status.paymentDeadline)}
                      </p>
                    </div>
                  </div>
                </div>
              )}

            {/* Bus Type and Price - Mobile: bus left, price right; Desktop: grouped on right */}
            <div
              className={`flex items-center justify-between order-1 ${
                ticket.status.paymentDeadline &&
                (!ticket.status.isPaid || ticket.status.isExpired) &&
                !ticket.status.isCancelled
                  ? 'lg:justify-end lg:gap-4 lg:order-2'
                  : 'lg:justify-end lg:gap-4'
              }`}
            >
              {/* Bus Type */}
              <div className="inline-flex items-center bg-gradient-to-r from-purple-100 to-indigo-100 px-4 sm:px-6 py-2 sm:py-3 rounded-xl border border-purple-200 shadow-md">
                <span className="text-sm sm:text-base text-purple-800 font-bold tracking-wide uppercase">
                  {ticket.trip.bus.type.name}
                </span>
              </div>

              {/* Price */}
              <div className="text-right">
                <p className="text-xs text-gray-500">
                  {ticket.booking.pricePerSeat.toLocaleString()} AF × {ticket.booking.seats.length}{' '}
                  seat
                  {ticket.booking.seats.length > 1 ? 's' : ''}
                </p>
                <p className="text-xl sm:text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                  {ticket.booking.totalPrice.toLocaleString()} AF
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
