'use server'

import { revalidatePath } from 'next/cache'
import { getOrganizationContext } from "@/lib/auth-context"
import prisma from "@/lib/prisma"
import { BodySide, Timepoint } from "@/generated/client/client"

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
}

export async function updateTreatment(treatmentId: string, formData: UpdateTreatmentFormData) {
  const { organizationId } = await getOrganizationContext()

  const {
    subject_id,
    date,
    location,
    category,
    product_label,
    notes,
    steps
  } = formData

  let total_units = 0
  if (steps && Array.isArray(steps)) {
    total_units = steps.reduce((sum: number, step: ProcedureStep) => sum + (step.numeric_value || 0), 0)
  }
  
  if (total_units <= 0) {
    return { error: "Total units must be greater than 0. Please add at least one injection step." }
  }

  // Transaction: Update Encounter + Replace Injections
  await prisma.$transaction(async (tx) => {
    // 1. Verify existence & Update main fields
    const encounter = await tx.encounter.findUnique({
      where: { id: treatmentId, organizationId }
    })
    
    if (!encounter) {
      throw new Error("Treatment not found or access denied")
    }

    // Handle Product
    let productId: string | null = encounter.productId // keep existing if not changed, or logic below
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
        patientId: subject_id, // technically shouldn't change often but allowed
        encounterAt: date,
        encounterLocalDate: date,
        treatmentSite: location || "N/A",
        indication: category,
        productId,
        totalUnits: total_units,
        effectNotes: notes,
        updatedAt: new Date()
      }
    })

    // 2. Replace Injections (Delete all old, Create new)
    // Note: This also deletes related InjectionAssessments via Cascade if configured in DB.
    // Our DB schema has ON DELETE CASCADE for Injection -> Encounter? 
    // Wait, Injection -> Encounter is CASCADE. But here we delete Injections directly.
    // InjectionAssessment -> Injection is CASCADE.
    await tx.injection.deleteMany({
      where: { encounterId: treatmentId }
    })

    if (steps && steps.length > 0) {
      const injectionsCreate = steps.map(step => {
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

        return {
          organizationId,
          encounterId: treatmentId, // Link to existing encounter
          muscleId: step.muscle_id,
          side: side,
          units: step.numeric_value,
          injectionAssessments: {
             create: injAssessments
          }
        }
      })
      
      // We cannot use createMany with nested creates (injectionAssessments).
      // So we map promise array.
      for (const inj of injectionsCreate) {
        await tx.injection.create({
          data: inj
        })
      }
    }
  })

  revalidatePath(`/treatments/${treatmentId}`)
  revalidatePath(`/patients/${subject_id}`)
  
  return { success: true, patientId: subject_id }
}