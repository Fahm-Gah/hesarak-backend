import { parsePhoneNumberFromString } from 'libphonenumber-js'

export const validatePhoneNumber = (value: any) => {
  if (!value) return true // Allow empty values since field is not required

  const phoneString = String(value).trim()

  try {
    const parsedPhone = parsePhoneNumberFromString(phoneString, 'AF')

    if (!parsedPhone || !parsedPhone.isValid()) {
      return 'شماره تلفن برای افغانستان نامعتبر است'
    }

    return true
  } catch (error) {
    return 'شماره تلفن برای افغانستان نامعتبر است'
  }
}
