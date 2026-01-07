"use server"

import { revalidatePath } from 'next/cache'
import { getOrganizationContext } from "@/lib/auth-context"
import prisma from "@/lib/prisma"
import { PERMISSIONS, requirePermission } from "@/lib/permissions"
import { logAuditAction } from "@/lib/audit-logger"

interface OrganizationPreferences {
  enable_compliance_views?: boolean;
  standard_vial_size?: number;
  standard_dilution_ml?: number;
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

  await logAuditAction(ctx, "COMPLIANCE_SETTINGS_UPDATED", "Organization", ctx.organizationId, { enabled })

  revalidatePath('/settings')
  return { success: true }
}

export async function updateOrganizationPreferences(data: Partial<OrganizationPreferences>) {
  const ctx = await getOrganizationContext()
  if (!ctx) return { error: "Not found" }

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
        ...data
      }
    }
  })

  await logAuditAction(ctx, "ORG_PREFERENCES_UPDATED", "Organization", ctx.organizationId, data)

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
    enable_compliance_views: !!prefs.enable_compliance_views,
    standard_vial_size: prefs.standard_vial_size || 100,
    standard_dilution_ml: prefs.standard_dilution_ml || 2.5
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

    await logAuditAction(ctx, "ORG_NAME_UPDATED", "Organization", organizationId, { oldName: ctx.organization.name, newName: name })
    
    revalidatePath("/dashboard")
    revalidatePath("/settings")
  } catch (error) {
    console.error("Failed to update org:", error)
    return { error: "Failed to update organization." }
  }
}
