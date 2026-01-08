"use client"

// AppSidebar component
import * as React from "react"
import {
  IconChartBar,
  IconDashboard,
  IconUsers,
  IconVaccine,
  IconSettings,
  IconLifebuoy
} from "@tabler/icons-react"

import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import { Logo } from "@/components/logo"
import Link from "next/link"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChevronsUpDown, Plus, Check } from "lucide-react"
import { switchOrganizationAction } from "@/app/actions/org-switching"
import { usePathname } from "next/navigation"
import { checkPermission, PERMISSIONS } from "@/lib/permissions"
import { MembershipRole } from "@/generated/client/enums"

// Default data if no user provided
const defaultUser = {
  name: "User",
  email: "user@example.com",
  avatar: "",
}

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: IconDashboard,
    },
    {
      title: "Patients",
      url: "/patients",
      icon: IconUsers,
    },
    {
      title: "Treatments",
      url: "/treatments",
      icon: IconVaccine,
    },
    {
      title: "Export",
      url: "/export",
      icon: IconChartBar,
    },
  ],
  navSecondary: [
    {
      title: "Support",
      url: "/support",
      icon: IconLifebuoy,
    },
    {
      title: "Settings",
      url: "/settings",
      icon: IconSettings,
      permission: PERMISSIONS.MANAGE_TEAM
    },
  ],
}

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user?: {
    name: string
    email: string
    avatar: string
  }
  organization?: {
    id: string
    name: string
  }
  allTeams?: {
    id: string
    name: string
  }[]
  userRole?: string
  variant?: "sidebar" | "floating" | "inset"
  collapsible?: "offcanvas" | "icon" | "none"
}

export function AppSidebar({ user, organization, allTeams = [], userRole = "Member", variant, collapsible, ...props }: AppSidebarProps) {
  const currentUser = user || defaultUser
  const orgName = organization?.name || "InjexPro"
  const orgId = organization?.id
  const initials = orgName.substring(0, 2).toUpperCase()
  const { isMobile } = useSidebar()
  const pathname = usePathname()

  const formattedRole = userRole.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase())

  const handleSwitch = async (teamId: string) => {
     await switchOrganizationAction(teamId, pathname)
     // Action redirects, but we might want to refresh manually if needed
  }

  // Filter navigation items
  // const allowedNavMain = data.navMain.filter(...) // Usually all roles see main nav
  const allowedNavSecondary = data.navSecondary.filter(item => {
      if (!item.permission) return true
      return checkPermission(userRole as MembershipRole, item.permission)
  })

  return (
    <Sidebar variant={variant} collapsible={collapsible || "offcanvas"} {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild className="hover:bg-transparent">
              <Link href="/dashboard">
                <Logo />
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground mt-2 border border-sidebar-border"
                >
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                     <span className="font-bold text-xs">{initials}</span>
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">{orgName}</span>
                    <span className="truncate text-xs text-muted-foreground">{formattedRole}</span>
                  </div>
                  <ChevronsUpDown className="ml-auto" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                align="start"
                side={isMobile ? "bottom" : "right"}
                sideOffset={4}
              >
            <DropdownMenuLabel className="text-xs text-muted-foreground px-2 py-1.5 uppercase tracking-wider">
              Organizations
            </DropdownMenuLabel>
            {allTeams.map((org) => (
              <DropdownMenuItem 
                key={org.id} 
                onClick={() => handleSwitch(org.id)}
                className="gap-2 px-2 py-2 cursor-pointer"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-sm border bg-background shrink-0">
                  <span className="font-medium text-xs">{org.name.substring(0, 1)}</span>
                </div>
                <span className="truncate flex-1">{org.name}</span>
                {org.id === orgId && <Check className="ml-auto h-4 w-4" />}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/onboarding" className="gap-2 px-2 py-2 cursor-pointer">
                <div className="flex h-6 w-6 items-center justify-center rounded-sm border border-dashed shrink-0">
                  <Plus className="h-4 w-4" />
                </div>
                <div className="font-medium text-muted-foreground">Add organization</div>
              </Link>
            </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSecondary items={allowedNavSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={currentUser} />
      </SidebarFooter>
    </Sidebar>
  )
}