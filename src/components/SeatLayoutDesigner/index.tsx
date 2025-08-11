'use client'

import React, { useState, useEffect, useRef } from 'react'
import type { JSONFieldClientComponent, SeatElement } from './types'
import { useField, ConfirmationModal } from '@payloadcms/ui'
import {
  DndContext,
  DragOverlay,
  useSensor,
  useSensors,
  PointerSensor,
  KeyboardSensor,
  closestCenter,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core'
import { nanoid } from 'nanoid'
import { useLayoutStore } from './store'
import { useLayoutLogic } from './hooks/useLayoutLogic'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'
import { Header } from './components/Header'
import { Toolbar } from './components/Toolbar'
import { Sidebar } from './components/Sidebar'
import { Grid } from './components/Grid'
import './index.scss'

const SeatLayoutDesigner: JSONFieldClientComponent = ({ path }) => {
  const { value, setValue } = useField<any[] | null>({ path })
  const hasUserInteracted = useRef(false)

  // --- State and Logic Hooks ---
  const { loadLayout, elements, clearAll: clearStore } = useLayoutStore()
  const {
    selectedIds,
    editingId,
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
  } = useLayoutLogic(hasUserInteracted)

  // UI state
  const [selectedTool, setSelectedTool] = useState<SeatElement['type']>('seat')
  const [elementSize, setElementSize] = useState({ rowSpan: 1, colSpan: 1 })
  const [activeId, setActiveId] = useState<string | null>(null)

  // --- Keyboard Shortcuts ---
  useKeyboardShortcuts({
    handleMoveSelected,
    handleDeleteSelected,
    handleSelectAll,
    deselectAll: handleDeselectAll,
    cancelEdit: handleCancelEdit,
    selectedIds,
    editingId,
  })

  // --- Data Sync Effects ---
  useEffect(() => {
    if (Array.isArray(value) && value.length > 0 && !hasUserInteracted.current) {
      try {
        const elems: SeatElement[] = value.map((item) => {
          if (!item || typeof item !== 'object') {
            throw new Error('Invalid item in layout data')
          }

          return {
            id: item.id || nanoid(),
            type: item.type || 'seat',
            seatNumber: item.seatNumber,
            position: item.position || { row: 1, col: 1 },
            size: item.size,
            disabled: item.disabled || false,
          }
        })

        const maxRow = Math.max(
          ...elems.map((e) => (e.position?.row || 1) + ((e.size?.rowSpan || 1) - 1)),
          12,
        )
        const maxCol = Math.max(
          ...elems.map((e) => (e.position?.col || 1) + ((e.size?.colSpan || 1) - 1)),
          4,
        )

        loadLayout(elems, { rows: maxRow, cols: maxCol })
        handleDeselectAll()
      } catch (error) {
        console.error('Error loading layout:', error)
        // Reset to empty layout on error
        loadLayout([], { rows: 12, cols: 4 })
      }
    }
  }, [value, loadLayout, handleDeselectAll])

  useEffect(() => {
    if (hasUserInteracted.current) {
      const layoutData = elements.map((el) => ({
        id: el.id,
        type: el.type,
        position: el.position,
        ...(el.seatNumber && { seatNumber: el.seatNumber }),
        ...(el.size && { size: el.size }),
        ...(el.disabled && { disabled: el.disabled }),
      }))
      setValue(layoutData)
    }
  }, [elements, setValue])

  // --- Drag and Drop ---
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 15, // Increased distance to allow clicks to register
        delay: 150, // Increased delay to allow click events first
      },
    }),
    useSensor(KeyboardSensor),
  )

  const handleDragStart = (event: DragStartEvent) => {
    const draggedId = String(event.active.id)
    setActiveId(draggedId)

    // Validate drag data
    const dragData = event.active.data?.current
    if (!dragData || dragData.type !== 'element') {
      console.warn('Invalid drag data in handleDragStart:', dragData)
      return
    }

    // If dragged element isn't selected, select it
    if (!selectedIds.has(draggedId)) {
      handleSelectElement(draggedId, 'single')
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null)

    const { active, over } = event

    // Early return if no valid drop target
    if (!over || !active) return

    // Validate drop data structure
    const dropData = over.data?.current
    if (!dropData || dropData.type !== 'cell') {
      console.warn('Invalid drop target:', dropData)
      return
    }

    // Ensure we have valid coordinates
    if (typeof dropData.row !== 'number' || typeof dropData.col !== 'number') {
      console.warn('Invalid drop coordinates:', dropData)
      return
    }

    // Validate dragged element data
    const dragData = active.data?.current
    if (!dragData || dragData.type !== 'element') {
      console.warn('Invalid drag data:', dragData)
      return
    }

    const draggedElement = elements.find((el) => el.id === active.id)
    if (!draggedElement) {
      console.warn('Dragged element not found:', active.id)
      return
    }

    const deltaRow = dropData.row - draggedElement.position.row
    const deltaCol = dropData.col - draggedElement.position.col

    // Only move if there's actually a position change
    if (deltaRow !== 0 || deltaCol !== 0) {
      handleMoveSelected(deltaRow, deltaCol)
    }
  }

  const handleClearAll = () => {
    hasUserInteracted.current = true
    clearStore()
    handleDeselectAll()
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="seat-maker">
        <Header />
        <Toolbar
          selectedIds={selectedIds}
          onSelectAll={handleSelectAll}
          onToggleDisabled={handleToggleDisabled}
          onDeleteSelected={handleDeleteSelected}
        />

        <div className="seat-maker__content">
          <Sidebar
            selectedTool={selectedTool}
            setSelectedTool={setSelectedTool}
            elementSize={elementSize}
            setElementSize={setElementSize}
            onDimensionChange={handleDimensionChange}
          />
          <Grid
            selectedIds={selectedIds}
            editingId={editingId}
            onCellClick={(row, col, e) => handleCellClick(row, col, e, selectedTool, elementSize)}
            onElementClick={handleElementClick}
            onElementDoubleClick={handleElementDoubleClick}
            onFinishEdit={handleFinishEdit}
            onCancelEdit={handleCancelEdit}
            onDeselectAll={handleDeselectAll}
          />
        </div>

        <DragOverlay>
          {/* Empty - let the original element handle its own drag appearance */}
        </DragOverlay>

        <ConfirmationModal
          modalSlug="clear-layout-confirm"
          heading="Clear Layout"
          onConfirm={handleClearAll}
          body={
            <p>Are you sure you want to clear the entire layout? This action cannot be undone.</p>
          }
        />
      </div>
    </DndContext>
  )
}

export default SeatLayoutDesigner
export type { JSONFieldClientComponent }
