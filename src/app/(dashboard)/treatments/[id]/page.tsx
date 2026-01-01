import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
import { getTreatment, getMuscles } from "@/app/(dashboard)/treatments/actions"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function ViewTreatmentPage({ params }: PageProps) {
  const { id } = await params
  
  const treatment = await getTreatment(id)
  
  if (!treatment) {
    notFound()
  }

  // Fetch muscles list for manual mapping
  const musclesList = await getMuscles()

  const indicationLabels: Record<string, string> = {
    kopfschmerz: "Headache",
    dystonie: "Dystonia",
    spastik: "Spasticity",
    autonom: "Autonomous",
    andere: "Other",
  }

  // Helper to find MAS scores
  const getMasScore = (injAssessments: { scale: string; timepoint: string; valueText: string }[], timepoint: string) => {
      const score = injAssessments?.find((a) => a.scale === 'MAS' && a.timepoint === timepoint)
      return score ? score.valueText : ""
  }

  const initialData = {
    location: treatment.treatmentSite,
    subject_id: treatment.patientId,
    date: treatment.encounterLocalDate,
    category: treatment.indication,
    product_label: treatment.product?.name || "N/A",
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

  const patientCode = treatment.patient.systemLabel || 'Unknown'

  return (
    <div className="flex flex-col gap-4 pt-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/patients/${treatment.patientId}`}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="size-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Treatment Details</h1>
            <p className="text-muted-foreground">
              Patient: {patientCode} • {treatment.encounterLocalDate.toLocaleDateString()}
            </p>
          </div>
        </div>
        <TreatmentDialog 
          treatmentId={id} 
          initialData={initialData} 
          isEditing 
          patients={[{ id: treatment.patientId, patient_code: patientCode }]}
          defaultPatientId={treatment.patientId}
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
                <div>{treatment.encounterLocalDate.toLocaleDateString()}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">Location</div>
                <div>{treatment.treatmentSite}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">Category</div>
                <div>{indicationLabels[treatment.indication] || treatment.indication}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">Product</div>
                <div>{treatment.product?.name || "N/A"}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">Total Units</div>
                <div className="text-xl font-bold">{treatment.totalUnits.toNumber()}</div>
              </div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Notes</div>
              <p className="whitespace-pre-wrap">{treatment.effectNotes || "No notes recorded."}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
           <CardHeader>
             <CardTitle>Global Assessments</CardTitle>
           </CardHeader>
           <CardContent>
              {treatment.assessments && treatment.assessments.length > 0 ? (
                  <div className="space-y-4">
                      {treatment.assessments.map((a) => (
                          <div key={a.id} className="flex justify-between items-center border-b pb-2 last:border-0">
                              <div>
                                  <div className="font-medium">{a.scale} <span className="text-muted-foreground text-sm font-normal">({a.timepoint})</span></div>
                                  <div className="text-xs text-muted-foreground">{new Date(a.assessedAt).toLocaleDateString()}</div>
                              </div>
                              <div className="flex flex-col items-end">
                                  <div className="font-bold text-lg">{a.valueText}</div>
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
            <CardDescription>{treatment.injections?.length || 0} sites treated</CardDescription>
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
                {(treatment.injections || []).map((inj) => {
                   const masBase = getMasScore(inj.injectionAssessments, 'baseline');
                   const masPeak = getMasScore(inj.injectionAssessments, 'peak_effect');
                   // Manual muscle name lookup
                   const muscleName = musclesList.find((m) => m.id === inj.muscleId)?.name || inj.muscleId;
                   
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
                        <TableCell className="text-right">{inj.units.toNumber()}</TableCell>
                      </TableRow>
                   )
                })}
                {(!treatment.injections || treatment.injections.length === 0) && (
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