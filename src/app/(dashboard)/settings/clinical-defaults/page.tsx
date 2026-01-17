import { getOrganizationContext } from "@/lib/auth-context"
import { getComplianceSettings } from "../actions"
import { getEffectivePlan, checkPlan } from "@/lib/permissions"
import { Plan } from "@/generated/client/enums"
import { PERMISSIONS } from "@/lib/permissions"
import { checkPermission } from "@/lib/permissions"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ShieldCheck, ArrowRight } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { ClinicalSettingsForm } from "@/components/settings/clinical-settings-form"
import { DecisionSupportToggle } from "../decision-support-toggle"
import { ComplianceToggle } from "../compliance-toggle"
import { ComplianceUpgradeTeaser } from "@/components/settings/compliance-upgrade-teaser"
import { getDictionary } from "@/lib/i18n/server"

export default async function ClinicalDefaultsPage() {
    const [ctx, dict] = await Promise.all([
        getOrganizationContext(),
        getDictionary()
    ])
    if (!ctx) redirect("/onboarding")

    const userPlan = getEffectivePlan(ctx.organization)
    const isPro = checkPlan(userPlan, Plan.PRO)
    const settings = await getComplianceSettings()
    const canManageTeam = checkPermission(ctx.membership.role, PERMISSIONS.MANAGE_TEAM)

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">{dict.settings.clinical.title}</h3>
                <p className="text-sm text-muted-foreground">{dict.settings.clinical.desc}</p>
            </div>

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
                        {dict.settings.clinical.decision_support}
                        {!isPro && <Badge variant="secondary" className="font-normal text-[10px] h-4">Pro</Badge>}
                    </CardTitle>
                    <CardDescription>
                        Manage how historical references and protocols are displayed.
                    </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <DecisionSupportToggle initialValue={ctx.organization.decisionSupportMode} disabled={!isPro} />
                        <div className="pt-4 border-t">
                            <ComplianceToggle initialValue={settings.enable_compliance_views && isPro} disabled={!isPro} />
                        </div>
                    </CardContent>
                </Card>

                {!isPro && <ComplianceUpgradeTeaser />}

                {isPro && canManageTeam && settings.enable_compliance_views && (
                    <Card>
                        <CardHeader>
                        <CardTitle>{dict.settings.clinical.logs}</CardTitle>
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
                                    <Link href="/settings/audit">
                                        View Detailed Logs <ArrowRight className="ml-2 h-4 w-4" />
                                    </Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    )
}