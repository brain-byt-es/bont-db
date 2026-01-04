import { MembershipRole } from "@/generated/client/enums"

export const PERMISSIONS = {
  // Organization Management
  MANAGE_ORGANIZATION: [MembershipRole.OWNER],
  MANAGE_TEAM: [MembershipRole.OWNER, MembershipRole.CLINIC_ADMIN],
  
  // Patient Management
  WRITE_PATIENTS: [MembershipRole.OWNER, MembershipRole.CLINIC_ADMIN, MembershipRole.PROVIDER, MembershipRole.ASSISTANT],
  DELETE_PATIENTS: [MembershipRole.OWNER, MembershipRole.CLINIC_ADMIN],
  
  // Treatment Management
  WRITE_TREATMENTS: [MembershipRole.OWNER, MembershipRole.CLINIC_ADMIN, MembershipRole.PROVIDER, MembershipRole.ASSISTANT],
  DELETE_TREATMENTS: [MembershipRole.OWNER, MembershipRole.CLINIC_ADMIN, MembershipRole.PROVIDER],
  
  // Data Access
  VIEW_EXPORTS: [MembershipRole.OWNER, MembershipRole.CLINIC_ADMIN, MembershipRole.PROVIDER],
}

export function checkPermission(role: MembershipRole, allowedRoles: MembershipRole[]): boolean {
  return allowedRoles.includes(role)
}

export function requirePermission(role: MembershipRole, allowedRoles: MembershipRole[], message = "Permission denied") {
  if (!checkPermission(role, allowedRoles)) {
    throw new Error(message)
  }
}
