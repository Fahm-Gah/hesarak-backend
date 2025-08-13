import React, { useState, useEffect } from 'react'
import { useModal } from '@payloadcms/ui'
import { useLayoutStore } from '../../store'
import { Undo, Redo, Square, Lock, Trash2, RotateCcw } from 'lucide-react'
import { useLanguage } from '@/hooks/useLanguage'
import { getSeatLayoutDesignerTranslations } from '@/utils/seatLayoutDesignerTranslations'

interface ToolbarProps {
  selectedIds: Set<string>
  onSelectAll: () => void
  onToggleDisabled: () => void
  onDeleteSelected: () => void
}

export const Toolbar: React.FC<ToolbarProps> = ({
  selectedIds,
  onSelectAll,
  onToggleDisabled,
  onDeleteSelected,
}) => {
  const { openModal } = useModal()
  const lang = useLanguage()
  const t = getSeatLayoutDesignerTranslations(lang)

  const [temporalState, setTemporalState] = useState({
    canUndo: false,
    canRedo: false,
  })

  useEffect(() => {
    const unsubscribe = useLayoutStore.temporal.subscribe((state) => {
      setTemporalState({
        canUndo: state.pastStates.length > 0,
        canRedo: state.futureStates.length > 0,
      })
    })

    const { pastStates, futureStates } = useLayoutStore.temporal.getState()
    setTemporalState({
      canUndo: pastStates.length > 0,
      canRedo: futureStates.length > 0,
    })

    return unsubscribe
  }, [])

  const handleUndo = () => {
    try {
      const { undo } = useLayoutStore.temporal.getState()
      undo()
    } catch (error) {
      console.error('Undo failed:', error)
    }
  }

  const handleRedo = () => {
    try {
      const { redo } = useLayoutStore.temporal.getState()
      redo()
    } catch (error) {
      console.error('Redo failed:', error)
    }
  }

  const selectedCount = selectedIds.size
  const hasSelection = selectedCount > 0

  return (
    <div className="seat-maker__toolbar">
      <button
        type="button"
        onClick={handleUndo}
        disabled={!temporalState.canUndo}
        className="seat-maker__btn"
        title={`${t.toolbar.undo} (Ctrl+Z)`}
      >
        <Undo size={16} />
      </button>

      <button
        type="button"
        onClick={handleRedo}
        disabled={!temporalState.canRedo}
        className="seat-maker__btn"
        title={`${t.toolbar.redo} (Ctrl+Y)`}
      >
        <Redo size={16} />
      </button>

      <div className="seat-maker__divider" />

      <button
        type="button"
        onClick={onSelectAll}
        className="seat-maker__btn"
        title="Select All (Ctrl+A)"
      >
        <Square size={16} />
        <span>{t.toolbar.all}</span>
      </button>

      <button
        type="button"
        onClick={onToggleDisabled}
        disabled={!hasSelection}
        className="seat-maker__btn"
        title={`Toggle Disabled (${selectedCount} selected)`}
      >
        <Lock size={16} />
        <span>{t.toolbar.disable}</span>
      </button>

      <button
        type="button"
        onClick={onDeleteSelected}
        disabled={!hasSelection}
        className="seat-maker__btn seat-maker__btn--danger"
        title={`Delete ${selectedCount} selected (Delete)`}
      >
        <Trash2 size={16} />
        <span>{t.toolbar.delete}</span>
      </button>

      <button
        type="button"
        onClick={() => openModal('clear-layout-confirm')}
        className="seat-maker__btn seat-maker__btn--danger"
        title="Clear All"
      >
        <RotateCcw size={16} />
        <span>{t.toolbar.clear}</span>
      </button>
    </div>
  )
}
