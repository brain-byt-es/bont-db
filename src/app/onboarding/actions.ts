"use server"

import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import { getUserContext } from "@/lib/auth-context"
import { revalidatePath } from "next/cache"

export async function createOrganizationAction(formData: FormData) {
  const { userId, user } = await getUserContext()
  
  const orgName = formData.get("orgName") as string

  if (!orgName || orgName.trim().length < 3) {
    return { error: "Organization name must be at least 3 characters." }
  }

  try {
    // Transaction to ensure atomicity
    await prisma.$transaction(async (tx) => {
      const newOrg = await tx.organization.create({
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
    })
  } catch (error) {
    console.error("Failed to create organization:", error)
    return { error: "Failed to create organization. Please try again." }
  }

  revalidatePath("/")
  redirect("/dashboard")
}
