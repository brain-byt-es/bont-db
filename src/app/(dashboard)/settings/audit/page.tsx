import { getOrganizationContext } from "@/lib/auth-context"
import { checkPermission, PERMISSIONS, checkPlan, getEffectivePlan } from "@/lib/permissions"
import { Plan } from "@/generated/client/enums"
import { redirect } from "next/navigation"
import { AuditLogManager } from "@/components/settings/audit-log-manager"
import { getAuditLogs, getAuditFilterOptions } from "../audit-logs/actions"

export default async function AuditSettingsPage() {
    const ctx = await getOrganizationContext()
    if (!ctx) redirect("/onboarding")

    const userPlan = getEffectivePlan(ctx.organization)
    const isPro = checkPlan(userPlan, Plan.PRO)
    const canManageTeam = checkPermission(ctx.membership.role, PERMISSIONS.MANAGE_TEAM)

    if (!isPro) {
        // Redirect to billing if they try to access audit without Pro
        redirect("/settings/billing")
    }

    if (!canManageTeam) {
        redirect("/settings/general")
    }

    const [logs, filterOptions] = await Promise.all([
        getAuditLogs(),
        getAuditFilterOptions()
    ])

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">Audit Logs</h3>
                <p className="text-sm text-muted-foreground">Detailed activity history for compliance and security.</p>
            </div>
            
            <AuditLogManager 
                initialLogs={logs} 
                filterOptions={filterOptions} 
            />
        </div>
    )
}
