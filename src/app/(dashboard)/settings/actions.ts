'use server'

import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

export async function updateComplianceSettings(enabled: boolean) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase.auth.updateUser({
    data: { enable_compliance_views: enabled }
  })

  if (error) {
    console.error('Error updating settings:', error)
    throw new Error('Failed to update settings')
  }

  revalidatePath('/')
}

export async function getComplianceSettings() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: { user } } = await supabase.auth.getUser()
  
  return {
    enable_compliance_views: user?.user_metadata?.enable_compliance_views || false
  }
}
