import React from 'react'
import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { getIconForType, TOOLS } from '../../constants'
import type { SeatElement } from '../../types'

interface DraggableElementProps {
  element: SeatElement
  isSelected: boolean
  onDoubleClick: () => void
  onElementClick?: (elementId: string, e: React.MouseEvent) => void
}

export const DraggableElement: React.FC<DraggableElementProps> = ({
  element,
  isSelected,
  onDoubleClick,
  onElementClick,
}) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: element.id,
    data: {
      type: 'element',
      element,
    },
  })

  const Icon = getIconForType(element.type)

  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    gridRow: `${element.position.row} / span ${element.size?.rowSpan || 1}`,
    gridColumn: `${element.position.col} / span ${element.size?.colSpan || 1}`,
    opacity: isDragging ? 0.7 : 1, // Less transparent to keep it visible
    zIndex: isDragging ? 1000 : isSelected ? 100 : undefined,
    willChange: isDragging ? 'transform' : 'auto',
  }

  const label =
    element.type === 'seat'
      ? element.seatNumber || 'S'
      : TOOLS.find((t) => t.type === element.type)?.label

  const handleClick = (e: React.MouseEvent) => {
    if (isDragging) return

    if (onElementClick) {
      e.stopPropagation()
      onElementClick(element.id, e)
    }
  }

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    onDoubleClick()
  }

  const handlePointerDown = (e: React.PointerEvent) => {
    // For touch devices, we need different handling
    const isTouchDevice = e.pointerType === 'touch'

    if (e.ctrlKey || e.metaKey || e.shiftKey) {
      e.preventDefault()
      e.stopPropagation()
      if (onElementClick) {
        onElementClick(element.id, e as any)
      }
      return
    }

    // On touch devices, allow immediate drag without delay
    if (isTouchDevice) {
      // Don't prevent default on touch - let the drag sensor handle it
      return
    }
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    // Prevent page scrolling during element interaction
    if (e.touches.length === 1) {
      e.preventDefault()
    }
  }

  return (
    <div
      ref={setNodeRef}
      className={`seat-maker__element seat-maker__element--${element.type} ${
        isSelected ? 'seat-maker__element--selected' : ''
      } ${element.disabled ? 'seat-maker__element--disabled' : ''} ${
        isDragging ? 'seat-maker__element--dragging' : ''
      }`}
      style={style}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onPointerDown={handlePointerDown}
      onTouchStart={handleTouchStart}
      {...listeners}
      {...attributes}
      role="button"
      tabIndex={0}
      aria-label={`${element.type} ${label}`}
      aria-selected={isSelected}
      aria-disabled={element.disabled}
    >
      <Icon size={16} />
      <span className="seat-maker__element-label">{label}</span>
    </div>
  )
}
