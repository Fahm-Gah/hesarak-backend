import { useCallback } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'
import { useLayoutStore } from '../store'
import type { KeyboardShortcutsConfig } from '../types'

export const useKeyboardShortcuts = ({
  handleMoveSelected,
  handleDeleteSelected,
  handleSelectAll,
  deselectAll,
  cancelEdit,
  selectedIds,
  editingId,
}: KeyboardShortcutsConfig) => {
  const { undo, redo } = useLayoutStore.temporal.getState()

  useHotkeys('ctrl+z, cmd+z', () => undo(), { preventDefault: true, enableOnFormTags: false })
  useHotkeys('ctrl+y, cmd+y, ctrl+shift+z, cmd+shift+z', () => redo(), {
    preventDefault: true,
    enableOnFormTags: false,
  })

  useHotkeys(
    'ctrl+a, cmd+a',
    (e) => {
      e.preventDefault()
      handleSelectAll()
    },
    { enableOnFormTags: false },
  )

  useHotkeys(
    'delete, backspace',
    () => {
      if (selectedIds.size > 0 && !editingId) {
        handleDeleteSelected()
      }
    },
    { enableOnFormTags: false },
  )

  useHotkeys(
    'escape',
    () => {
      if (editingId) {
        cancelEdit()
      } else {
        deselectAll()
      }
    },
    { enableOnFormTags: false },
  )

  const moveHandler = useCallback(
    (deltaRow: number, deltaCol: number) => () => {
      if (selectedIds.size > 0 && !editingId) {
        handleMoveSelected(deltaRow, deltaCol)
      }
    },
    [selectedIds.size, editingId, handleMoveSelected],
  )

  useHotkeys('up', moveHandler(-1, 0), { enableOnFormTags: false })
  useHotkeys('down', moveHandler(1, 0), { enableOnFormTags: false })
  useHotkeys('left', moveHandler(0, -1), { enableOnFormTags: false })
  useHotkeys('right', moveHandler(0, 1), { enableOnFormTags: false })
}
