import { getOrganizationContext } from "@/lib/auth-context"
import { getTeamData } from "../invite-actions"
import { TeamManager } from "@/components/settings/team-manager"
import { checkPermission, PERMISSIONS } from "@/lib/permissions"
import { redirect } from "next/navigation"
import { getDictionary } from "@/lib/i18n/server"

export default async function TeamSettingsPage() {
    const [ctx, dict] = await Promise.all([
        getOrganizationContext(),
        getDictionary()
    ])
    if (!ctx) redirect("/onboarding")

    const canManageTeam = checkPermission(ctx.membership.role, PERMISSIONS.MANAGE_TEAM)
    if (!canManageTeam) {
        redirect("/settings/general")
    }

    const teamData = await getTeamData()

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">{dict.settings.team.title}</h3>
                <p className="text-sm text-muted-foreground">{dict.settings.team.desc}</p>
            </div>
            
            <TeamManager initialData={teamData} />
        </div>
    )
}