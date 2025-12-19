'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'


export async function getPatients() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  
  const { data, error } = await supabase
    .from('patients')
    .select('id, patient_code')
    .order('patient_code')
    
  if (error) {
    console.error('Error fetching patients:', error)
    return []
  }
  
  return data
}

export async function createPatient(formData: FormData) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const patient_code = formData.get('patient_code') as string
  const birth_year = parseInt(formData.get('birth_year') as string)
  
  // Basic validation
  if (!patient_code || !birth_year) {
    throw new Error("Missing required fields")
  }

  const { error } = await supabase
    .from('patients')
    .insert({
      patient_code,
      birth_year,
      notes: '', // Default empty notes
      // id is auto-generated
    })

  if (error) {
    console.error('Error creating patient:', error)
    throw new Error('Failed to create patient')
  }

  revalidatePath('/patients')
}
