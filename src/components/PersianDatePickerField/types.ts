import type {
  StaticLabel,
} from 'payload'
import type {
  RefObject,
} from 'react'

export type PickerAppearance = 'default' | 'monthOnly' | 'dayOnly' | 'dayAndTime' | 'timeOnly'

export type DatePickerOverrides = {
  customInputRef?: RefObject<HTMLInputElement>
}

export type DateFieldAdmin = {
  displayFormat?: string
  pickerAppearance?: PickerAppearance
  timeIntervals?: number
  timeFormat?: string
  filterDate?: (date: Date) => boolean
  minDate?: Date | string
  maxDate?: Date | string
  minTime?: Date | string
  maxTime?: Date | string
  placeholderText?: string
  monthsToShow?: number
  overrides?: Partial<DatePickerOverrides>
  readOnly?: boolean
}

export type FieldConfig = {
  label?: string | StaticLabel
  required?: boolean
  admin?: {
    date?: DateFieldAdmin
    readOnly?: boolean
  }
}

export type PersianDatePickerProps = {
  id?: string
  onChange?: (val: Date | null) => void
  placeholder?: string
  placeholderText?: string
  readOnly?: boolean
  value?: Date | string | null
  filterDate?: (date: Date) => boolean
  minDate?: Date
  maxDate?: Date
  minTime?: Date
  maxTime?: Date
  disabled?: boolean
  pickerAppearance?: PickerAppearance
  timeIntervals?: number
  timeFormat?: string
  displayFormat?: string
  customDisplayFormat?: string
  label?: string | StaticLabel
  required?: boolean
  path?: string
  showLabel?: boolean
  showError?: boolean
  errorMessage?: string
  monthsToShow?: number
  overrides?: Partial<DatePickerOverrides>
  field?: FieldConfig
}

export type FieldComponentProps = {
  path: string
  field: {
    name: string
    type: 'date'
    label?: string | StaticLabel
    required?: boolean
    admin?: {
      date?: DateFieldAdmin
      readOnly?: boolean
      [key: string]: any
    }
    [key: string]: any
  }
  readOnly?: boolean
  validate?: (value: any, options: any) => string | boolean | Promise<string | boolean>
  permissions?: {
    create?: {
      permission: boolean
    }
    read?: {
      permission: boolean
    }
    update?: {
      permission: boolean
    }
  }
  [key: string]: any
}

export type Props = PersianDatePickerProps & Partial<FieldComponentProps>

export type PersianDatePickerComponentProps = PersianDatePickerProps
