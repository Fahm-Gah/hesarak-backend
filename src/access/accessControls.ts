import type { Access, FieldAccess } from 'payload'

/**
 * Minimal app-facing user shape we rely on in access rules.
 */
type AppUser = {
  id: string
  roles?: string[]
  terminal?: string | string[]
  isActive?: boolean
}

/** Simple Where type for Payload queries returned by Access functions */
type Where = Record<string, unknown>

/** Role hierarchy (higher index = more permissions) */
const ROLE_HIERARCHY = {
  customer: 0,
  editor: 1,
  agent: 2,
  admin: 3,
  superadmin: 4,
  dev: 5,
} as const

type RoleKey = keyof typeof ROLE_HIERARCHY

/** Runtime validator for `req.user` -> AppUser | null */
const validateAppUser = (raw: unknown): AppUser | null => {
  if (!raw || typeof raw !== 'object') return null
  const r = raw as any

  if (typeof r.id !== 'string') return null

  let roles: string[] | undefined
  if (Array.isArray(r.roles)) {
    roles = r.roles.filter((x: any) => typeof x === 'string')
  }

  let terminal: string | string[] | undefined
  if (typeof r.terminal === 'string') terminal = r.terminal
  else if (Array.isArray(r.terminal)) {
    terminal = r.terminal.filter((x: any) => typeof x === 'string')
  }

  const isActive = typeof r.isActive === 'boolean' ? r.isActive : undefined

  return {
    id: r.id,
    roles,
    terminal,
    isActive,
  }
}

/** Helpers using the small AppUser shape */
export const anyone: Access = () => true

export const hasRole = (user: AppUser | null | undefined, minRole: RoleKey): boolean => {
  if (!user?.roles) return false
  if (user.isActive === false) return false

  const minLevel = ROLE_HIERARCHY[minRole]
  return user.roles.some((role) => {
    const roleLevel = ROLE_HIERARCHY[role as RoleKey]
    return typeof roleLevel === 'number' && roleLevel >= minLevel
  })
}

export const hasExactRole = (user: AppUser | null | undefined, role: string): boolean => {
  if (!user?.roles) return false
  if (user.isActive === false) return false
  return user.roles.includes(role)
}

export const hasAnyRole = (user: AppUser | null | undefined, roles: string[]): boolean => {
  if (!user?.roles) return false
  if (user.isActive === false) return false
  return roles.some((r) => user.roles!.includes(r))
}

// ---------------------------
// Reusable access functions
// ---------------------------

export const publicRead: Access = () => true

export const authenticated: Access = ({ req }: any) => {
  const user = validateAppUser(req?.user)
  return !!user && user.isActive !== false
}

export const ownRecords: Access = ({ req }: any) => {
  const user = validateAppUser(req?.user)
  if (!user || user.isActive === false) return false
  if (hasRole(user, 'admin')) return true

  return {
    'user.id': {
      equals: user.id,
    },
  } as any
}

export const ownOrCreatedRecords: Access = ({ req }: any) => {
  const user = validateAppUser(req?.user)
  if (!user || user.isActive === false) return false
  if (hasRole(user, 'admin')) return true

  return {
    or: [
      { 'user.id': { equals: user.id } },
      { 'createdBy.id': { equals: user.id } },
      { 'bookedBy.id': { equals: user.id } },
    ],
  } as any
}

export const adminOrHigher: Access = ({ req }: any) => {
  const user = validateAppUser(req?.user)
  return hasRole(user, 'admin')
}

export const superAdminOnly: Access = ({ req }: any) => {
  const user = validateAppUser(req?.user)
  return hasRole(user, 'superadmin')
}

export const devOnly: Access = ({ req }: any) => {
  const user = validateAppUser(req?.user)
  return hasRole(user, 'dev')
}

export const agentOrHigher: Access = ({ req }: any) => {
  const user = validateAppUser(req?.user)
  return hasRole(user, 'agent')
}

export const superadminOrEditor: Access = ({ req }: any) => {
  const user = validateAppUser(req?.user)
  return hasAnyRole(user, ['superadmin', 'editor'])
}

// Field-level access
export const fieldAccessAdminOnly: FieldAccess = ({ req }: any) => {
  const user = validateAppUser(req?.user)
  return hasRole(user, 'admin')
}

export const fieldAccessSuperAdminOnly: FieldAccess = ({ req }: any) => {
  const user = validateAppUser(req?.user)
  return hasRole(user, 'superadmin')
}

// ---------------------------
// Collection access objects
// ---------------------------

