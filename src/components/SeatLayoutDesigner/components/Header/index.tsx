import React, { useMemo } from 'react'
import { Bus } from 'lucide-react'
import { useLayoutStore } from '../../store'

export const Header: React.FC = () => {
  const elements = useLayoutStore((s) => s.elements)

  const stats = useMemo(() => {
    if (!elements || !Array.isArray(elements)) {
      return { total: 0, available: 0, disabled: 0 }
    }

    const seats = elements.filter((e) => e && e.type === 'seat')
    return {
      total: seats.length,
      available: seats.filter((s) => s && !s.disabled).length,
      disabled: seats.filter((s) => s && s.disabled).length,
    }
  }, [elements])

  return (
    <div className="seat-maker__header">
      <div className="seat-maker__title">
        <Bus size={20} />
        <span>Seat Layout Designer</span>
      </div>
      <div className="seat-maker__stats">
        Seats: <strong>{stats.total}</strong> | Available: <strong>{stats.available}</strong> |
        Disabled: <strong>{stats.disabled}</strong>
      </div>
    </div>
  )
}
