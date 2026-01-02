import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getComplianceSettings } from "./actions"
import { ComplianceToggle } from "./compliance-toggle"
import { getOrganizationContext } from "@/lib/auth-context"
import { OrgSettingsForm } from "./org-settings-form"
import { redirect } from "next/navigation"

export default async function SettingsPage() {
  const settings = await getComplianceSettings()
  const ctx = await getOrganizationContext()

  if (!ctx) {
    // Should be handled by layout, but safety first
    redirect("/onboarding")
  }

  return (
    <div className="flex flex-col gap-6 pt-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
      </div>

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
    </div>
  )
}