export const busTypesAccess = {
  read: agentOrHigher,
  create: adminOrHigher,
  update: adminOrHigher,
  delete: superAdminOnly,
}

export const busesAccess = {
  read: agentOrHigher,
  create: adminOrHigher,
  update: adminOrHigher,
  delete: superAdminOnly,
}

export const driversAccess = {
  read: adminOrHigher,
  create: adminOrHigher,
  update: adminOrHigher,
  delete: superAdminOnly,
}

export const mediaAccess = {
  read: anyone,
  create: superadminOrEditor,
  update: superadminOrEditor,
  delete: superAdminOnly,
}

export const postsAccess = {
  read: anyone,
  create: superadminOrEditor,
  update: superadminOrEditor,
  delete: superAdminOnly,
}

export const profilesAccess = {
  read: async ({ req }: any) => {
    const user = validateAppUser(req?.user)
    if (!user || user.isActive === false) return false

    // Superadmins and admins can read all profiles
    if (hasRole(user, 'admin')) return true

    // Agents and customers can read all profiles
    if (hasRole(user, 'agent') || hasExactRole(user, 'customer')) return true

    // Editors can only read their own profile
    if (hasExactRole(user, 'editor')) {
      try {
        const userDoc = await req.payload.findByID({
          collection: 'users',
          id: user.id,
        })

        if (userDoc?.profile) {
          // Handle both string ID and populated relationship object
          const profileId =
            typeof userDoc.profile === 'string' ? userDoc.profile : userDoc.profile.id
          return {
            id: { equals: profileId },
          } as any
        }
      } catch (error) {
        console.error('Error checking editor profile access:', error)
      }
    }

    return false
  },
  create: agentOrHigher,
  update: async ({ req, id }: any) => {
    const user = validateAppUser(req?.user)
    if (!user || user.isActive === false) return false

    // Superadmins can update all profiles
    if (hasRole(user, 'superadmin')) return true

    try {
      // Check if user is trying to update their own profile
      const userDoc = await req.payload.findByID({
        collection: 'users',
        id: user.id,
      })

      const userProfileId =
        typeof userDoc?.profile === 'string' ? userDoc.profile : userDoc?.profile?.id

      // If this is the user's own profile, allow it
      if (userProfileId === id) {
        return true
      }

      // For editing other profiles, check the target profile's user roles
      if (hasRole(user, 'agent')) {
        // Find the user who owns the target profile
        const targetProfileUsers = await req.payload.find({
          collection: 'users',
          where: {
            profile: { equals: id },
          },
          limit: 1,
        })

        if (targetProfileUsers.docs.length > 0) {
          const targetUser = targetProfileUsers.docs[0]

          // Only superadmins can edit profiles of users with elevated roles (non-customer)
          if (targetUser.roles && targetUser.roles.some((role: string) => role !== 'customer')) {
            return false // Agents cannot edit profiles of other agents/admins/etc.
          }

          // Agents can edit customer profiles
          return true
        }
      }

      return false
    } catch (error) {
      console.error('Error checking profile update access:', error)
      return false
    }
  },
  delete: superAdminOnly,
}

export const terminalsAccess = {
  read: agentOrHigher,
  create: adminOrHigher,
  update: adminOrHigher,
  delete: superAdminOnly,
}

export const tripRecordsAccess = {
  read: adminOrHigher,
  create: adminOrHigher,
  update: superAdminOnly,
  delete: superAdminOnly,
}

export const tripSchedulesAccess = {
  read: agentOrHigher,
  create: adminOrHigher,
  update: adminOrHigher,
  delete: superAdminOnly,
}

export const ticketsAccess = {
  read: agentOrHigher,
  create: agentOrHigher,
  update: agentOrHigher,
  delete: agentOrHigher,
}

export const usersAccess = {
  read: ({ req }: any) => {
    const user = validateAppUser(req?.user)
    if (!user || user.isActive === false) return false
    if (hasRole(user, 'agent')) return true
    return {
      id: { equals: user.id },
    } as any
  },
  create: ({ req }: any) => {
    const user = validateAppUser(req?.user)
    if (!user) return true
    return hasRole(user, 'admin')
  },
  update: ({ req }: any) => {
    const user = validateAppUser(req?.user)
    if (!user || user.isActive === false) return false
    if (hasRole(user, 'superadmin')) return true
    if (hasRole(user, 'admin')) {
      return {
        roles: { not_contains: 'admin' },
      } as any
    }
  },
  delete: superAdminOnly,
  admin: ({ req }: any) => {
    const user = validateAppUser(req?.user)
    return hasRole(user, 'editor')
  },
}
