"use server"

import { revalidatePath } from 'next/cache'
import { getOrganizationContext } from "@/lib/auth-context"
import prisma from "@/lib/prisma"
import { BodySide, Timepoint, EncounterStatus, Prisma } from "@/generated/client/client"
import { PERMISSIONS, requirePermission } from "@/lib/permissions"
import { getDoseSuggestions, CLINICAL_PROTOCOLS } from "@/lib/dose-engine"
import { logAuditAction } from "@/lib/audit-logger"

interface AssessmentData {
  scale: string;
  timepoint: string;
  value: number;
  assessed_at: Date;
  notes?: string;
}

interface ProcedureStep {
  muscle_id: string; 
  side: 'Left' | 'Right' | 'Bilateral' | 'Midline';
  numeric_value: number;
  volume_ml?: number;
  mas_baseline?: string;
  mas_peak?: string;
}

interface GoalAssessmentData {
  goalId: string;
  score: number;
  notes?: string | null;
}

interface CreateTreatmentFormData {
  subject_id: string;
  date: Date;
  location: string;
  category: string;
  diagnosis_id?: string;
  product_label: string;
  vial_size?: number;
  dilution_ml?: number;
  notes?: string;
  is_supervised?: boolean;
  supervisor_name?: string;
  steps?: ProcedureStep[];
  assessments?: AssessmentData[];
  status?: "DRAFT" | "SIGNED";
  
  // Longitudinal Goals
  targetedGoalIds?: string[];
  goalAssessments?: GoalAssessmentData[];
}

export async function createTreatment(formData: CreateTreatmentFormData) {
  const ctx = await getOrganizationContext()
  if (!ctx) throw new Error("No organization context")
  const { organizationId, membership } = ctx

  requirePermission(membership.role, PERMISSIONS.WRITE_TREATMENTS)

  const {
    subject_id,
    date,
    location,
    category,
    diagnosis_id,
    product_label,
    vial_size = 100,
    dilution_ml = 2.5,
    notes,
    is_supervised = false,
    supervisor_name,
    steps,
    assessments,
    status = "DRAFT",
    targetedGoalIds,
    goalAssessments
  } = formData

  const unitsPerMl = vial_size / dilution_ml

  // Calculate total units
  let total_units = 0
  if (steps && Array.isArray(steps)) {
    total_units = steps.reduce((sum: number, step: ProcedureStep) => sum + (step.numeric_value || 0), 0)
  }

  if (total_units <= 0) {
    return { error: "Total units must be greater than 0. Please add at least one injection step." }
  }
  
  // Prepare Injections Nested Create
  const injectionsCreate = (steps || []).map(step => {
    let side: BodySide = BodySide.B;
    if (step.side === 'Left') side = BodySide.L;
    if (step.side === 'Right') side = BodySide.R;
    
    // Prepare Injection Assessments (MAS)
    const injAssessments = []
    
    if (step.mas_baseline) {
       const valNum = step.mas_baseline === "1+" ? 1.5 : parseFloat(step.mas_baseline)
       injAssessments.push({
           scale: 'MAS',
           timepoint: Timepoint.baseline,
           valueText: step.mas_baseline,
           valueNum: isNaN(valNum) ? null : valNum
       })
    }

    if (step.mas_peak) {
       const valText = step.mas_peak
       const valNum = valText === "1+" ? 1.5 : parseFloat(valText)
       injAssessments.push({
           scale: 'MAS',
           timepoint: Timepoint.peak_effect,
           valueText: valText,
           valueNum: isNaN(valNum) ? null : valNum
       })
    }

    return {
      organizationId,
      muscleId: step.muscle_id,
      side: side,
      units: step.numeric_value,
      volumeMl: step.volume_ml || (step.numeric_value / unitsPerMl),
      injectionAssessments: {
        create: injAssessments
      }
    }
  })

  // Prepare Encounter Assessments Nested Create
  const assessmentsCreate = (assessments || []).map(a => ({
    timepoint: mapTimepoint(a.timepoint),
    assessedAt: new Date(a.assessed_at),
    scale: a.scale,
    valueNum: a.value,
    notes: a.notes,
    valueText: a.value.toString()
  }))

  // Handle Product Lookup/Creation
  let productId: string | null = null
  if (product_label) {
    const product = await prisma.product.upsert({
      where: {
        organizationId_name: {
          organizationId,
          name: product_label
        }
      },
      update: {},
      create: {
        organizationId,
        name: product_label
      }
    })
    productId = product.id
  }

  // Create Encounter with ALL nested data
  const encounter = await prisma.encounter.create({
    data: {
      organizationId,
      patientId: subject_id,
      createdByMembershipId: membership.id,
      providerMembershipId: membership.id, 
      encounterAt: date,
      encounterLocalDate: date,
      status: status === "SIGNED" ? EncounterStatus.SIGNED : EncounterStatus.DRAFT,
      treatmentSite: location || "N/A",
      indication: category,
      productId: productId,
      
      // Certification
      isSupervised: is_supervised,
      supervisorName: supervisor_name,
      
      dilutionText: `${vial_size}U in ${dilution_ml}ml`,
      dilutionUnitsPerMl: unitsPerMl,
      totalUnits: total_units,
      effectNotes: notes,
      adverseEventNotes: "keine",
      
      injections: {
        create: injectionsCreate
      },
      assessments: {
        create: assessmentsCreate
      },
      diagnoses: diagnosis_id ? {
        create: {
            diagnosisId: diagnosis_id
        }
      } : undefined,

      // GAS - Connect targeted goals
      targetedGoals: targetedGoalIds ? {
        connect: targetedGoalIds.map(id => ({ id }))
      } : undefined,

      // GAS - Create assessments
      goalAssessments: goalAssessments ? {
        create: goalAssessments.map(ga => ({
            goalId: ga.goalId,
            score: ga.score,
            notes: ga.notes,
            assessedByMembershipId: ctx.membership.id
        }))
      } : undefined
    }
  })

  await logAuditAction(ctx, "TREATMENT_CREATED", "Encounter", encounter.id, { patientId: subject_id, totalUnits: total_units })

  revalidatePath('/patients')
  revalidatePath(`/patients/${subject_id}`)
  
  return { success: true, patientId: subject_id }
}

