import { RecordForm } from "@/components/record-form"
import { OrganizationPreferences } from "@/app/(dashboard)/settings/actions"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { getPatients } from "../../patients/actions"
import { getOrganizationContext } from "@/lib/auth-context"
import { redirect } from "next/navigation"

export default async function NewTreatmentPage({
  searchParams,
}: {
  searchParams: Promise<{ subjectId?: string }>
}) {
  const { subjectId } = await searchParams
  const ctx = await getOrganizationContext()
  
  if (!ctx) {
    redirect("/onboarding")
  }

  const patientsRaw = await getPatients()
  const patients = patientsRaw.map(p => ({
    id: p.id,
    patient_code: p.patient_code
  }))

  return (
    <div className="mx-auto max-w-4xl p-4">
       <Card>
        <CardHeader>
          <CardTitle>New Treatment Record</CardTitle>
          <CardDescription>Enter details for the new procedure.</CardDescription>
        </CardHeader>
        <CardContent>
          <RecordForm 
            patients={patients} 
            defaultSubjectId={subjectId} 
            userRole={ctx.membership.role}
            organization={{
              name: ctx.organization.name,
              preferences: {
                  ...(ctx.organization.preferences as OrganizationPreferences | null),
                  default_supervisor_name: ctx.membership.defaultSupervisorName || undefined
              }
            }}
          />
        </CardContent>
       </Card>
    </div>
  )
}
