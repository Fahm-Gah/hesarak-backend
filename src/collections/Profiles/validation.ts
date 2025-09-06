import { parsePhoneNumberFromString } from 'libphonenumber-js'
import { t } from '@/utils/i18n'

export const validatePhoneNumber = (value: any, { req }: any) => {
  if (!value) return true // Allow empty values since field is not required

  const phoneString = String(value).trim()

  try {
    const parsedPhone = parsePhoneNumberFromString(phoneString, 'AF')

    if (!parsedPhone || !parsedPhone.isValid()) {
      // Get locale from headers (Headers object needs .get() method)
      let locale: 'en' | 'fa' = 'fa' // default to Persian

      // Method 1: Check accept-language header directly
      const acceptLanguage =
        req?.headers?.get?.('accept-language') || req?.headers?.['accept-language']
      if (acceptLanguage) {
        locale = acceptLanguage === 'en' ? 'en' : 'fa'
      }

      // Method 2: Check payload-lng cookie as fallback
      if (!acceptLanguage) {
        const cookieHeader = req?.headers?.get?.('cookie') || req?.headers?.cookie
        if (cookieHeader && typeof cookieHeader === 'string') {
          const payloadLngMatch = cookieHeader.match(/payload-lng=([^;]+)/)
          if (payloadLngMatch) {
            locale = payloadLngMatch[1] === 'en' ? 'en' : 'fa'
          }
        }
      }

      // Use your existing t function with detected locale
      return t('INVALID_PHONE_NUMBER', locale)
    }

    return true
  } catch (error) {
    // Same locale detection logic
    let locale: 'en' | 'fa' = 'fa'

    const acceptLanguage =
      req?.headers?.get?.('accept-language') || req?.headers?.['accept-language']
    if (acceptLanguage) {
      locale = acceptLanguage === 'en' ? 'en' : 'fa'
    } else {
      const cookieHeader = req?.headers?.get?.('cookie') || req?.headers?.cookie
      if (cookieHeader && typeof cookieHeader === 'string') {
        const payloadLngMatch = cookieHeader.match(/payload-lng=([^;]+)/)
        if (payloadLngMatch) {
          locale = payloadLngMatch[1] === 'en' ? 'en' : 'fa'
        }
      }
    }

    return t('INVALID_PHONE_NUMBER', locale)
  }
}
