import { Users, Toilet, User, DoorOpen, type LucideIcon } from 'lucide-react'
import type { ElementType } from './types'

export interface Tool {
  type: ElementType
  label: string
  labelFa?: string // Persian label
  icon: LucideIcon
  shortcut?: string
  description?: string
  descriptionFa?: string // Persian description
}

export const TOOLS: Tool[] = [
  {
    type: 'seat',
    label: 'Seat',
    labelFa: 'صندلی',
    icon: Users,
    shortcut: 'S',
    description: 'Passenger seat',
    descriptionFa: 'صندلی مسافر',
  },
  {
    type: 'wc',
    label: 'WC',
    labelFa: 'دستشویی',
    icon: Toilet,
    shortcut: 'W',
    description: 'Restroom',
    descriptionFa: 'سرویس بهداشتی',
  },
  {
    type: 'driver',
    label: 'Driver',
    labelFa: 'راننده',
    icon: User,
    shortcut: 'D',
    description: 'Driver seat',
    descriptionFa: 'صندلی راننده',
  },
  {
    type: 'door',
    label: 'Door',
    labelFa: 'دروازه',
    icon: DoorOpen,
    shortcut: 'O',
    description: 'Entry/exit door',
    descriptionFa: 'دروازه ورود/خروج',
  },
] as const

export const getIconForType = (type: ElementType): LucideIcon => {
  const tool = TOOLS.find((t) => t.type === type)
  return tool?.icon || Users
}

export const getToolByType = (type: ElementType): Tool | undefined => {
  return TOOLS.find((t) => t.type === type)
}

export const DEFAULT_DIMENSIONS = { rows: 12, cols: 4 } as const
export const MIN_DIMENSIONS = { rows: 1, cols: 1 } as const
export const MAX_DIMENSIONS = { rows: 50, cols: 20 } as const

export const DEFAULT_ELEMENT_SIZE = { rowSpan: 1, colSpan: 1 } as const
export const MAX_ELEMENT_SIZE = { rowSpan: 10, colSpan: 10 } as const

export const KEYBOARD_SHORTCUTS = {
  UNDO: ['ctrl+z', 'cmd+z'],
  REDO: ['ctrl+y', 'cmd+y', 'ctrl+shift+z', 'cmd+shift+z'],
  SELECT_ALL: ['ctrl+a', 'cmd+a'],
  DELETE: ['delete', 'backspace'],
  ESCAPE: ['escape'],
  MOVE_UP: ['up'],
  MOVE_DOWN: ['down'],
  MOVE_LEFT: ['left'],
  MOVE_RIGHT: ['right'],
} as const
