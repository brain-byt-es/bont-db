import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import { getOrganizationContext } from "@/lib/auth-context"
import prisma from "@/lib/prisma"
import { AuthContextProvider } from "@/components/auth-context-provider"
import { MembershipRole } from "@/generated/client/enums"
import { getEffectivePlan } from "@/lib/permissions"
import { DPAAcceptanceGate } from "@/components/legal/dpa-acceptance-gate"
import { checkDPANeeded } from "@/app/actions/legal"
import { CommandMenu } from "@/components/command-menu"
import { OrganizationPreferences } from "@/app/(dashboard)/settings/actions"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect("/login")
  }

  // Ensure the user has an active organization context
  const orgContext = await getOrganizationContext()
  if (!orgContext) {
    redirect("/onboarding")
  }

  // Fetch all active memberships for switcher
  const memberships = await prisma.organizationMembership.findMany({
    where: { 
        userId: session.user.id, 
        status: "ACTIVE",
        organization: {
            status: "ACTIVE"
        }
    },
    select: {
        organization: { select: { id: true, name: true } }
    },
    orderBy: { createdAt: 'asc' }
  })
  
  const allTeams = memberships.map(m => m.organization)

  const appUser = session.user ? {
    name: session.user.name || "User",
    email: session.user.email || "",
    avatar: session.user.image || "",
  } : undefined

  // Resolve Effective Plan (including manual overrides)
  const effectivePlan = getEffectivePlan(orgContext.organization)

  const dpaNeeded = await checkDPANeeded()

  return (
    <AuthContextProvider 
      userRole={orgContext.membership.role as MembershipRole}
      userPlan={effectivePlan}
      userId={session.user.id}
    >
      <CommandMenu />
      <DPAAcceptanceGate needed={dpaNeeded} />
      <SidebarProvider
        style={
          {
            "--sidebar-width": "18rem", // Fallback or explicit
            "--header-height": "3rem",
          } as React.CSSProperties
        }
      >
        <AppSidebar 
          variant="inset" 
          user={appUser} 
          organization={orgContext.organization as { id: string; name: string; preferences: OrganizationPreferences | null }} 
          allTeams={allTeams}
          userRole={orgContext.membership.role}
        />
        <SidebarInset>
          <SiteHeader />
          <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </AuthContextProvider>
  )
}
