'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export async function deleteTreatment(treatmentId: string) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('User not authenticated')
  }

  // Delete associated injections first (though cascade might handle it, safer to be explicit or rely on FK cascade)
  // Assuming FK cascade is ON for injections -> treatment_id
  
  const { error } = await supabase
    .from('treatments')
    .delete()
    .eq('id', treatmentId)
    .eq('user_id', user.id) // Security: Ensure user owns the record

  if (error) {
    console.error('Error deleting treatment:', error)
    throw new Error(`Failed to delete treatment: ${error.message}`)
  }

  revalidatePath('/patients')
}
