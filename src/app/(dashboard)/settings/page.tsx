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
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight, ShieldCheck } from "lucide-react"
import { getAuditLogs } from "./audit-logs/actions"
import { format } from "date-fns"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { SettingsTabs } from "./settings-tabs"
import { cn } from "@/lib/utils"
import { ComplianceUpgradeTeaser } from "@/components/settings/compliance-upgrade-teaser"
import { ClinicalSettingsForm } from "@/components/settings/clinical-settings-form"

export default async function SettingsPage() {
  const ctx = await getOrganizationContext()

  if (!ctx) {
    redirect("/onboarding")
  }

  const userPlan = ctx.organization.plan as Plan
  const canManageTeam = checkPermission(ctx.membership.role, PERMISSIONS.MANAGE_TEAM)
  const isPro = checkPlan(userPlan, Plan.PRO)

  // Fetch data in parallel
  const [settings, teamData, profileData, auditLogs] = await Promise.all([
      getComplianceSettings(),
      getTeamData(),
      getProfileData(),
      (canManageTeam && isPro) ? getAuditLogs() : Promise.resolve([])
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
                        {!isPro && <Badge variant="secondary" className="font-normal">Pro</Badge>}
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
                )}
            </div>
        </TabsContent>

        {canManageTeam && isPro && (
          <TabsContent value="audit" className="space-y-4">
              <Card>
                  <CardHeader>
                  <CardTitle>Security & Audit Logs</CardTitle>
                  <CardDescription>
                      Review system-wide activity and security events for compliance audits.
                  </CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                      <ScrollArea className="h-[600px]">
                        <Table>
                            <TableHeader>
                            <TableRow className="hover:bg-transparent">
                                <TableHead className="sticky top-0 bg-background pl-6">Time</TableHead>
                                <TableHead className="sticky top-0 bg-background">User</TableHead>
                                <TableHead className="sticky top-0 bg-background">Action</TableHead>
                                <TableHead className="sticky top-0 bg-background">Resource</TableHead>
                                <TableHead className="sticky top-0 bg-background pr-6">Details</TableHead>
                            </TableRow>
                            </TableHeader>
                            <TableBody>
                            {auditLogs.length === 0 ? (
                                <TableRow>
                                <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                                    No audit logs found.
                                </TableCell>
                                </TableRow>
                            ) : (
                                auditLogs.map((log) => (
                                <TableRow key={log.id}>
                                    <TableCell className="whitespace-nowrap pl-6 py-4 text-xs font-mono">
                                    {format(log.occurredAt, "yyyy-MM-dd HH:mm:ss")}
                                    </TableCell>
                                    <TableCell className="py-4">
                                    <div className="flex flex-col">
                                        <span className="font-medium text-xs">{log.actorMembership?.user.displayName || "System"}</span>
                                        <span className="text-[10px] text-muted-foreground">{log.actorMembership?.user.email}</span>
                                    </div>
                                    </TableCell>
                                    <TableCell className="py-4">
                                    <Badge variant="outline" className="text-[10px] font-mono px-1 py-0">{log.action}</Badge>
                                    </TableCell>
                                    <TableCell className="py-4">
                                    <span className="text-[10px] font-mono opacity-70">{log.resourceType}</span>
                                    </TableCell>
                                    <TableCell className="max-w-xs truncate text-[10px] pr-6 py-4">
                                    {log.details ? JSON.stringify(log.details) : "-"}
                                    </TableCell>
                                </TableRow>
                                ))
                            )}
                            </TableBody>
                        </Table>
                      </ScrollArea>
                  </CardContent>
              </Card>
          </TabsContent>
        )}
      </SettingsTabs>
    </div>
  )
}
