import { QualificationStats } from "@/components/dashboard/qualification-stats"
import { IndicationBreakdown } from "@/components/dashboard/indication-breakdown"
import { GuidelinesChecklist } from "@/components/dashboard/guidelines-checklist"
import { ActivityTrendCard, TopMusclesCard } from "@/components/dashboard/clinical-activity"
import { NextActions } from "@/components/dashboard/next-actions"
import { DocumentationQuality } from "@/components/dashboard/documentation-quality"
import { UpsellTeaser } from "@/components/dashboard/upsell-teaser"
import { StatsCard } from "@/components/stats-card"
import { Users, Activity, TrendingUp, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { getDashboardData } from "./actions"
import { getOrganizationContext } from "@/lib/auth-context"
import { checkPlan, PLAN_GATES } from "@/lib/permissions"
import { Plan } from "@/generated/client/enums"
import { OutcomeTrendsCard, DoseDistributionCard } from "@/components/dashboard/clinical-insights"
import { DateRangeFilter } from "@/components/dashboard/date-range-filter"

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>
}) {
  const { range } = await searchParams
  const days = range ? parseInt(range) : 90

  const [data, ctx] = await Promise.all([
      getDashboardData(days),
      getOrganizationContext()
  ])

  const userPlan = ctx?.organization.plan as Plan
  const isPro = checkPlan(userPlan, PLAN_GATES.CLINICAL_INSIGHTS)

  // 6. Next Actions Construction
  const actions: { id: string, label: string, count: number, href: string, type: 'warning' | 'info' | 'success' }[] = []

  if (data.overdueFollowUpsCount > 0) {
    actions.push({
      id: 'missing-followups',
      label: 'treatments overdue for follow-up',
      count: data.overdueFollowUpsCount,
      href: '/treatments?filter=missing-followup',
      type: 'warning'
    })
  }

  if (data.missingBaselineCount > 0) {
     actions.push({
      id: 'missing-baseline',
      label: 'injections missing MAS baseline',
      count: data.missingBaselineCount,
      href: '/treatments?indication=spastik',
      type: 'info'
    })
  }

  // Goals (Static for now, could be dynamic per org later)
  const goals = {
    totalTreatmentsGoal: 250,
    withFollowUpGoal: 50,
    indicationsCoveredGoal: 2,
    spastikDystonieGoal: 25,
  }
  
  const enableCompliance = false // Default to false

  return (
    <div className="@container/main flex flex-1 flex-col gap-6 pt-6 pb-8">
      
      {/* Header */}
      <div className="flex items-center justify-between px-4 lg:px-6">
        <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">Clinical Activity & Progress</p>
        </div>
        <div className="flex items-center gap-2">
            <DateRangeFilter />
        </div>
      </div>
      
      {/* 1. Overview Row & Next Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 px-4 lg:px-6 items-stretch">
         <StatsCard 
            title="Total Patients" 
            value={data.totalPatientsCount} 
            subtext="Distinct patients treated"
            icon={Users}
            className="h-full"
         />
         <StatsCard 
            title="Total Treatments" 
            value={data.totalTreatmentsCount} 
            subtext={`${range ? 'Last ' + range + ' days' : 'Total records logged'}`}
            icon={Activity}
            className="h-full"
         />
         <StatsCard 
            title="Follow-up Rate" 
            value={`${Math.round(data.followUpRateRecent)}%`}
            subtext={`${range ? 'Last ' + range + ' days' : 'Last 90 days'}`}
            icon={TrendingUp}
            className="h-full"
         />
         <NextActions actions={actions} className="h-full" />
      </div>

      {/* 2. Qualification & Compliance Subsection */}
      <div className="px-4 lg:px-6">
        <Collapsible defaultOpen={enableCompliance} className="space-y-2">
            <div className="flex items-center justify-between rounded-lg border bg-card p-4 shadow-sm">
                <div className="flex flex-col gap-1">
                    <h3 className="font-semibold leading-none tracking-tight">Qualification & Compliance</h3>
                    <p className="text-sm text-muted-foreground">Certification requirements and guidelines.</p>
                </div>
                <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm" className="w-9 p-0">
                        <ChevronDown className="h-4 w-4" />
                        <span className="sr-only">Toggle</span>
                    </Button>
                </CollapsibleTrigger>
            </div>
            <CollapsibleContent className="space-y-4 pt-2">
                <div className="rounded-lg border bg-card p-6 shadow-sm space-y-6">
                    <QualificationStats
                        totalTreatments={data.totalTreatmentsCount}
                        totalTreatmentsGoal={goals.totalTreatmentsGoal}
                        withFollowUp={data.followUpsCount}
                        withFollowUpGoal={goals.withFollowUpGoal}
                        indicationsCovered={data.indicationsCoveredCount}
                        indicationsCoveredGoal={goals.indicationsCoveredGoal}
                        spastikDystonie={data.spastikDystonieCount}
                        spastikDystonieGoal={goals.spastikDystonieGoal}
                        showGoals={true}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <GuidelinesChecklist
                            totalTreatments={data.totalTreatmentsCount}
                            totalTreatmentsGoal={goals.totalTreatmentsGoal}
                            withFollowUp={data.followUpsCount}
                            withFollowUpGoal={goals.withFollowUpGoal}
                            spastikDystonie={data.spastikDystonieCount}
                            spastikDystonieGoal={goals.spastikDystonieGoal}
                        />
                         <div className="rounded-lg bg-muted/50 p-4 text-sm text-muted-foreground">
                            <h4 className="font-medium text-foreground mb-2">Why this matters?</h4>
                            <p>To achieve full qualification, you need to demonstrate a broad range of treatments and consistent follow-up documentation. Use the filtered lists to identify gaps.</p>
                         </div>
                    </div>
                </div>
            </CollapsibleContent>
        </Collapsible>
      </div>

      <div className="px-4 lg:px-6">
        <h2 className="text-lg font-semibold tracking-tight">Clinical Insights</h2>
      </div>

      {/* 3. Clinical Insights Grid (3x2) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4 lg:px-6 items-stretch">
        
        {/* Row 1 */}
        <OutcomeTrendsCard outcomeTrends={data.outcomeTrends} isPro={isPro} className="h-full" />
        <DoseDistributionCard dosePerIndication={data.dosePerIndication} isPro={isPro} className="h-full" />
        <ActivityTrendCard trendData={data.trendData} isPro={isPro} className="h-full" />

        {/* Row 2 */}
        <TopMusclesCard topMuscles={data.topMuscles} isPro={isPro} className="h-full" />
        <IndicationBreakdown data={data.indicationBreakdownData} isPro={isPro} className="h-full" />
        <DocumentationQuality 
            followUpRateOverall={data.followUpRateOverall}
            followUpRateRecent={data.followUpRateRecent}
            masBaselineRate={data.masBaselineRate}
            masPeakRate={data.masPeakRate}
            className="h-full"
        />
      </div>

      {!isPro && (
        <div className="px-4 lg:px-6 mt-6">
            <UpsellTeaser />
        </div>
      )}

    </div>
  )
}
