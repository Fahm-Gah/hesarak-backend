import type { RelationshipField } from 'payload'

export interface Profile {
  id: string
  fullName: string
  fatherName?: string
  phoneNumber?: string
  gender?: 'male' | 'female'
}

export interface Props {
  field: RelationshipField & {
    relationTo: 'profiles'
  }
  path: string
  readOnly?: boolean
  validate?: (value: any, siblingData: any) => string | Promise<string> | true
}
