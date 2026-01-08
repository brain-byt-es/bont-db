"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { getUserContext } from "@/lib/auth-context"
import prisma from "@/lib/prisma"

export async function switchOrganizationAction(orgId: string, redirectTo: string = "/dashboard") {
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

  // Security & UX Check: Prevent 404s when switching while on a specific resource page
  // If the path contains a UUID-like structure, we revert to the base section
  const segments = redirectTo.split("/")
  let finalRedirect = redirectTo

  // Heuristic: If any segment looks like a UUID (approx 36 chars), pop it and its parent if it's a detail view
  // Example: /patients/uuid -> /patients
  // Example: /treatments/uuid/edit -> /treatments
  const hasId = segments.some(s => s.length > 20)
  if (hasId) {
      if (redirectTo.startsWith("/patients")) finalRedirect = "/patients"
      else if (redirectTo.startsWith("/treatments")) finalRedirect = "/treatments"
      else finalRedirect = "/dashboard"
  }

  redirect(finalRedirect)
}
