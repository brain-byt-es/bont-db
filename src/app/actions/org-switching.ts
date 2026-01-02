"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { getUserContext } from "@/lib/auth-context"
import prisma from "@/lib/prisma"

export async function switchOrganizationAction(orgId: string) {
  const { userId } = await getUserContext()

  // Verify membership exists and is active
  const membership = await prisma.organizationMembership.findUnique({
    where: {
      organizationId_userId: {
        organizationId: orgId,
        userId: userId
      },
      status: "ACTIVE"
    }
  })

  if (!membership) {
    throw new Error("Invalid organization")
  }

  // Set cookie
  const cookieStore = await cookies()
  cookieStore.set("injexpro_org_id", orgId, {
    path: "/",
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365 // 1 year
  })

  redirect("/dashboard")
}
