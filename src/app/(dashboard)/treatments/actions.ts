"use server"

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { getOrganizationContext } from "@/lib/auth-context"
import prisma from "@/lib/prisma"
import { BodySide, Timepoint } from "@/generated/client/client"

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
  mas_baseline?: string;
  mas_peak?: string;
}

interface CreateTreatmentFormData {
  subject_id: string;
  date: Date;
  location: string;
  category: string;
  product_label: string;
  notes?: string;
  steps?: ProcedureStep[];
  assessments?: AssessmentData[];
}

export async function createTreatment(formData: CreateTreatmentFormData) {
  const { organizationId, membership } = await getOrganizationContext()

  const {
    subject_id,
    date,
    location,
    category,
    product_label,
    notes,
    steps,
    assessments
  } = formData

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

  // Derived Regions logic could be handled here or via trigger/app logic.
  // For now we rely on EncounterRegion model if we want to store them, 
  // but the current schema uses `EncounterRegion` table. 
  // We can populate it if needed, but let's stick to core data first.

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
  await prisma.encounter.create({
    data: {
      organizationId,
      patientId: subject_id,
      createdByMembershipId: membership.id,
      providerMembershipId: membership.id, // Assuming creator is provider for now
      encounterAt: date,
      encounterLocalDate: date,
      status: "SIGNED", // Default to signed/completed for now
      treatmentSite: location || "N/A",
      indication: category,
      productId: productId,
      
      dilutionText: "N/A",
      totalUnits: total_units,
      effectNotes: notes,
      adverseEventNotes: "keine",
      
      injections: {
        create: injectionsCreate
      },
      assessments: {
        create: assessmentsCreate
      }
    }
  })

  revalidatePath('/patients')
  redirect(`/patients/${subject_id}`)
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
  const { organizationId } = await getOrganizationContext()

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
    patient: {
      patient_code: t.patient.systemLabel || 'Unknown'
    }
  }))
}

export async function getTreatment(treatmentId: string) {
  const { organizationId } = await getOrganizationContext()

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
      assessments: true
    }
  })

  if (!treatment) return null

  // Convert Decimals to numbers for client serialization
  return {
    ...treatment,
    totalUnits: treatment.totalUnits.toNumber(),
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



  const { organizationId } = await getOrganizationContext()







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



      assessments: true



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

