'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

interface ProcedureStep {
  target_structure: string;
  side: 'Left' | 'Right' | 'Bilateral' | 'Midline';
  numeric_value: number;
}

interface CreateTreatmentFormData {
  subject_id: string;
  date: Date;
  location: string;
  category: string;
  product_label: string;
  notes?: string;
  steps?: ProcedureStep[];
}

export async function createTreatment(formData: CreateTreatmentFormData) {
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
  const ae_notes = 'keine' // Default from schema
  const dilution = 'N/A' // Placeholder, should be added to form if needed
  const regions: string[] = [] // Placeholder, should be added to form if needed

  let total_units = 0
  if (steps && Array.isArray(steps)) {
    total_units = steps.reduce((sum: number, step: ProcedureStep) => sum + (step.numeric_value || 0), 0)
  }

  if (total_units <= 0) {
    throw new Error("Total units must be greater than 0. Please add at least one injection step.")
  }

  // Insert into treatments table
  const { data: treatment, error: treatmentError } = await supabase
    .from('treatments')
    .insert({
      user_id: user.id,
      patient_id,
      treatment_date,
      treatment_site,
      indication,
      product,
      dilution,
      total_units,
      regions,
      effect_notes,
      ae_notes,
    })
    .select()
    .single()

  if (treatmentError) {
    console.error('Error creating treatment:', treatmentError)
    throw new Error(`Failed to create treatment record: ${treatmentError.message}`)
  }

  // Insert into injections table
  if (steps && Array.isArray(steps) && steps.length > 0) {
    const injectionsToInsert = steps.map((step: ProcedureStep) => {
      let sideCode = 'B';
      switch (step.side) {
        case 'Left': sideCode = 'L'; break;
        case 'Right': sideCode = 'R'; break;
        case 'Bilateral': sideCode = 'B'; break;
        case 'Midline': sideCode = 'B'; break; // Fallback or assume B for now
        default: sideCode = 'B';
      }

      return {
        user_id: user.id,
        treatment_id: treatment.id,
        muscle: step.target_structure,
        side: sideCode,
        units: step.numeric_value,
        // volume_ml, notes - not in form currently, can add if needed
      };
    })

    const { error: injectionsError } = await supabase
      .from('injections')
      .insert(injectionsToInsert)

    if (injectionsError) {
      console.error('Error creating injections:', injectionsError)
      // Consider rolling back treatment if injections fail, or handle as partial success
      throw new Error(`Failed to create injections for treatment: ${injectionsError.message}`)
    }
  }

  revalidatePath('/patients') // Revalidate patient list if new treatment added
  redirect(`/patients/${patient_id}`) // Redirect to patient details page
}
