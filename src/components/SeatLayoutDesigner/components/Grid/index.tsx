import React from 'react'
import { useDroppable } from '@dnd-kit/core'
import { useLayoutStore } from '../../store'
import { DraggableElement } from '../DraggableElement'
import { EditableElement } from '../EditableElement'
import type { SeatElement } from '../../types'

const DroppableCell: React.FC<{
  row: number
  col: number
  onClick: (e: React.MouseEvent) => void
  hasElement: boolean
}> = ({ row, col, onClick, hasElement }) => {
  const { isOver, setNodeRef } = useDroppable({
    id: `cell-${row}-${col}`,
    data: {
      type: 'cell',
      row,
      col,
    },
  })

  const handleClick = (e: React.MouseEvent) => {
    // Only trigger if there's no element in this cell
    if (!hasElement) {
      e.stopPropagation()
      onClick(e)
    }
  }

  return (
    <div
      ref={setNodeRef}
      className={`seat-maker__cell ${isOver ? 'seat-maker__cell--over' : ''} ${
        hasElement ? 'seat-maker__cell--occupied' : ''
      }`}
      style={{ gridRow: row, gridColumn: col }}
      onClick={handleClick}
      // Accessibility
      role={hasElement ? 'presentation' : 'button'}
      tabIndex={hasElement ? -1 : 0}
      aria-label={hasElement ? undefined : `Empty cell at row ${row}, column ${col}`}
    />
  )
}

interface GridProps {
  selectedIds: Set<string>
  editingId: string | null
  onCellClick: (row: number, col: number, e: React.MouseEvent) => void
  onElementClick?: (elementId: string, e: React.MouseEvent) => void
  onElementDoubleClick: (element: SeatElement) => void
  onFinishEdit: (id: string, value: string) => void
  onCancelEdit: () => void
  onDeselectAll: () => void
}

export const Grid: React.FC<GridProps> = ({
  selectedIds,
  editingId,
  onCellClick,
  onElementClick,
  onElementDoubleClick,
  onFinishEdit,
  onCancelEdit,
  onDeselectAll,
}) => {
  const { dimensions, elements } = useLayoutStore()

  // Create a map of occupied cells for performance
  const occupiedCells = React.useMemo(() => {
    const occupied = new Set<string>()
    if (!elements || !Array.isArray(elements)) return occupied

    elements.forEach((element) => {
      if (!element || !element.position) return

      const rowSpan = element.size?.rowSpan || 1
      const colSpan = element.size?.colSpan || 1
      for (let r = 0; r < rowSpan; r++) {
        for (let c = 0; c < colSpan; c++) {
          occupied.add(`${element.position.row + r}-${element.position.col + c}`)
        }
      }
    })
    return occupied
  }, [elements])

  const handleGridClick = (e: React.MouseEvent) => {
    // Only deselect if clicking directly on the grid background
    if (e.target === e.currentTarget) {
      onDeselectAll()
    }
  }

  // Validate dimensions
  if (!dimensions || dimensions.rows < 1 || dimensions.cols < 1) {
    return (
      <div className="seat-maker__grid-container">
        <div className="seat-maker__grid-error">Invalid grid dimensions</div>
      </div>
    )
  }

  return (
    <div className="seat-maker__grid-container">
      <div
        className="seat-maker__grid"
        style={{
          gridTemplateRows: `repeat(${dimensions.rows}, 50px)`,
          gridTemplateColumns: `repeat(${dimensions.cols}, 80px)`,
        }}
        onClick={handleGridClick}
        role="grid"
        aria-label={`Seat layout grid, ${dimensions.rows} rows by ${dimensions.cols} columns`}
      >
        {/* Render Grid Cells */}
        {Array.from({ length: dimensions.rows }, (_, r) =>
          Array.from({ length: dimensions.cols }, (_, c) => {
            const row = r + 1
            const col = c + 1
            const cellKey = `${row}-${col}`
            const hasElement = occupiedCells.has(cellKey)

            return (
              <DroppableCell
                key={`cell-${cellKey}`}
                row={row}
                col={col}
                hasElement={hasElement}
                onClick={(e) => onCellClick(row, col, e)}
              />
            )
          }),
        )}

        {/* Render Elements */}
        {elements &&
          Array.isArray(elements) &&
          elements.map((element) => {
            // Safety check for element data
            if (!element || !element.id || !element.position) {
              console.warn('Invalid element data:', element)
              return null
            }

            return editingId === element.id ? (
              <EditableElement
                key={element.id}
                element={element}
                onFinishEdit={onFinishEdit}
                onCancelEdit={onCancelEdit}
              />
            ) : (
              <DraggableElement
                key={element.id}
                element={element}
                isSelected={selectedIds.has(element.id)}
                onDoubleClick={() => onElementDoubleClick(element)}
                onElementClick={onElementClick}
              />
            )
          })}
      </div>
    </div>
  )
}
