import { DecisionSupportMode } from "@/generated/client/enums"
import prisma from "./prisma"

export interface OrgPolicy {
  mode: DecisionSupportMode
  flags: Record<string, boolean>
}

export async function getOrgPolicy(orgId: string): Promise<OrgPolicy> {
  const org = await prisma.organization.findUnique({
    where: { id: orgId },
    select: { decisionSupportMode: true, featureFlags: true }
  })

  if (!org) {
    return { mode: DecisionSupportMode.STRICT, flags: {} }
  }

  return {
    mode: org.decisionSupportMode,
    flags: (org.featureFlags as Record<string, boolean>) || {}
  }
}

const FORBIDDEN_TERMS = [
  "recommended",
  "recommend",
  "you should",
  "optimal",
  "best dose",
  "suggested dose",
  "inject X units"
]

export function assertNoPrescriptiveAdvice(text: string, context?: string) {
  const lowerText = text.toLowerCase()
  for (const term of FORBIDDEN_TERMS) {
    if (lowerText.includes(term.toLowerCase())) {
      console.error(`Compliance Violation: Prescriptive term "${term}" found in ${context || 'server response'}`)
      throw new Error("Internal Compliance Error: Prescriptive clinical advice detected.")
    }
  }
}

export function validateSafeResponse<T>(data: T, context?: string): T {
  const serialized = JSON.stringify(data)
  assertNoPrescriptiveAdvice(serialized, context)
  return data
}
