import { getOrganizationContext } from "@/lib/auth-context"
import { getEffectivePlan, checkPlan } from "@/lib/permissions"
import { Plan } from "@/generated/client/enums"
import { redirect } from "next/navigation"
import { IntegrationsManager } from "@/components/settings/integrations-manager"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Mail } from "lucide-react"

export default async function IntegrationsSettingsPage() {
    const ctx = await getOrganizationContext()
    if (!ctx) redirect("/onboarding")

    const userPlan = getEffectivePlan(ctx.organization)
    const isEnterprise = userPlan === Plan.ENTERPRISE

    if (!isEnterprise) {
        // Direct access teaser for non-enterprise
        return (
            <div className="space-y-6">
                <div>
                    <h3 className="text-lg font-medium">Integrations</h3>
                    <p className="text-sm text-muted-foreground">Connect with external EHR and Identity providers.</p>
                </div>
                <Card className="bg-muted/30 border-dashed">
                    <CardHeader>
                        <CardTitle>Enterprise Feature</CardTitle>
                        <CardDescription>SSO (SAML/OIDC) and EHR (HL7/FHIR) integrations are available on the Enterprise plan.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button variant="outline" asChild>
                            <a href="mailto:sales@injexpro.com">Contact Sales <Mail className="ml-2 h-4 w-4" /></a>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">Integrations</h3>
                <p className="text-sm text-muted-foreground">Manage your external connections.</p>
            </div>
            
            <IntegrationsManager />
        </div>
    )
}
