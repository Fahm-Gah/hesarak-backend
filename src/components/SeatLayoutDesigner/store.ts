import { create } from 'zustand'
import { temporal } from 'zundo'
import type { LayoutState, LayoutActions } from './types'

export const useLayoutStore = create<LayoutState & LayoutActions>()(
  temporal(
    (set) => ({
      // State
      dimensions: { rows: 12, cols: 4 },
      elements: [],

      // Actions
      setDimensions: (rows, cols) =>
        set(() => ({
          dimensions: { rows: Math.max(1, rows), cols: Math.max(1, cols) },
        })),

      addElement: (element) =>
        set((state) => ({
          elements: [...state.elements, element],
        })),

      removeElements: (ids) =>
        set((state) => ({
          elements: state.elements.filter((el) => !ids.has(el.id)),
        })),

      updateElement: (id, updates) =>
        set((state) => ({
          elements: state.elements.map((el) => (el.id === id ? { ...el, ...updates } : el)),
        })),

      moveElements: (ids, deltaRow, deltaCol) =>
        set((state) => ({
          elements: state.elements.map((el) =>
            ids.has(el.id)
              ? {
                  ...el,
                  position: {
                    row: Math.max(1, Math.min(state.dimensions.rows, el.position.row + deltaRow)),
                    col: Math.max(1, Math.min(state.dimensions.cols, el.position.col + deltaCol)),
                  },
                }
              : el,
          ),
        })),

      clearAll: () => set(() => ({ elements: [] })),

      toggleDisabled: (ids) =>
        set((state) => ({
          elements: state.elements.map((el) =>
            ids.has(el.id) && el.type === 'seat' ? { ...el, disabled: !el.disabled } : el,
          ),
        })),

      loadLayout: (elements, dimensions) =>
        set(() => ({
          elements: elements || [],
          dimensions: dimensions || { rows: 12, cols: 4 },
        })),
    }),
    {
      // Zundo options for better undo/redo experience
      limit: 50,
      equality: (pastState, currentState) =>
        JSON.stringify(pastState.elements) === JSON.stringify(currentState.elements) &&
        JSON.stringify(pastState.dimensions) === JSON.stringify(currentState.dimensions),
    },
  ),
)
