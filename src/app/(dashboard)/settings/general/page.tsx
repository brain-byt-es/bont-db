import { getOrganizationContext } from "@/lib/auth-context"
import { getComplianceSettings, OrganizationPreferences } from "../actions"
import { OrgSettingsForm } from "../org-settings-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Globe } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { redirect } from "next/navigation"
import { DeleteOrgCard } from "../delete-org-card"
import { MembershipRole } from "@/generated/client/enums"

export default async function GeneralSettingsPage() {
    const ctx = await getOrganizationContext()
    if (!ctx) redirect("/onboarding")

    const settings = await getComplianceSettings()
    const isOwner = ctx.membership.role === MembershipRole.OWNER

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">General</h3>
                <p className="text-sm text-muted-foreground">Manage your clinic&apos;s public profile and details.</p>
            </div>
            
            <Card>
                <CardHeader>
                <CardTitle>Organization Details</CardTitle>
                <CardDescription>
                    Visible on invoices and patient communications.
                </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                <OrgSettingsForm 
                    initialName={ctx.organization.name} 
                    initialView={settings.standard_patient_view}
                    initialLogo={(ctx.organization.preferences as OrganizationPreferences | null)?.logo_url}
                />
                
                <div className="pt-4 border-t space-y-3">
                    <h4 className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                        <Globe className="h-4 w-4" />
                        Data Residency
                    </h4>
                    <div className="flex items-center justify-between p-3 border rounded-md bg-muted/30">
                        <div className="space-y-0.5">
                            <p className="text-sm font-semibold">
                                {ctx.organization.region === 'EU' ? 'European Union (France)' : 'United States (East)'}
                            </p>
                            <p className="text-[11px] text-muted-foreground">
                                All clinical and PII data is physically isolated in this region.
                            </p>
                        </div>
                        <Badge variant="outline" className="bg-background">
                            {ctx.organization.region}
                        </Badge>
                    </div>
                </div>
                </CardContent>
            </Card>

            {isOwner && (
                <DeleteOrgCard />
            )}
        </div>
    )
}
