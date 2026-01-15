import { notFound, redirect } from "next/navigation"
import { getOrganizationContext } from "@/lib/auth-context"
import prisma from "@/lib/prisma"
import { getPatientInsightsAction } from "../../insights-actions"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { GoalTrendChart } from "@/components/goal-trend-chart"
import { Activity, FlaskConical, Target } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Goal } from "@/components/patient-goals-hub"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function PatientInsightsPage({ params }: PageProps) {
  const { id } = await params
  const ctx = await getOrganizationContext()
  if (!ctx) redirect('/onboarding')

  const patient = await prisma.patient.findUnique({
    where: { id, organizationId: ctx.organizationId }
  })

  if (!patient) notFound()

  const { goals, doseTrends } = await getPatientInsightsAction(id)

  return (
    <div className="flex flex-col gap-6 pt-6">
      <div className="flex items-center justify-between">
        <div>
            <h1 className="text-3xl font-bold tracking-tight">Clinical Insights</h1>
            <p className="text-muted-foreground">Longitudinal analysis for {patient.systemLabel}</p>
        </div>
        <Badge variant="outline" className="bg-muted/50">
            <Target className="h-3 w-3 mr-1" />
            Decision Support Mode: {ctx.organization.decisionSupportMode}
        </Badge>
      </div>

      <div className="grid gap-6">
        {/* GAS Trend */}
        <Card>
            <CardHeader>
                <div className="flex items-center gap-2 text-primary">
                    <Activity className="h-5 w-5" />
                    <CardTitle>Goal Attainment Trend</CardTitle>
                </div>
                <CardDescription>
                    Visual history of therapeutic gain across multiple clinical encounters.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <GoalTrendChart goals={goals as unknown as Goal[]} />
            </CardContent>
        </Card>

        {/* Dose Trend */}
        <Card>
            <CardHeader>
                <div className="flex items-center gap-2 text-blue-600">
                    <FlaskConical className="h-5 w-5" />
                    <CardTitle>Dosage History</CardTitle>
                </div>
                <CardDescription>
                    Total units injected per session over time.
                </CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
                {/* Simplified list for now or we could use ClinicalInsights chart components */}
                <div className="space-y-4">
                    {doseTrends.map((t, i) => (
                        <div key={i} className="flex justify-between items-center p-3 border rounded-lg hover:bg-muted/30 transition-colors">
                            <div className="space-y-0.5">
                                <p className="text-sm font-bold">{t.date}</p>
                                <p className="text-xs text-muted-foreground capitalize">{t.indication}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xl font-black text-primary">{t.units} U</p>
                            </div>
                        </div>
                    ))}
                    {doseTrends.length === 0 && <p className="text-center py-10 text-muted-foreground">No signed encounters found.</p>}
                </div>
            </CardContent>
        </Card>
      </div>
    </div>
  )
}
