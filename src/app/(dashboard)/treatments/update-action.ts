'use server'

import { revalidatePath } from 'next/cache'
import { getOrganizationContext } from "@/lib/auth-context"
import prisma from "@/lib/prisma"
import { BodySide, Timepoint, EncounterStatus } from "@/generated/client/client"
import { PERMISSIONS, requirePermission } from "@/lib/permissions"

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

interface UpdateTreatmentFormData {
  subject_id: string;
  date: Date;
  location: string;
  category: string;
  product_label: string;
  notes?: string;
  steps?: ProcedureStep[];
  assessments?: AssessmentData[];
  status?: "DRAFT" | "SIGNED";
}

export async function updateTreatment(treatmentId: string, formData: UpdateTreatmentFormData) {
  const ctx = await getOrganizationContext()
  if (!ctx) throw new Error("No organization context")
  const { organizationId, membership } = ctx

  requirePermission(membership.role, PERMISSIONS.WRITE_TREATMENTS)

  const {
    subject_id,
    date,
    location,
    category,
    product_label,
    notes,
    steps,
    assessments,
    status
  } = formData

  let total_units = 0
  if (steps && Array.isArray(steps)) {
    total_units = steps.reduce((sum: number, step: ProcedureStep) => sum + (step.numeric_value || 0), 0)
  }
  
  if (total_units <= 0) {
    return { error: "Total units must be greater than 0. Please add at least one injection step." }
  }

  // Transaction: Update Encounter + Replace Injections & Assessments
  await prisma.$transaction(async (tx) => {
    // 1. Verify existence & Update main fields
    const encounter = await tx.encounter.findUnique({
      where: { id: treatmentId, organizationId }
    })
    
    if (!encounter) {
      throw new Error("Treatment not found or access denied")
    }

    if (encounter.status === "SIGNED") {
      throw new Error("This treatment is signed and cannot be edited. Please re-open it first.")
    }

    // Handle Product
    let productId: string | null = encounter.productId
    if (product_label) {
         const product = await tx.product.upsert({
          where: {
            organizationId_name: { organizationId, name: product_label }
          },
          update: {},
          create: { organizationId, name: product_label }
        })
        productId = product.id
    }

    await tx.encounter.update({
      where: { id: treatmentId },
      data: {
        // patientId: subject_id, // IMMUTABLE field
        encounterAt: date,
        encounterLocalDate: date,
        treatmentSite: location || "N/A",
        indication: category,
        productId,
        status: status === "SIGNED" ? EncounterStatus.SIGNED : undefined,
        totalUnits: total_units,
        effectNotes: notes,
        updatedAt: new Date()
      }
    })

    // 2. Replace Injections (Delete all old, Create new)
    await tx.injection.deleteMany({
      where: { encounterId: treatmentId }
    })

    if (steps && steps.length > 0) {
      for (const step of steps) {
        let side: BodySide = BodySide.B;
        if (step.side === 'Left') side = BodySide.L;
        if (step.side === 'Right') side = BodySide.R;
        
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

        await tx.injection.create({
          data: {
            organizationId,
            encounterId: treatmentId,
            muscleId: step.muscle_id,
            side: side,
            units: step.numeric_value,
            injectionAssessments: {
               create: injAssessments
            }
          }
        })
      }
    }

    // 3. Replace Encounter Assessments
    await tx.assessment.deleteMany({
      where: { encounterId: treatmentId }
    })

    if (assessments && assessments.length > 0) {
      await tx.assessment.createMany({
        data: assessments.map(a => ({
          encounterId: treatmentId,
          timepoint: mapTimepoint(a.timepoint),
          assessedAt: new Date(a.assessed_at),
          scale: a.scale,
          valueNum: a.value,
          notes: a.notes,
          valueText: a.value.toString()
        }))
      })
    }
  })

  revalidatePath(`/treatments/${treatmentId}`)
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