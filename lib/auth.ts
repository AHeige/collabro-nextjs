// lib/auth.ts (klient-säker – inga server imports här)
import type { UserLite } from '@/types/auth'

export function hasPermission(
  user: Pick<UserLite, 'teamMember' | 'projectMember'> | null | undefined,
  entity: string,
  action: 'canRead' | 'canCreate' | 'canUpdate' | 'canDelete'
): boolean {
  if (!user) return false
  const teamPerms = (user.teamMember ?? []).flatMap((tm) => tm.role?.permissions ?? [])
  const projPerms = (user.projectMember ?? []).flatMap((pm) => pm.role?.permissions ?? [])
  return [...teamPerms, ...projPerms].some((p) => p.entity === entity && (p as any)[action] === true)
}
