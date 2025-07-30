import type { CollectionBeforeChangeHook } from 'payload'

export const populateBookedBy: CollectionBeforeChangeHook = async ({
  data,
  operation,
  originalDoc,
  req,
}) => {
  if (operation === 'create' && req.user) {
    data.bookedBy = req.user.id
  } else if (operation === 'update' && originalDoc?.bookedBy) {
    data.bookedBy = originalDoc.bookedBy
  }

  return data
}
