import { RecordForm } from "@/components/record-form"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { notFound } from "next/navigation"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditTreatmentPage({ params }: PageProps) {
  const { id } = await params
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  // Fetch treatment details
  const { data: treatment, error: treatmentError } = await supabase
    .from('treatments')
    .select('*')
    .eq('id', id)
    .single()

  if (treatmentError || !treatment) {
    notFound()
  }

  // Fetch injections for this treatment
  const { data: injections } = await supabase
    .from('injections')
    .select('*')
    .eq('treatment_id', id)

  // Fetch all patients for the select list
  const { data: patients } = await supabase
    .from('patients')
    .select('id, patient_code')
    .order('patient_code', { ascending: true })

  interface Injection {
    id: string;
    muscle: string;
    side: 'L' | 'R' | 'B'; // Assuming these are the possible values for side
    units: number;
  }
  
      // Transform data for the form
      const initialData = {
        ...treatment,
        subject_id: treatment.patient_id,
        date: new Date(treatment.treatment_date),
        location: treatment.treatment_site,
        category: treatment.indication,
        product_label: treatment.product,
        notes: treatment.effect_notes,
        steps: (injections || []).map((inj: Injection) => ({
          id: inj.id,
          target_structure: inj.muscle,
          side: inj.side === 'L' ? 'Left' : inj.side === 'R' ? 'Right' : inj.side === 'B' ? 'Bilateral' : 'Midline',
          numeric_value: inj.units
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
            patients={patients || []} 
            defaultSubjectId={treatment.patient_id}
            initialData={initialData}
            treatmentId={id}
            isEditing
          />
        </CardContent>
       </Card>
    </div>
  )
}
