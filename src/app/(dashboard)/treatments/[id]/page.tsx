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
import { Badge } from "@/components/ui/badge"
import { getMuscles } from "@/app/(dashboard)/treatments/actions"

interface PageProps {
  params: Promise<{ id: string }>
}

interface InjectionAssessment {
  scale: string;
  timepoint: string;
  value_text: string;
}

interface Muscle {
  id: string;
  name: string;
}

interface Injection {
  id: string;
  muscle: string;
  side: string;
  units: number;
  injection_assessments: InjectionAssessment[];
}

interface Assessment {
  id: string;
  scale: string;
  timepoint: string;
  value: string | number;
  assessed_at: string;
  notes?: string;
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

  // Fetch injections for this treatment with assessments
  const { data: injectionsData } = await supabase
    .from('injections')
    .select('*, injection_assessments(*)')
    .eq('treatment_id', id)
    
  const injections = injectionsData as unknown as Injection[]

  // Fetch global assessments
  const { data: globalAssessmentsData } = await supabase
    .from('assessments')
    .select('*')
    .eq('treatment_id', id)
    
  const globalAssessments = globalAssessmentsData as unknown as Assessment[]

  // Fetch muscles list for manual mapping
  const musclesList = await getMuscles() as unknown as Muscle[]

  const indicationLabels: Record<string, string> = {
    kopfschmerz: "Headache",
    dystonie: "Dystonia",
    spastik: "Spasticity",
    autonom: "Autonomous",
    andere: "Other",
  }

  // Helper to find MAS scores
  const getMasScore = (injAssessments: InjectionAssessment[], timepoint: string) => {
      const score = injAssessments?.find((a) => a.scale === 'MAS' && a.timepoint === timepoint)
      return score ? score.value_text : ""
  }

  const initialData = {
    location: treatment.treatment_site,
    subject_id: treatment.patient_id,
    date: treatment.treatment_date,
    category: treatment.indication,
    product_label: treatment.product,
    notes: treatment.effect_notes,
    assessments: globalAssessments || [],
    steps: (injections || []).map((inj) => ({
      id: inj.id,
      muscle_id: inj.muscle,
      side: (inj.side === 'L' ? 'Left' : inj.side === 'R' ? 'Right' : inj.side === 'B' ? 'Bilateral' : 'Midline') as "Left" | "Right" | "Bilateral" | "Midline",
      numeric_value: inj.units,
      mas_baseline: getMasScore(inj.injection_assessments, 'baseline'),
      mas_peak: getMasScore(inj.injection_assessments, 'peak_effect')
    }))
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
             <CardTitle>Global Assessments</CardTitle>
           </CardHeader>
           <CardContent>
              {globalAssessments && globalAssessments.length > 0 ? (
                  <div className="space-y-4">
                      {globalAssessments.map((a) => (
                          <div key={a.id} className="flex justify-between items-center border-b pb-2 last:border-0">
                              <div>
                                  <div className="font-medium">{a.scale} <span className="text-muted-foreground text-sm font-normal">({a.timepoint})</span></div>
                                  <div className="text-xs text-muted-foreground">{new Date(a.assessed_at).toLocaleDateString()}</div>
                              </div>
                              <div className="flex flex-col items-end">
                                  <div className="font-bold text-lg">{a.value}</div>
                                  {a.notes && <div className="text-xs text-muted-foreground max-w-[150px] truncate" title={a.notes}>{a.notes}</div>}
                              </div>
                          </div>
                      ))}
                  </div>
              ) : (
                  <div className="text-sm text-muted-foreground text-center py-4">No global assessments recorded.</div>
              )}
           </CardContent>
        </Card>

        <Card className="md:col-span-2">
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
                  <TableHead>MAS Base</TableHead>
                  <TableHead>MAS Peak</TableHead>
                  <TableHead className="text-right">Units</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(injections || []).map((inj) => {
                   const masBase = getMasScore(inj.injection_assessments, 'baseline');
                   const masPeak = getMasScore(inj.injection_assessments, 'peak_effect');
                   // Manual muscle name lookup
                   const muscleName = musclesList.find((m) => m.id === inj.muscle)?.name || inj.muscle;
                   
                   return (
                      <TableRow key={inj.id}>
                        <TableCell>{muscleName}</TableCell>
                        <TableCell>
                          {inj.side === 'L' ? 'Left' : inj.side === 'R' ? 'Right' : inj.side === 'B' ? 'Bilateral' : inj.side}
                        </TableCell>
                        <TableCell>
                            {masBase ? <Badge variant="outline">{masBase}</Badge> : "-"}
                        </TableCell>
                        <TableCell>
                            {masPeak ? <Badge variant="outline">{masPeak}</Badge> : "-"}
                        </TableCell>
                        <TableCell className="text-right">{inj.units}</TableCell>
                      </TableRow>
                   )
                })}
                {(!injections || injections.length === 0) && (
                   <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">No injection data.</TableCell>
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
