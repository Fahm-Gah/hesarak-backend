import type { CollectionAfterLoginHook } from 'payload'

export const updateLastLogin: CollectionAfterLoginHook = async ({ req, user }) => {
  // Update last login timestamp
  try {
    await req.payload.update({
      collection: 'users',
      id: user.id,
      data: {
        lastLoginAt: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.warn('Failed to update last login timestamp:', error)
  }
}
