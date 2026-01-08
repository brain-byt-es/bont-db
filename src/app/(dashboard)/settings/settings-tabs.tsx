"use client"

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useRouter, useSearchParams } from "next/navigation"
import { ReactNode } from "react"

export function SettingsTabs({
  children,
  canManageTeam,
  enableCompliance
}: {
  children: ReactNode,
  canManageTeam: boolean,
  enableCompliance: boolean
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const activeTab = searchParams.get("tab") || "profile"

  const handleTabChange = (value: string) => {
    // Aktualisiert die URL ohne die Seite komplett neu zu laden (SPA-feeling)
    const params = new URLSearchParams(searchParams.toString())
    params.set("tab", value)
    router.push(`/settings?${params.toString()}`, { scroll: false })
  }

  const showAudit = canManageTeam && enableCompliance

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
      <TabsList>
        <TabsTrigger value="profile">Profile</TabsTrigger>
        <TabsTrigger value="qualification">Qualification</TabsTrigger>
        <TabsTrigger value="organization">Organization</TabsTrigger>
        {canManageTeam && <TabsTrigger value="team">Team Members</TabsTrigger>}
        {canManageTeam && <TabsTrigger value="integrations">Integrations</TabsTrigger>}
        <TabsTrigger value="compliance">Compliance</TabsTrigger>
        {showAudit && <TabsTrigger value="audit">Security & Logs</TabsTrigger>}
      </TabsList>
      {children}
    </Tabs>
  )
}
