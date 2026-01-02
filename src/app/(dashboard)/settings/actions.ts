'use server'

import { revalidatePath } from 'next/cache'
import { getOrganizationContext } from "@/lib/auth-context"
import prisma from "@/lib/prisma"
import { PERMISSIONS, requirePermission } from "@/lib/permissions"

// Note: Compliance settings were stored in Supabase Auth Metadata.
// In our new schema, we don't have a direct "user settings" JSON field yet.
// For now, we will treat this as a no-op or default to enabled/disabled.
// Future: Add 'settings' Json field to User or OrganizationMembership.

export async function updateComplianceSettings(enabled: boolean) {
  // TODO: Persist this preference to DB
  console.log("Update compliance settings:", enabled)
  revalidatePath('/')
}

export async function getComplianceSettings() {
  // Default to false for now until we add persistence
  return {
    enable_compliance_views: false
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
