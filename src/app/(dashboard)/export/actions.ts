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
