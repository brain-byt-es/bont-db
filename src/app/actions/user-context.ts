"use server"

import { getOrganizationContext, getUserContext } from "@/lib/auth-context"
import prisma from "@/lib/prisma"

export async function getUserContextAction() {
    const { userId } = await getUserContext()
    const ctx = await getOrganizationContext()
    
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
            identities: {
                select: {
                    provider: true,
                    emailAtAuth: true,
                    createdAt: true
                }
            }
        }
    })

    if (!user) return null

    return {
        user: {
            id: user.id,
            name: user.displayName,
            email: user.email,
            image: user.profilePhotoUrl,
            identities: user.identities.map(i => ({
                provider: i.provider,
                email: i.emailAtAuth,
                linkedAt: i.createdAt
            }))
        },
        membership: ctx ? {
            specialty: ctx.membership.specialty,
            supervisionMode: ctx.membership.supervisionMode,
            defaultSupervisorName: ctx.membership.defaultSupervisorName,
            showCertificationRoadmap: ctx.membership.showCertificationRoadmap,
            role: ctx.membership.role
        } : null
    }
}
