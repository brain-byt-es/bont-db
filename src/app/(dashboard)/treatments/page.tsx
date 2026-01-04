import { TreatmentsClient } from "./client"
import { getTreatments } from "./actions"
import { getPatients } from "../patients/actions"
import { getOrganizationContext } from "@/lib/auth-context"
import { checkPlan } from "@/lib/permissions"
import prisma from "@/lib/prisma"
import { Plan } from "@/generated/client/enums"
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

  // Usage Wall Check
  const isPro = checkPlan(ctx?.organization.plan as Plan, Plan.PRO)
  let limitReached = false
  if (!isPro) {
      const count = await prisma.encounter.count({
          where: { organizationId: ctx?.organizationId }
      })
      limitReached = count >= 100
  }

  return (
    <TreatmentsClient 
      initialTreatments={treatments} 
      patients={patients} 
      usageLimitReached={limitReached}
      organization={{
        preferences: ctx?.organization.preferences as unknown as OrganizationPreferences
      }}
    />
  )
}