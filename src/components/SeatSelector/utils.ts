import { getSeatSelectorTranslations } from '@/utils/seatSelectorTranslations'

export const translationsCache = new Map<string, ReturnType<typeof getSeatSelectorTranslations>>()

export const getOptimizedTranslations = (lang: string) => {
  if (!translationsCache.has(lang)) {
    translationsCache.set(lang, getSeatSelectorTranslations(lang as 'en' | 'fa'))
  }
  return translationsCache.get(lang)!
}

export const calculateGridDimensions = (seats: any[]) => {
  if (!Array.isArray(seats) || seats.length === 0) {
    return { rows: 10, cols: 4 }
  }

  let maxRow = 0
  let maxCol = 0

  for (const seat of seats) {
    if (seat?.position?.row > maxRow) {
      maxRow = seat.position.row
    }
    if (seat?.position?.col > maxCol) {
      maxCol = seat.position.col
    }
  }

  return {
    rows: Math.max(maxRow, 1),
    cols: Math.max(maxCol, 1),
  }
}

export const isTicketExpired = (booking: any): boolean => {
  if (!booking?.paymentDeadline || booking.isPaid || booking.isCancelled) {
    return false
  }

  try {
    const deadline = new Date(booking.paymentDeadline)
    return !isNaN(deadline.getTime()) && deadline.getTime() < Date.now()
  } catch {
    return false
  }
}
