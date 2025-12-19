import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { TreatmentsClient } from "./client"

interface PatientCode {
  patient_code: string;
}

interface Treatment {
  id: string;
  patient_id: string;
  treatment_date: string;
  treatment_site: string;
  indication: string;
  product: string;
  total_units: number;
}

interface TreatmentWithPatient extends Treatment {
  patients: PatientCode;
}

export default async function TreatmentsPage() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  // Fetch treatments with patient info
  const { data: treatments, error: treatmentsError } = await supabase
    .from('treatments')
    .select('*, patients(patient_code)')
    .order('treatment_date', { ascending: false })

  if (treatmentsError) {
    console.error("Error fetching treatments:", treatmentsError)
  }

  // Fetch patients for the create dialog
  const { data: patients } = await supabase
    .from('patients')
    .select('id, patient_code')
    .order('patient_code', { ascending: true })

  // Transform data for the table
  const formattedTreatments = (treatments as unknown as TreatmentWithPatient[] || []).map((t) => ({
    id: t.id,
    treatment_date: t.treatment_date,
    treatment_site: t.treatment_site,
    indication: t.indication,
    product: t.product,
    total_units: t.total_units,
    patient: t.patients 
  }))

  return (
    <TreatmentsClient 
      initialTreatments={formattedTreatments} 
      patients={patients || []} 
    />
  )
}
