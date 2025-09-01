export type SupportedLocale = 'fa' | 'en'

export interface TranslationMessage {
  fa: string
  en: string
}

// Error messages for endpoints
export const errorMessages = {
  // Authentication errors
  AUTH_REQUIRED: {
    fa: 'احراز هویت الزامی است',
    en: 'Authentication required',
  },
  USER_INACTIVE: {
    fa: 'حساب کاربری غیرفعال است',
    en: 'User account is inactive',
  },
  PROFILE_REQUIRED: {
    fa: 'تکمیل پروفایل الزامی است. لطفاً قبل از قید کردن تکت پروفایل خود را تکمیل کنید.',
    en: 'Profile required. Please complete your profile before booking tickets.',
  },

  // Booking validation errors
  VALIDATION_FAILED: {
    fa: 'اعتبارسنجی ناموفق بود',
    en: 'Validation failed',
  },
  BOOKING_CONSTRAINTS_VIOLATED: {
    fa: 'محدودیت‌های قید کردن نقض شده است',
    en: 'Booking constraints violated',
  },
  INVALID_JSON: {
    fa: 'فرمت JSON نامعتبر در درخواست',
    en: 'Invalid JSON in request body',
  },

  // Trip errors
  TRIP_NOT_FOUND: {
    fa: 'سفر یافت نشد یا دیگر در دسترس نیست',
    en: 'Trip not found or no longer available',
  },
  TRIP_ALREADY_DEPARTED: {
    fa: 'امکان قید کردن تکت برای سفرهای انجام شده وجود ندارد.',
    en: 'Cannot book tickets for trips that have already departed.',
  },
  BOOKING_TOO_CLOSE: {
    fa: 'قید کردن تکت در کمتر از ۲ ساعت به زمان حرکت مجاز نیست. لطفاً حداقل ۲ ساعت قبل از حرکت تکت خود را قید کنید.',
    en: 'Booking is not allowed within 2 hours of departure time. Please book your ticket at least 2 hours before departure.',
  },
  DEPARTURE_TIME_VALIDATION_FAILED: {
    fa: 'امکان اعتبارسنجی زمان حرکت وجود ندارد. لطفاً دوباره تلاش کنید.',
    en: 'Unable to validate departure time. Please try again.',
  },

  // Bus and seat errors
  BUS_CONFIG_NOT_FOUND: {
    fa: 'پیکربندی بس یافت نشد',
    en: 'Bus configuration not found',
  },
  INVALID_SEAT_IDS: {
    fa: 'شماره‌های چوکی نامعتبر یا غیرفعال: {seatIds}',
    en: 'Invalid or disabled seat IDs: {seatIds}',
  },
  SEATS_ALREADY_BOOKED: {
    fa: 'چوکی‌های زیر قبلاً قید شده‌اند: {seats}',
    en: 'The following seats are already booked: {seats}',
  },

  // Booking limits
  BOOKING_LIMIT_EXCEEDED: {
    fa: 'حد مجاز قید کردن تجاوز شده است. حداکثر {maxSeats} چوکی برای هر کاربر در هر سفر مجاز است.',
    en: 'Booking limit exceeded. Maximum {maxSeats} seats per user per trip.',
  },
  MAX_SEATS_REACHED: {
    fa: 'شما به حداکثر {maxSeats} چوکی برای این سفر رسیده‌اید.',
    en: 'You have already reached the maximum limit of {maxSeats} seats for this trip.',
  },

  // Success messages
  BOOKING_SUCCESS: {
    fa: 'تکت‌ها با موفقیت قید شدند',
    en: 'Tickets booked successfully',
  },
  CONTACT_FORM_SUBMITTED: {
    fa: 'پیام شما با موفقیت ارسال شد',
    en: 'Your message has been sent successfully',
  },

  // Generic errors
  INTERNAL_ERROR: {
    fa: 'قید کردن به دلیل خطای داخلی ناموفق بود. لطفاً دوباره تلاش کنید.',
    en: 'Booking failed due to an internal error. Please try again.',
  },
} as const

/**
 * Get translated message based on locale
 * @param messageKey - Key from errorMessages
 * @param locale - Target locale ('fa' | 'en')
 * @param interpolations - Object with values to replace in message (e.g., {maxSeats: 2})
 * @returns Translated message
 */
export function t(
  messageKey: keyof typeof errorMessages,
  locale: SupportedLocale = 'fa',
  interpolations?: Record<string, string | number>,
): string {
  const message = errorMessages[messageKey][locale]

  if (!interpolations) {
    return message
  }

  // Replace placeholders like {maxSeats} with actual values
  let result: string = message
  for (const [key, value] of Object.entries(interpolations)) {
    result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), String(value))
  }
  return result
}

/**
 * Get locale from request headers or default to Persian
 * @param req - Request object
 * @returns Detected locale
 */
export function getLocaleFromRequest(req: { headers?: Record<string, string> }): SupportedLocale {
  // Check Accept-Language header
  const acceptLanguage = req.headers?.['accept-language']

  if (acceptLanguage?.includes('en')) {
    return 'en'
  }

  // Check custom header
  const customLocale = req.headers?.['x-locale']
  if (customLocale === 'en' || customLocale === 'fa') {
    return customLocale
  }

  // Default to Persian (primary language)
  return 'fa'
}

/**
 * Create localized error response
 * @param messageKey - Error message key
 * @param status - HTTP status code
 * @param locale - Target locale
 * @param interpolations - Values for message placeholders
 * @param details - Additional error details
 * @returns Response object
 */
export function createErrorResponse(
  messageKey: keyof typeof errorMessages,
  status: number,
  locale: SupportedLocale = 'fa',
  interpolations?: Record<string, string | number>,
  details?: unknown,
) {
  const error = t(messageKey, locale, interpolations)

  const responseBody: Record<string, unknown> = {
    success: false,
    error,
    locale,
  }

  if (details) {
    responseBody.details = details
  }

  return Response.json(responseBody, { status })
}

/**
 * Create localized success response
 * @param messageKey - Success message key
 * @param data - Response data
 * @param locale - Target locale
 * @param interpolations - Values for message placeholders
 * @returns Response object
 */
export function createSuccessResponse(
  messageKey: keyof typeof errorMessages,
  data?: unknown,
  locale: SupportedLocale = 'fa',
  interpolations?: Record<string, string | number>,
) {
  const message = t(messageKey, locale, interpolations)

  const responseBody: Record<string, unknown> = {
    success: true,
    message,
    locale,
  }

  if (data) {
    responseBody.data = data
  }

  return Response.json(responseBody, { status: 200 })
}
