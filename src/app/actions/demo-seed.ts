"use server"

import prisma from "@/lib/prisma"
import { Prisma } from "@/generated/client/client"
import { generateDemoData } from "@/lib/demo-data-generator"
import { 
    OrganizationStatus, 
    MembershipRole, 
    MembershipStatus, 
    Region, 
    Plan
} from "@/generated/client/enums"
import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { cookies } from "next/headers"

/**
 * Action to seed a high-fidelity Demo Organization.
 * Uses optimized flat createMany strategy for speed and reliability.
 */
export async function seedDemoOrganizationAction() {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) throw new Error("Unauthorized")

    // 1. Setup Demo Org
    const demoOrg = await prisma.organization.create({
        data: {
            name: "Metropolitan Neuro & Rehab Center",
            region: Region.EU,
            status: OrganizationStatus.DEMO,
            plan: Plan.PRO,
            timezone: "Europe/Berlin",
            preferences: {
                standard_vial_size: 100,
                standard_dilution_ml: 2.5,
                enable_compliance_views: true,
                is_demo: true
            }
        }
    })

    // 2. Create Memberships & ghost users
    const ownerMembership = await prisma.organizationMembership.create({
        data: {
            organizationId: demoOrg.id,
            userId: session.user.id,
            role: MembershipRole.OWNER,
            status: MembershipStatus.ACTIVE,
            specialty: "NEUROLOGY"
        }
    })

    const colleagueUser = await prisma.user.create({
        data: {
            email: `dr.chen-${demoOrg.id.slice(0, 5)}@demo.injexpro.com`,
            displayName: "Dr. James Chen",
            emailVerified: new Date()
        }
    })

    const providerMembership = await prisma.organizationMembership.create({
        data: {
            organizationId: demoOrg.id,
            userId: colleagueUser.id, 
            role: MembershipRole.PROVIDER,
            status: MembershipStatus.ACTIVE,
            specialty: "NEUROLOGY"
        }
    })

    // 3. Generate Data Payloads
    const muscles = await prisma.muscle.findMany()
    const { patients, encounters } = generateDemoData(muscles)

    // 4. Batch Create Patients & Identifiers
    await prisma.patient.createMany({
        data: patients.map(p => ({
            id: p.id,
            organizationId: demoOrg.id,
            status: "ACTIVE",
            systemLabel: p.systemLabel,
            notes: p.notes
        }))
    })

    await prisma.patientIdentifier.createMany({
        data: patients.map(p => ({
            patientId: p.id,
            organizationId: demoOrg.id,
            ehrPatientId: `EHR-${p.systemLabel}`,
            birthYear: p.birthYear,
            sourceSystem: "DEMO_GEN"
        }))
    })

    // 5. Flatten & Prepare Encounters, Injections, Goals, Outcomes
    const membershipIds = [ownerMembership.id, providerMembership.id]
    
    const encounterPayload: Prisma.EncounterCreateManyInput[] = []
    const injectionPayload: Prisma.InjectionCreateManyInput[] = []
    const goalPayload: Prisma.TreatmentGoalCreateManyInput[] = []
    const outcomePayload: Prisma.GoalOutcomeCreateManyInput[] = []

    for (const e of encounters) {
        const mId = membershipIds[Math.floor(Math.random() * membershipIds.length)]
        const unitsPerMl = e.vialSize / e.dilution

        encounterPayload.push({
            id: e.id,
            organizationId: demoOrg.id,
            patientId: e.patientId,
            createdByMembershipId: mId,
            providerMembershipId: mId,
            encounterAt: e.date,
            encounterLocalDate: e.date,
            status: e.status,
            indication: e.indication,
            treatmentSite: e.treatmentSite,
            totalUnits: new Prisma.Decimal(e.totalUnits),
            dilutionText: `${e.vialSize}U in ${e.dilution}ml`,
            dilutionUnitsPerMl: new Prisma.Decimal(unitsPerMl),
            effectNotes: "Standard treatment cycle. Patient reported stable effect.",
            adverseEventNotes: "keine"
        })

        e.injections.forEach((inj) => {
            injectionPayload.push({
                organizationId: demoOrg.id,
                encounterId: e.id,
                muscleId: inj.muscleId,
                side: inj.side,
                units: new Prisma.Decimal(inj.units),
                volumeMl: new Prisma.Decimal(inj.units / unitsPerMl)
            })
        })

        e.goals.forEach((g) => {
            goalPayload.push({
                id: g.id,
                encounterId: e.id,
                category: g.category,
                description: g.description
            })
        })

        e.goalOutcomes.forEach((o) => {
            outcomePayload.push({
                assessmentEncounterId: e.id,
                goalId: o.goalId,
                score: o.score,
                notes: o.notes
            })
        })
    }

    // 6. Execute Batch Insertions in Strict Dependency Order
    // Chunking to 500 records per query to be safe with DB limits
    const CHUNK_SIZE = 500

    for (let i = 0; i < encounterPayload.length; i += CHUNK_SIZE) {
        await prisma.encounter.createMany({ data: encounterPayload.slice(i, i + CHUNK_SIZE) })
    }
    for (let i = 0; i < injectionPayload.length; i += CHUNK_SIZE) {
        await prisma.injection.createMany({ data: injectionPayload.slice(i, i + CHUNK_SIZE) })
    }
    for (let i = 0; i < goalPayload.length; i += CHUNK_SIZE) {
        await prisma.treatmentGoal.createMany({ data: goalPayload.slice(i, i + CHUNK_SIZE) })
    }
    for (let i = 0; i < outcomePayload.length; i += CHUNK_SIZE) {
        await prisma.goalOutcome.createMany({ data: outcomePayload.slice(i, i + CHUNK_SIZE) })
    }

    // Set preference cookie to land in this demo org
    const cookieStore = await cookies()
    cookieStore.set("injexpro_org_id", demoOrg.id, {
        path: "/",
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 365 
    })

    revalidatePath("/dashboard")
    return { success: true, organizationId: demoOrg.id }
}
