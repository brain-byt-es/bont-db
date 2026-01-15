"use server"

import { getOrganizationContext } from "@/lib/auth-context"
import prisma from "@/lib/prisma"
import { format } from "date-fns"

export async function getPatientInsightsAction(patientId: string) {
    const ctx = await getOrganizationContext()
    if (!ctx) throw new Error("Unauthorized")

    // 1. GAS Trends
    const goals = await prisma.treatmentGoal.findMany({
        where: { patientId, organizationId: ctx.organizationId },
        include: {
            assessments: {
                orderBy: { assessedAt: 'asc' }
            }
        }
    })

    // 2. Encounter Frequency (Dose totals over time)
    const encounters = await prisma.encounter.findMany({
        where: { patientId, organizationId: ctx.organizationId, status: 'SIGNED' },
        orderBy: { encounterLocalDate: 'asc' },
        include: {
            injections: {
                include: { muscle: true }
            }
        }
    })

    const doseTrends = encounters.map(e => ({
        date: format(e.encounterLocalDate, 'MMM d, yyyy'),
        units: e.totalUnits.toNumber(),
        indication: e.indication
    }))

    return {
        goals,
        doseTrends
    }
}
