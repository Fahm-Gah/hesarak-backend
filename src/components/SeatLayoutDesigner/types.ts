import type { JSONFieldClientComponent } from 'payload'

export type { JSONFieldClientComponent }

export type ElementType = 'seat' | 'wc' | 'driver' | 'door'

export interface Position {
  row: number
  col: number
}

export interface ElementSize {
  rowSpan: number
  colSpan: number
}

export interface GridDimensions {
  rows: number
  cols: number
}

export interface SeatElement {
  id: string
  type: ElementType
  seatNumber?: string
  position: Position
  size?: ElementSize
  disabled?: boolean
}

export interface LayoutState {
  dimensions: GridDimensions
  elements: SeatElement[]
}

export interface LayoutActions {
  setDimensions: (rows: number, cols: number) => void
  addElement: (element: SeatElement) => void
  removeElements: (ids: Set<string>) => void
  updateElement: (id: string, updates: Partial<SeatElement>) => void
  moveElements: (ids: Set<string>, deltaRow: number, deltaCol: number) => void
  clearAll: () => void
  toggleDisabled: (ids: Set<string>) => void
  loadLayout: (elements: SeatElement[], dimensions: GridDimensions) => void
}

export interface KeyboardShortcutsConfig {
  handleMoveSelected: (deltaRow: number, deltaCol: number) => void
  handleDeleteSelected: () => void
  handleSelectAll: () => void
  deselectAll: () => void
  cancelEdit: () => void
  selectedIds: Set<string>
  editingId: string | null
}

export type UserInteractionRef = { current: boolean }
