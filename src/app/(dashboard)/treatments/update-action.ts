'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

interface ProcedureStep {
  muscle_id: string; // Renamed from target_structure
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
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const {
    subject_id,
    date,
    location,
    category,
    product_label,
    notes,
    steps
  } = formData

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('User not authenticated')
  }

  const patient_id = subject_id
  const treatment_date = date
  const treatment_site = location || "N/A"
  const indication = category
  const product = product_label
  const effect_notes = notes || ""
  
  let total_units = 0
  if (steps && Array.isArray(steps)) {
    total_units = steps.reduce((sum: number, step: ProcedureStep) => sum + (step.numeric_value || 0), 0)
  }
  
  if (total_units <= 0) {
    throw new Error("Total units must be greater than 0.")
  }

  // Update treatment record
  const { error: treatmentError } = await supabase
    .from('treatments')
    .update({
      patient_id,
      treatment_date,
      treatment_site,
      indication,
      product,
      total_units,
      effect_notes,
      updated_at: new Date().toISOString(),
    })
    .eq('id', treatmentId)
    .eq('user_id', user.id)

  if (treatmentError) {
    console.error('Error updating treatment:', treatmentError)
    throw new Error(`Failed to update treatment: ${treatmentError.message}`)
  }

  // Handle injections: simpler to delete all and recreate for now (transactionally ideal, but step-by-step here)
  // 1. Delete existing
  const { error: deleteError } = await supabase
    .from('injections')
    .delete()
    .eq('treatment_id', treatmentId)
  
  if (deleteError) {
     console.error('Error deleting old injections:', deleteError)
     throw new Error('Failed to update injection details')
  }

  // 2. Insert new
  if (steps && Array.isArray(steps) && steps.length > 0) {
    // Validate muscles exist (global lookup, no user_id)
    const muscleIds = [...new Set(steps.map(s => s.muscle_id))]
    const { data: validMuscles, error: validationError } = await supabase
      .from('muscles')
      .select('id')
      .in('id', muscleIds)

    if (validationError || !validMuscles || validMuscles.length !== muscleIds.length) {
      console.error('Muscle validation failed:', validationError)
      throw new Error('Invalid muscle selection detected.')
    }

    const injectionsToInsert = steps.map((step: ProcedureStep) => {
      let sideCode = 'B';
      switch (step.side) {
        case 'Left': sideCode = 'L'; break;
        case 'Right': sideCode = 'R'; break;
        case 'Bilateral': sideCode = 'B'; break;
        case 'Midline': sideCode = 'B'; break;
        default: sideCode = 'B';
      }

      return {
        user_id: user.id,
        treatment_id: treatmentId,
        muscle: step.muscle_id, // Map muscle_id to muscle column
        side: sideCode,
        units: step.numeric_value,
      };
    })

    const { data: insertedInjections, error: injectionsError } = await supabase
      .from('injections')
      .insert(injectionsToInsert)
      .select()

    if (injectionsError) {
      console.error('Error creating injections:', injectionsError)
      throw new Error(`Failed to update injections: ${injectionsError.message}`)
    }

    // Insert injection assessments (MAS scores)
    const injectionAssessmentsToInsert: any[] = []
    
    steps.forEach((step, index) => {
       // Assuming order is preserved, which is typical for single-batch inserts in Supabase
       const injectionId = insertedInjections[index].id
       
       if (step.mas_baseline) {
           const valText = step.mas_baseline
           const valNum = valText === "1+" ? 1.5 : parseFloat(valText)
           injectionAssessmentsToInsert.push({
               user_id: user.id,
               injection_id: injectionId,
               scale: 'MAS',
               timepoint: 'baseline',
               value_text: valText,
               value_num: isNaN(valNum) ? null : valNum
           })
       }

       if (step.mas_peak) {
           const valText = step.mas_peak
           const valNum = valText === "1+" ? 1.5 : parseFloat(valText)
           injectionAssessmentsToInsert.push({
               user_id: user.id,
               injection_id: injectionId,
               scale: 'MAS',
               timepoint: 'peak_effect',
               value_text: valText,
               value_num: isNaN(valNum) ? null : valNum
           })
       }
    })

    if (injectionAssessmentsToInsert.length > 0) {
        const { error: injAssessError } = await supabase
            .from('injection_assessments')
            .insert(injectionAssessmentsToInsert)
        
        if (injAssessError) {
            console.error('Error creating injection assessments:', injAssessError)
        }
    }
  }

  revalidatePath(`/treatments/${treatmentId}`)
  revalidatePath(`/patients/${patient_id}`)
  redirect(`/patients/${patient_id}`)
}
