import { RecordForm } from "@/components/record-form"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { notFound } from "next/navigation"
import { getTreatment } from "../../actions"
import { getPatients } from "../../../patients/actions"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditTreatmentPage({ params }: PageProps) {
  const { id } = await params

  // Fetch treatment details
  const treatment = await getTreatment(id)

  if (!treatment) {
    notFound()
  }

  // Fetch all patients for the select list
  const patientsRaw = await getPatients()
  const patients = patientsRaw.map(p => ({
    id: p.id,
    patient_code: p.patient_code
  }))

  // Helper to find MAS scores
  const getMasScore = (injAssessments: { scale: string; timepoint: string; valueText: string }[], timepoint: string) => {
      const score = injAssessments?.find((a) => a.scale === 'MAS' && a.timepoint === timepoint)
      return score ? score.valueText : ""
  }

  // Transform data for the form
  const initialData = {
    subject_id: treatment.patientId,
    date: treatment.encounterLocalDate,
    location: treatment.treatmentSite,
    category: treatment.indication,
    product_label: treatment.product?.name || '',
    notes: treatment.effectNotes ?? undefined,
    assessments: treatment.assessments || [],
    steps: (treatment.injections || []).map((inj) => ({
      id: inj.id,
      muscle_id: inj.muscleId || '', 
      side: (inj.side === 'L' ? 'Left' : inj.side === 'R' ? 'Right' : inj.side === 'B' ? 'Bilateral' : 'Midline') as "Left" | "Right" | "Bilateral" | "Midline",
      numeric_value: inj.units.toNumber(),
      mas_baseline: getMasScore(inj.injectionAssessments, 'baseline'),
      mas_peak: getMasScore(inj.injectionAssessments, 'peak_effect')
    }))
  }

  return (
    <div className="mx-auto max-w-4xl p-4">
       <Card>
        <CardHeader>
          <CardTitle>Edit Treatment Record</CardTitle>
          <CardDescription>Update details for this procedure.</CardDescription>
        </CardHeader>
        <CardContent>
          <RecordForm 
            patients={patients} 
            defaultSubjectId={treatment.patientId}
            initialData={initialData}
            treatmentId={id}
            isEditing
          />
        </CardContent>
       </Card>
    </div>
  )
}