import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Building2, Key, Lock, Network, ArrowUpRight, Mail } from "lucide-react"

export function IntegrationsManager() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
            <h3 className="text-lg font-medium">Enterprise Integrations</h3>
            <p className="text-sm text-muted-foreground">Connect InjexPro with your hospital infrastructure.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <IntegrationCard 
            title="EHR / KIS Connectivity"
            description="Sync patient demographics and document treatments directly into EPIC, Cerner, or KISIM."
            icon={Network}
            tags={["HL7 v2", "FHIR", "Custom"]}
        />
        <IntegrationCard 
            title="SSO & Identity"
            description="Enforce organization-wide security policies with SAML 2.0 or OIDC. Auto-provision users via SCIM."
            icon={Key}
            tags={["Okta", "Azure AD", "Auth0"]}
        />
        <IntegrationCard 
            title="Audit API"
            description="Stream secure audit logs to your SIEM (Splunk, Datadog) for centralized compliance monitoring."
            icon={Lock}
            tags={["JSON API", "Webhook"]}
        />
        <IntegrationCard 
            title="Multi-Location Management"
            description="Centralized administration for hospital networks with distinct departments and cost centers."
            icon={Building2}
            tags={["Headquarters", "Sub-Orgs"]}
        />
      </div>

      <Card className="bg-muted/50 border-dashed">
        <CardContent className="flex flex-col items-center justify-center p-8 text-center space-y-4">
            <div className="rounded-full bg-primary/10 p-3">
                <Building2 className="h-6 w-6 text-primary" />
            </div>
            <div className="space-y-2 max-w-lg">
                <h3 className="font-semibold text-lg">Need custom integration?</h3>
                <p className="text-sm text-muted-foreground">
                    Our solution engineering team works directly with your IT department to ensure secure, compliant, and seamless connectivity.
                </p>
            </div>
            <Button asChild>
                <a href="mailto:sales@injexpro.com?subject=Integration Request">
                    Contact Enterprise Sales <Mail className="ml-2 h-4 w-4" />
                </a>
            </Button>
        </CardContent>
      </Card>
    </div>
  )
}

function IntegrationCard({ title, description, icon: Icon, tags }: { title: string, description: string, icon: React.ElementType, tags: string[] }) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    {title}
                </CardTitle>
                <Button variant="ghost" size="icon" className="h-6 w-6 -mr-2" asChild>
                    <a href="mailto:sales@injexpro.com?subject=Integration Inquiry">
                        <ArrowUpRight className="h-3 w-3 text-muted-foreground" />
                        <span className="sr-only">Contact</span>
                    </a>
                </Button>
            </CardHeader>
            <CardContent>
                <CardDescription className="text-xs min-h-[2rem]">
                    {description}
                </CardDescription>
                <div className="flex flex-wrap gap-2 mt-3">
                    {tags.map(tag => (
                        <Badge key={tag} variant="secondary" className="font-normal text-[10px] px-1.5 h-5 text-muted-foreground">
                            {tag}
                        </Badge>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
