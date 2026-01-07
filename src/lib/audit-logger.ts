import prisma from "@/lib/prisma"
import { headers } from "next/headers"

interface AuditContext {
    organizationId: string
    membership?: { id: string } | null
}

export async function logAuditAction(
    ctx: AuditContext,
    action: string,
    resourceType: string,
    resourceId?: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    details?: Record<string, any>
) {
    try {
        const headersList = await headers()
        const userAgent = headersList.get("user-agent") || undefined
        // x-forwarded-for can be a list "client, proxy1, proxy2"
        const forwardedFor = headersList.get("x-forwarded-for")
        const ip = forwardedFor ? forwardedFor.split(',')[0].trim() : "unknown"

        // In a real production app, we might want to salt and hash this IP for GDPR compliance
        // if we call the field 'ipHash'. For now, we store the raw IP or a simple masked version.
        // Let's store raw for internal audit trails if legally permitted, or just the string.
        
        await prisma.auditLog.create({
            data: {
                organizationId: ctx.organizationId,
                actorMembershipId: ctx.membership?.id,
                action,
                resourceType,
                resourceId,
                details: details || undefined,
                ipHash: ip, 
                userAgent
            }
        })
    } catch (e) {
        console.error("Failed to write audit log:", e)
        // Fail silently to not disrupt the user flow
    }
}
