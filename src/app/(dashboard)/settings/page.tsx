import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getComplianceSettings } from "./actions"
import { getTeamData } from "./invite-actions"
import { getProfileData } from "./profile-actions"
import { ComplianceToggle } from "./compliance-toggle"
import { getOrganizationContext } from "@/lib/auth-context"
import { OrgSettingsForm } from "./org-settings-form"
import { TeamManager } from "@/components/settings/team-manager"
import { ProfileManager } from "@/components/settings/profile-manager"
import { redirect } from "next/navigation"
import { TabsContent } from "@/components/ui/tabs"
import { checkPermission, PERMISSIONS, checkPlan } from "@/lib/permissions"
import { Plan } from "@/generated/client/enums"
import { SettingsTabs } from "./settings-tabs"
import { cn } from "@/lib/utils"
import { ComplianceUpgradeTeaser } from "@/components/settings/compliance-upgrade-teaser"
import { ClinicalSettingsForm } from "@/components/settings/clinical-settings-form"
import { getAuditLogs, getAuditFilterOptions } from "./audit-logs/actions"
import { AuditLogManager } from "@/components/settings/audit-log-manager"
import { Badge } from "@/components/ui/badge"
import { ShieldCheck, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function SettingsPage() {
  const ctx = await getOrganizationContext()

  if (!ctx) {
    redirect("/onboarding")
  }

  const userPlan = ctx.organization.plan as Plan
  const canManageTeam = checkPermission(ctx.membership.role, PERMISSIONS.MANAGE_TEAM)
  const isPro = checkPlan(userPlan, Plan.PRO)

  // Fetch data in parallel
  const [settings, teamData, profileData, auditLogs, auditFilterOptions] = await Promise.all([
      getComplianceSettings(),
      getTeamData(),
      getProfileData(),
      (canManageTeam && isPro) ? getAuditLogs() : Promise.resolve([]),
      (canManageTeam && isPro) ? getAuditFilterOptions() : Promise.resolve({ actions: [], users: [] })
  ])

  return (
    <div className="flex flex-col gap-6 pt-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
      </div>

      <SettingsTabs 
        canManageTeam={canManageTeam} 
        enableCompliance={settings.enable_compliance_views && isPro}
      >
        <TabsContent value="profile" className="space-y-4">
            <ProfileManager initialData={profileData} />
        </TabsContent>
        
        <TabsContent value="organization" className="space-y-4">
            <Card>
                <CardHeader>
                <CardTitle>Organization Settings</CardTitle>
                <CardDescription>
                    Manage your clinic&apos;s public profile and details.
                </CardDescription>
                </CardHeader>
                <CardContent>
                <OrgSettingsForm initialName={ctx.organization.name} />
                </CardContent>
            </Card>
        </TabsContent>

        {canManageTeam && (
          <TabsContent value="team" className="space-y-4">
              <TeamManager initialData={teamData} />
          </TabsContent>
        )}

        <TabsContent value="compliance" className="space-y-4">
            <div className="grid gap-4">
                {isPro && (
                    <ClinicalSettingsForm 
                        initialVialSize={settings.standard_vial_size || 100}
                        initialDilution={settings.standard_dilution_ml || 2.5}
                    />
                )}

                <Card className={cn(!isPro && "opacity-60 grayscale-[0.5]")}>
                    <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        Compliance & Exports
                        {!isPro && <Badge variant="secondary" className="font-normal text-[10px] h-4">Pro</Badge>}
                    </CardTitle>
                    <CardDescription>
                        Manage documentation standards and export formats.
                    </CardDescription>
                    </CardHeader>
                    <CardContent>
                    <ComplianceToggle initialValue={settings.enable_compliance_views && isPro} disabled={!isPro} />
                    </CardContent>
                </Card>

                {!isPro && <ComplianceUpgradeTeaser />}

                {isPro && canManageTeam && settings.enable_compliance_views && (
                    <AuditLogTeaser />
                )}
            </div>
        </TabsContent>

        {canManageTeam && isPro && (
          <TabsContent value="audit" className="space-y-4">
              <AuditLogManager 
                initialLogs={auditLogs} 
                filterOptions={auditFilterOptions} 
              />
          </TabsContent>
        )}
      </SettingsTabs>
    </div>
  )
}

function AuditLogTeaser() {
    return (
        <Card>
            <CardHeader>
            <CardTitle>Security Logs</CardTitle>
            <CardDescription>
                Review system-wide activity and security events for compliance audits.
            </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex items-center gap-4 p-4 border rounded-lg bg-muted/50">
                    <ShieldCheck className="h-8 w-8 text-primary" />
                    <div className="flex-1">
                        <p className="text-sm font-medium">Activity Monitoring</p>
                        <p className="text-xs text-muted-foreground">All critical actions are logged and immutable.</p>
                    </div>
                    <Button asChild variant="outline" size="sm">
                        <Link href="/settings?tab=audit">
                            View Detailed Logs <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
