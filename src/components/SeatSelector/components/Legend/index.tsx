import React, { useMemo } from 'react'
import { useDocumentInfo } from '@payloadcms/ui'

/**
 * Displays a legend for the seat map, explaining the meaning of different seat statuses.
 * It dynamically includes a "This Ticket" status if an existing ticket is being edited.
 */
export const Legend = () => {
  // Safely get the current ticket ID from document info
  const { id: currentTicketId } = useDocumentInfo() || {}

  // Memoize the statuses array as it depends on currentTicketId
  const statuses = useMemo(() => {
    const baseStatuses = ['available', 'selected', 'booked', 'unpaid']
    if (currentTicketId) {
      baseStatuses.push('current-ticket')
    }
    return baseStatuses
  }, [currentTicketId])

  // Helper function to format status text for display
  const formatStatusText = (status: string) => {
    if (status === 'current-ticket') {
      return 'This Ticket'
    }
    return status.charAt(0).toUpperCase() + status.slice(1)
  }

  return (
    <div className="legend">
      {statuses.map((status) => (
        <div key={status} className="legend__item">
          <div className={`legend__box legend__box--${status}`} />
          <span>{formatStatusText(status)}</span>
        </div>
      ))}
    </div>
  )
}
