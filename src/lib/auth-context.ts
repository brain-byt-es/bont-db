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
  let membership = await prisma.organizationMembership.findFirst({
    where: {
      userId: userId,
      status: "ACTIVE"
    },
    include: {
      organization: true
    }
  })

  // Auto-provision organization if none exists (Onboarding logic)
  if (!membership) {
    console.log(`User ${userId} has no organization. Auto-provisioning...`)
    
    const orgName = user.name ? `${user.name}'s Clinic` : "My Clinic"
    
    // Transaction to ensure atomicity
    const newOrg = await prisma.organization.create({
      data: {
        name: orgName,
        region: "EU", // Default to EU for now
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

    // Fetch the newly created membership
    membership = await prisma.organizationMembership.findFirst({
      where: {
        userId: userId,
        organizationId: newOrg.id
      },
      include: {
        organization: true
      }
    })
  }

  if (!membership) {
    throw new Error("Failed to provision organization for user.")
  }

  return { 
    organizationId: membership.organizationId, 
    organization: membership.organization,
    membership: membership 
  }
}
