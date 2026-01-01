import { PatientsClient } from "./client"
import { getPatients } from "./actions"

export default async function PatientsPage() {
  const subjects = await getPatients()

  return (
    <PatientsClient initialSubjects={subjects} />
  )
}
