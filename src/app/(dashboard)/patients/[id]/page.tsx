import { notFound, redirect } from "next/navigation"
import PatientPage from "./client"
import { getOrganizationContext } from "@/lib/auth-context"
import prisma from "@/lib/prisma"
import { PatientPhiInclude, getBirthYear } from "@/phi/patient-phi"
import { OrganizationPreferences } from "@/app/(dashboard)/settings/actions"
import { getPatientGoalsAction } from "../goal-actions"
import { Goal } from "@/components/patient-goals-hub"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function Page({ params }: PageProps) {
  const { id } = await params
  const ctx = await getOrganizationContext()
  if (!ctx) redirect('/onboarding')
  const { organizationId } = ctx

  // Fetch patient and goals in parallel
  const [patient, goals] = await Promise.all([
    prisma.patient.findUnique({
        where: { id: id, organizationId: organizationId },
        include: { ...PatientPhiInclude }
    }),
    getPatientGoalsAction(id)
  ])

  if (!patient) {
    notFound()
  }

  // Fetch treatments
  const treatments = await prisma.encounter.findMany({
    where: {
      patientId: id,
      organizationId: organizationId,
      status: { not: "VOID" }
    },
    include: {
      product: { select: { name: true } }
    },
    orderBy: {
      encounterAt: 'desc'
    }
  })

  // Map to UI types
  const mappedPatient = {
    id: patient.id,
    notes: patient.notes,
    patient_code: patient.systemLabel || 'Unknown',
    birth_year: getBirthYear(patient),
    last_activity: treatments[0]?.encounterLocalDate.toISOString().split('T')[0]
  }

  const mappedTreatments = treatments.map(t => ({
    id: t.id,
    treatment_date: t.encounterLocalDate.toISOString(),
    treatment_site: t.treatmentSite,
    indication: t.indication,
    product: t.product?.name || 'N/A',
    total_units: t.totalUnits.toNumber(),
    status: t.status,
    patient: { patient_code: mappedPatient.patient_code }
  }))

  return (
    <PatientPage
      patient={mappedPatient}
      treatments={mappedTreatments}
      goals={goals as Goal[]}
      organization={{
        name: ctx.organization.name,
        preferences: {
          ...(ctx.organization.preferences as OrganizationPreferences | null),
          default_supervisor_name: ctx.membership.defaultSupervisorName || undefined
        }
      }}
    />
  )
}
