import { useState, useCallback, useMemo } from 'react'
import { nanoid } from 'nanoid'
import { useLayoutStore } from '../store'
import type { SeatElement, ElementType, UserInteractionRef } from '../types'

export const useLayoutLogic = (hasUserInteracted: UserInteractionRef) => {
  const {
    elements,
    dimensions,
    addElement,
    removeElements,
    updateElement,
    moveElements,
    toggleDisabled,
    setDimensions,
  } = useLayoutStore()

  // Local UI state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [lastSelectedId, setLastSelectedId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)

  // --- Computed Values ---
  const selectedElements = useMemo(
    () => elements.filter((el) => selectedIds.has(el.id)),
    [elements, selectedIds],
  )

  const nextSeatNumber = useMemo(() => {
    const seatNumbers = elements
      .filter((e) => e.type === 'seat' && e.seatNumber)
      .map((e) => parseInt(e.seatNumber!, 10))
      .filter((n) => !isNaN(n))
    return seatNumbers.length ? Math.max(...seatNumbers) + 1 : 1
  }, [elements])

  // --- Helper Functions ---
  const getElementAt = useCallback(
    (row: number, col: number, exclude = new Set<string>()): SeatElement | undefined => {
      if (!elements || !Array.isArray(elements)) return undefined

      return elements.find((el) => {
        if (!el || !el.position || exclude.has(el.id)) return false

        const rowSpan = el.size?.rowSpan || 1
        const colSpan = el.size?.colSpan || 1
        return (
          row >= el.position.row &&
          row < el.position.row + rowSpan &&
          col >= el.position.col &&
          col < el.position.col + colSpan
        )
      })
    },
    [elements],
  )

  const canPlaceElement = useCallback(
    (
      row: number,
      col: number,
      rowSpan: number,
      colSpan: number,
      exclude = new Set<string>(),
    ): boolean => {
      if (!dimensions) return false

      // Check boundaries
      if (
        row < 1 ||
        col < 1 ||
        row + rowSpan - 1 > dimensions.rows ||
        col + colSpan - 1 > dimensions.cols
      ) {
        return false
      }

      // Check for collisions
      for (let r = row; r < row + rowSpan; r++) {
        for (let c = col; c < col + colSpan; c++) {
          if (getElementAt(r, c, exclude)) {
            return false
          }
        }
      }
      return true
    },
    [dimensions, getElementAt],
  )

  const markUserInteraction = useCallback(() => {
    hasUserInteracted.current = true
  }, [hasUserInteracted])

  // --- Selection Actions ---
  const handleSelectElement = useCallback(
    (elementId: string, mode: 'single' | 'add' | 'toggle' | 'range' = 'single') => {
      markUserInteraction()

      switch (mode) {
        case 'single':
          setSelectedIds(new Set([elementId]))
          setLastSelectedId(elementId)
          break

        case 'add':
          setSelectedIds((prev) => new Set([...prev, elementId]))
          setLastSelectedId(elementId)
          break

        case 'toggle':
          setSelectedIds((prev) => {
            const newSet = new Set(prev)
            if (newSet.has(elementId)) {
              newSet.delete(elementId)
            } else {
              newSet.add(elementId)
            }
            return newSet
          })
          setLastSelectedId(elementId)
          break

        case 'range':
          if (lastSelectedId) {
            const lastElement = elements.find((el) => el.id === lastSelectedId)
            const currentElement = elements.find((el) => el.id === elementId)

            if (lastElement && currentElement) {
              const minRow = Math.min(lastElement.position.row, currentElement.position.row)
              const maxRow = Math.max(lastElement.position.row, currentElement.position.row)
              const minCol = Math.min(lastElement.position.col, currentElement.position.col)
              const maxCol = Math.max(lastElement.position.col, currentElement.position.col)

              const rangeElements = elements.filter(
                (el) =>
                  el.position.row >= minRow &&
                  el.position.row <= maxRow &&
                  el.position.col >= minCol &&
                  el.position.col <= maxCol,
              )

              setSelectedIds(new Set(rangeElements.map((el) => el.id)))
            }
          } else {
            setSelectedIds(new Set([elementId]))
            setLastSelectedId(elementId)
          }
          break
      }
    },
    [elements, lastSelectedId, markUserInteraction],
  )

  const handleDeselectAll = useCallback(() => {
    setSelectedIds(new Set())
    setLastSelectedId(null)
  }, [])

  const handleSelectAll = useCallback(() => {
    const allIds = new Set(elements.map((el) => el.id))
    setSelectedIds(allIds)
    setLastSelectedId(elements.length > 0 ? elements[0].id : null)
  }, [elements])

  // --- Element Actions ---
  const handleAddElement = useCallback(
    (row: number, col: number, tool: ElementType, size = { rowSpan: 1, colSpan: 1 }) => {
      if (!canPlaceElement(row, col, size.rowSpan, size.colSpan)) {
        return false
      }

      markUserInteraction()
      const newElement: SeatElement = {
        id: nanoid(),
        type: tool,
        seatNumber: tool === 'seat' ? String(nextSeatNumber) : undefined,
        position: { row, col },
        size: size.rowSpan > 1 || size.colSpan > 1 ? size : undefined,
        disabled: false,
      }

      addElement(newElement)
      setSelectedIds(new Set([newElement.id]))
      setLastSelectedId(newElement.id)
      return true
    },
    [canPlaceElement, nextSeatNumber, addElement, markUserInteraction],
  )

  const handleMoveSelected = useCallback(
    (deltaRow: number, deltaCol: number) => {
      if (selectedIds.size === 0) return false

      const elementsToMove = elements.filter((el) => selectedIds.has(el.id))

      const canMoveAll = elementsToMove.every((el) => {
        const newRow = el.position.row + deltaRow
        const newCol = el.position.col + deltaCol
        return canPlaceElement(
          newRow,
          newCol,
          el.size?.rowSpan || 1,
          el.size?.colSpan || 1,
          selectedIds, // Exclude selected elements from collision check
        )
      })

      if (canMoveAll) {
        markUserInteraction()
        moveElements(selectedIds, deltaRow, deltaCol)
        return true
      }
      return false
    },
    [elements, selectedIds, canPlaceElement, moveElements, markUserInteraction],
  )

  const handleDeleteSelected = useCallback(() => {
    if (selectedIds.size === 0) return

    markUserInteraction()
    removeElements(selectedIds)
    setSelectedIds(new Set())
    setLastSelectedId(null)
  }, [selectedIds, removeElements, markUserInteraction])

  const handleToggleDisabled = useCallback(() => {
    if (selectedIds.size === 0) return

    markUserInteraction()
    toggleDisabled(selectedIds)
  }, [selectedIds, toggleDisabled, markUserInteraction])

  // Direct element click handler for better modifier key support
  const handleElementClick = useCallback(
    (elementId: string, e: React.MouseEvent) => {
      e.stopPropagation()

      if (e.shiftKey) {
        handleSelectElement(elementId, 'range')
      } else if (e.ctrlKey || e.metaKey) {
        handleSelectElement(elementId, 'toggle')
      } else {
        handleSelectElement(elementId, 'single')
      }
    },
    [handleSelectElement],
  )
  const handleCellClick = useCallback(
    (
      row: number,
      col: number,
      e: React.MouseEvent,
      tool: ElementType,
      size = { rowSpan: 1, colSpan: 1 },
    ) => {
      const element = getElementAt(row, col)

      if (element) {
        // Handle element selection
        if (e.shiftKey) {
          handleSelectElement(element.id, 'range')
        } else if (e.ctrlKey || e.metaKey) {
          handleSelectElement(element.id, 'toggle')
        } else {
          handleSelectElement(element.id, 'single')
        }
      } else {
        // Add new element on empty cell
        if (!e.ctrlKey && !e.metaKey && !e.shiftKey) {
          handleDeselectAll()
        }
        handleAddElement(row, col, tool, size)
      }
    },
    [getElementAt, handleSelectElement, handleDeselectAll, handleAddElement],
  )

  const handleElementDoubleClick = useCallback((element: SeatElement) => {
    if (element.type === 'seat') {
      setEditingId(element.id)
    }
  }, [])

  const handleFinishEdit = useCallback(
    (id: string, value: string) => {
      if (!id) return

      markUserInteraction()
      updateElement(id, { seatNumber: value.trim() || undefined })
      setEditingId(null)
    },
    [updateElement, markUserInteraction],
  )

  const handleCancelEdit = useCallback(() => {
    setEditingId(null)
  }, [])

  const handleDimensionChange = useCallback(
    (dimension: 'rows' | 'cols', value: number) => {
      markUserInteraction()
      const newRows = dimension === 'rows' ? value : dimensions.rows
      const newCols = dimension === 'cols' ? value : dimensions.cols
      setDimensions(newRows, newCols)
    },
    [dimensions, setDimensions, markUserInteraction],
  )

  return {
    // State
    selectedIds,
    selectedElements,
    lastSelectedId,
    editingId,

    // State setters
    setSelectedIds,
    setLastSelectedId,

    // Event handlers
    handleCellClick,
    handleElementClick,
    handleMoveSelected,
    handleElementDoubleClick,
    handleFinishEdit,
    handleCancelEdit,
    handleDeleteSelected,
    handleToggleDisabled,
    handleSelectAll,
    handleDeselectAll,
    handleDimensionChange,
    handleSelectElement,

    // Utilities
    getElementAt,
    canPlaceElement,
  }
}
