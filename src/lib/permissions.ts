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
 * Seat Limits per Plan
 */
export const PRO_SEAT_LIMIT = 5

export const PLAN_SEAT_LIMITS = {
    [Plan.BASIC]: 1, // Usually just the owner
    [Plan.PRO]: PRO_SEAT_LIMIT,
    [Plan.ENTERPRISE]: Infinity,
}

/**
 * Feature Gates based on the Organization's Plan.
 */
export const PLAN_GATES = {
  REOPEN_TREATMENT: Plan.PRO,
  AUDIT_LOGS: Plan.PRO,
  ADVANCED_COMPLIANCE: Plan.PRO,
  CLINICAL_INSIGHTS: Plan.PRO,
  ENTERPRISE_SECURITY: Plan.ENTERPRISE,
  API_ACCESS: Plan.ENTERPRISE,
}

/**
 * Plan Hierarchy Ranking
 */
const PLAN_RANK: Record<Plan, number> = {
    [Plan.BASIC]: 0,
    [Plan.PRO]: 1,
    [Plan.ENTERPRISE]: 2,
}

/**
 * Resolves the effective plan considering manual overrides.
 */
export function getEffectivePlan(org: { 
    plan: Plan, 
    planOverride?: Plan | null, 
    proUntil?: Date | null 
}): Plan {
    // 1. Hard Override (Sales/Support)
    if (org.planOverride) return org.planOverride

    // 2. Temporary PRO (Trial/Support)
    if (org.proUntil && new Date(org.proUntil) > new Date()) {
        return Plan.PRO
    }

    // 3. Standard Plan (Stripe-synced)
    return org.plan
}

export function checkPermission(role: MembershipRole, allowedRoles: MembershipRole[]): boolean {
  return allowedRoles.includes(role)
}

export function checkPlan(currentPlan: Plan, requiredPlan: Plan): boolean {
  return PLAN_RANK[currentPlan] >= PLAN_RANK[requiredPlan]
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
