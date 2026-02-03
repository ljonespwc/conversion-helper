export type UserRole = 'owner' | 'admin' | 'editor' | 'analyst'

const ROLE_HIERARCHY: Record<UserRole, number> = {
  owner: 4,
  admin: 3,
  editor: 2,
  analyst: 1,
}

export function hasPermission(userRole: UserRole, requiredRole: UserRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole]
}

// Shorthand checks
export const canDelete = (role: UserRole) => hasPermission(role, 'admin')
export const canEdit = (role: UserRole) => hasPermission(role, 'editor')
export const canView = (role: UserRole) => hasPermission(role, 'analyst')