function mapTimepoint(t: string): Timepoint {
  switch(t) {
    case 'baseline': return Timepoint.baseline
    case 'peak_effect': return Timepoint.peak_effect
    case 'reinjection': return Timepoint.reinjection
    case 'followup': return Timepoint.followup
    default: return Timepoint.other
  }
}

export async function getMuscles() {
  const muscles = await prisma.muscle.findMany({
    orderBy: { sortOrder: 'asc' }
  })
  return muscles.map(m => ({
    ...m,
    region_id: m.regionId,
    sort_order: m.sortOrder
  }))
}

export async function getMuscleRegions() {
  const regions = await prisma.muscleRegion.findMany({
    orderBy: { sortOrder: 'asc' }
  })
  return regions.map(r => ({
    ...r,
    sort_order: r.sortOrder
  }))
}

export async function getTreatments() {
  const ctx = await getOrganizationContext()
  if (!ctx) throw new Error("No organization context")
  const { organizationId } = ctx

  const treatments = await prisma.encounter.findMany({
    where: {
      organizationId,
      status: { not: "VOID" }
    },
    include: {
      patient: {
        select: { systemLabel: true }
      },
      product: {
        select: { name: true }
      }
    },
    orderBy: {
      encounterAt: 'desc'
    }
  })

  // Map to UI interface
  return treatments.map(t => ({
    id: t.id,
    treatment_date: t.encounterLocalDate.toISOString(), // or encounterAt
    treatment_site: t.treatmentSite,
    indication: t.indication,
    product: t.product?.name || 'N/A', // Handle linked product
    total_units: t.totalUnits.toNumber(),
    status: t.status,
    patient: {
      patient_code: t.patient.systemLabel || 'Unknown'
    }
  }))
}

export async function getTreatment(treatmentId: string) {
  const ctx = await getOrganizationContext()
  if (!ctx) throw new Error("No organization context")
  const { organizationId } = ctx

  const treatment = await prisma.encounter.findUnique({
    where: {
      id: treatmentId,
      organizationId
    },
    include: {
      patient: {
        select: { 
          id: true,
          systemLabel: true 
        }
      },
      product: {
        select: { name: true }
      },
      injections: {
        include: {
          injectionAssessments: true
        }
      },
      assessments: true,
      targetedGoals: true,
      goalAssessments: {
        include: {
          goal: true
        }
      }
    }
  })

  if (!treatment) return null

  // Convert Decimals to numbers for client serialization
  return {
    ...treatment,
    totalUnits: treatment.totalUnits.toNumber(),
    dilutionUnitsPerMl: treatment.dilutionUnitsPerMl?.toNumber() ?? null,
    injections: treatment.injections.map(inj => ({
      ...inj,
      units: inj.units.toNumber(),
      volumeMl: inj.volumeMl?.toNumber() ?? null
    })),
    assessments: treatment.assessments.map(a => ({
      ...a,
      valueNum: a.valueNum?.toNumber() ?? null
    }))
  }
}

