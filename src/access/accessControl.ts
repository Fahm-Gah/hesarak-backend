// src/access.ts
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
  agent: 1,
  driver: 2,
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

/**
 * Terminal-based where builder for an AppUser.
 * Returns either `true`, `false`, or a Payload-style where object.
 */
const terminalWhereForUser = (user: AppUser): boolean | Where => {
  if (!user || user.isActive === false) return false

  if (hasRole(user, 'admin')) return true

  if (hasExactRole(user, 'agent') && user.terminal) {
    const terminals = Array.isArray(user.terminal) ? user.terminal : [user.terminal]
    return {
      or: [
        { 'from.id': { in: terminals } },
        { 'to.id': { in: terminals } },
        { 'terminal.id': { in: terminals } },
      ],
    }
  }

  return false
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

export const adminOnly: Access = ({ req }: any) => {
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

export const driverOrHigher: Access = ({ req }: any) => {
  const user = validateAppUser(req?.user)
  return hasRole(user, 'driver')
}

/**
 * Terminal-based Access: validate user, then delegate to `terminalWhereForUser`.
 * Cast to any to satisfy Payload's Access typing.
 */
export const terminalBasedAccess: Access = ({ req }: any) => {
  const user = validateAppUser(req?.user)
  if (!user) return false
  return terminalWhereForUser(user) as any
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
  create: adminOnly,
  update: adminOnly,
  delete: superAdminOnly,
}

export const busesAccess = {
  read: agentOrHigher,
  create: adminOnly,
  update: adminOnly,
  delete: superAdminOnly,
}

export const driversAccess = {
  read: agentOrHigher,
  create: adminOnly,
  update: adminOnly,
  delete: superAdminOnly,
}

export const mediaAccess = {
  read: publicRead,
  create: authenticated,
  update: ownOrCreatedRecords,
  delete: adminOnly,
}

export const postsAccess = {
  read: publicRead,
  create: agentOrHigher,
  update: ({ req }: any) => {
    const user = validateAppUser(req?.user)
    if (!user || user.isActive === false) return false
    if (hasRole(user, 'admin')) return true
    return {
      'author.id': { equals: user.id },
    } as any
  },
  delete: adminOnly,
}

export const profilesAccess = {
  read: authenticated,
  create: agentOrHigher,
  update: ({ req }: any) => {
    const user = validateAppUser(req?.user)
    if (!user || user.isActive === false) return false
    if (hasRole(user, 'admin')) return true
    return {
      'user.id': { equals: user.id },
    } as any
  },
  delete: superAdminOnly,
}

export const terminalsAccess = {
  read: publicRead,
  create: adminOnly,
  update: adminOnly,
  delete: superAdminOnly,
}

export const tripRecordsAccess = {
  read: agentOrHigher,
  create: agentOrHigher,
  update: adminOnly,
  delete: superAdminOnly,
}

export const tripSchedulesAccess = {
  read: publicRead,
  create: adminOnly,
  update: adminOnly,
  delete: superAdminOnly,
}

export const ticketsAccess = {
  read: ({ req }: any) => {
    const user = validateAppUser(req?.user)
    if (!user || user.isActive === false) return false
    if (hasRole(user, 'admin')) return true

    if (hasExactRole(user, 'agent')) {
      return terminalWhereForUser(user) as any
    }

    return {
      or: [{ 'bookedBy.id': { equals: user.id } }, { 'passenger.user.id': { equals: user.id } }],
    } as any
  },
  create: agentOrHigher,
  update: ({ req }: any) => {
    const user = validateAppUser(req?.user)
    if (!user || user.isActive === false) return false
    if (hasRole(user, 'admin')) return true
    if (hasExactRole(user, 'agent')) {
      return terminalWhereForUser(user) as any
    }
    return false
  },
  delete: adminOnly,
}

export const usersAccess = {
  read: ({ req }: any) => {
    const user = validateAppUser(req?.user)
    if (!user || user.isActive === false) return false
    if (hasRole(user, 'admin')) return true
    if (hasExactRole(user, 'agent')) {
      return {
        roles: { contains: 'customer' },
      } as any
    }
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
    return {
      id: { equals: user.id },
    } as any
  },
  delete: superAdminOnly,
  admin: ({ req }: any) => {
    const user = validateAppUser(req?.user)
    return hasRole(user, 'agent')
  },
}
