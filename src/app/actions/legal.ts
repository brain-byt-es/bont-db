"use server"

import { getOrganizationContext } from "@/lib/auth-context"
import prisma from "@/lib/prisma"
import { LEGAL_VERSIONS } from "@/lib/legal-config"
import { LegalDocumentType } from "@/generated/client/enums"
import { headers } from "next/headers"
import { revalidatePath } from "next/cache"
import { logAuditAction } from "@/lib/audit-logger"

export async function acceptDPAAction() {
  const ctx = await getOrganizationContext()
  if (!ctx) throw new Error("No organization context")
  
  if (ctx.membership.role !== "OWNER") {
    throw new Error("Only owners can accept the DPA")
  }

  const headersList = await headers()
  const userAgent = headersList.get("user-agent") || undefined
  const acceptedIp = headersList.get("x-forwarded-for") || "unknown"

  const acceptance = await prisma.legalAcceptance.create({
    data: {
      userId: ctx.membership.userId,
      organizationId: ctx.organizationId,
      documentType: LegalDocumentType.DPA,
      documentVersion: LEGAL_VERSIONS.DPA,
      acceptedIp,
      userAgent
    }
  })

  await logAuditAction(ctx, "DPA_ACCEPTED", "LegalAcceptance", acceptance.id, { version: LEGAL_VERSIONS.DPA })

  revalidatePath("/")
  return { success: true }
}

export async function checkDPANeeded() {
  const ctx = await getOrganizationContext()
  if (!ctx || ctx.organization.region === 'US') return false
  
  if (ctx.membership.role !== "OWNER") return false

  const acceptance = await prisma.legalAcceptance.findFirst({
    where: {
      organizationId: ctx.organizationId,
      documentType: LegalDocumentType.DPA,
      documentVersion: LEGAL_VERSIONS.DPA
    }
  })

  return !acceptance
}
