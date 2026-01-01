'use server'

import { revalidatePath } from 'next/cache'

// Note: Compliance settings were stored in Supabase Auth Metadata.
// In our new schema, we don't have a direct "user settings" JSON field yet.
// For now, we will treat this as a no-op or default to enabled/disabled.
// Future: Add 'settings' Json field to User or OrganizationMembership.

export async function updateComplianceSettings(enabled: boolean) {
  // TODO: Persist this preference to DB
  console.log("Update compliance settings:", enabled)
  revalidatePath('/')
}

export async function getComplianceSettings() {
  // Default to false for now until we add persistence
  return {
    enable_compliance_views: false
  }
}