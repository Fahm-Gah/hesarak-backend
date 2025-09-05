import type { CollectionAfterReadHook } from 'payload'

export const attachUser: CollectionAfterReadHook = async ({ doc, req }) => {
  // Find user associated with this profile if any
  try {
    const payload = req.payload
    const userResult = await payload.find({
      collection: 'users',
      where: {
        profile: { equals: doc.id },
      },
      depth: 0,
      limit: 1,
    })

    if (userResult.docs.length > 0) {
      // Add user information to the profile
      doc.user = userResult.docs[0]
    }
  } catch (error) {
    // Silently fail if we can't fetch the user
    console.error('Failed to fetch user for profile:', error)
  }

  return doc
}
