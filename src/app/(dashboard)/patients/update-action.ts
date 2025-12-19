'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export async function updatePatient(patientId: string, formData: FormData) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const patient_code = formData.get('patient_code') as string
  const birth_year = parseInt(formData.get('birth_year') as string)
  const notes = formData.get('notes') as string
  
  // Basic validation
  if (!patient_code || !birth_year) {
    throw new Error("Missing required fields")
  }

  const { error } = await supabase
    .from('patients')
    .update({
      patient_code,
      birth_year,
      notes,
    })
    .eq('id', patientId)

  if (error) {
    console.error('Error updating patient:', error)
    throw new Error('Failed to update patient')
  }

  revalidatePath(`/patients/${patientId}`)
  revalidatePath('/patients')
}
