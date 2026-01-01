import { TreatmentsClient } from "./client"
import { getTreatments } from "./actions"
import { getPatients } from "../patients/actions"

export default async function TreatmentsPage() {
  const treatments = await getTreatments()
  const patientsRaw = await getPatients()

  // Map Subject[] to PatientOption[]
  const patients = patientsRaw.map(p => ({
    id: p.id,
    patient_code: p.patient_code
  }))

  return (
    <TreatmentsClient 
      initialTreatments={treatments} 
      patients={patients} 
    />
  )
}
