// lib/auth.ts (klient-säker – inga server imports här)
import type { UserLite } from '@/types/auth'
import type { Entity } from '@prisma/client'

export function hasPermission(
  user: Pick<UserLite, 'teamMember' | 'projectMember'> | null | undefined,
  entity: Entity,
  action: 'canRead' | 'canCreate' | 'canUpdate' | 'canDelete'
): boolean {
  if (!user) return false
  const teamPerms = (user.teamMember ?? []).flatMap((tm) => tm.role?.permissions ?? [])
  const projPerms = (user.projectMember ?? []).flatMap((pm) => pm.role?.permissions ?? [])
  return [...teamPerms, ...projPerms].some((p) => p.entity === entity && p[action] === true)
}
