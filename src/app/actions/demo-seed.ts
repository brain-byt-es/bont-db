"use server"

import prisma from "@/lib/prisma"
import { Prisma } from "@/generated/client/client"
import { generateDemoData } from "@/lib/demo-data-generator"
import { 
    OrganizationStatus, 
    MembershipRole, 
    MembershipStatus, 
    Region, 
    Plan,
    GoalCategory
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

    // Ensure User exists (handling DB resets)
    const user = await prisma.user.upsert({
        where: { id: session.user.id },
        update: {},
        create: {
            id: session.user.id,
            email: session.user.email || `demo-user-${session.user.id.slice(0,5)}@example.com`,
            displayName: session.user.name || "Demo User",
            emailVerified: new Date()
        }
    })

    // 2. Create Memberships & ghost users
    const ownerMembership = await prisma.organizationMembership.create({
        data: {
            organizationId: demoOrg.id,
            userId: user.id,
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

    // 4. Create Products for the Demo Org
    const productNames = ["Botox", "Xeomin", "Dysport", "Myobloc"]
    const products = await Promise.all(
        productNames.map(name => 
            prisma.product.create({
                data: {
                    organizationId: demoOrg.id,
                    name,
                    manufacturer: name === "Botox" ? "Allergan" : name === "Xeomin" ? "Merz" : "Ipsen"
                }
            })
        )
    )

    // 5. Batch Create Patients & Identifiers
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

    // 6. Flatten & Prepare Encounters, Injections, Goals, Assessments
    const membershipIds = [ownerMembership.id, providerMembership.id]
    
    const encounterPayload: Prisma.EncounterCreateManyInput[] = []
    const injectionPayload: Prisma.InjectionCreateManyInput[] = []
    const goalPayload: Prisma.TreatmentGoalCreateManyInput[] = []
    const goalAssessmentPayload: Prisma.GoalAssessmentCreateManyInput[] = []
    const injectionAssessmentPayload: Prisma.InjectionAssessmentCreateManyInput[] = []
    const followupPayload: Prisma.FollowupCreateManyInput[] = []
    const targetedGoalsLinks: { A: string, B: string }[] = []
    const seenGoalIds = new Set<string>()

    interface DemoGoal {
        id: string
        category: GoalCategory
        description: string
    }

    interface DemoOutcome {
        goalId: string
        score: number
        notes: string | null
    }

    for (const e of encounters) {
        const mId = membershipIds[Math.floor(Math.random() * membershipIds.length)]
        const unitsPerMl = e.vialSize / e.dilution
        const productId = products.find(p => p.name === e.product)?.id

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
            productId: productId,
            totalUnits: new Prisma.Decimal(e.totalUnits),
            dilutionText: `${e.vialSize}U in ${e.dilution}ml`,
            dilutionUnitsPerMl: new Prisma.Decimal(unitsPerMl),
            effectNotes: "Standard treatment cycle. Patient reported stable effect.",
            adverseEventNotes: "keine"
        })

        if (e.followup) {
            followupPayload.push({
                id: crypto.randomUUID(),
                encounterId: e.id,
                followupDate: e.followup.date,
                outcome: e.followup.outcome
            })
        }

        e.injections.forEach((inj) => {
            injectionPayload.push({
                id: inj.id,
                organizationId: demoOrg.id,
                encounterId: e.id,
                muscleId: inj.muscleId,
                side: inj.side,
                units: new Prisma.Decimal(inj.units),
                volumeMl: new Prisma.Decimal(inj.units / unitsPerMl)
            })

            // Seed MAS Assessments if present
            if (inj.masBaseline !== undefined) {
                injectionAssessmentPayload.push({
                    id: crypto.randomUUID(),
                    injectionId: inj.id,
                    timepoint: "baseline",
                    scale: "MAS",
                    valueText: inj.masBaseline.toString(),
                    valueNum: new Prisma.Decimal(inj.masBaseline)
                })
            }
            if (inj.masPeak !== undefined) {
                injectionAssessmentPayload.push({
                    id: crypto.randomUUID(),
                    injectionId: inj.id,
                    timepoint: "peak_effect",
                    scale: "MAS",
                    valueText: inj.masPeak.toString(),
                    valueNum: new Prisma.Decimal(inj.masPeak)
                })
            }
        })

        e.goals.forEach((g: DemoGoal) => {
            if (!seenGoalIds.has(g.id)) {
                goalPayload.push({
                    id: g.id,
                    patientId: e.patientId,
                    organizationId: demoOrg.id,
                    category: g.category,
                    description: g.description,
                    indication: e.indication
                })
                seenGoalIds.add(g.id)
            }
            // Link to encounter
            targetedGoalsLinks.push({ A: e.id, B: g.id })
        })

        e.goalOutcomes.forEach((o: DemoOutcome) => {
            goalAssessmentPayload.push({
                id: crypto.randomUUID(),
                encounterId: e.id,
                goalId: o.goalId,
                score: o.score,
                notes: o.notes,
                assessedByMembershipId: mId
            })
        })
    }

    // 7. Execute Batch Insertions in Strict Dependency Order
    const CHUNK_SIZE = 500

    for (let i = 0; i < encounterPayload.length; i += CHUNK_SIZE) {
        await prisma.encounter.createMany({ data: encounterPayload.slice(i, i + CHUNK_SIZE) })
    }
    for (let i = 0; i < injectionPayload.length; i += CHUNK_SIZE) {
        await prisma.injection.createMany({ data: injectionPayload.slice(i, i + CHUNK_SIZE) })
    }
    for (let i = 0; i < injectionAssessmentPayload.length; i += CHUNK_SIZE) {
        await prisma.injectionAssessment.createMany({ data: injectionAssessmentPayload.slice(i, i + CHUNK_SIZE) })
    }
    for (let i = 0; i < goalPayload.length; i += CHUNK_SIZE) {
        await prisma.treatmentGoal.createMany({ data: goalPayload.slice(i, i + CHUNK_SIZE) })
    }
    for (let i = 0; i < goalAssessmentPayload.length; i += CHUNK_SIZE) {
        await prisma.goalAssessment.createMany({ data: goalAssessmentPayload.slice(i, i + CHUNK_SIZE) })
    }
    for (let i = 0; i < followupPayload.length; i += CHUNK_SIZE) {
        await prisma.followup.createMany({ data: followupPayload.slice(i, i + CHUNK_SIZE) })
    }

    // 8. Populate Many-to-Many Join Table (Raw SQL for implicit compatibility)
    if (targetedGoalsLinks.length > 0) {
        for (let i = 0; i < targetedGoalsLinks.length; i += CHUNK_SIZE) {
            const chunk = targetedGoalsLinks.slice(i, i + CHUNK_SIZE)
            const values = chunk.map(link => `('${link.A}', '${link.B}')`).join(",")
            await prisma.$executeRawUnsafe(`INSERT INTO "_EncounterTargetedGoals" ("A", "B") VALUES ${values} ON CONFLICT DO NOTHING`)
        }
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
