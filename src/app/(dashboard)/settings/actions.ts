"use server"

import { revalidatePath } from 'next/cache'
import { getOrganizationContext } from "@/lib/auth-context"
import prisma from "@/lib/prisma"
import { PERMISSIONS, requirePermission } from "@/lib/permissions"

interface OrganizationPreferences {
  enable_compliance_views?: boolean;
}

export async function updateComplianceSettings(enabled: boolean) {
  const ctx = await getOrganizationContext()
  if (!ctx) return { error: "Not found" }

  // Fresh fetch to avoid stale context data (v2)
  const org = await prisma.organization.findUnique({
    where: { id: ctx.organizationId },
    select: { preferences: true }
  })

  const currentPrefs = (org?.preferences as OrganizationPreferences) || {}
  
  await prisma.organization.update({
    where: { id: ctx.organizationId },
    data: {
      preferences: {
        ...currentPrefs,
        enable_compliance_views: enabled
      }
    }
  })

  revalidatePath('/settings')
  return { success: true }
}

export async function getComplianceSettings() {
  const ctx = await getOrganizationContext()
  if (!ctx) return { enable_compliance_views: false }

  // Re-fetch to ensure we show the user the absolute truth from the DB
  const org = await prisma.organization.findUnique({
    where: { id: ctx.organizationId },
    select: { preferences: true }
  })

  const prefs = (org?.preferences as OrganizationPreferences) || {}
  return {
    enable_compliance_views: !!prefs.enable_compliance_views
  }
}

export async function updateOrganizationName(formData: FormData) {
  const ctx = await getOrganizationContext()
  
  if (!ctx) {
    return { error: "Organization context not found" }
  }

  const { organizationId, membership } = ctx

  requirePermission(membership.role, PERMISSIONS.MANAGE_ORGANIZATION)

  const name = formData.get("name") as string

  if (!name || name.trim().length < 3) {
    return { error: "Name must be at least 3 characters long." }
  }

  try {
    await prisma.organization.update({
      where: { id: organizationId },
      data: { name: name.trim() }
    })
    
    revalidatePath("/dashboard")
    revalidatePath("/settings")
  } catch (error) {
    console.error("Failed to update org:", error)
    return { error: "Failed to update organization." }
  }
}
