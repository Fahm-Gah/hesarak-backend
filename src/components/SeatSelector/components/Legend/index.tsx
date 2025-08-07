import React, { memo } from 'react'
import './index.scss'

const statusLabels: Record<string, string> = {
  available: 'Available',
  selected: 'Selected',
  booked: 'Booked',
  unpaid: 'Reserved',
}

export const Legend = memo(() => {
  const statuses = ['available', 'selected', 'booked', 'unpaid']

  return (
    <div className="legend" role="list" aria-label="Seat status legend">
      {statuses.map((status) => (
        <div key={status} className="legend__item" role="listitem">
          <div className={`legend__box legend__box--${status}`} aria-hidden="true" />
          <span>{statusLabels[status] || status}</span>
        </div>
      ))}
    </div>
  )
})

Legend.displayName = 'Legend'
