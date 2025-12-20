'use server'

import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export async function getExportData() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: treatments, error } = await supabase
    .from('treatments')
    .select(`
      *,
      patients (patient_code, birth_year),
      followups (followup_date, outcome)
    `)
    .order('treatment_date', { ascending: false })

  if (error) {
    console.error('Error fetching export data:', error)
    return []
  }

  return treatments
}

export async function getResearchExportData() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  // Fetch injections with related treatment, patient, and assessments info
  const { data: injections, error } = await supabase
    .from('injections')
    .select(`
      id,
      muscle,
      side,
      units,
      muscles:muscle (name),
      treatments!inner (
        id,
        treatment_date,
        treatment_site,
        indication,
        product,
        dilution,
        user_id,
        patients (patient_code, birth_year),
        followups (id)
      ),
      injection_assessments (
        scale,
        timepoint,
        value_text,
        value_num
      )
    `)
    .order('treatments(treatment_date)', { ascending: false })

  if (error) {
    console.error('Error fetching research export data:', error)
    return []
  }

  // Transform to flat structure
  const flatData = injections.map((inj: any) => {
    const treatment = inj.treatments
    const patient = treatment.patients
    const assessments = inj.injection_assessments || []

    const masBaseline = assessments.find((a: any) => a.scale === 'MAS' && a.timepoint === 'baseline')
    const masPeak = assessments.find((a: any) => a.scale === 'MAS' && a.timepoint === 'peak_effect')

    return {
      user_id: treatment.user_id,
      patient_code: patient?.patient_code || 'UNKNOWN',
      treatment_id: treatment.id,
      treatment_date: treatment.treatment_date,
      indication: treatment.indication,
      product: treatment.product,
      dilution: treatment.dilution || 'N/A',
      injection_id: inj.id,
      muscle_id: inj.muscle,
      muscle_name: inj.muscles?.name || inj.muscle,
      side: inj.side,
      units: inj.units,
      followup_flag: treatment.followups && treatment.followups.length > 0 ? 1 : 0,
      MAS_baseline_text: masBaseline?.value_text || '',
      MAS_baseline_num: masBaseline?.value_num !== null ? masBaseline?.value_num : '',
      MAS_peak_text: masPeak?.value_text || '',
      MAS_peak_num: masPeak?.value_num !== null ? masPeak?.value_num : '',
    }
  })

  return flatData
}
