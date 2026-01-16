import { getOrganizationContext } from "@/lib/auth-context"
import { getEffectivePlan } from "@/lib/permissions"
import { MembershipRole } from "@/generated/client/enums"
import { SettingsSidebar } from "@/components/settings/settings-sidebar"
import { redirect } from "next/navigation"

export default async function SettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const ctx = await getOrganizationContext()
  if (!ctx) redirect("/onboarding")

  const userPlan = getEffectivePlan(ctx.organization)
  const isOwner = ctx.membership.role === MembershipRole.OWNER

  return (
    <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0 p-6">
      <SettingsSidebar userPlan={userPlan} isOwner={isOwner} />
      <div className="flex-1 lg:max-w-4xl">{children}</div>
    </div>
  )
}
