import type { StaticLabel } from 'payload'
import type { Profile } from '@/payload-types'

export type ProfileOption = {
  id: string
  fullName: string
  fatherName?: string | null
  phoneNumber?: string | null
  gender?: 'male' | 'female' | null
}

export type FieldComponentProps = {
  path: string
  field: {
    name: string
    type: 'relationship'
    relationTo: 'profiles'
    label?: string | StaticLabel
    required?: boolean
    admin?: {
      allowCreate?: boolean
      allowEdit?: boolean
      [key: string]: any
    }
    [key: string]: any
  }
  value?: string | Profile | null
  onChange?: (value: string | null) => void
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

export type Props = FieldComponentProps
