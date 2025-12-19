import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { RecentRecordsTable } from "@/components/recent-records-table"
import { TreatmentCreateDialog } from "@/components/treatment-create-dialog"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

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
  } else {
    console.log(`Fetched ${treatments?.length} treatments`)
  }

  // Fetch patients for the create dialog
  const { data: patients } = await supabase
    .from('patients')
    .select('id, patient_code')
    .order('patient_code', { ascending: true })

  // Transform data for the table
  const formattedTreatments = (treatments as unknown as TreatmentWithPatient[] || []).map((t) => ({
    ...t,
    patient: t.patients 
  }))

  return (
    <div className="flex flex-col gap-4 pt-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Treatments</h1>
        <TreatmentCreateDialog patients={patients || []}>
          <Button>
            <Plus className="mr-2 size-4" />
            New Treatment
          </Button>
        </TreatmentCreateDialog>
      </div>
      <RecentRecordsTable records={formattedTreatments} />
    </div>
  )
}
