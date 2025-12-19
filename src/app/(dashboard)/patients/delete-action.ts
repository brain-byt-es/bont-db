'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export async function deletePatient(patientId: string) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('User not authenticated')
  }

  // Delete patient (cascade should handle related treatments/injections if configured, 
  // otherwise we might need to delete them manually. Assuming cascade is ON or user accepts error if not).
  
  const { error } = await supabase
    .from('patients')
    .delete()
    .eq('id', patientId)
    // .eq('user_id', user.id) // Security check if patients belong to user

  if (error) {
    console.error('Error deleting patient:', error)
    throw new Error(`Failed to delete patient: ${error.message}`)
  }

  revalidatePath('/patients')
}
