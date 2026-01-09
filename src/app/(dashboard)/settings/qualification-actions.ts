"use server"

import { revalidatePath } from 'next/cache'
import { getOrganizationContext } from "@/lib/auth-context"
import prisma from "@/lib/prisma"
import { QualificationSpecialty, SupervisionMode } from "@/generated/client/enums"
import { logAuditAction } from "@/lib/audit-logger"

export async function updateQualificationProfile(data: {
  specialty: QualificationSpecialty;
  supervisionMode: SupervisionMode;
  defaultSupervisorName?: string;
  showCertificationRoadmap: boolean;
}) {
  const ctx = await getOrganizationContext()
  if (!ctx) return { error: "Not found" }

  const updated = await prisma.organizationMembership.update({
    where: { id: ctx.membership.id },
    data: {
      specialty: data.specialty,
      supervisionMode: data.supervisionMode,
      defaultSupervisorName: data.defaultSupervisorName,
      showCertificationRoadmap: data.showCertificationRoadmap
    }
  })

  // Update org preferences for global defaults (optional, but let's keep it in membership for now as it's individual)
  
  await logAuditAction(ctx, "QUALIFICATION_PROFILE_UPDATED", "OrganizationMembership", updated.id, data)

  revalidatePath('/settings')
  revalidatePath('/dashboard')
  return { success: true }
}
