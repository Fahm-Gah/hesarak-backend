import { formatTime, convertPersianDateToGregorian } from '@/utils/dateUtils'
import { hasRole } from '@/access/accessControls'

export const validateTicketDate = async (value: any, { data, req }: any) => {
  if (!value || !data?.trip) return true

  const { payload, user } = req

  // Helper to validate user shape for role checking
  const validateAppUser = (raw: unknown) => {
    if (!raw || typeof raw !== 'object') return null
    const r = raw as any
    if (typeof r.id !== 'string') return null

    let roles: string[] | undefined
    if (Array.isArray(r.roles)) {
      roles = r.roles.filter((x: any) => typeof x === 'string')
    }

    const isActive = typeof r.isActive === 'boolean' ? r.isActive : undefined

    return {
      id: r.id,
      roles,
      isActive,
    }
  }

  const appUser = validateAppUser(user)

  try {
    // Fetch the trip schedule with full depth for stops
    const trip = await payload.findByID({
      collection: 'trip-schedules',
      id: data.trip as string,
      depth: 3,
    })

    if (!trip || !(trip as any).isActive) {
      return 'Selected trip is not active'
    }

    // Handle both ISO string dates and date objects
    let selectedDate: Date
    if (typeof value === 'string') {
      // Handle ISO string - convert Persian dates if needed
      const normalizedDateString = convertPersianDateToGregorian(value)
      selectedDate = new Date(normalizedDateString)
    } else if (value instanceof Date) {
      selectedDate = value
    } else {
      return 'Invalid date format'
    }

    // Check if the date is valid
    if (isNaN(selectedDate.getTime())) {
      return 'Invalid date format'
    }

    // Check if trip runs on this day
    if ((trip as any).frequency === 'specific-days' && (trip as any).days) {
      const dayOfWeek = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][selectedDate.getDay()]

      if (!(trip as any).days.includes(dayOfWeek)) {
        const dayNames = {
          sun: 'Sunday',
          mon: 'Monday',
          tue: 'Tuesday',
          wed: 'Wednesday',
          thu: 'Thursday',
          fri: 'Friday',
          sat: 'Saturday',
        }

        const runningDays = (trip as any).days
          .map((d: string) => dayNames[d as keyof typeof dayNames])
          .join(', ')
        return `This trip only runs on: ${runningDays}`
      }
    }

    // Check departure time validation (2-hour cutoff)
    const now = new Date()
    let departureTimeToCheck = (trip as any).departureTime

    // If user has specific boarding terminals, find the actual boarding time
    if (data.from && (trip as any).stops) {
      const boardingStop = (trip as any).stops.find((stop: any) => {
        const terminalId = typeof stop.terminal === 'string' ? stop.terminal : stop.terminal?.id
        const fromTerminalId =
          typeof data.from === 'string' ? data.from : data.from?.id || data.from
        return terminalId === fromTerminalId
      })

      if (boardingStop && boardingStop.time) {
        departureTimeToCheck = boardingStop.time
      }
    }

    if (departureTimeToCheck) {
      // Extract time string from ISO date or time string using dateUtils
      const timeString = formatTime(departureTimeToCheck)

      if (timeString && timeString.includes(':')) {
        const [hours, minutes] = timeString.split(':').map(Number)

        // Create departure datetime using the selected date
        const departureDateTime = new Date(selectedDate)
        departureDateTime.setHours(hours, minutes, 0, 0)

        const timeDiffInHours = (departureDateTime.getTime() - now.getTime()) / (1000 * 60 * 60)

        // Prevent booking if trip has already departed
        if (timeDiffInHours <= 0) {
          return 'Cannot book tickets for trips that have already departed'
        }

        // Prevent booking if within 2 hours of departure (unless user is agent or above)
        if (timeDiffInHours < 2 && !hasRole(appUser, 'agent')) {
          return 'Booking is not allowed within 2 hours of departure time. Please book your ticket at least 2 hours before departure'
        }
      } else {
        return 'Invalid departure time format'
      }
    }

    return true
  } catch (error) {
    console.error('Error validating ticket date:', error)
    return 'Error validating trip date'
  }
}
