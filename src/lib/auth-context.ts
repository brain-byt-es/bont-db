import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import prisma from "@/lib/prisma"
import { redirect } from "next/navigation"

export async function getUserContext() {
  const session = await getServerSession(authOptions)

  if (!session || !session.user || !session.user.id) {
    redirect("/login")
  }

  return { userId: session.user.id, user: session.user }
}

export async function getOrganizationContext() {
  const { userId, user } = await getUserContext()

  // For now, we pick the first active membership. 
  // Future: Read from cookie or URL param for multi-org users.
  const membership = await prisma.organizationMembership.findFirst({
    where: {
      userId: userId,
      status: "ACTIVE"
    },
    include: {
      organization: true
    }
  })

  if (!membership) {
    return null
  }

  return { 
    organizationId: membership.organizationId, 
    organization: membership.organization,
    membership: membership 
  }
}
