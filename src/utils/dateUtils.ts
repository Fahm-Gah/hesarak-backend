import moment from 'moment-jalaali'

/**
 * Get day of week from a date string
 * @param date - Date string in YYYY-MM-DD format
 * @returns Day abbreviation (sun, mon, tue, etc.)
 */
export const getDayOfWeek = (date: string): string => {
  const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']
  const dayIndex = new Date(date).getDay()
  return days[dayIndex]
}

/**
 * Format time string to HH:mm format (24-hour)
 * @param timeInput - Time string or Date object from database
 * @returns Formatted time in 24-hour format
 */
export const formatTime = (timeInput: string | Date): string => {
  try {
    let date: Date

    if (timeInput instanceof Date) {
      date = timeInput
    } else if (typeof timeInput === 'string') {
      // Handle both ISO strings and time-only strings
      if (timeInput.includes('T') || timeInput.includes('Z')) {
        date = new Date(timeInput)
      } else {
        date = new Date(`1970-01-01T${timeInput}:00`)
      }
    } else {
      return String(timeInput)
    }

    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })
  } catch {
    return String(timeInput)
  }
}

/**
 * Format a time to a readable 12-hour format with AM/PM.
 * This function can handle Date objects, ISO strings, and "HH:MM" strings.
 * @param timeInput - Time input (Date object, ISO string, or "HH:MM" string)
 * @returns Formatted time (e.g., "9:00 AM", "2:30 PM", or "7:30 PM")
 */
export const formatDepartureTime = (timeInput: string | Date): string => {
  try {
    let date: Date

    if (timeInput instanceof Date) {
      // Direct Date object
      date = timeInput
    } else if (typeof timeInput === 'string') {
      // Handle both ISO strings and time-only strings
      if (timeInput.includes('T') || timeInput.includes('Z')) {
        // ISO string
        date = new Date(timeInput)
      } else {
        // Time-only string like "14:30"
        date = new Date(`1970-01-01T${timeInput}:00`)
      }
    } else {
      return String(timeInput)
    }

    if (isNaN(date.getTime())) {
      throw new Error('Invalid date/time')
    }

    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  } catch (e) {
    console.error('Error formatting departure time:', e, 'Input:', timeInput)
    return String(timeInput) // Fallback to original string on error
  }
}

/**
 * Calculate duration between two times
 * @param startTime - Start time in HH:mm format or formatted time string
 * @param endTime - End time in HH:mm format or formatted time string
 * @returns Duration string like "9h 30m"
 */
export const calculateDuration = (startTime: string, endTime: string): string => {
  try {
    // Validate inputs
    if (
      !startTime ||
      !endTime ||
      typeof startTime !== 'string' ||
      typeof endTime !== 'string' ||
      startTime === 'Invalid Date' ||
      endTime === 'Invalid Date'
    ) {
      return 'Unknown'
    }

    // Extract time from potential full datetime strings
    let startTimeOnly = startTime
    let endTimeOnly = endTime

    // If it's a full datetime string, extract just the time part
    if (startTime.includes('T')) {
      startTimeOnly = new Date(startTime).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      })
    }

    if (endTime.includes('T')) {
      endTimeOnly = new Date(endTime).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      })
    }

    // Validate time format (should be HH:MM or similar)
    const timeRegex = /^\d{1,2}:\d{2}$/
    if (!timeRegex.test(startTimeOnly) || !timeRegex.test(endTimeOnly)) {
      console.warn('Invalid time format for duration calculation:', { startTime, endTime })
      return 'Unknown'
    }

    const start = new Date(`1970-01-01T${startTimeOnly}`)
    const end = new Date(`1970-01-01T${endTimeOnly}`)

    // Check if dates are valid
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      console.warn('Invalid dates in duration calculation:', { startTimeOnly, endTimeOnly })
      return 'Unknown'
    }

    let durationMs = end.getTime() - start.getTime()

    // Handle overnight trips
    if (durationMs < 0) {
      durationMs += 24 * 60 * 60 * 1000 // Add 24 hours
    }

    const hours = Math.floor(durationMs / (1000 * 60 * 60))
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60))

    // Validate calculated values
    if (isNaN(hours) || isNaN(minutes)) {
      console.warn('NaN values in duration calculation:', { hours, minutes, durationMs })
      return 'Unknown'
    }

    return `${hours}h ${minutes}m`
  } catch (error) {
    console.error('Error calculating duration:', error, { startTime, endTime })
    return 'Unknown'
  }
}

/**
 * Converts Persian/Farsi digits to standard Arabic digits
 * Handles URL-encoded Persian characters automatically
 * @param input - String containing Persian digits (۰۱۲۳۴۵۶۷۸۹)
 * @returns String with standard digits (0123456789)
 */
export const convertPersianDigits = (input: string): string => {
  if (!input) return input

  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹']
  const arabicDigits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']

  let result = input

  // Replace Persian digits with Arabic digits
  persianDigits.forEach((persianDigit, index) => {
    const regex = new RegExp(persianDigit, 'g')
    result = result.replace(regex, arabicDigits[index])
  })

  return result
}

