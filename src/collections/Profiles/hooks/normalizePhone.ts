import type { CollectionBeforeChangeHook } from 'payload'
import { parsePhoneNumberFromString } from 'libphonenumber-js'

export const normalizePhone: CollectionBeforeChangeHook = async ({ data }) => {
  // Normalize phone number if provided and valid
  if (data?.phoneNumber) {
    const parsedPhone = parsePhoneNumberFromString(data.phoneNumber, 'AF')
    if (parsedPhone && parsedPhone.isValid()) {
      data.phoneNumber = parsedPhone.format('E.164')
    }
  }
  return data
}
