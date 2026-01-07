"use server"

import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import { getUserContext } from "@/lib/auth-context"
import { revalidatePath } from "next/cache"
import { cookies, headers } from "next/headers"
import { getRegionForCountry } from "@/lib/countries"
import { Region, LegalDocumentType, MembershipRole } from "@/generated/client/enums"
import { LEGAL_VERSIONS } from "@/lib/legal-config"

export async function createOrganizationAction(formData: FormData) {
  const headersList = await headers()
  const userAgent = headersList.get("user-agent") || undefined
  const acceptedIp = headersList.get("x-forwarded-for") || "unknown"

  const { userId } = await getUserContext()
  
  const orgName = formData.get("orgName") as string
  const countryCode = formData.get("countryCode") as string || "DE"

  if (!orgName || orgName.trim().length < 3) {
    return { error: "Organization name must be at least 3 characters." }
  }

  const trimmedName = orgName.trim()

  // Check for duplicate organization name for this owner
  const existingOrg = await prisma.organizationMembership.findFirst({
    where: {
      userId: userId,
      role: MembershipRole.OWNER,
      status: "ACTIVE",
      organization: {
        name: {
          equals: trimmedName,
          mode: "insensitive"
        },
        status: "ACTIVE"
      }
    }
  })

  if (existingOrg) {
    return { error: "You already own an organization with this name." }
  }

  const region = getRegionForCountry(countryCode) as Region

  let newOrgId = ""

  try {
    // Transaction to ensure atomicity
    await prisma.$transaction(async (tx) => {
      const org = await tx.organization.create({
        data: {
          name: trimmedName,
          region: region,
          status: "ACTIVE",
          memberships: {
            create: {
              userId: userId,
              role: "OWNER",
              status: "ACTIVE"
            }
          },
          // Record DPA acceptance if Non-US
          legalAcceptances: region !== Region.US ? {
            create: {
              userId: userId,
              documentType: LegalDocumentType.DPA,
              documentVersion: LEGAL_VERSIONS.DPA,
              acceptedIp,
              userAgent
            }
          } : undefined
        }
      })
      newOrgId = org.id
    })
  } catch (error) {
    console.error("Failed to create organization:", error)
    return { error: "Failed to create organization. Please try again." }
  }

  if (newOrgId) {
      const cookieStore = await cookies()
      cookieStore.set("injexpro_org_id", newOrgId, {
        path: "/",
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 365 // 1 year
      })
  }

  revalidatePath("/")
  redirect("/dashboard")
}