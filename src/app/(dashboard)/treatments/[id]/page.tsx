import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Edit } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { TreatmentDialog } from "@/components/treatment-create-dialog"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function ViewTreatmentPage({ params }: PageProps) {
  const { id } = await params
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  // Fetch treatment details with patient info
  const { data: treatment, error: treatmentError } = await supabase
    .from('treatments')
    .select('*, patients(id, patient_code)')
    .eq('id', id)
    .single()

  if (treatmentError || !treatment) {
    notFound()
  }

  // Fetch injections for this treatment
  const { data: injections } = await supabase
    .from('injections')
    .select('*, muscles:muscle(name)') // Join using the 'muscle' column which stores the ID
    .eq('treatment_id', id)

  const indicationLabels: Record<string, string> = {
    kopfschmerz: "Headache",
    dystonie: "Dystonia",
    spastik: "Spasticity",
    autonom: "Autonomous",
    andere: "Other",
  }

  const initialData = {
    location: treatment.treatment_site,
    subject_id: treatment.patient_id,
    date: treatment.treatment_date,
    category: treatment.indication,
    product_label: treatment.product,
    notes: treatment.effect_notes,
    steps: (injections || []).map((inj: { id: string; muscle: string; side: string; units: number }) => ({
      id: inj.id,
      muscle_id: inj.muscle,
      side: (inj.side === 'L' ? 'Left' : inj.side === 'R' ? 'Right' : inj.side === 'B' ? 'Bilateral' : 'Midline') as "Left" | "Right" | "Bilateral" | "Midline",
      numeric_value: inj.units
    }))
  }

  interface InjectionWithMuscle {
    id: string
    muscle: string
    muscles?: { name: string }
    side: string
    units: number
  }

  return (
    <div className="flex flex-col gap-4 pt-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/patients/${treatment.patient_id}`}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="size-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Treatment Details</h1>
            <p className="text-muted-foreground">
              Patient: {treatment.patients.patient_code} • {new Date(treatment.treatment_date).toLocaleDateString()}
            </p>
          </div>
        </div>
        <TreatmentDialog 
          treatmentId={id} 
          initialData={initialData} 
          isEditing 
          patients={[treatment.patients]}
          defaultPatientId={treatment.patient_id}
        >
          <Button variant="outline">
            <Edit className="mr-2 size-4" />
            Edit Record
          </Button>
        </TreatmentDialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>General Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm font-medium text-muted-foreground">Date</div>
                <div>{new Date(treatment.treatment_date).toLocaleDateString()}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">Location</div>
                <div>{treatment.treatment_site}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">Category</div>
                <div>{indicationLabels[treatment.indication] || treatment.indication}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">Product</div>
                <div>{treatment.product}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">Total Units</div>
                <div className="text-xl font-bold">{treatment.total_units}</div>
              </div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Notes</div>
              <p className="whitespace-pre-wrap">{treatment.effect_notes || "No notes recorded."}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Injection Sites</CardTitle>
            <CardDescription>{injections?.length || 0} sites treated</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Muscle</TableHead>
                  <TableHead>Side</TableHead>
                  <TableHead className="text-right">Units</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(injections as unknown as InjectionWithMuscle[])?.map((inj) => (
                  <TableRow key={inj.id}>
                    <TableCell>{inj.muscles?.name || inj.muscle}</TableCell>
                    <TableCell>
                      {inj.side === 'L' ? 'Left' : inj.side === 'R' ? 'Right' : inj.side === 'B' ? 'Bilateral' : inj.side}
                    </TableCell>
                    <TableCell className="text-right">{inj.units}</TableCell>
                  </TableRow>
                ))}
                {(!injections || injections.length === 0) && (
                   <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground">No injection data.</TableCell>
                   </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}