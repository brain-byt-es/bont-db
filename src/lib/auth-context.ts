import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import prisma from "@/lib/prisma"
import { redirect } from "next/navigation"
import { cookies } from "next/headers"

export async function getUserContext() {
  const session = await getServerSession(authOptions)

  if (!session || !session.user || !session.user.id) {
    redirect("/login")
  }

  return { userId: session.user.id, user: session.user }
}

export async function getOrganizationContext() {
  const { userId } = await getUserContext()
  const cookieStore = await cookies()
  const preferredOrgId = cookieStore.get("injexpro_org_id")?.value

  let membership = null

  if (preferredOrgId) {
    membership = await prisma.organizationMembership.findUnique({
      where: {
        organizationId_userId: {
          organizationId: preferredOrgId,
          userId: userId
        },
        status: "ACTIVE" // Ensure strict active check
      },
      include: {
        organization: true,
        user: true
      }
    })
  }

  // Fallback if no cookie or invalid/inactive membership found
  if (!membership) {
    membership = await prisma.organizationMembership.findFirst({
      where: {
        userId: userId,
        status: "ACTIVE"
      },
      include: {
        organization: true,
        user: true
      },
      orderBy: {
        createdAt: 'asc' // Deterministic fallback
      }
    })
  }

  if (!membership) {
    return null
  }

  return { 
    organizationId: membership.organizationId, 
    organization: membership.organization,
    membership: membership 
  }
}
