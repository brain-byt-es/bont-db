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

  const appUser = session.user ? {
    name: session.user.name || "User",
    email: session.user.email || "",
    avatar: session.user.image || "",
  } : undefined

  return (
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
        organization={{ name: orgContext.organization.name }} 
      />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
