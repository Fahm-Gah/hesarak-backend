import type { CollectionBeforeChangeHook } from 'payload'
import { parsePhoneNumberFromString } from 'libphonenumber-js'

export const normalizePhone: CollectionBeforeChangeHook = async ({ data, operation }) => {
  // Normalize phone number stored in username field
  if (data.username) {
    try {
      // Skip normalization if already in E.164 format
      if (!data.username.startsWith('+')) {
        const phoneNumber = parsePhoneNumberFromString(data.username, 'AF')
        if (phoneNumber && phoneNumber.isValid()) {
          data.username = phoneNumber.format('E.164')
          data.normalizedPhone = phoneNumber.format('E.164')
        } else {
          throw new Error('Invalid phone number for Afghanistan')
        }
      } else {
        // Already normalized, just sync
        data.normalizedPhone = data.username
      }
    } catch (error) {
      console.warn('Phone number normalization failed:', error)
      throw new Error('Invalid phone number format')
    }
  }

  return data
}
