"use server"

import { getOrganizationContext } from "@/lib/auth-context"
import prisma from "@/lib/prisma"
import { GoalStatus, GoalCategory } from "@/generated/client/enums"
import { revalidatePath } from "next/cache"

export async function getPatientGoalsAction(patientId: string) {
    const ctx = await getOrganizationContext()
    if (!ctx) throw new Error("Unauthorized")

    return await prisma.treatmentGoal.findMany({
        where: {
            patientId,
            organizationId: ctx.organizationId
        },
        include: {
            assessments: {
                orderBy: { assessedAt: 'desc' },
                include: {
                    assessedByMembership: {
                        include: { user: { select: { displayName: true } } }
                    }
                }
            }
        },
        orderBy: { createdAt: 'desc' }
    })
}

export async function createGoalAction(data: {
    patientId: string
    category: GoalCategory
    description: string
    indication?: string
    targetRegion?: string
    baselineScore: number
}) {
    const ctx = await getOrganizationContext()
    if (!ctx) throw new Error("Unauthorized")

    const goal = await prisma.treatmentGoal.create({
        data: {
            patientId: data.patientId,
            organizationId: ctx.organizationId,
            category: data.category,
            description: data.description,
            indication: data.indication,
            targetRegion: data.targetRegion,
            status: GoalStatus.ACTIVE,
            assessments: {
                create: {
                    score: data.baselineScore,
                    isBaseline: true,
                    assessedByMembershipId: ctx.membership.id,
                    notes: "Initial baseline score."
                }
            }
        }
    })

    revalidatePath(`/patients/${data.patientId}`)
    return goal
}

export async function addGoalAssessmentAction(data: {
    goalId: string
    score: number
    notes?: string
    encounterId?: string
}) {
    const ctx = await getOrganizationContext()
    if (!ctx) throw new Error("Unauthorized")

    const goal = await prisma.treatmentGoal.findUnique({
        where: { id: data.goalId, organizationId: ctx.organizationId }
    })

    if (!goal) throw new Error("Goal not found")

    const assessment = await prisma.goalAssessment.create({
        data: {
            goalId: data.goalId,
            score: data.score,
            notes: data.notes,
            encounterId: data.encounterId,
            assessedByMembershipId: ctx.membership.id
        }
    })

    revalidatePath(`/patients/${goal.patientId}`)
    return assessment
}

export async function updateGoalStatusAction(goalId: string, status: GoalStatus) {
    const ctx = await getOrganizationContext()
    if (!ctx) throw new Error("Unauthorized")

    const goal = await prisma.treatmentGoal.update({
        where: { id: goalId, organizationId: ctx.organizationId },
        data: { status }
    })

    revalidatePath(`/patients/${goal.patientId}`)
    return goal
}
