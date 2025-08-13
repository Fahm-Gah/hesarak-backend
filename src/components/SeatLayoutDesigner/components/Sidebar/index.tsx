import React from 'react'
import { useLayoutStore } from '../../store'
import { TOOLS, MAX_ELEMENT_SIZE } from '../../constants'
import { useLanguage } from '@/hooks/useLanguage'
import type { ElementType } from '../../types'
import { getSeatLayoutDesignerTranslations } from '@/utils/seatLayoutDesignerTranslations'

interface SidebarProps {
  selectedTool: ElementType
  setSelectedTool: (tool: ElementType) => void
  elementSize: { rowSpan: number; colSpan: number }
  setElementSize: React.Dispatch<React.SetStateAction<{ rowSpan: number; colSpan: number }>>
  onDimensionChange: (dimension: 'rows' | 'cols', value: number) => void
}

export const Sidebar: React.FC<SidebarProps> = ({
  selectedTool,
  setSelectedTool,
  elementSize,
  setElementSize,
  onDimensionChange,
}) => {
  const { dimensions } = useLayoutStore()
  const lang = useLanguage()
  const t = getSeatLayoutDesignerTranslations(lang)

  const handleElementSizeChange = (dimension: 'rowSpan' | 'colSpan', value: string) => {
    const numValue = parseInt(value, 10)
    if (isNaN(numValue) || numValue < 1) return

    const maxValue = dimension === 'rowSpan' ? MAX_ELEMENT_SIZE.rowSpan : MAX_ELEMENT_SIZE.colSpan
    const clampedValue = Math.min(numValue, maxValue)

    setElementSize((prev) => ({
      ...prev,
      [dimension]: clampedValue,
    }))
  }

  const handleGridSizeChange = (dimension: 'rows' | 'cols', value: string) => {
    const numValue = parseInt(value, 10)
    if (isNaN(numValue) || numValue < 1) return

    onDimensionChange(dimension, numValue)
  }

  return (
    <div className="seat-maker__sidebar">
      <div className="seat-maker__section">
        <h4>{t.sidebar.addElement}</h4>
        <div className="seat-maker__tools">
          {TOOLS.map((tool) => {
            const Icon = tool.icon
            const label = lang === 'fa' ? tool.labelFa || tool.label : tool.label
            const description =
              lang === 'fa' ? tool.descriptionFa || tool.description : tool.description

            return (
              <button
                type="button"
                key={tool.type}
                onClick={() => setSelectedTool(tool.type)}
                className={`seat-maker__tool ${
                  selectedTool === tool.type ? 'seat-maker__tool--active' : ''
                }`}
                title={description}
              >
                <Icon size={18} />
                <span>{label}</span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="seat-maker__section">
        <h4>{t.sidebar.elementSize}</h4>
        <div className="seat-maker__size-controls">
          <div className="seat-maker__size-input">
            <label htmlFor="element-rows">{t.sidebar.rows}</label>
            <input
              id="element-rows"
              type="number"
              min="1"
              max={MAX_ELEMENT_SIZE.rowSpan}
              value={elementSize.rowSpan}
              onChange={(e) => handleElementSizeChange('rowSpan', e.target.value)}
            />
          </div>
          <div className="seat-maker__size-input">
            <label htmlFor="element-cols">{t.sidebar.cols}</label>
            <input
              id="element-cols"
              type="number"
              min="1"
              max={MAX_ELEMENT_SIZE.colSpan}
              value={elementSize.colSpan}
              onChange={(e) => handleElementSizeChange('colSpan', e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="seat-maker__section">
        <h4>{t.sidebar.gridSize}</h4>
        <div className="seat-maker__size-controls">
          <div className="seat-maker__size-input">
            <label htmlFor="grid-rows">{t.sidebar.rows}</label>
            <input
              id="grid-rows"
              type="number"
              min="4"
              max="20"
              value={dimensions?.rows || 12}
              onChange={(e) => handleGridSizeChange('rows', e.target.value)}
            />
          </div>
          <div className="seat-maker__size-input">
            <label htmlFor="grid-cols">{t.sidebar.cols}</label>
            <input
              id="grid-cols"
              type="number"
              min="2"
              max="8"
              value={dimensions?.cols || 4}
              onChange={(e) => handleGridSizeChange('cols', e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="seat-maker__section seat-maker__tips">
        <h4>{t.sidebar.tips}</h4>
        <ul>
          {t.sidebar.tipsList.map((tip, index) => (
            <li key={index}>{tip}</li>
          ))}
        </ul>
      </div>
    </div>
  )
}