/**
 * PRODUCTION VERSION: Converts Persian/Solar Hijri date to Gregorian using moment-jalaali
 * Handles Persian digits, URL encoding, and accurate calendar conversion
 * @param dateString - Persian date string (e.g., "1404-7-10" or "۱۴۰۴-۷-۱۰")
 * @returns Gregorian date in YYYY-MM-DD format
 */
export const convertPersianDateToGregorian = (dateString: string): string => {
  if (!dateString) return dateString

  try {
    // First convert Persian digits to standard digits
    const normalizedDate = convertPersianDigits(dateString)

    // Parse date parts
    const parts = normalizedDate.split('-')
    if (parts.length !== 3) {
      // If not in expected format, return as-is
      return normalizedDate
    }

    const year = parseInt(parts[0])
    const month = parseInt(parts[1])
    const day = parseInt(parts[2])

    // Validate parsed numbers
    if (isNaN(year) || isNaN(month) || isNaN(day)) {
      console.warn(`Invalid date parts in: ${dateString}`)
      return normalizedDate
    }

    // If year is in Persian calendar range (1300-1500), convert it
    if (year >= 1300 && year <= 1500) {
      // Parse as Jalaali date and convert to Gregorian
      const persianMoment = moment(`${year}/${month}/${day}`, 'jYYYY/jM/jD')

      if (persianMoment.isValid()) {
        const gregorianDate = persianMoment.format('YYYY-MM-DD')
        return gregorianDate
      } else {
        console.warn(`Invalid Persian date: ${dateString}`)
        return normalizedDate
      }
    }

    // If year is not in Persian range, assume it's already Gregorian
    return normalizedDate
  } catch (error) {
    console.error('Error converting Persian date:', error)
    return dateString // Return original on error
  }
}

/**
 * Validates a date string and checks if it's not in the past
 * Handles Persian calendar conversion automatically
 * @param dateString - Date string (Persian or Gregorian)
 * @returns Validation result with date object and error message
 */
export const validateDate = (
  dateString: string,
): { isValid: boolean; date?: Date; error?: string } => {
  if (!dateString) {
    return {
      isValid: false,
      error: 'Date is required',
    }
  }

  try {
    // Convert Persian digits and calendar to Gregorian using production library
    const gregorianDate = convertPersianDateToGregorian(dateString)
    const searchDate = new Date(gregorianDate)

    if (isNaN(searchDate.getTime())) {
      return {
        isValid: false,
        error: 'Invalid date format. Please use YYYY-MM-DD format',
      }
    }

    // Check if date is not in the past
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    searchDate.setHours(0, 0, 0, 0)

    if (searchDate < today) {
      return {
        isValid: false,
        error: 'Cannot search for trips in the past',
      }
    }

    return { isValid: true, date: searchDate }
  } catch (error) {
    console.error('Date validation error:', error)
    return {
      isValid: false,
      error: 'Error validating date',
    }
  }
}

/**
 * Convert Gregorian date to Persian display format
 * Useful for displaying dates back to users in Persian format
 * @param gregorianDate - Gregorian date string (YYYY-MM-DD)
 * @returns Persian date string (jYYYY/jMM/jDD)
 */
export const convertGregorianToPersianDisplay = (gregorianDate: string): string => {
  try {
    // Handle multiple date formats
    let m = moment(gregorianDate, 'YYYY-MM-DD')
    if (!m.isValid()) {
      m = moment(gregorianDate) // Try automatic parsing
    }
    
    if (m.isValid()) {
      const formatted = m.format('jYYYY/jMM/jDD')
      // Double check the year isn't malformed
      if (formatted.startsWith('0') && formatted.length > 8) {
        // If year starts with 0, something went wrong, try different approach
        const persianYear = m.jYear()
        const persianMonth = m.jMonth() + 1 // jMonth is 0-indexed
        const persianDay = m.jDate()
        const corrected = `${persianYear}/${String(persianMonth).padStart(2, '0')}/${String(persianDay).padStart(2, '0')}`
        return corrected
      }
      return formatted
    }
    console.warn('Invalid date for conversion:', gregorianDate)
    return gregorianDate
  } catch (error) {
    console.error('Error converting to Persian display:', error, 'Input:', gregorianDate)
    return gregorianDate
  }
}

/**
 * Get Persian month name from Gregorian date
 * @param gregorianDate - Gregorian date string (YYYY-MM-DD)
 * @returns Persian month name
 */
export const getPersianMonthName = (gregorianDate: string): string => {
  try {
    const m = moment(gregorianDate, 'YYYY-MM-DD')
    if (m.isValid()) {
      return m.format('jMMMM') // Returns Persian month name like "مهر"
    }
    return ''
  } catch (error) {
    console.error('Error getting Persian month name:', error)
    return ''
  }
}

/**
 * Get current date in Persian calendar
 * @returns Current Persian date in jYYYY/jMM/jDD format
 */
export const getCurrentPersianDate = (): string => {
  return moment().format('jYYYY/jMM/jDD')
}

/**
 * Check if a Persian year is a leap year
 * @param persianYear - Persian year (e.g., 1404)
 * @returns True if leap year, false otherwise
 */
export const isPersianLeapYear = (persianYear: number): boolean => {
  return moment.jIsLeapYear(persianYear)
}
