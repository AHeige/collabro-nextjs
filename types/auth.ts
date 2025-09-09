// types/auth.ts

export type Permission = {
  entity: string
  canRead: boolean
  canCreate: boolean
  canUpdate: boolean
  canDelete: boolean
}

export type RoleLite = {
  id?: string
  name?: string
  permissions: Permission[]
}

export type TeamRef = { id: string; name: string }
export type ProjectRef = { id: string; name: string }

export type TeamMemberLite = {
  team: TeamRef
  role?: { permissions: Permission[] } | null
}

export type ProjectMemberLite = {
  project: ProjectRef
  role?: { permissions: Permission[] } | null
}

/**
 * Minimal, klient-säker user för UI/permissions.
 * (Inga Date-objekt – allt är serialiserbart.)
 */
export type UserLite = {
  id: string
  email: string | null
  name: string | null
  teamMember: TeamMemberLite[]
  projectMember: ProjectMemberLite[]
}

/** Praktisk typ för headern om du vill hålla den ännu smalare */
export type HeaderUser = Pick<UserLite, 'id' | 'name' | 'email'>
