'use client'

import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react'
import type { JSONFieldClientComponent } from 'payload'
import { useField, useModal, ConfirmationModal } from '@payloadcms/ui'
import {
  Bus,
  Users,
  DoorOpen,
  Trash2,
  Undo,
  Redo,
  Lock,
  Square,
  RotateCcw,
  Toilet,
  User,
} from 'lucide-react'
import './index.scss'

export type { JSONFieldClientComponent }

interface SeatElement {
  id: string
  type: 'seat' | 'wc' | 'driver' | 'door'
  seatNumber?: string
  position: { row: number; col: number }
  size?: { rowSpan: number; colSpan: number }
  disabled?: boolean
}

interface LayoutState {
  dimensions: { rows: number; cols: number }
  elements: SeatElement[]
}

const generateObjectId = () => {
  const timestamp = Math.floor(Date.now() / 1000).toString(16)
  const rnd = () =>
    Math.floor(Math.random() * 0xffffff)
      .toString(16)
      .padStart(6, '0')
  return `${timestamp}${rnd()}${rnd()}`.slice(0, 24)
}

const useHistory = (initialState: LayoutState) => {
  const [state, setStateInternal] = useState(initialState)
  const [history, setHistory] = useState<LayoutState[]>([initialState])
  const [index, setIndex] = useState(0)

  const push = useCallback(
    (newState: LayoutState) => {
      const h = history.slice(0, index + 1)
      h.push(newState)
      const sliced = h.slice(-50)
      setHistory(sliced)
      setIndex(sliced.length - 1)
      setStateInternal(newState)
    },
    [history, index],
  )

  const undo = useCallback(() => {
    if (index > 0) {
      setIndex((i) => i - 1)
      setStateInternal(history[index - 1])
    }
  }, [history, index])

  const redo = useCallback(() => {
    if (index < history.length - 1) {
      setIndex((i) => i + 1)
      setStateInternal(history[index + 1])
    }
  }, [history, index])

  return {
    state,
    setState: push,
    undo,
    redo,
    canUndo: index > 0,
    canRedo: index < history.length - 1,
  }
}

