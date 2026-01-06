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
import { checkPermission, PERMISSIONS, checkPlan, getEffectivePlan, PLAN_SEAT_LIMITS } from "@/lib/permissions"
import { Plan, SubscriptionStatus } from "@/generated/client/enums"
import { SettingsTabs } from "./settings-tabs"
import { cn } from "@/lib/utils"
import { ComplianceUpgradeTeaser } from "@/components/settings/compliance-upgrade-teaser"
import { ClinicalSettingsForm } from "@/components/settings/clinical-settings-form"
import { getAuditLogs, getAuditFilterOptions } from "./audit-logs/actions"
import { AuditLogManager } from "@/components/settings/audit-log-manager"
import { IntegrationsManager } from "@/components/settings/integrations-manager"
import { Badge } from "@/components/ui/badge"
import { ShieldCheck, ArrowRight, CreditCard, ExternalLink, CheckCircle2, AlertTriangle, Users, Info, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { createCustomerPortalAction, syncStripeSession } from "@/app/actions/stripe"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { calculateBillableSeats } from "@/lib/stripe-billing"
import { format } from "date-fns"

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; success?: string; canceled?: string; session_id?: string }>
}) {
  const { success, canceled, session_id } = await searchParams

  // Attempt to sync session if we just returned from Stripe
  if (success === "true" && session_id) {
    await syncStripeSession(session_id)
  }

  const ctx = await getOrganizationContext()

  if (!ctx) {
    redirect("/onboarding")
  }

  // Resolve Effective Plan
  const userPlan = getEffectivePlan(ctx.organization)
  const isOverrideActive = !!(ctx.organization.planOverride || (ctx.organization.proUntil && new Date(ctx.organization.proUntil) > new Date()))

  const canManageTeam = checkPermission(ctx.membership.role, PERMISSIONS.MANAGE_TEAM)
  const isPro = checkPlan(userPlan, Plan.PRO)
  const isEnterprise = userPlan === Plan.ENTERPRISE
  
  // Calculate seats on the fly for display
  const seatCount = await calculateBillableSeats(ctx.organizationId)
  const seatLimit = PLAN_SEAT_LIMITS[userPlan]
  const subStatus = ctx.organization.subscriptionStatus
  const periodEnd = ctx.organization.stripeCurrentPeriodEnd

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

      {success === "true" && (
          <Alert className="bg-emerald-50 border-emerald-200 text-emerald-900">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <AlertTitle>Success!</AlertTitle>
              <AlertDescription>
                  Your plan has been updated. It might take a few seconds for all Pro features to appear.
              </AlertDescription>
          </Alert>
      )}

      {canceled === "true" && (
          <Alert variant="default" className="bg-amber-50 border-amber-200 text-amber-900">
              <AlertTitle>Canceled</AlertTitle>
              <AlertDescription>
                  The upgrade process was canceled. No charges were made.
              </AlertDescription>
          </Alert>
      )}

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

            <Card className={cn(isPro ? "border-primary/20 bg-primary/5" : "")}>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <CreditCard className="h-5 w-5" />
                                Subscription Plan
                            </CardTitle>
                            <CardDescription>
                                Manage your billing and seats.
                            </CardDescription>
                        </div>
                        <Badge variant={isEnterprise ? "default" : isPro ? "default" : "secondary"} className={cn("text-base px-3 py-1", isEnterprise && "bg-purple-600 hover:bg-purple-700")}>
                            {userPlan}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent>
                    {isOverrideActive && (
                        <Alert className="mb-6 bg-blue-50 text-blue-900 border-blue-200">
                            <Info className="h-4 w-4 text-blue-600" />
                            <AlertTitle>Manual Override Active</AlertTitle>
                            <AlertDescription>
                                Your plan is currently managed manually by support. Standard Stripe billing might be paused or overridden.
                                {ctx.organization.proUntil && ` Access guaranteed until ${format(new Date(ctx.organization.proUntil), "MMM d, yyyy")}.`}
                            </AlertDescription>
                        </Alert>
                    )}

                    {isPro ? (
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                <div className="p-3 bg-background rounded-md border">
                                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Status</p>
                                    <div className="mt-1 flex items-center gap-2">
                                        <div className={cn("h-2 w-2 rounded-full", 
                                            isEnterprise ? "bg-purple-500" :
                                            subStatus === SubscriptionStatus.ACTIVE ? "bg-emerald-500" :
                                            subStatus === SubscriptionStatus.PAST_DUE ? "bg-amber-500" : "bg-red-500"
                                        )} />
                                        <span className="font-semibold capitalize">{isEnterprise ? 'Active' : subStatus.toLowerCase().replace('_', ' ')}</span>
                                    </div>
                                </div>
                                <div className="p-3 bg-background rounded-md border">
                                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Active Seats</p>
                                    <div className="mt-1 flex items-center gap-2">
                                        <Users className="h-4 w-4 text-muted-foreground" />
                                        <span className="font-semibold">
                                            {seatCount} {seatLimit !== Infinity ? `/ ${seatLimit}` : '/ Unlimited'}
                                        </span>
                                    </div>
                                </div>
                                {periodEnd && !isEnterprise && (
                                    <div className="p-3 bg-background rounded-md border">
                                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Renews On</p>
                                        <div className="mt-1 font-semibold">
                                            {format(periodEnd, 'MMM d, yyyy')}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {subStatus === SubscriptionStatus.PAST_DUE && !isOverrideActive && !isEnterprise && (
                                <Alert className="bg-amber-50 text-amber-900 border-amber-200">
                                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                                    <AlertTitle>Payment Past Due</AlertTitle>
                                    <AlertDescription>
                                        We couldn&apos;t process your last payment. Please update your payment method to avoid losing access to Pro features.
                                    </AlertDescription>
                                </Alert>
                            )}

                            <div className="flex items-center justify-between pt-2">
                                <p className="text-sm text-muted-foreground max-w-md">
                                    {isEnterprise 
                                        ? "Your organization is on an Enterprise plan. Billing and seats are managed via your account manager."
                                        : "Your clinic has access to all Pro features including Audit Logs, Clinical Insights, and unlimited treatments."}
                                </p>
                                
                                {isEnterprise ? (
                                    <Button variant="outline" asChild>
                                        <a href="mailto:support@injexpro.com">
                                            Contact Support <Mail className="ml-2 h-4 w-4" />
                                        </a>
                                    </Button>
                                ) : (
                                    <form action={createCustomerPortalAction}>
                                        <Button variant="default" type="submit">
                                            Manage Billing & Invoices <ExternalLink className="ml-2 h-4 w-4" />
                                        </Button>
                                    </form>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <p className="text-sm text-muted-foreground">
                                Basic plans include unlimited clinical documentation for a single user. Upgrade for team collaboration and advanced oversight tools.
                            </p>
                            <Button asChild size="lg" className="w-full md:w-auto">
                                <Link href="/pricing">Upgrade to Pro</Link>
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </TabsContent>

        {canManageTeam && (
          <TabsContent value="team" className="space-y-4">
              <TeamManager initialData={teamData} />
          </TabsContent>
        )}

        {canManageTeam && (
          <TabsContent value="integrations" className="space-y-4">
              <IntegrationsManager />
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
