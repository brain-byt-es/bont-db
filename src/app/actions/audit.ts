"use server"

import { getOrganizationContext } from "@/lib/auth-context"
import { logAuditAction } from "@/lib/audit-logger"

export async function logPhiRevealAction(resourceType: string, resourceId: string, fieldName: string) {
    const ctx = await getOrganizationContext()
    if (!ctx) return { error: "Unauthorized" }

    await logAuditAction(ctx, "PHI_REVEAL", resourceType, resourceId, { field: fieldName })
    return { success: true }
}