const SeatLayoutDesigner: JSONFieldClientComponent = ({ path }) => {
  const { value, setValue } = useField<any[]>({ path })
  const { openModal } = useModal()

  const getInitialLayout = useMemo((): LayoutState => {
    if (Array.isArray(value) && value.length) {
      try {
        const elems: SeatElement[] = value.map((item) => ({
          id: item.id || generateObjectId(),
          type: item.type,
          seatNumber: item.seatNumber,
          position: item.position,
          size: item.size,
          disabled: item.disabled || false,
        }))
        const maxRow = elems.reduce(
          (m, e) => Math.max(m, e.position.row + (e.size?.rowSpan || 1) - 1),
          12,
        )
        const maxCol = elems.reduce(
          (m, e) => Math.max(m, e.position.col + (e.size?.colSpan || 1) - 1),
          4,
        )
        return { dimensions: { rows: maxRow, cols: maxCol }, elements: elems }
      } catch {
        // fall through
      }
    }
    return { dimensions: { rows: 12, cols: 4 }, elements: [] }
  }, [value])

  const {
    state: layout,
    setState: setLayout,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useHistory(getInitialLayout)

  const [ui, setUi] = useState({
    selectedTool: 'seat' as SeatElement['type'],
    selected: new Set<string>(),
    last: null as string | null,
    dragEl: null as SeatElement | null,
    dragging: false,
    preview: null as { row: number; col: number } | null,
    editing: null as string | null,
    editVal: '',
    size: { rowSpan: 1, colSpan: 1 },
  })

  const {
    selectedTool,
    selected,
    last,
    dragEl,
    dragging,
    preview,
    editing,
    editVal,
    size: elementSize,
  } = ui

  const container = useRef<HTMLDivElement>(null)

  const nextSeatNumber = useMemo(() => {
    const nums = layout.elements
      .filter((e) => e.type === 'seat' && e.seatNumber)
      .map((e) => parseInt(e.seatNumber!, 10))
      .filter((n) => !isNaN(n))
    return nums.length ? Math.max(...nums) + 1 : 1
  }, [layout.elements])

  useEffect(() => {
    setValue(
      layout.elements.map((el) => ({
        id: el.id,
        type: el.type,
        position: el.position,
        ...(el.seatNumber && { seatNumber: el.seatNumber }),
        ...(el.size && { size: el.size }),
        ...(el.disabled && { disabled: el.disabled }),
      })),
    )
  }, [layout.elements, setValue])

  const getAt = useCallback(
    (row: number, col: number, exclude = new Set<string>()) =>
      layout.elements.find((el) => {
        if (exclude.has(el.id)) return false
        const rs = el.size?.rowSpan || 1
        const cs = el.size?.colSpan || 1
        return (
          row >= el.position.row &&
          row < el.position.row + rs &&
          col >= el.position.col &&
          col < el.position.col + cs
        )
      }),
    [layout.elements],
  )

  const canPlace = useCallback(
    (row: number, col: number, rs: number, cs: number, exclude = new Set<string>()) => {
      const { rows, cols } = layout.dimensions
      if (row < 1 || col < 1 || row + rs - 1 > rows || col + cs - 1 > cols) return false
      for (let r = row; r < row + rs; r++) {
        for (let c = col; c < col + cs; c++) {
          if (getAt(r, c, exclude)) return false
        }
      }
      return true
    },
    [layout.dimensions, getAt],
  )

  const add = useCallback(
    (row: number, col: number) => {
      const { rowSpan, colSpan } = elementSize
      if (!canPlace(row, col, rowSpan, colSpan)) return
      const el: SeatElement = {
        id: generateObjectId(),
        type: selectedTool,
        seatNumber: selectedTool === 'seat' ? String(nextSeatNumber) : undefined,
        position: { row, col },
        size: rowSpan > 1 || colSpan > 1 ? { rowSpan, colSpan } : undefined,
        disabled: false,
      }
      setLayout({ ...layout, elements: [...layout.elements, el] })
    },
    [selectedTool, elementSize, canPlace, nextSeatNumber, layout, setLayout],
  )

  const removeSel = useCallback(() => {
    setLayout({
      ...layout,
      elements: layout.elements.filter((el) => !selected.has(el.id)),
    })
    setUi((u) => ({ ...u, selected: new Set() }))
  }, [selected, layout, setLayout])

  const selectAll = useCallback(() => {
    setUi((u) => ({ ...u, selected: new Set(layout.elements.map((el) => el.id)) }))
  }, [layout.elements])

  const clearAll = useCallback(() => openModal('clear-layout-confirm'), [openModal])

  const confirmClear = useCallback(() => {
    setLayout({ ...layout, elements: [] })
    setUi((u) => ({ ...u, selected: new Set() }))
  }, [layout, setLayout])

  const toggleDisable = useCallback(() => {
    setLayout({
      ...layout,
      elements: layout.elements.map((el) =>
        selected.has(el.id) && el.type === 'seat' ? { ...el, disabled: !el.disabled } : el,
      ),
    })
  }, [selected, layout, setLayout])

  const moveSel = useCallback(
    (dR: number, dC: number) => {
      const sel = layout.elements.filter((el) => selected.has(el.id))
      const excl = new Set(selected)
      const ok = sel.every((el) =>
        canPlace(
          el.position.row + dR,
          el.position.col + dC,
          el.size?.rowSpan || 1,
          el.size?.colSpan || 1,
          excl,
        ),
      )
      if (ok) {
        setLayout({
          ...layout,
          elements: layout.elements.map((el) =>
            selected.has(el.id)
              ? { ...el, position: { row: el.position.row + dR, col: el.position.col + dC } }
              : el,
          ),
        })
      }
    },
    [selected, layout, canPlace, setLayout],
  )

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (editing) return
      if (!container.current?.contains(document.activeElement)) return
      const dir: Record<string, { row: number; col: number }> = {
        ArrowUp: { row: -1, col: 0 },
        ArrowDown: { row: 1, col: 0 },
        ArrowLeft: { row: 0, col: -1 },
        ArrowRight: { row: 0, col: 1 },
      }
      if (e.ctrlKey || e.metaKey) {
        if (e.key.toLowerCase() === 'z') {
          e.preventDefault()
          undo()
        }
        if (e.key.toLowerCase() === 'y') {
          e.preventDefault()
          redo()
        }
        if (e.key.toLowerCase() === 'a') {
          e.preventDefault()
          selectAll()
        }
      }
      if (e.key === 'Delete' && selected.size) {
        e.preventDefault()
        removeSel()
      }
      if (e.key === 'Escape') {
        setUi((u) => ({ ...u, selected: new Set(), editing: null }))
      }
      if (selected.size && dir[e.key]) {
        e.preventDefault()
        const { row, col } = dir[e.key]
        moveSel(row, col)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [editing, selected, undo, redo, selectAll, removeSel, moveSel])

  const onDragStart = useCallback(
    (e: React.DragEvent, el: SeatElement) => {
      const isSel = selected.has(el.id)
      if (!isSel) setUi((u) => ({ ...u, selected: new Set([el.id]), last: el.id }))
      setUi((u) => ({ ...u, dragEl: el, dragging: true }))
      e.dataTransfer.effectAllowed = 'move'
    },
    [selected],
  )

  const onDragOver = useCallback(
    (e: React.DragEvent, row: number, col: number) => {
      e.preventDefault()
      if (!dragEl) return
      e.dataTransfer.dropEffect = 'move'
      const multi = selected.size > 1 && selected.has(dragEl.id)
      const previewPos = multi
        ? (() => {
            const dR = row - dragEl.position.row
            const dC = col - dragEl.position.col
            const sel = layout.elements.filter((el) => selected.has(el.id))
            const ex = new Set(selected)
            const ok = sel.every((el) =>
              canPlace(
                el.position.row + dR,
                el.position.col + dC,
                el.size?.rowSpan || 1,
                el.size?.colSpan || 1,
                ex,
              ),
            )
            return ok ? { row, col } : null
          })()
        : canPlace(
              row,
              col,
              dragEl.size?.rowSpan || 1,
              dragEl.size?.colSpan || 1,
              new Set([dragEl.id]),
            )
          ? { row, col }
          : null
      setUi((u) => ({ ...u, preview: previewPos }))
    },
    [dragEl, selected, layout.elements, canPlace],
  )

  const stopDrag = useCallback(() => {
    setUi((u) => ({ ...u, dragEl: null, dragging: false, preview: null }))
  }, [])

  const onDrop = useCallback(
    (e: React.DragEvent, row: number, col: number) => {
      e.preventDefault()
      if (!dragEl || !preview) {
        stopDrag()
        return
      }
      const multi = selected.size > 1 && selected.has(dragEl.id)
      const update = (els: SeatElement[]) =>
        multi
          ? els.map((el) =>
              selected.has(el.id)
                ? {
                    ...el,
                    position: {
                      row: el.position.row + (preview.row - dragEl.position.row),
                      col: el.position.col + (preview.col - dragEl.position.col),
                    },
                  }
                : el,
            )
          : els.map((el) => (el.id === dragEl.id ? { ...el, position: preview } : el))
      setLayout({ ...layout, elements: update(layout.elements) })
      stopDrag()
    },
    [dragEl, preview, selected, layout, setLayout, stopDrag],
  )

  const onCellClick = useCallback(
    (row: number, col: number, e: React.MouseEvent) => {
      e.stopPropagation()
      const exist = getAt(row, col)
      if (exist) {
        if (e.shiftKey && last) {
          const lastEl = layout.elements.find((el) => el.id === last)
          if (!lastEl) return
          const minR = Math.min(lastEl.position.row, exist.position.row)
          const maxR = Math.max(lastEl.position.row, exist.position.row)
          const minC = Math.min(lastEl.position.col, exist.position.col)
          const maxC = Math.max(lastEl.position.col, exist.position.col)
          const range = new Set<string>()
          layout.elements.forEach((el) => {
            const r = el.position.row
            const c = el.position.col
            if (r >= minR && r <= maxR && c >= minC && c <= maxC) range.add(el.id)
          })
          setUi((u) => ({ ...u, selected: range }))
        } else if (e.ctrlKey || e.metaKey) {
          setUi((u) => {
            const nxt = new Set(u.selected)
            nxt.has(exist.id) ? nxt.delete(exist.id) : nxt.add(exist.id)
            return { ...u, selected: nxt, last: exist.id }
          })
        } else {
          setUi((u) => ({ ...u, selected: new Set([exist.id]), last: exist.id }))
        }
      } else {
        add(row, col)
        setUi((u) => ({ ...u, selected: new Set() }))
      }
    },
    [getAt, add, last, layout.elements],
  )

  const startEdit = useCallback((id: string, cur: string) => {
    setUi((u) => ({ ...u, editing: id, editVal: cur }))
  }, [])

  const finishEdit = useCallback(() => {
    if (!editing) return
    setLayout({
      ...layout,
      elements: layout.elements.map((el) =>
        el.id === editing ? { ...el, seatNumber: ui.editVal } : el,
      ),
    })
    setUi((u) => ({ ...u, editing: null, editVal: '' }))
  }, [editing, ui.editVal, layout, setLayout])

  const updateSize = useCallback(
    (el: SeatElement, rs: number, cs: number) => {
      if (canPlace(el.position.row, el.position.col, rs, cs, new Set([el.id]))) {
        setLayout({
          ...layout,
          elements: layout.elements.map((e) =>
            e.id === el.id ? { ...e, size: { rowSpan: rs, colSpan: cs } } : e,
          ),
        })
      }
    },
    [layout, canPlace, setLayout],
  )

  const stats = useMemo(() => {
    const seats = layout.elements.filter((e) => e.type === 'seat')
    return {
      total: seats.length,
      available: seats.filter((s) => !s.disabled).length,
      disabled: seats.filter((s) => s.disabled).length,
    }
  }, [layout.elements])

  const tools = [
    { type: 'seat' as const, label: 'Seat', icon: Users },
    { type: 'wc' as const, label: 'WC', icon: Toilet },
    { type: 'driver' as const, label: 'Driver', icon: User },
    { type: 'door' as const, label: 'Door', icon: DoorOpen },
  ]

  return (
    <div className="seat-maker" ref={container} tabIndex={-1}>
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
      <div className="seat-maker__toolbar">
        <button
          type="button"
          onClick={undo}
          disabled={!canUndo}
          className="seat-maker__btn"
          title="Undo (Ctrl+Z)"
        >
          <Undo size={16} />
        </button>
        <button
          type="button"
          onClick={redo}
          disabled={!canRedo}
          className="seat-maker__btn"
          title="Redo (Ctrl+Y)"
        >
          <Redo size={16} />
        </button>
        <div className="seat-maker__divider" />
        <button
          type="button"
          onClick={selectAll}
          className="seat-maker__btn"
          title="Select All (Ctrl+A)"
        >
          <Square size={16} /> All
        </button>
        <button
          type="button"
          onClick={toggleDisable}
          disabled={!selected.size}
          className="seat-maker__btn"
          title="Toggle Disabled"
        >
          <Lock size={16} /> Disable
        </button>
        <button
          type="button"
          onClick={removeSel}
          disabled={!selected.size}
          className="seat-maker__btn seat-maker__btn--danger"
          title="Delete (Delete)"
        >
          <Trash2 size={16} /> Delete
        </button>
        <button
          type="button"
          onClick={clearAll}
          className="seat-maker__btn seat-maker__btn--danger"
          title="Clear All"
        >
          <RotateCcw size={16} /> Clear
        </button>
      </div>

      <div className="seat-maker__content">
        <div className="seat-maker__sidebar">
          <div className="seat-maker__section">
            <h4>Add Element</h4>
            <div className="seat-maker__tools">
              {tools.map((tool) => {
                const Icon = tool.icon
                return (
                  <button
                    type="button"
                    key={tool.type}
                    onClick={() => setUi((u) => ({ ...u, selectedTool: tool.type }))}
                    className={`seat-maker__tool ${selectedTool === tool.type ? 'seat-maker__tool--active' : ''}`}
                  >
                    <Icon size={18} />
                    <span>{tool.label}</span>
                  </button>
                )
              })}
            </div>
          </div>
          <div className="seat-maker__section">
            <h4>Element Size</h4>
            <div className="seat-maker__size-controls">
              <div className="seat-maker__size-input">
                <label>Rows</label>
                <input
                  type="number"
                  min="1"
                  max="4"
                  value={elementSize.rowSpan}
                  onChange={(e) =>
                    setUi((u) => ({
                      ...u,
                      size: { ...u.size, rowSpan: parseInt(e.target.value) || 1 },
                    }))
                  }
                />
              </div>
              <div className="seat-maker__size-input">
                <label>Cols</label>
                <input
                  type="number"
                  min="1"
                  max="4"
                  value={elementSize.colSpan}
                  onChange={(e) =>
                    setUi((u) => ({
                      ...u,
                      size: { ...u.size, colSpan: parseInt(e.target.value) || 1 },
                    }))
                  }
                />
              </div>
            </div>
          </div>
          <div className="seat-maker__section">
            <h4>Grid Size</h4>
            <div className="seat-maker__size-controls">
              <div className="seat-maker__size-input">
                <label>Rows</label>
                <input
                  type="number"
                  min="4"
                  max="20"
                  value={layout.dimensions.rows}
                  onChange={(e) =>
                    setLayout({
                      ...layout,
                      dimensions: { ...layout.dimensions, rows: parseInt(e.target.value) || 12 },
                    })
                  }
                />
              </div>
              <div className="seat-maker__size-input">
                <label>Cols</label>
                <input
                  type="number"
                  min="2"
                  max="8"
                  value={layout.dimensions.cols}
                  onChange={(e) =>
                    setLayout({
                      ...layout,
                      dimensions: { ...layout.dimensions, cols: parseInt(e.target.value) || 4 },
                    })
                  }
                />
              </div>
            </div>
          </div>
          {selected.size === 1 &&
            (() => {
              const el = layout.elements.find((e) => selected.has(e.id))
              if (el && el.type !== 'seat') {
                return (
                  <div className="seat-maker__section">
                    <h4>Selected {el.type}</h4>
                    <div className="seat-maker__size-controls">
                      <div className="seat-maker__size-input">
                        <label>Rows</label>
                        <input
                          type="number"
                          min="1"
                          max="4"
                          value={el.size?.rowSpan || 1}
                          onChange={(e) =>
                            updateSize(el, parseInt(e.target.value) || 1, el.size?.colSpan || 1)
                          }
                        />
                      </div>
                      <div className="seat-maker__size-input">
                        <label>Cols</label>
                        <input
                          type="number"
                          min="1"
                          max="4"
                          value={el.size?.colSpan || 1}
                          onChange={(e) =>
                            updateSize(el, el.size?.rowSpan || 1, parseInt(e.target.value) || 1)
                          }
                        />
                      </div>
                    </div>
                  </div>
                )
              }
              return null
            })()}
          <div className="seat-maker__section seat-maker__tips">
            <h4>Tips</h4>
            <ul>
              <li>Click empty cells to add</li>
              <li>Drag elements to move</li>
              <li>Shift+click for range select</li>
              <li>Ctrl+click to add to selection</li>
              <li>Double-click seats to edit</li>
              <li>Arrow keys move selected</li>
              <li>Delete key removes selected</li>
            </ul>
          </div>
        </div>

        <div
          className="seat-maker__grid-container"
          onClick={(e) =>
            e.currentTarget === e.target && setUi((u) => ({ ...u, selected: new Set() }))
          }
        >
          <div
            className={`seat-maker__grid ${dragging ? 'seat-maker__grid--dragging' : ''}`}
            style={{
              gridTemplateRows: `repeat(${layout.dimensions.rows}, 50px)`,
              gridTemplateColumns: `repeat(${layout.dimensions.cols}, 80px)`,
            }}
          >
            {Array.from({ length: layout.dimensions.rows }, (_, r) =>
              Array.from({ length: layout.dimensions.cols }, (_, c) => {
                const row = r + 1
                const col = c + 1
                return (
                  <div
                    key={`cell-${r}-${c}`}
                    className="seat-maker__cell"
                    style={{ gridRow: row, gridColumn: col }}
                    onClick={(e) => onCellClick(row, col, e)}
                    onDragOver={(e) => onDragOver(e, row, col)}
                    onDrop={(e) => onDrop(e, row, col)}
                  />
                )
              }),
            )}

            {layout.elements.map((el) => {
              const Icon = tools.find((t) => t.type === el.type)?.icon || Users
              const isSel = selected.has(el.id)
              const isEdit = editing === el.id

              return (
                <div
                  key={el.id}
                  className={`seat-maker__element seat-maker__element--${el.type} ${isSel ? 'seat-maker__element--selected' : ''} ${el.disabled ? 'seat-maker__element--disabled' : ''} ${
                    dragEl?.id === el.id ? 'seat-maker__element--dragging-source' : ''
                  }`}
                  style={{
                    gridRow: `${el.position.row} / span ${el.size?.rowSpan || 1}`,
                    gridColumn: `${el.position.col} / span ${el.size?.colSpan || 1}`,
                  }}
                  draggable={!isEdit}
                  onDragStart={(e) => onDragStart(e, el)}
                  onDragEnd={stopDrag}
                  onClick={(e) => onCellClick(el.position.row, el.position.col, e)}
                  onDoubleClick={(e) => {
                    e.stopPropagation()
                    el.type === 'seat' && startEdit(el.id, el.seatNumber || '')
                  }}
                >
                  <Icon size={16} />
                  {isEdit ? (
                    <input
                      className="seat-maker__element-input"
                      value={editVal}
                      onChange={(e) => setUi((u) => ({ ...u, editVal: e.target.value }))}
                      onBlur={finishEdit}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') finishEdit()
                        if (e.key === 'Escape') setUi((u) => ({ ...u, editing: null }))
                      }}
                      onClick={(e) => e.stopPropagation()}
                      autoFocus
                    />
                  ) : (
                    <span className="seat-maker__element-label">
                      {el.type === 'seat'
                        ? el.seatNumber || 'S'
                        : tools.find((t) => t.type === el.type)!.label}
                    </span>
                  )}
                </div>
              )
            })}

            {preview &&
              dragEl &&
              layout.elements
                .filter((el) => selected.has(el.id))
                .map((el) => (
                  <div
                    key={`preview-${el.id}`}
                    className="seat-maker__preview"
                    style={{
                      gridRow: `${el.position.row + (preview.row - dragEl.position.row)} / span ${el.size?.rowSpan || 1}`,
                      gridColumn: `${el.position.col + (preview.col - dragEl.position.col)} / span ${
                        el.size?.colSpan || 1
                      }`,
                    }}
                  />
                ))}
          </div>
        </div>
      </div>

      <ConfirmationModal
        modalSlug="clear-layout-confirm"
        heading="Clear Layout"
        onConfirm={confirmClear}
        body={<p>Are you sure you want to clear the entire layout?</p>}
      />
    </div>
  )
}

export default SeatLayoutDesigner
