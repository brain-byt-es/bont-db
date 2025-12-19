import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { notFound } from "next/navigation"
import PatientPage from "./client"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function Page({ params }: PageProps) {
  const { id } = await params
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  // Fetch patient
  const { data: patient, error: patientError } = await supabase
    .from('patients')
    .select('*')
    .eq('id', id)
    .single()

  if (patientError || !patient) {
    console.error("Error fetching patient:", patientError)
    notFound()
  }

  // Fetch treatments
  const { data: treatments, error: treatmentsError } = await supabase
    .from('treatments')
    .select('*')
    .eq('patient_id', id)
    .order('treatment_date', { ascending: false })

  if (treatmentsError) {
    console.error("Error fetching treatments:", treatmentsError)
  }

  return (
    <PatientPage
      patient={patient}
      treatments={treatments || []}
    />
  )
}