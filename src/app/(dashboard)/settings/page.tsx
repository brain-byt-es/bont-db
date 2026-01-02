import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getComplianceSettings } from "./actions"
import { getTeamData } from "./invite-actions"
import { ComplianceToggle } from "./compliance-toggle"
import { getOrganizationContext } from "@/lib/auth-context"
import { OrgSettingsForm } from "./org-settings-form"
import { TeamManager } from "@/components/settings/team-manager"
import { redirect } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default async function SettingsPage() {
  const ctx = await getOrganizationContext()

  if (!ctx) {
    redirect("/onboarding")
  }

  // Fetch data in parallel
  const [settings, teamData] = await Promise.all([
      getComplianceSettings(),
      getTeamData()
  ])

  return (
    <div className="flex flex-col gap-6 pt-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
      </div>

      <Tabs defaultValue="organization" className="space-y-4">
        <TabsList>
          <TabsTrigger value="organization">Organization</TabsTrigger>
          <TabsTrigger value="team">Team Members</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
        </TabsList>
        
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

        <TabsContent value="team" className="space-y-4">
            <TeamManager initialData={teamData} />
        </TabsContent>

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
      </Tabs>
    </div>
  )
}
