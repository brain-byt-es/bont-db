import { getOrganizationContext } from "@/lib/auth-context"
import { getTeamData } from "../invite-actions"
import { TeamManager } from "@/components/settings/team-manager"
import { checkPermission, PERMISSIONS } from "@/lib/permissions"
import { redirect } from "next/navigation"

export default async function TeamSettingsPage() {
    const ctx = await getOrganizationContext()
    if (!ctx) redirect("/onboarding")

    const canManageTeam = checkPermission(ctx.membership.role, PERMISSIONS.MANAGE_TEAM)
    if (!canManageTeam) {
        // Simple access denied or redirect to general
        redirect("/settings/general")
    }

    const teamData = await getTeamData()

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">Team & Roles</h3>
                <p className="text-sm text-muted-foreground">Manage members and their access levels.</p>
            </div>
            
            <TeamManager initialData={teamData} />
        </div>
    )
}
