import type { CollectionBeforeChangeHook } from 'payload'

export const calculateCapacity: CollectionBeforeChangeHook = async ({ data }) => {
  let totalSeats = 0
  if (data.seats && Array.isArray(data.seats)) {
    data.seats.forEach((item: any) => {
      if (item.type === 'seat' && !item.disabled) {
        totalSeats += 1
      }
    })
  }
  data.capacity = totalSeats
  return data
}
