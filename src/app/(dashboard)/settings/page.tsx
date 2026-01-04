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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { checkPermission, PERMISSIONS } from "@/lib/permissions"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight, ShieldCheck } from "lucide-react"

export default async function SettingsPage() {
  const ctx = await getOrganizationContext()

  if (!ctx) {
    redirect("/onboarding")
  }

  const canManageTeam = checkPermission(ctx.membership.role, PERMISSIONS.MANAGE_TEAM)

  // Fetch data in parallel
  const [settings, teamData, profileData] = await Promise.all([
      getComplianceSettings(),
      getTeamData(),
      getProfileData()
  ])

  return (
    <div className="flex flex-col gap-6 pt-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="organization">Organization</TabsTrigger>
          {canManageTeam && <TabsTrigger value="team">Team Members</TabsTrigger>}
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          {canManageTeam && <TabsTrigger value="audit">Security & Logs</TabsTrigger>}
        </TabsList>

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
            <Card>
                <CardHeader>
                <CardTitle>Compliance & Exports</CardTitle>
                <CardDescription>
                    Manage documentation standards and export formats.
                </CardDescription>
                </CardHeader>
                <CardContent>
                <ComplianceToggle initialValue={settings.enable_compliance_views} />
                </CardContent>
            </Card>
        </TabsContent>

        {canManageTeam && (
          <TabsContent value="audit" className="space-y-4">
              <Card>
                  <CardHeader>
                  <CardTitle>Audit Logs</CardTitle>
                  <CardDescription>
                      Review system-wide activity and security events for compliance audits.
                  </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                      <div className="flex items-center gap-4 p-4 border rounded-lg bg-slate-50">
                          <ShieldCheck className="h-8 w-8 text-primary" />
                          <div className="flex-1">
                              <p className="text-sm font-medium">Activity Monitoring</p>
                              <p className="text-xs text-muted-foreground">All critical actions are logged and immutable.</p>
                          </div>
                          <Button asChild variant="outline" size="sm">
                              <Link href="/settings/audit-logs">
                                  View Detailed Logs <ArrowRight className="ml-2 h-4 w-4" />
                              </Link>
                          </Button>
                      </div>
                  </CardContent>
              </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
