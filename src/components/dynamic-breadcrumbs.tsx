"use client"

import { usePathname } from "next/navigation"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import React from "react"

const ROUTE_LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  patients: "Patients",
  treatments: "Treatments",
  settings: "Settings",
  profile: "Profile",
  export: "Export",
  support: "Support",
  new: "New",
  edit: "Edit",
  onboarding: "Onboarding",
}

export function DynamicBreadcrumbs() {
  const pathname = usePathname()
  const segments = pathname.split("/").filter((item) => item !== "")

  // Don't show breadcrumbs on root if you want, but here we assume /dashboard root
  // If we are at /dashboard, showing just "Dashboard" is fine.

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard">Home</BreadcrumbLink>
        </BreadcrumbItem>
        {segments.length > 0 && <BreadcrumbSeparator />}
        
        {segments.map((segment, index) => {
          const isLast = index === segments.length - 1
          const href = `/${segments.slice(0, index + 1).join("/")}`
          
          // Determine Label
          let label = ROUTE_LABELS[segment]
          
          // Heuristic for IDs (UUIDs are long, numeric IDs are usually digits)
          if (!label) {
              if (segment.length > 20) {
                  // Likely UUID
                  label = "Details" 
              } else if (!isNaN(Number(segment))) {
                  // Numeric ID
                  label = `#${segment}`
              } else {
                  // Fallback: capitalize first letter
                  label = segment.charAt(0).toUpperCase() + segment.slice(1)
              }
          }

          return (
            <React.Fragment key={href}>
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink href={href}>{label}</BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!isLast && <BreadcrumbSeparator />}
            </React.Fragment>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
