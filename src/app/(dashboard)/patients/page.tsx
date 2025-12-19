import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { PatientsClient } from "./client"

export default async function PatientsPage() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: patients } = await supabase
    .from('patients')
    .select('id, patient_code, birth_year, notes')
    .order('created_at', { ascending: false })

  // Transform data to match Subject interface (add missing optional fields if needed)
  const subjects = (patients || []).map(p => ({
    ...p,
    record_count: 0, // Placeholder as we don't have this yet
    last_activity: null // Placeholder
  }))

  return (
    <PatientsClient initialSubjects={subjects} />
  )
}
