import React, { useState, useEffect, useRef } from 'react'
import { Users } from 'lucide-react'
import type { SeatElement } from '../../types'

interface EditableElementProps {
  element: SeatElement
  onFinishEdit: (id: string, value: string) => void
  onCancelEdit: () => void
}

export const EditableElement: React.FC<EditableElementProps> = ({
  element,
  onFinishEdit,
  onCancelEdit,
}) => {
  const [value, setValue] = useState(element.seatNumber || '')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [])

  const handleFinish = () => {
    onFinishEdit(element.id, value.trim())
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleFinish()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      onCancelEdit()
    }
  }

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
  }

  return (
    <div
      className="seat-maker__element seat-maker__element--seat seat-maker__element--selected seat-maker__element--editing"
      style={{
        gridRow: `${element.position.row} / span ${element.size?.rowSpan || 1}`,
        gridColumn: `${element.position.col} / span ${element.size?.colSpan || 1}`,
        zIndex: 5,
      }}
      onClick={handleClick}
      onMouseDown={handleClick}
    >
      <Users size={16} />
      <input
        ref={inputRef}
        className="seat-maker__element-input"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={handleFinish}
        onKeyDown={handleKeyDown}
        onClick={handleClick}
        onMouseDown={handleClick}
        maxLength={10}
        placeholder="Seat #"
      />
    </div>
  )
}
