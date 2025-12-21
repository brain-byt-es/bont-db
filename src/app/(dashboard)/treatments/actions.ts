'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

interface AssessmentData {
  scale: string;
  timepoint: string;
  value: number;
  assessed_at: Date;
  notes?: string;
}

interface ProcedureStep {
  muscle_id: string; // Renamed from target_structure
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

interface MuscleData {
  region_id: string;
  muscle_regions: {
    name: string;
  };
}

interface InjectionAssessmentInsert {
  user_id: string;
  injection_id: string;
  scale: string;
  timepoint: string;
  value_text: string;
  value_num: number | null;
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
    steps,
    assessments
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
  
  // Derive regions from selected muscles
  let regions: string[] = []
  if (steps && Array.isArray(steps) && steps.length > 0) {
    const muscleIds = [...new Set(steps.map(s => s.muscle_id).filter(Boolean))]
    
    if (muscleIds.length > 0) {
        const { data: muscleData } = await supabase
            .from('muscles')
            .select('region_id, muscle_regions(name)')
            .in('id', muscleIds)
            .returns<MuscleData[]>()
        
        if (muscleData) {
            const regionNames = muscleData
                .map((m) => m.muscle_regions?.name)
                .filter(Boolean)
            regions = [...new Set(regionNames)]
        }
    }
  }

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
        case 'Midline': sideCode = 'B'; break; // Fallback or assume B for now
        default: sideCode = 'B';
      }

      return {
        user_id: user.id, // injections still have user_id
        treatment_id: treatment.id,
        muscle: step.muscle_id, // Map muscle_id to muscle column (FK)
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
      // Consider rolling back treatment if injections fail, or handle as partial success
      throw new Error(`Failed to create injections for treatment: ${injectionsError.message}`)
    }

    // Insert injection assessments (MAS scores)
    const injectionAssessmentsToInsert: InjectionAssessmentInsert[] = []
    
    steps.forEach((step, index) => {
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

  // Insert assessments
  if (assessments && Array.isArray(assessments) && assessments.length > 0) {
    const assessmentsToInsert = assessments.map((assessment) => ({
      user_id: user.id,
      treatment_id: treatment.id,
      timepoint: assessment.timepoint,
      assessed_at: assessment.assessed_at,
      scale: assessment.scale,
      value: assessment.value,
      notes: assessment.notes
    }))

    const { error: assessmentError } = await supabase
      .from('assessments')
      .insert(assessmentsToInsert)

    if (assessmentError) {
      console.error('Error creating assessments:', assessmentError)
      // Log error but don't fail the whole transaction as treatment is created
    }
  }

  revalidatePath('/patients') // Revalidate patient list if new treatment added
  redirect(`/patients/${patient_id}`) // Redirect to patient details page
}

export async function getMuscles() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data, error } = await supabase
    .from('muscles')
    .select('*')
    .order('sort_order', { ascending: true })

  if (error) {
    console.error('Error fetching muscles:', error)
    return []
  }

  return data
}

export async function getMuscleRegions() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data, error } = await supabase
    .from('muscle_regions')
    .select('*')
    .order('sort_order', { ascending: true })

  if (error) {
    console.error('Error fetching muscle regions:', error)
    return []
  }

  return data
}

export async function getLatestTreatment(patientId: string) {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    const { data, error } = await supabase
        .from('treatments')
        .select(`
            *,
            injections (
                *,
                injection_assessments (*)
            ),
            assessments (*)
        `)
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

    if (error) {
        if (error.code !== 'PGRST116') { // PGRST116 is "The result contains 0 rows"
             console.error('Error fetching latest treatment:', error)
        }
        return null
    }

    return data
}
