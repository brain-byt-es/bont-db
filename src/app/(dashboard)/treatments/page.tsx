import { TreatmentsClient } from "./client"
import { getTreatments } from "./actions"
import { getPatients } from "../patients/actions"
import { getOrganizationContext } from "@/lib/auth-context"
import { OrganizationPreferences } from "@/components/record-form"

export default async function TreatmentsPage() {
  const [treatments, patientsRaw, ctx] = await Promise.all([
      getTreatments(),
      getPatients(),
      getOrganizationContext()
  ])

  // Map Subject[] to PatientOption[]
  const patients = patientsRaw.map(p => ({
    id: p.id,
    patient_code: p.patient_code
  }))

    return (

      <TreatmentsClient 

        initialTreatments={treatments} 

        patients={patients} 

        usageLimitReached={false}

        organization={{

          name: ctx?.organization.name,

          preferences: ctx?.organization.preferences as unknown as OrganizationPreferences

        }}

      />

    )

  }

  