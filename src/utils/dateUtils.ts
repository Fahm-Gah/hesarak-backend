export const getDayOfWeek = (date: string): string => {
  const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']
  const dayIndex = new Date(date).getDay()
  return days[dayIndex]
}

export const formatTime = (timeString: string): string => {
  try {
    const date = new Date(timeString)
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })
  } catch {
    return timeString
  }
}

export const calculateDuration = (startTime: string, endTime: string): string => {
  try {
    const start = new Date(`1970-01-01T${startTime}`)
    const end = new Date(`1970-01-01T${endTime}`)
    let durationMs = end.getTime() - start.getTime()

    // Handle overnight trips
    if (durationMs < 0) {
      durationMs += 24 * 60 * 60 * 1000 // Add 24 hours
    }

    const hours = Math.floor(durationMs / (1000 * 60 * 60))
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60))
    return `${hours}h ${minutes}m`
  } catch {
    return 'Unknown'
  }
}

export const validateDate = (
  dateString: string,
): { isValid: boolean; date?: Date; error?: string } => {
  const searchDate = new Date(dateString)

  if (isNaN(searchDate.getTime())) {
    return {
      isValid: false,
      error: 'Invalid date format. Please use YYYY-MM-DD format',
    }
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  if (searchDate < today) {
    return {
      isValid: false,
      error: 'Cannot search for trips in the past',
    }
  }

  return { isValid: true, date: searchDate }
}
