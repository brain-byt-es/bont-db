import { MembershipRole, Plan } from "@/generated/client/enums"

export const PERMISSIONS = {
  // ... (keep existing)
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

/**
 * Feature Gates based on the Organization's Plan.
 */
export const PLAN_GATES = {
  REOPEN_TREATMENT: Plan.PRO,
  AUDIT_LOGS: Plan.PRO,
  ADVANCED_COMPLIANCE: Plan.PRO,
}

export function checkPermission(role: MembershipRole, allowedRoles: MembershipRole[]): boolean {
  return allowedRoles.includes(role)
}

export function checkPlan(currentPlan: Plan, requiredPlan: Plan): boolean {
  // Simple hierarchy: PRO includes everything BASIC has.
  if (requiredPlan === Plan.BASIC) return true
  return currentPlan === Plan.PRO
}

export function requirePermission(role: MembershipRole, allowedRoles: MembershipRole[], message = "Permission denied") {
  if (!checkPermission(role, allowedRoles)) {
    throw new Error(message)
  }
}

export function requirePlan(currentPlan: Plan, requiredPlan: Plan, message = "Plan upgrade required") {
  if (!checkPlan(currentPlan, requiredPlan)) {
    throw new Error(message)
  }
}
