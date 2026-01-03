"use server"

import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import { getUserContext } from "@/lib/auth-context"
import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"

export async function createOrganizationAction(formData: FormData) {
  const { userId } = await getUserContext()
  
  const orgName = formData.get("orgName") as string

  if (!orgName || orgName.trim().length < 3) {
    return { error: "Organization name must be at least 3 characters." }
  }

  let newOrgId = ""

  try {
    // Transaction to ensure atomicity
    await prisma.$transaction(async (tx) => {
      const org = await tx.organization.create({
        data: {
          name: orgName.trim(),
          region: "EU", // Defaulting to EU as per project specs
          status: "ACTIVE",
          memberships: {
            create: {
              userId: userId,
              role: "OWNER",
              status: "ACTIVE"
            }
          }
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
