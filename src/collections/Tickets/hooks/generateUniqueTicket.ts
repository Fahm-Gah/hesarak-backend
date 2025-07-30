import type { CollectionBeforeChangeHook } from 'payload'

export const generateUniqueTicket: CollectionBeforeChangeHook = async ({ data, operation }) => {
  if (operation === 'create' && !data.ticketNumber) {
    const timestamp = Date.now()
    const randomStr = Math.random().toString(36).substring(2, 9).toUpperCase()
    data.ticketNumber = `TK${timestamp}-${randomStr}`
  }

  return data
}
