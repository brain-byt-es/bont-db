"use client"

// AppSidebar component
import * as React from "react"
import {
  IconChartBar,
  IconDashboard,
  IconUsers,
  IconVaccine,
  IconSettings
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
} from "@/components/ui/sidebar"

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
      title: "Settings",
      url: "/settings",
      icon: IconSettings,
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
    name: string
  }
}

export function AppSidebar({ user, organization, ...props }: AppSidebarProps) {
  const currentUser = user || defaultUser
  const orgName = organization?.name || "InjexPro"
  const initials = orgName.substring(0, 2).toUpperCase()

  return (
    <Sidebar collapsible="offcanvas" {...props}>
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
            <div className="flex items-center gap-2 rounded-md border bg-card p-2 shadow-sm mt-2">
                <div className="flex aspect-square size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
                  <span className="font-bold text-xs">{initials}</span>
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{orgName}</span>
                  <span className="truncate text-xs text-muted-foreground">Free Plan</span>
                </div>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={currentUser} />
      </SidebarFooter>
    </Sidebar>
  )
}
