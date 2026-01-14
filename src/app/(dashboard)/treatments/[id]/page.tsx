import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { notFound } from "next/navigation"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { getTreatment, getMuscles } from "@/app/(dashboard)/treatments/actions"
import { TreatmentHeader } from "./treatment-header"
import { CopySummaryButton } from "@/components/copy-summary-button"
import { Target, CheckCircle2, Activity, User, Briefcase, TrendingUp, TrendingDown, Minus, AlertCircle, LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { GoalCategory } from "@/generated/client/enums"

interface PageProps {
  params: Promise<{ id: string }>
}

interface Goal {
  id: string
  category: GoalCategory
  description: string
}

interface GoalOutcome {
  id: string
  score: number
  notes: string | null
  goal: Goal
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
      numeric_value: inj.units,
      mas_baseline: getMasScore(inj.injectionAssessments, 'baseline'),
      mas_peak: getMasScore(inj.injectionAssessments, 'peak_effect')
    })),
    goals: treatment.goals as Goal[],
    goalOutcomes: treatment.goalOutcomes as unknown as GoalOutcome[]
  }

  const patientCode = treatment.patient.systemLabel || 'Unknown'

  const GAS_CONFIG: Record<number, { label: string, color: string, icon: LucideIcon }> = {
    [-2]: { label: "Worse", color: "text-red-600 bg-red-50 border-red-200", icon: TrendingDown },
    [-1]: { label: "Partial", color: "text-amber-600 bg-amber-50 border-amber-200", icon: Minus },
    [0]: { label: "Target", color: "text-emerald-600 bg-emerald-50 border-emerald-200", icon: CheckCircle2 },
    [1]: { label: "Better", color: "text-blue-600 bg-blue-50 border-blue-200", icon: TrendingUp },
    [2]: { label: "Exceeds", color: "text-purple-600 bg-purple-50 border-purple-200", icon: AlertCircle },
  }

  const CATEGORY_ICONS: Record<string, LucideIcon> = {
    SYMPTOM: Activity,
    FUNCTION: User,
    PARTICIPATION: Briefcase,
  }

  return (
    <div className="flex flex-col gap-4 pt-6">
      <TreatmentHeader 
        treatment={treatment} 
        patientCode={patientCode} 
        initialData={initialData} 
      />

      {/* GAS Section */}
      <div className="grid gap-6 md:grid-cols-2">
        {treatment.goalOutcomes && treatment.goalOutcomes.length > 0 && (
            <Card className="border-l-4 border-l-blue-500">
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-blue-600" />
                        Outcome Review
                    </CardTitle>
                    <CardDescription>Results for goals set in previous visit</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {(treatment.goalOutcomes as unknown as GoalOutcome[]).map((outcome) => {
                        const config = GAS_CONFIG[outcome.score]
                        const Icon = config.icon
                        const CatIcon = CATEGORY_ICONS[outcome.goal.category]
                        return (
                            <div key={outcome.id} className="p-3 border rounded-lg space-y-2">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            {CatIcon && <CatIcon className="h-3 w-3 text-muted-foreground" />}
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                                {outcome.goal.category}
                                            </span>
                                        </div>
                                        <p className="text-sm font-medium">{outcome.goal.description}</p>
                                    </div>
                                    <Badge className={cn("flex items-center gap-1 font-semibold", config.color)}>
                                        <Icon className="h-3 w-3" />
                                        {config.label} ({outcome.score})
                                    </Badge>
                                </div>
                                {outcome.notes && (
                                    <p className="text-xs text-muted-foreground bg-muted/30 p-2 rounded italic">
                                        &ldquo;{outcome.notes}&rdquo;
                                    </p>
                                )}
                            </div>
                        )
                    })}
                </CardContent>
            </Card>
        )}

        {treatment.goals && treatment.goals.length > 0 && (
            <Card className="border-l-4 border-l-emerald-500">
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Target className="h-5 w-5 text-emerald-600" />
                        New Goals
                    </CardTitle>
                    <CardDescription>Treatment intent for current cycle</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {(treatment.goals as unknown as Goal[]).map((goal) => {
                         const CatIcon = CATEGORY_ICONS[goal.category]
                         return (
                            <div key={goal.id} className="flex items-center gap-3 p-3 border rounded-lg">
                                <div className="h-8 w-8 rounded-full bg-emerald-50 flex items-center justify-center">
                                    {CatIcon ? <CatIcon className="h-4 w-4 text-emerald-600" /> : <Target className="h-4 w-4 text-emerald-600" />}
                                </div>
                                <div>
                                    <div className="text-[10px] font-bold uppercase text-muted-foreground">{goal.category}</div>
                                    <p className="text-sm font-medium">{goal.description}</p>
                                </div>
                            </div>
                         )
                    })}
                </CardContent>
            </Card>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle>General Info</CardTitle>
            <CopySummaryButton 
                treatment={treatment} 
                muscles={musclesList} 
                patientCode={patientCode} 
            />
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
                <div className="text-xl font-bold">{treatment.totalUnits}</div>
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
                        <TableCell className="text-right">{inj.units}</TableCell>
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