export async function getLatestTreatment(patientId: string) {
  const ctx = await getOrganizationContext()
  if (!ctx) throw new Error("No organization context")
  const { organizationId } = ctx

  const treatment = await prisma.encounter.findFirst({
    where: {
      patientId,
      organizationId
    },
    include: {
      product: { select: { name: true } },
      injections: {
        include: {
          injectionAssessments: true
        }
      },
      assessments: true,
      targetedGoals: true,
      goalAssessments: {
        include: {
          goal: true
        }
      }
    },
    orderBy: {
      encounterAt: 'desc'
    }
  })

  if (!treatment) return null

  // Map to legacy structure for RecordForm compatibility
  // AND convert Decimals to numbers
  return {
    ...treatment,
    totalUnits: treatment.totalUnits.toNumber(), // Convert totalUnits
    dilutionUnitsPerMl: treatment.dilutionUnitsPerMl?.toNumber() ?? null,
    product: treatment.product?.name || '',
    treatment_site: treatment.treatmentSite,
    indication: treatment.indication,
    effect_notes: treatment.effectNotes,
    injections: treatment.injections.map(inj => ({
      ...inj,
      units: inj.units.toNumber(), // Convert units
      volumeMl: inj.volumeMl?.toNumber() ?? null // Convert volumeMl
    })),
    assessments: treatment.assessments.map(a => ({
      ...a,
      valueNum: a.valueNum?.toNumber() ?? null // Convert assessment values
    }))
  }
}

/**
 * Get goals from the LAST SIGNED encounter for a patient.
 * Used for Goal Review in the new encounter.
 * REFATURED: Now returns patient goals that were targeted in the last session.
 */
export async function getPreviousGoalsAction(patientId: string) {
  const ctx = await getOrganizationContext()
  if (!ctx) throw new Error("No organization context")
  const { organizationId } = ctx

  const lastSigned = await prisma.encounter.findFirst({
    where: {
      patientId,
      organizationId,
      status: 'SIGNED'
    },
    orderBy: {
      encounterAt: 'desc'
    },
    include: {
      targetedGoals: true
    }
  })

  return lastSigned ? { goals: lastSigned.targetedGoals, date: lastSigned.encounterLocalDate } : null
}

/**
 * Advanced Dose Engine: Get suggestions for a specific patient and muscle.
 */
export async function getDoseSuggestionsAction(patientId: string, muscleId: string) {
  const ctx = await getOrganizationContext()
  if (!ctx) throw new Error("No organization context")
  
  return await getDoseSuggestions(ctx.organizationId, patientId, muscleId)
}

/**
 * Save a custom treatment protocol for the organization.
 */
export async function saveProtocolAction(name: string, indication: string, steps: ProcedureStep[]) {
  const ctx = await getOrganizationContext()
  if (!ctx) throw new Error("No organization context")
  
  requirePermission(ctx.membership.role, PERMISSIONS.MANAGE_ORGANIZATION)

    const protocol = await prisma.clinicalProtocol.create({
      data: {
        organizationId: ctx.organizationId,
        createdByUserId: ctx.membership.userId,
        name,
        indication,
        steps: steps.map(s => ({
            muscleId: s.muscle_id,
            units: s.numeric_value,
            side: s.side
        })) as unknown as Prisma.InputJsonValue
      }
    })
  
  await logAuditAction(ctx, "PROTOCOL_CREATED", "ClinicalProtocol", protocol.id, { name })
  return { success: true }
}

/**
 * Get all available protocols (Global + Custom) for an indication.
 */
export async function getProtocolsAction(indication: string) {
    const ctx = await getOrganizationContext()
    const globalProtocols = CLINICAL_PROTOCOLS.filter(p => p.indication === indication)
    
    if (!ctx) return globalProtocols

    const customProtocols = await prisma.clinicalProtocol.findMany({
        where: {
            organizationId: ctx.organizationId,
            indication
        },
        orderBy: { name: 'asc' }
    })

    const mappedCustom = customProtocols.map(p => ({
        id: p.id,
        name: p.name,
        indication: p.indication,
        isCustom: true,
        steps: (p.steps as Array<{ muscleId: string, units: number, side: string }>).map(s => ({
            muscleId: s.muscleId,
            units: s.units,
            side: s.side
        }))
    }))

    return [...globalProtocols, ...mappedCustom]
}
